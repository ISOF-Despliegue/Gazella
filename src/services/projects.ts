import { apiRequest } from "./api";
import { type Project, type ProjectApiEntry, type ProjectsResponse, type EnrollmentApiEntry, type CreateProjectInput } from "../types/project";

function formatProjectDate(value?: string): string {
    if (!value) return "Fecha por confirmar";
    const date = new Date(value + "T00:00:00");
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

export function mapProjectEntry(entry: ProjectApiEntry): Project {
    return {
        id: entry.project_id,
        title: entry.title || "Proyecto sin título",
        description: entry.description || "Sin descripción disponible",
        location: entry.location || "Ubicación por confirmar",
        startDate: entry.start_date,
        endDate: entry.end_date,
        date: formatProjectDate(entry.start_date),
        volunteersEnrolled: entry.enrolled_count ?? 0,
        volunteersMax: entry.max_volunteers ?? 0,
        status: entry.status || "Active",
        category: entry.category || "",
        coverUri: entry.cover_uri,
        imageUrl: entry.cover_uri,
    };
}

export interface GetProjectsParams {
    pageIndex?: number;
    pageSize?: number;
    categoryId?: string;
    searchTerm?: string;
    location?: string;
    startDate?: string;
    orderBy?: string;
}

export async function getProjects(params: GetProjectsParams = {}): Promise<ProjectsResponse & { mappedProjects: Project[] }> {
    const query = new URLSearchParams();
    if (params.pageIndex !== undefined) query.set("pageIndex", String(params.pageIndex + 1));
    if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize));
    if (params.categoryId) query.set("categoryId", params.categoryId);
    if (params.searchTerm) query.set("searchTerm", params.searchTerm);
    if (params.location) query.set("location", params.location);
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.orderBy) query.set("orderBy", params.orderBy);

    const qs = query.toString();
    const raw = await apiRequest<ProjectsResponse>(`/projects${qs ? `?${qs}` : ""}`, { skipAuth: true });
    return {
        ...raw,
        mappedProjects: (raw.projects ?? []).map(mapProjectEntry),
    };
}

export async function getUpcomingProjects(): Promise<Project[]> {
    const result = await getProjects({ pageSize: 3, orderBy: "soonest" });
    return result.mappedProjects;
}

export async function getProjectById(projectId: string): Promise<Project> {
    const raw = await apiRequest<ProjectApiEntry>(`/projects/${projectId}`, { skipAuth: true });
    return mapProjectEntry(raw);
}

export async function getMyProjects(): Promise<Project[]> {
    const raw = await apiRequest<{ myProjects: ProjectApiEntry[] }>("/my-projects");
    return (raw.myProjects ?? []).map(mapProjectEntry);
}

export async function getMyEnrollments(): Promise<EnrollmentApiEntry[]> {
    const raw = await apiRequest<{ myEnrollments: EnrollmentApiEntry[] }>("/my-enrollments");
    return raw.myEnrollments ?? [];
}

export async function enrollInProject(projectId: string): Promise<void> {
    await apiRequest(`/projects/${projectId}/registrations`, { method: "POST" });
}

export async function cancelEnrollment(projectId: string): Promise<void> {
    await apiRequest(`/projects/${projectId}/registrations`, { method: "DELETE" });
}

export async function cancelProject(projectId: string): Promise<void> {
    await apiRequest(`/projects/${projectId}/cancellations`, { method: "POST" });
}

export async function createProject(input: CreateProjectInput): Promise<ProjectApiEntry> {
    return apiRequest<ProjectApiEntry>("/projects", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export async function updateProject(projectId: string, input: Partial<CreateProjectInput>): Promise<ProjectApiEntry> {
    return apiRequest<ProjectApiEntry>(`/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

export interface VolunteerEntry {
    volunteer_id: string;
    full_name: string;
    email: string;
    enrolled_at: string;
    enrollment_status: string;
}

export async function getProjectVolunteers(
    projectId: string,
    params: { pageIndex?: number; pageSize?: number; searchTerm?: string; statusFilter?: string } = {}
): Promise<{ volunteers: VolunteerEntry[]; totalVolunteers: number; total: number }> {
    const query = new URLSearchParams();
    if (params.pageIndex !== undefined) query.set("pageIndex", String(params.pageIndex + 1));
    if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize));
    if (params.searchTerm) query.set("searchTerm", params.searchTerm);
    if (params.statusFilter) query.set("statusFilter", params.statusFilter);
    const qs = query.toString();
    return apiRequest(`/projects/${projectId}/volunteers${qs ? `?${qs}` : ""}`);
}