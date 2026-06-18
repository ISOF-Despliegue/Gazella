import { apiRequest } from "./api";

const CLIENT_ID = import.meta.env.VITE_OIDC_CLIENT_ID ?? "gazella-client";
const RESOURCE = import.meta.env.VITE_OIDC_RESOURCE ?? "urn:gazella:client";
const SCOPE = import.meta.env.VITE_OIDC_SCOPE ?? "openid email account gazella";
const REDIRECT_URI =
    import.meta.env.VITE_OIDC_REDIRECT_URI ?? `${globalThis.location.origin}/auth/callback`;

type RegisterInput = {
    email: string;
    password: string;
    name: string;
    parentalSurname?: string;
    maternalSurname?: string;
    role?: "volunteer" | "editor";
};

type InteractionResponse = {
    interactionId: string;
};

type TokenResponse = {
    access_token: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
};

export type AuthSession = {
    accessToken: string;
    email?: string;
    roles: string[];
    permissions: string[];
    sub?: string;
};

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
    const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const binary = String.fromCodePoint(...view);
    return btoa(binary).replaceAll('+', "-").replaceAll('/', "_").replace(/=+$/g, "");
}

function randomBase64Url(byteLength: number): string {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return base64UrlEncode(bytes);
}

async function sha256(value: string): Promise<ArrayBuffer> {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
}

function decodeJwtPayload(token: string) {
    const [, payload] = token.split(".");
    if (!payload) return {};

    const normalized = payload.replaceAll('-', "+").replaceAll('_', "/");
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
    return JSON.parse(atob(padded));
}

function gatewayPath(url: string): string {
    const parsed = new URL(url, globalThis.location.origin);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

async function beginInteraction(authParams: URLSearchParams): Promise<InteractionResponse> {
    return apiRequest<InteractionResponse>(`/oidc/auth?${authParams.toString()}`, {
        credentials: "include",
        skipAuth: true,
    });
}

function saveSession(tokenResponse: TokenResponse): AuthSession {
    const claims = decodeJwtPayload(tokenResponse.access_token) as {
        email?: string;
        roles?: string[];
        permissions?: string[];
        sub?: string;
    };

    localStorage.setItem("gazella_access_token", tokenResponse.access_token);

    if (tokenResponse.expires_in) {
        localStorage.setItem(
            "gazella_access_token_expires_at",
            String(Date.now() + tokenResponse.expires_in * 1000),
        );
    }

    return {
        accessToken: tokenResponse.access_token,
        email: claims.email,
        roles: claims.roles ?? [],
        permissions: claims.permissions ?? [],
        sub: claims.sub,
    };
}

export function getCurrentSession(): AuthSession | null {
    const accessToken = localStorage.getItem("gazella_access_token");
    if (!accessToken) {
        return null;
    }

    const expiresAt = Number(localStorage.getItem("gazella_access_token_expires_at") ?? "0");
    if (expiresAt && Date.now() >= expiresAt) {
        logout();
        return null;
    }

    const claims = decodeJwtPayload(accessToken) as {
        email?: string;
        roles?: string[];
        permissions?: string[];
        sub?: string;
    };

    return {
        accessToken,
        email: claims.email,
        roles: claims.roles ?? [],
        permissions: claims.permissions ?? [],
        sub: claims.sub,
    };
}

export function logout() {
    localStorage.removeItem("gazella_access_token");
    localStorage.removeItem("gazella_access_token_expires_at");
    localStorage.removeItem("gazella_local_profile")
}

export function hasAnyRole(session: AuthSession | null, allowedRoles: string[]) {
    if (!session) return false;

    const normalizedRoles = new Set(session.roles.map((role) => role.toLowerCase()));
    return allowedRoles.some((role) => normalizedRoles.has(role.toLowerCase()));
}

export async function register(input: RegisterInput) {
    return apiRequest<{ message: string }>("/api/auth/registration", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify(input),
    });
}

export async function verifyEmail(email: string, code: string) {
    return apiRequest<{ message: string }>("/api/auth/verification", {
        method: "PATCH",
        skipAuth: true,
        body: JSON.stringify({ email, code }),
    });
}

