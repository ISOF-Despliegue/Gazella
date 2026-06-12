import { apiRequest } from "./api";
import {
    type Article,
    type ArticleSearchResult,
    type Category,
    type PendingArticle,
    type RejectArticleRequest,
} from "../types/article";

type ArticleSearchEntry = {
    id: string;
    title: string;
    authorName?: string;
    summary?: string;
};

type ArticleSearchResponse = {
    entries: ArticleSearchEntry[];
};

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

const PENDING_ARTICLES_STUB: PendingArticle[] = [
    {
        id: "revision-1",
        title: "La importancia de separar basura",
        authorId: "author-1",
        authorName: "Carlos Castillo",
        categoryId: "biodiversidad",
        categoryName: "Biodiversidad",
        submittedAt: "2026-04-18T10:30:00.000Z",
        summary: "Pequeñas decisiones diarias que reducen residuos y protegen los ecosistemas.",
        coverUri: "",
        status: "pending",
        content: {
            time: 1776508200000,
            version: "2.31.6",
            blocks: [
                {
                    id: "intro-1",
                    type: "paragraph",
                    data: {
                        text: "Separar correctamente los residuos permite recuperar materiales, reducir la contaminación y evitar que la basura llegue a ríos, bosques y áreas naturales.",
                    },
                },
                {
                    id: "list-1",
                    type: "list",
                    data: {
                        style: "unordered",
                        items: [
                            { content: "Limpia y seca los envases antes de reciclarlos.", items: [] },
                            { content: "Separa los residuos orgánicos de los inorgánicos.", items: [] },
                            { content: "Lleva pilas y electrónicos a centros de acopio.", items: [] },
                        ],
                    },
                },
            ],
        },
    },
    {
        id: "revision-2",
        title: "Ecosistemas marinos",
        authorId: "author-2",
        authorName: "Leonardo Ortega",
        categoryId: "oceanos",
        categoryName: "Océanos",
        submittedAt: "2026-04-14T16:10:00.000Z",
        summary: "Una mirada a la riqueza y fragilidad de los hábitats marinos.",
        coverUri: "",
        status: "pending",
        content: {
            time: 1776179400000,
            version: "2.31.6",
            blocks: [
                {
                    id: "marine-1",
                    type: "paragraph",
                    data: {
                        text: "Los océanos regulan el clima y sostienen una enorme diversidad de vida, pero enfrentan presión por contaminación, pesca excesiva y calentamiento global.",
                    },
                },
            ],
        },
    },
    {
        id: "revision-3",
        title: "Especies en peligro en México",
        authorId: "author-3",
        authorName: "Abel Yong",
        categoryId: "flora-fauna",
        categoryName: "Flora y fauna",
        submittedAt: "2026-04-05T09:00:00.000Z",
        summary: "Especies mexicanas que requieren acciones urgentes de conservación.",
        coverUri: "",
        status: "pending",
        content: {
            time: 1775379600000,
            version: "2.31.6",
            blocks: [
                {
                    id: "species-1",
                    type: "paragraph",
                    data: {
                        text: "México es uno de los países con mayor biodiversidad del planeta. Proteger sus especies amenazadas también conserva los ecosistemas de los que dependemos.",
                    },
                },
            ],
        },
    },
    {
        id: "revision-4",
        title: "Deforestación y clima",
        authorId: "author-4",
        authorName: "Luis Flores",
        categoryId: "bosques",
        categoryName: "Bosques",
        submittedAt: "2026-04-01T12:45:00.000Z",
        summary: "Cómo la pérdida de bosques acelera el cambio climático.",
        coverUri: "",
        status: "pending",
        content: {
            time: 1775057100000,
            version: "2.31.6",
            blocks: [
                {
                    id: "forest-1",
                    type: "paragraph",
                    data: {
                        text: "Los bosques capturan carbono, regulan el agua y brindan refugio a miles de especies. Frenar la deforestación es una medida climática esencial.",
                    },
                },
            ],
        },
    },
];

// TODO: Replace these stubs with the article moderation API once its contract is available.
export async function getPendingArticles(): Promise<PendingArticle[]> {
    return Promise.resolve(
        PENDING_ARTICLES_STUB
            .filter(({ status }) => status === "pending")
            .map((article) => ({ ...article })),
    );
}

export async function getPendingArticle(articleId: string): Promise<PendingArticle> {
    const article = PENDING_ARTICLES_STUB.find(({ id }) => id === articleId);

    if (!article) {
        throw new Error("No se encontró el artículo pendiente.");
    }

    return Promise.resolve({ ...article });
}

export async function approveArticle(articleId: string): Promise<{ message: string }> {
    const article = PENDING_ARTICLES_STUB.find(({ id }) => id === articleId);
    if (!article) {
        throw new Error("No se encontró el artículo pendiente.");
    }

    article.status = "approved";
    return Promise.resolve({ message: "Artículo aprobado correctamente." });
}

export async function rejectArticle(
    articleId: string,
    request: RejectArticleRequest,
): Promise<{ message: string }> {
    const article = PENDING_ARTICLES_STUB.find(({ id }) => id === articleId);
    if (!article) {
        throw new Error("No se encontró el artículo pendiente.");
    }
    if (!request.reason.trim()) {
        throw new Error("El motivo del rechazo es obligatorio.");
    }

    article.status = "rejected";
    return Promise.resolve({ message: "Artículo rechazado correctamente." });
}
