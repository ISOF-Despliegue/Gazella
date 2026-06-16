import { apiRequest } from "../api";
import { type GetOlderCommentsResult } from '../../types/article';

export interface PostCommentRequest {
    authorName: string;
    authorPfpUri: string;
    content: string;
}

export interface PostCommentResponse {
    success: boolean;
    commentId: string;
    postedAt: string;
}

export async function postComment(articleId: string, request: PostCommentRequest): Promise<PostCommentResponse> {
    return await apiRequest<PostCommentResponse>(`/articles/interactions/${articleId}/comments`, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

export interface DeleteCommentResponse {
    success: boolean;
    message: string;
}

export async function deleteComment(articleId: string, commentId: string): Promise<DeleteCommentResponse> {
    const response = await apiRequest<DeleteCommentResponse>(`/articles/interactions/${articleId}/comments/${commentId}`, {
        method: "DELETE",
    });
    return response;
}

export async function deleteOwnComment(articleId: string, commentId: string, authorId: string): Promise<DeleteCommentResponse> {
    const response = await apiRequest<DeleteCommentResponse>(`/articles/interactions/${articleId}/authors/${authorId}/comments/${commentId}`, {
        method: "DELETE",
    });
    return response;
}

export async function getOlderComments(articleId: string, pageIndex: number): Promise<GetOlderCommentsResult> {
    const searchParams = new URLSearchParams();

    searchParams.append("pageIndex", pageIndex.toString());

    return await apiRequest<GetOlderCommentsResult>(`/articles/interactions/${articleId}/comments${searchParams.toString()}`, {
        skipAuth: true
    });
}

interface CheckExistingLikeResponse {
    isAlreadyLiked: boolean;
}

export async function checkIfExistingLike(articleId: string): Promise<boolean> {
    const response = await apiRequest<CheckExistingLikeResponse>(`/articles/interactions/${articleId}/likes/me`);
    return response.isAlreadyLiked;
}

export interface LikeArticleResponse {
    message: string;
    currentLikes: number;
}

export async function likeArticle(articleId: string): Promise<LikeArticleResponse> {
    return await apiRequest<LikeArticleResponse>(`/articles/interactions/${articleId}/likes`, {
        method: "POST",
    });
}

export interface RevokeLikeResponse {
    message: string;
    currentLikes: number;
}

export async function revokeLike(articleId: string): Promise<RevokeLikeResponse> {
    return await apiRequest<RevokeLikeResponse>(`/articles/interactions/${articleId}/likes`, {
        method: "DELETE",
    });
}
