export interface Project {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    date: string;
    volunteersEnrolled: number;
    volunteersMax: number;
    status: "Active" | "Draft" | "Cancelled" | "Completed" | string;
    category: string;
    coverUri?: string;
    imageUrl?: string;
}

export interface ProjectsResponse {
    projects: ProjectApiEntry[];
    totalProjects: number;
    currentPage: number;
    pageCount: number;
    pageSize: number;
}

export interface ProjectApiEntry {
    project_id: string;
    title: string;
    description: string;
    cover_uri?: string;
    location: string;
    category: string;
    start_date: string;
    end_date: string;
    status: string;
    enrolled_count: number;
    max_volunteers: number;
}

export interface EnrollmentApiEntry {
    project_id: string;
    project_title: string;
    location: string;
    start_date: string;
    project_status: string;
    enrollment_status: "Confirmed" | "Cancelled" | string;
    enrolled_at: string;
    cover_uri?: string;
}

export interface CreateProjectInput {
    title: string;
    description: string;
    location: string;
    categoryId?: string;
    organizerId?: string;
    organizerName?: string;
    coverUri?: string;
    organizerPfpUri?: string;
    startDate: string;
    endDate: string;
    maxVolunteers: number;
    isDraft: boolean;
}