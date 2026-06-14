export interface Category {
    id: string;
    name: string;
}

export interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    authorPfpUri: string;
    content: string;
    postedAt: string;
}

export interface Article {
    id: string;
    title: string;
    coverUri: string;
    summary: string;
    category: string;
    publishedAt: string;
    lastUpdatedAt: string;
    status: string;
    content: string;
    authorId: string;
    authorName: string;
    authorPfpUri: string;
    likesCount: number;
    commentsCount: number;
    recentComments: Comment[] 
}

export interface FeaturedArticle {
    id: string;
    title: string;
    coverUri: string;
    authorId: string;
    authorName: string;
    authorPfpUri: string;
    summary: string;
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

export interface GetOlderCommentsResult {
    comments: Comment[],
    totalComments: number;
    currentPage: number;
    pageCount: number;
    pageSize: number;
}

export interface RejectArticleRequest {
    reason: string;
}

export type PublishedArticleStatus = "Published" | "Removed";

export interface PublishedArticle {
    id: string;
    title: string;
    authorName: string;
    publishedAt: string;
    likesCount: number;
    commentsCount: number;
    status: PublishedArticleStatus;
}

export interface PublishedArticlesResult {
    publishedArticles: PublishedArticle[];
    totalEntries: number;
    currentPage: number;
    pageCount: number;
    pageSize: number;
}

export interface MyArticle {
    id: string;
    title: string;
    coverUri: string;
    status: string;
    category: string;
    publishedAt: string;
    likes: string;
    comments: string;
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
