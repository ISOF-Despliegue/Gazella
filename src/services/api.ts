export const API_BASE_URL =
    globalThis.location.protocol === "http:" || globalThis.location.protocol === "https:" 
        ? "" 
        : "http://localhost:4000";

export class ApiError extends Error {
    status: number;
    code?: string;
    details?: unknown;

    constructor(message: string, status: number, code?: string, details?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

async function parseResponse(response: Response) {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    const text = await response.text();
    return text ? { message: text } : null;
}

type ApiRequestInit = RequestInit & {
    skipAuth?: boolean;
};

export async function apiRequest<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
    const { skipAuth, ...requestInit } = init;
    const headers = new Headers(init.headers);

    if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const token = localStorage.getItem("gazella_access_token");
    if (!skipAuth && token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...requestInit,
        headers,
        credentials: init.credentials ?? "include",
    });

    const data = await parseResponse(response);

    if (!response.ok) {
        const message =
            data?.message ??
            data?.error ??
            `La solicitud fallo con estado ${response.status}`;

        throw new ApiError(message, response.status, data?.code, data?.details);
    }

    return data as T;
}
