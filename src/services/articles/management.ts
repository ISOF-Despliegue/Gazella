import { apiRequest } from "../api";
import { type PublishedArticlesResult } from "../../types/article";

export async function getPublishedArticles(pageIndex: number, pageSize: number): Promise<PublishedArticlesResult> {
    const searchParams = new URLSearchParams();

    if (pageIndex !== undefined) {
        searchParams.append("pageIndex", pageIndex.toString());
    }

    if (pageSize !== undefined) {
        searchParams.append("pageSize", pageSize.toString())
    }

    let queryString = searchParams.toString();
    queryString = queryString ? `?${queryString}` : "";
    
    const response = await apiRequest<PublishedArticlesResult>(`/articles/publications${queryString}`);
    return response ?? [];
}

export async function deletePublishedArticle(articleId: string): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>(`/articles/publications/${articleId}`, {
        method: "DELETE",
    });
}
