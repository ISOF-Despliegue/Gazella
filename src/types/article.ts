import type { OutputData } from "@editorjs/editorjs";

export interface Category {
    id: string;
    name: string;
}

export interface DraftArticle {
    id: string | undefined;
    title: string;
    coverUri: string;
    summary: string;
    categoryId: string;
    authorId: string;
    content: OutputData
}

export interface Article {
    id: number | string;
    title: string;
    author: string;
    summary: string;
    imageUrl?: string;
    likes: number;
}

export interface ArticleSearchEntry {
    id: number;
    title: string;
    coverUri: string;
    authorId: string;
    authorName: string;
    categoryName: string;
    summary: string;
    publishedAt: string;
    lastUpdatedAt: string;
}

export interface ArticleSearchResult {
    entries: ArticleSearchEntry[];
    totalEntries: number;
    currentPage: number;
    pageCount: number;
    pageSize: number;
}
