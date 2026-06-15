import { apiRequest } from "../api";
import {
    type Article,
    type ArticleSearchResult,
    type AuthorStats,
    type Category,
    type FeaturedArticle,
    type MyArticle
} from "../../types/article";

export interface SearchArticlesParams {
    pageIndex?: number;
    pageSize?: number;
    title?: string;
    category?: string;
    authorName?: string;
    publishedAfter?: string;
    sortBy?: string;
}

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

export async function getArticle(articleId: string): Promise<Article> {
    const response = await apiRequest<Article>(`/articles/articles/${articleId}`, {
        skipAuth: true
    });

    return response;
}

export async function getFeaturedArticles(amount: number = 3): Promise<FeaturedArticle[]> {
    const response = await apiRequest<FeaturedArticle[]>(`/articles/featured?amount=${amount}`, {
        skipAuth: true,
    });

    return response ?? [];
}

export async function searchArticles(params: SearchArticlesParams): Promise<ArticleSearchResult> {
    const searchParams = new URLSearchParams();

    if (params.pageIndex !== undefined) {
        searchParams.append("pageIndex", params.pageIndex.toString());
    }
    if (params.pageSize !== undefined) {
        searchParams.append("pageSize", params.pageSize.toString());
    }
    if (params.title) {
        searchParams.append("title", params.title);
    }
    if (params.category) {
        searchParams.append("category", params.category);
    }
    if (params.authorName) {
        searchParams.append("authorName", params.authorName);
    }
    if (params.publishedAfter) {
        searchParams.append("publishedAfter", params.publishedAfter);
    }
    if (params.sortBy) {
        searchParams.append("sortBy", params.sortBy);
    }

    let queryString = searchParams.toString();
    queryString = queryString ? `?${queryString}` : "";
    
    const endpoint = `/articles/search${queryString}`;

    return apiRequest<ArticleSearchResult>(endpoint, {
        skipAuth: true
    });
}

export async function getCategories(): Promise<Category[]> {
    const response = await apiRequest<Category[]>("/articles/categories", {
        skipAuth: true
    });

    return response ?? [];
}

export async function getMyArticles(): Promise<MyArticle[]> {
    const response = await apiRequest<MyArticle[]>("/articles/my-articles");

    return response ?? [];
}

export async function deleteMyArticle(articleId: string, myUserId: string): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>(`/articles/authors/${myUserId}/articles/${articleId}`, {
        method: "DELETE",
    });
}

export async function getMyAuthorStats(): Promise<AuthorStats> {
    return await apiRequest<AuthorStats>("/articles/my-stats");
}