export async function requestVerificationEmail(email: string) {
    return apiRequest<{ message: string }>("/api/auth/verification", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email }),
    });
}

export async function requestRecoveryEmail(email: string) {
    return apiRequest<{ message: string }>("/api/auth/recovery", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email }),
    });
}

export async function completeAccountRecovery(email: string, code: string, password: string) {
    return apiRequest<{ message: string }>("/api/auth/recovery", {
        method: "PATCH",
        skipAuth: true,
        body: JSON.stringify({ email, code, password }),
    });
}

async function resolveIdpFlow(response: any): Promise<string> {
    if (response.customRedirectUrl) {
        return response.customRedirectUrl;
    }
    
    if (response.returnTo) {
        const path = gatewayPath(response.returnTo);
        
        const rawResponse = await fetch(path, {
            method: "GET",
            credentials: "include",
        });
        
        if (rawResponse.url.includes("/auth/callback")) {
            return rawResponse.url;
        }
        
        const contentType = rawResponse.headers.get("content-type") ?? "";
        const authResult = contentType.includes("application/json")
            ? await rawResponse.json()
            : { message: await rawResponse.text() };
        
        return resolveIdpFlow(authResult);
    }

    if (response.message && typeof response.message === "string" && response.message.includes('name="xsrf"')) {
        console.warn("Detectado formulario de limpieza de sesión del IdP. Auto-enviando...");
        
        const xsrfMatch = response.message.match(/name="xsrf" value="([^"]+)"/);
        const actionMatch = response.message.match(/action="([^"]+)"/);
        
        if (xsrfMatch && actionMatch) {
            const xsrf = xsrfMatch[1];
            const actionUrl = gatewayPath(actionMatch[1]);
            
            const confirmResponse = await apiRequest<any>(actionUrl, {
                method: "POST",
                skipAuth: true,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `xsrf=${xsrf}&logout=yes`
            });
            
            return resolveIdpFlow(confirmResponse);
        }
    }
    
    return "";
}

export async function loginWithPassword(email: string, password: string): Promise<AuthSession> {
    const codeVerifier = randomBase64Url(64);
    const codeChallenge = base64UrlEncode(await sha256(codeVerifier));
    const state = randomBase64Url(24);

    const authParams = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        resource: RESOURCE,
        scope: SCOPE,
        redirect_uri: REDIRECT_URI,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        prompt: "login",
    });

    const interaction = await beginInteraction(authParams);

    let finalRedirectUrl = await resolveIdpFlow(interaction);

    if (!finalRedirectUrl && interaction.interactionId) {
        const loginResponse = await fetch(
            `/api/auth/interaction/${interaction.interactionId}/login`,
            {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            },
        );

        if (!loginResponse.ok && loginResponse.status !== 303) {
            const errorData = await loginResponse.json().catch(() => ({})) as { message?: string };
            throw new Error(errorData.message ?? "Error al iniciar sesión");
        }

        if (loginResponse.url.includes("/auth/callback")) {
            finalRedirectUrl = loginResponse.url;
        } else {
            const contentType = loginResponse.headers.get("content-type") ?? "";
            const interactionResponse = contentType.includes("application/json")
                ? await loginResponse.json()
                : { message: await loginResponse.text() };
            finalRedirectUrl = await resolveIdpFlow(interactionResponse);
        }
    }

    if (!finalRedirectUrl) {
        throw new Error("El IdP no devolvió la URL de reanudación.");
    }

    const callbackUrl = new URL(finalRedirectUrl);
    const code = callbackUrl.searchParams.get("code");
    const returnedState = callbackUrl.searchParams.get("state");

    if (!code || returnedState !== state) {
        throw new Error("No se pudo completar el flujo OIDC.");
    }

    const tokenParams = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "authorization_code",
        code,
        code_verifier: codeVerifier,
        redirect_uri: REDIRECT_URI,
        resource: RESOURCE
    });

    const tokenResponse = await apiRequest<TokenResponse>("/oidc/token", {
        method: "POST",
        skipAuth: true,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenParams,
    });

    return saveSession(tokenResponse);
}
