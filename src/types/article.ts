export interface Article {
    id: number;
    title: string;
    author: string;
    summary: string;
    imageUrl?: string;
    likes: number;
}