import { API_BASE_URL } from "./api";

export type UploadResponse = {
    message: string;
    url: string;
};

export class MediaUploadError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MediaUploadError";
    }
}

const ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
];

const MAX_SIZE_BYTES = 50 * 1024 * 1024;

export function validateFile(file: File): void {
    if (!ACCEPTED_TYPES.includes(file.type)) {
        throw new MediaUploadError(
            `Tipo de archivo no permitido. Tipos aceptados: JPEG, PNG, WEBP, GIF, MP4, WEBM, MOV`
        );
    }

    if (file.size > MAX_SIZE_BYTES) {
        throw new MediaUploadError(`El archivo supera el límite de 50 MB`);
    }
}

export async function uploadMedia(file: File): Promise<UploadResponse> {
    validateFile(file);

    const token = localStorage.getItem("gazella_access_token");
    if (!token) {
        throw new MediaUploadError("No hay sesión activa. Inicia sesión para subir archivos.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/media`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new MediaUploadError(
            data.message ?? `Error al subir el archivo (${response.status})`
        );
    }

    return response.json() as Promise<UploadResponse>;
}