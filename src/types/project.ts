export interface Project {
    id: number | string;
    title: string;
    description: string;
    location: string;
    date: string;
    volunteersEnrolled: number;
    volunteersMax: number;
    imageUrl?: string;
}
