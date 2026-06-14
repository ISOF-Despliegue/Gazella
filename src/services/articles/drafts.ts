import { apiRequest } from "../api";
import type { Draft, SubmitDraftResponse } from "./articles";

export interface ArticlePendingReview {
    id: string;
    title: string;
    authorName: string;
    category: string;
    submittedAt: string;
}

export interface ArticlesPendingReviewResult {
    articlesPending: ArticlePendingReview[];
    totalPending: number;
    currentPage: number;
    pageCount: number;
    pageSize: number; 
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

export async function getPendingReview(pageIndex: number, pageSize: number): Promise<ArticlesPendingReviewResult> {
    const searchParams = new URLSearchParams();

    if (pageIndex !== undefined) {
        searchParams.append("pageIndex", pageIndex.toString());
    }

    if (pageSize !== undefined) {
        searchParams.append("pageSize", pageSize.toString())
    }

    let queryString = searchParams.toString();
    queryString = queryString ? `?${queryString}` : "";

    const response = await apiRequest<ArticlesPendingReviewResult>(`/articles/to-review-articles${queryString}`);

    return response ?? [];
}

interface ArticleReviewResponse {
    message: string;
    status: string;
}

export async function approveArticle(articleId: string): Promise<boolean> {
    const response = await apiRequest<ArticleReviewResponse>(`/articles/reviews/${articleId}/publications`, {
        method: "POST"
    });

    return response?.status === "Published";
}

export interface RejectionReason {
    rejectionReason: string;
}

export async function rejectArticle(articleId: string, rejectionReason: RejectionReason): Promise<boolean> {
    const response = await apiRequest<ArticleReviewResponse>(`/articles/reviews/${articleId}/rejections`, {
        method: "POST",
        body: JSON.stringify(rejectionReason)
    });

    return response?.status === "Rejected";
}
