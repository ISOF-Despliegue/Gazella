const ALLOWED_ORIGINS: string[] = [
    "http://localhost:4000",
    "http://localhost:8000",
    "http://localhost:10000",
    "https://gazella.com",
    "http://ec2-18-117-197-124.us-east-2.compute.amazonaws.com"
];

type ImageValidationResult =
    | { valid: true; url: string }
    | { valid: false; reason: "empty" | "illegal_origin" | "invalid_url" };

export function validateImageUrl(
    url: string | null | undefined
): ImageValidationResult {
    if (!url || url.trim() === "") {
        return { valid: false, reason: "empty" };
    }

    let parsed: URL;
    try {
        parsed = new URL(url.trim());
    } catch {
        return { valid: false, reason: "invalid_url" };
    }

    const isAllowed = ALLOWED_ORIGINS.some(
        (origin) => parsed.origin === new URL(origin).origin
    );

    if (!isAllowed) {
        return { valid: false, reason: "illegal_origin" };
    }

    return { valid: true, url: url.trim() };
}

export function getSafeImageUrl(url: string | null | undefined): string | null {
    const result = validateImageUrl(url);
    return result.valid ? result.url : null;
}