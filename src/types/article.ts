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

export type ArticleReviewStatus = "pending" | "approved" | "rejected";

export interface PendingArticle {
    id: string;
    title: string;
    authorId: string;
    authorName: string;
    categoryId: string;
    categoryName: string;
    submittedAt: string;
    summary: string;
    coverUri?: string;
    content: OutputData;
    status: ArticleReviewStatus;
}

export interface RejectArticleRequest {
    reason: string;
}
