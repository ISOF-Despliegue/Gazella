import { apiRequest } from "./api";
import { type Article, type Category } from "../types/article";
import type { OutputData } from "@editorjs/editorjs";

type ArticleSearchEntry = {
    id: string;
    title: string;
    authorName?: string;
    summary?: string;
};

type ArticleSearchResponse = {
    entries: ArticleSearchEntry[];
};

export type Draft = {
    id: string | undefined;
    title: string;
    coverUri: string;
    summary: string;
    categoryId: string;
    authorId: string;
    authorName: string;
    authorPfpUri: string;
    content: string
}

export type SubmitDraftResponse = {
    message: string;
    id: string;
}

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

export async function getCategories(): Promise<Category[]> {
    const response = await apiRequest<Category[]>("/articles/categories", {
        skipAuth: true
    });

    return response ?? [];
}

export async function submitDraft(draft: Draft) {
    return apiRequest<SubmitDraftResponse>("/articles/drafts", {
        method: "POST",
        body: JSON.stringify(draft)
    });
}

export async function publishDraft(draft: Draft) {
    return apiRequest<{ message: string }>(`/articles/drafts/${draft.id}/publications`, {
        method: "POST",
        body: JSON.stringify(draft)
    });
}
