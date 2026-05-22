export interface Article {
    id: number | string;
    title: string;
    author: string;
    summary: string;
    imageUrl?: string;
    likes: number;
}
