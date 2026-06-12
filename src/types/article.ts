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

export type PublishedArticleStatus = "published" | "deleted";

export interface PublishedArticle {
    id: string;
    title: string;
    authorName: string;
    publishedAt: string;
    likesCount: number;
    commentsCount: number;
    status: PublishedArticleStatus;
}

export interface PublishedArticlesResponse {
    publishedArticles: PublishedArticle[];
    totalEntries: number;
    currentPage: number;
    pageCount: number;
    pageSize: number;
}

export interface TopAuthorArticle {
    id: string;
    title: string;
    likesCount: number;
    commentsCount: number;
}

export interface RecentAuthorActivity {
    latestCommentId?: string;
    latestCommentArticleId?: string;
    latestCommentPostedAt?: string;
    likesToday: number;
}

export interface AuthorStats {
    topArticles: TopAuthorArticle[];
    recentActivity: RecentAuthorActivity;
    totalLikes: number;
    totalComments: number;
    publishedArticlesCount: number;
    engagementRate: number;
}
