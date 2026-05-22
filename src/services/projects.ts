import { apiRequest } from "./api";
import { type Project } from "../types/project";

type ProjectApiEntry = {
    id: string;
    title?: string;
    name?: string;
    description?: string;
    location?: string;
    date?: string;
    startsAt?: string;
    volunteersEnrolled?: number;
    volunteersMax?: number;
    currentVolunteers?: number;
    maxVolunteers?: number;
    imageUrl?: string;
};

function formatProjectDate(value?: string) {
    if (!value) return "Fecha por confirmar";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

export async function getUpcomingProjects(): Promise<Project[]> {
    const response = await apiRequest<ProjectApiEntry[] | { projects: ProjectApiEntry[] }>("/projects", {
        skipAuth: true,
    });

    const entries = Array.isArray(response) ? response : response.projects;

    return entries.slice(0, 3).map((project) => ({
        id: project.id,
        title: project.title || project.name || "Proyecto sin titulo",
        description: project.description || "Sin descripcion disponible",
        location: project.location || "Ubicacion por confirmar",
        date: formatProjectDate(project.date || project.startsAt),
        volunteersEnrolled: project.volunteersEnrolled ?? project.currentVolunteers ?? 0,
        volunteersMax: project.volunteersMax ?? project.maxVolunteers ?? 0,
        imageUrl: project.imageUrl,
    }));
}
