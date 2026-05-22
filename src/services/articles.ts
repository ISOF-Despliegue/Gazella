import { apiRequest } from "./api";
import { type Article } from "../types/article";

type ArticleSearchEntry = {
    id: string;
    title: string;
    authorName?: string;
    summary?: string;
};

type ArticleSearchResponse = {
    entries: ArticleSearchEntry[];
};

export async function getFeaturedArticles(): Promise<Article[]> {
    const searchParams = new URLSearchParams({
        pageIndex: "0",
        pageSize: "10",
        sortBy: "likes",
    });

    const response = await apiRequest<ArticleSearchResponse>(`/articles/search?${searchParams.toString()}`, {
        skipAuth: true,
    });

    return response.entries.slice(0, 3).map((entry) => ({
        id: entry.id,
        title: entry.title,
        author: entry.authorName || "Autor no disponible",
        summary: entry.summary || "Sin resumen disponible",
        likes: 0,
    }));
}
