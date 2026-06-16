import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArticleContent } from '../components/ArticleContent';
import { Header } from '../components/Header';
import { followAccount, getFollowersFor, getLocalProfile, getProfileById, type PublicAccountProfile, unfollowAccount } from '../services/accounts';
import { getCurrentSession } from '../services/auth';
import { getArticle, getFeaturedArticles } from '../services/articles/articles';
import { 
    postComment, 
    checkIfExistingLike, 
    likeArticle, 
    revokeLike,
    deleteComment
} from '../services/articles/interaction';
import type { Article, FeaturedArticle, Comment } from '../types/article';
import { SafeImage } from '../components/SafeImage';

function formatDate(value?: string) : string {
    if (!value) {
        return "—";
    }
    const d = value.includes("T") ? new Date(value) : new Date(value + "T00:00:00");
    if (Number.isNaN(d.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export const ReadArticlePage = () => {
    const { articleId } = useParams<{ articleId: string }>();
    const navigate = useNavigate();
    const localProfile = getLocalProfile();
    const session = getCurrentSession();
    const canModerate = session?.roles?.some(role => role.toLowerCase() === 'moderator') ?? false;
    
    const currentUserName = localProfile ? `${localProfile.name || ''} ${localProfile.parentalSurname || ''} ${localProfile.maternalSurname || ''}`.trim() : "Usuario Anónimo";
    const currentUserPfp = localProfile?.pfpUri || "";

    const [article, setArticle] = useState<Article | null>(null);
    const [featuredArticles, setFeaturedArticles] = useState<FeaturedArticle[]>([]);
    
    const [authorProfile, setAuthorProfile] = useState<PublicAccountProfile | null>(null);
    const [followerCount, setFollowerCount] = useState(0);
    const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsCount, setCommentsCount] = useState(0);
    
    const [commentInput, setCommentInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const commentInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!articleId) {
            return;
        }

        const loadArticleData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedArticle = await getArticle(articleId);

                const [fetchedFeatured, userLiked] = await Promise.all([
                    fetchedArticle.status === "Published" ? getFeaturedArticles(3) : Promise.resolve([]),
                    session != null ? checkIfExistingLike(articleId).catch(() => false) : false
                ]);

                const fetchedProfile = await getProfileById(fetchedArticle.authorId).catch((err) => {
                    console.error("Error al cargar perfil público del autor:", err);
                    return null;
                });

                setArticle(fetchedArticle);
                setFeaturedArticles(fetchedFeatured);
                setAuthorProfile(fetchedProfile);

                if (fetchedProfile?.id) {
                    const followers = await getFollowersFor(fetchedProfile.id).catch((err) => {
                        console.error('Error al obtener seguidores del autor:', err);
                        return [] as Array<{ follower: PublicAccountProfile }>;
                    });

                    setFollowerCount(followers.length);
                    setIsFollowingAuthor(
                        !!followers.find((entry) => entry.follower.id === session?.sub),
                    );
                }

                setLikesCount(fetchedArticle.likesCount);
                setCommentsCount(fetchedArticle.commentsCount);
                setComments(fetchedArticle.recentComments || []);
                setIsLiked(userLiked);
            } catch (err) {
                console.error("Error loading article:", err);
                setError("No se pudo cargar el artículo o no existe.");
            } finally {
                setIsLoading(false);
            }
        };

        loadArticleData();
    }, [articleId]);

    const handleLikeToggle = async () => {
        if (!articleId || article?.status !== "Published") {
            return;
        }

        if (!localProfile) {
            return alert("Debes iniciar sesión para dar me gusta.");
        }

        const previouslyLiked = isLiked;
        
        setIsLiked(!previouslyLiked);
        setLikesCount(prev => previouslyLiked ? prev - 1 : prev + 1);

        try {
            if (previouslyLiked) {
                const res = await revokeLike(articleId);
                setLikesCount(res.currentLikes);
            } else {
                const res = await likeArticle(articleId);
                setLikesCount(res.currentLikes);
            }
        } catch (error) {
            setIsLiked(previouslyLiked);
            setLikesCount(prev => previouslyLiked ? prev + 1 : prev - 1);
            console.error("Failed to like article:", error);
        }
    };

    const handleFollowToggle = async () => {
        if (!session || !authorProfile?.id) {
            return alert('Debes iniciar sesión para seguir o dejar de seguir al autor.');
        }

        const targetAccountId = authorProfile.id;
        const currentlyFollowing = isFollowingAuthor;

        setIsFollowingAuthor(!currentlyFollowing);
        setFollowerCount((count) => currentlyFollowing ? count - 1 : count + 1);

        try {
            if (currentlyFollowing) {
                await unfollowAccount(targetAccountId);
            } else {
                await followAccount(targetAccountId);
            }
        } catch (err) {
            setIsFollowingAuthor(currentlyFollowing);
            setFollowerCount((count) => currentlyFollowing ? count + 1 : count - 1);
            console.error('Error al actualizar seguimiento:', err);
            alert('No se pudo actualizar el seguimiento. Intenta de nuevo.');
        }
    };

    const handleSendComment = async () => {
        const text = commentInput.trim();
        if (!text || !articleId || article?.status !== "Published") {
            return;
        }
        if (!localProfile) {
            return alert("Debes iniciar sesión para comentar.");
        }

        setIsSubmitting(true);
        try {
            const res = await postComment(articleId, {
                authorName: currentUserName,
                authorPfpUri: currentUserPfp,
                content: text
            });

            if (res.success) {
                const newComment: Comment = {
                    id: res.commentId,
                    authorId: localProfile.id || "me",
                    authorName: currentUserName,
                    authorPfpUri: currentUserPfp,
                    content: text,
                    postedAt: formatDate(res.postedAt)
                };

                setComments(prev => [newComment, ...prev]);
                setCommentsCount(prev => prev + 1);
                setCommentInput('');
            } else {
                alert("No se pudo publicar tu comentario. Intenta de nuevo más tarde.");
            }
        } catch (error) {
            console.error("Failed to post comment:", error);
            alert("Hubo un error al enviar tu comentario.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFocusComment = () => {
        if (article?.status !== "Published") {
            return;
        }

        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCommentInput(e.target.value.trimStart());
    };

    if (isLoading) {
        return (
            <div className="h-screen bg-gray-100 flex flex-col">
                <Header />
                <div className="flex-1 flex justify-center items-center">
                    <p className="text-gray-500 font-medium">Cargando artículo...</p>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="h-screen bg-gray-100 flex flex-col">
                <Header />
                <div className="flex-1 flex justify-center items-center">
                    <p className="text-red-500 font-medium">{error || "Artículo no encontrado"}</p>
                </div>
            </div>
        );
    }

    const isRemoved = article.status === "Removed";
    const isPreview = (article.status === "Draft" || article.status === "UnderReview" || article.status === "Rejected");
    const isPublished = article.status === "Published";

    return (
        <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
            <Header />

            <div style={{ display: 'flex', padding: '20px 40px', gap: '20px' }} />

            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 flex justify-center gap-8 overflow-hidden">
                
                {/* Main content */}
                <section className="flex-1 max-w-[900px] flex flex-col bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden h-full">
                    {isPreview && (
                        <div className="w-full bg-blue-100 text-blue-700 py-3 px-4 font-bold text-sm text-center border-b border-blue-200">
                            Este articulo aun no ha sido publicado. Esta es una vista previa del artículo.
                        </div>
                    )}
                    {isRemoved && (
                        <div className="w-full bg-orange-100 text-black-700 py-3 px-4 font-bold text-sm text-center border-b border-orange-200">
                            Este artículo ha sido eliminado y ahora es de solo lectura.
                        </div>
                    )}
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-gray-200 shrink-0 bg-white z-10 flex flex-col items-center text-center">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            {article.title}
                        </h1>
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-gray-500">
                            <span className="flex items-center gap-1">
                                <span className="text-gray-400">Autor:</span> <span className="text-gray-800">{article.authorName}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="text-gray-400">Publicado:</span> 
                                <span className="text-gray-800">
                                    {formatDate(article.publishedAt)}
                                </span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="text-gray-400">Categoría:</span> <span className="text-gray-800">{article.category}</span>
                            </span>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto scroll-smooth p-6 md:p-10 bg-white">
                        
                        <div className="w-full max-h-[450px] h-[450px] rounded-xl mb-10 border border-gray-200 overflow-hidden bg-gray-50 shrink-0">
                            <SafeImage 
                                src={article.coverUri} 
                                alt="Portada del artículo" 
                                variant="cover"
                                className="w-full h-full object-cover" 
                            />
                        </div>

                        <div className="w-full">
                            <ArticleContent content={article.content} />
                        </div>

                        {/* Interaction bar */}
                        <div className="w-full flex items-center justify-start gap-8 mt-12 pt-6 border-t border-gray-100">
                            <button 
                                onClick={handleLikeToggle}
                                disabled={!isPublished}
                                className={`flex items-center gap-2 transition-colors ${
                                    isPublished ? '' : 'opacity-50 cursor-not-allowed'
                                } ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                            >
                                <svg className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="font-semibold">{likesCount} Likes</span>
                            </button>
                            
                            <button 
                                onClick={handleFocusComment}
                                disabled={!isPublished}
                                className={`flex items-center gap-2 transition-colors ${
                                    isPublished ? '' : 'opacity-50 cursor-not-allowed text-gray-600'
                                }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="font-semibold">{commentsCount} Comentarios</span>
                            </button>

                            <button 
                                onClick={() => navigator.clipboard.writeText(globalThis.location.href).then(() => alert("Enlace copiado!"))}
                                disabled={!isPublished}
                                className={`flex items-center gap-2 transition-colors ${
                                    isPublished ? '' : 'opacity-50 cursor-not-allowed text-gray-600'
                                }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <span className="font-semibold">Compartir</span>
                            </button>
                        </div>

                        {/* Comment section */}
                        <div className="w-full mt-10 bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Comentarios</h3>
                            
                            <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-3">
                                {comments.length === 0 ? (
                                    <p className="text-gray-500 italic text-sm">Sé el primero en comentar.</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-4 items-start justify-between w-full border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                            <div className="flex gap-4 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                                                    <SafeImage 
                                                        src={comment.authorPfpUri} 
                                                        alt={comment.authorName} 
                                                        variant="avatar" 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="font-bold text-gray-900 text-sm">{comment.authorName}</span>
                                                    <p className="text-gray-700 mt-1 text-sm leading-relaxed break-words">{comment.content}</p>
                                                    <span className="text-xs text-gray-500">{formatDate(comment.postedAt)}</span>
                                                </div>
                                            </div>

                                            {canModerate && (
                                                <button
                                                    onClick={async () => {
                                                        if (globalThis.confirm("¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.")) {
                                                            try {
                                                                await deleteComment(articleId!, comment.id);
                                                                setComments(prev => prev.filter(c => c.id !== comment.id));
                                                                setCommentsCount(prev => Math.max(0, prev - 1));
                                                            } catch (err) {
                                                                console.error("Error al eliminar comentario:", err);
                                                                alert("No se pudo completar la eliminación del comentario.");
                                                            }
                                                        }
                                                    }}
                                                    className="text-xs text-red-500 hover:text-red-700 font-bold shrink-0 ml-4 px-2.5 py-1 rounded border border-red-200 hover:border-red-300 bg-white transition-colors"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    {session ? (
                        <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50 shrink-0 flex items-center gap-4 z-10">
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-300 bg-gray-100">
                                <SafeImage 
                                    src={currentUserPfp} 
                                    alt="Mi perfil" 
                                    variant="avatar" 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            <input
                                ref={commentInputRef}
                                type="text"
                                value={commentInput}
                                onChange={handleCommentChange}
                                maxLength={500}
                                placeholder={isPublished ? "Escribe un comentario..." : "No se pueden comentar artículos no publicados o eliminados."}
                                disabled={isSubmitting || !isPublished}
                                className="flex-1 h-12 border border-gray-300 rounded-lg px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white disabled:bg-gray-200 disabled:cursor-not-allowed overflow-x-auto whitespace-nowrap scrollbar-thin"
                            />
                            <span className="text-xs text-gray-500 font-semibold shrink-0">
                                {commentInput.length}/500
                            </span>
                            <button 
                                onClick={handleSendComment}
                                disabled={commentInput.trim().length === 0 || isSubmitting}
                                className={`h-12 px-6 font-bold rounded-full text-sm transition-colors shadow-sm shrink-0 ${
                                    commentInput.trim().length > 0 && !isSubmitting
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                    : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar'}
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50 w-full flex items-center justify-center z-10">
                            <div style={{ width: '100%', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px', textAlign: 'center', fontSize: '14px', color: '#6b7280', border: '1px solid #e5e7eb' }}>
                                Debes <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }} onClick={() => navigate('/login')}>iniciar sesión</span> para publicar un comentario o interactuar con el artículo.
                            </div>
                        </div> 
                    )}
                </section>

                {/* Lateral bar */}
                <aside className="w-[320px] hidden lg:flex flex-col gap-6 overflow-y-auto h-full pb-4 shrink-0">
                    
                    <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-sm flex flex-col items-center text-center shrink-0">
                        <h3 className="w-full text-left text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Sobre el autor</h3>
                        
                        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-gray-50 shadow-sm bg-gray-100 shrink-0">
                            <SafeImage 
                                src={authorProfile?.pfpUri} 
                                alt={article.authorName} 
                                variant="avatar" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        
                        <h4 className="font-extrabold text-gray-900 text-lg">
                            {authorProfile ? `${authorProfile.name} ${authorProfile.parentalSurname ?? ''}`.trim() : article.authorName}
                        </h4>
                        <p className="text-gray-500 text-sm mt-3 leading-relaxed line-clamp-4">
                            {authorProfile?.bio ?? "Autor contribuyente en la plataforma Gazella."}
                        </p>

                        <div className="mt-6 flex flex-col gap-3 w-full">
                            <button
                                type="button"
                                onClick={handleFollowToggle}
                                className={`w-full h-11 rounded-full font-semibold transition-colors ${isFollowingAuthor ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            >
                                {isFollowingAuthor ? 'Siguiendo' : 'Seguir'}
                            </button>
                            <div className="text-sm text-gray-500">
                                {followerCount} {followerCount === 1 ? 'seguidor' : 'seguidores'}
                            </div>
                        </div>
                    </div>

                    {isPublished && featuredArticles.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-sm flex flex-col shrink-0">
                            <h3 className="text-xs text-center font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Artículos Destacados</h3>
                            <div className="flex flex-col gap-5">
                                {featuredArticles.map((related) => (
                                    <div 
                                        key={related.id} 
                                        onClick={() => navigate(`/articulos/${related.id}`)}
                                        className="group cursor-pointer flex flex-col gap-2"
                                    >
                                        <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                                            <SafeImage 
                                                src={related.coverUri} 
                                                alt={related.title} 
                                                variant="cover" 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                            />
                                        </div>
                                        <h4 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {related.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 line-clamp-2">
                                            {related.summary}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
};
