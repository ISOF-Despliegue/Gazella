import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFollowersFor, getProfileById, followAccount, unfollowAccount, type PublicAccountProfile } from '../services/accounts';
import { getCurrentSession } from '../services/auth';
import { searchArticles } from '../services/articles/articles';
import { Header } from '../components/Header';
import { SafeImage } from '../components/SafeImage';
import { type ArticleSearchEntry } from '../types/article';

function formatMemberSince(date?: string) {
    if (!date) {
        return 'Miembro reciente';
    }
    return `Miembro desde ${new Intl.DateTimeFormat('es-MX', { month: 'short', year: 'numeric' }).format(new Date(date))}`;
}

function formatDate(value?: string): string {
    if (!value) return "—";
    const d = value.includes("T") ? new Date(value) : new Date(value + "T00:00:00");
    if (Number.isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export function UserProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const session = getCurrentSession();
    const isOwnProfile = session?.sub === userId;

    const [profile, setProfile] = useState<PublicAccountProfile | null>(null);
    const [articles, setArticles] = useState<ArticleSearchEntry[]>([]);
    const [followerCount, setFollowerCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setError('No se especificó un usuario.');
            setIsLoading(false);
            return;
        }

        const loadProfile = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const fetchedProfile = await getProfileById(userId);
                setProfile(fetchedProfile);

                // Fetch follower count and following status
                if (fetchedProfile?.id) {
                    const followers = await getFollowersFor(fetchedProfile.id).catch(() => [] as Array<{ follower: PublicAccountProfile }>);
                    setFollowerCount(followers.length);
                    setIsFollowing(!!followers.some((entry) => entry.follower.id === session?.sub));
                }

                // Fetch articles by this author
                const articleResult = await searchArticles({
                    authorName: fetchedProfile.name,
                    pageSize: 10,
                }).catch(() => ({ entries: [] as ArticleSearchEntry[], totalEntries: 0, currentPage: 1, pageCount: 0, pageSize: 10 }));

                setArticles(articleResult.entries ?? []);
            } catch (err) {
                console.error("Error loading user profile:", err);
                setError('No se pudo cargar el perfil del usuario.');
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [userId, session?.sub]);

    const displayName = useMemo(() => {
        if (!profile) return 'Cargando...';
        return [profile.name, profile.parentalSurname, profile.maternalSurname]
            .filter(Boolean)
            .join(' ');
    }, [profile]);

    const handleFollowToggle = async () => {
        if (!session || !profile?.id) {
            return alert('Debes iniciar sesión para seguir o dejar de seguir usuarios.');
        }

        const targetAccountId = profile.id;
        const currentlyFollowing = isFollowing;

        setIsFollowing(!currentlyFollowing);
        setFollowerCount((count) => currentlyFollowing ? count - 1 : count + 1);

        try {
            if (currentlyFollowing) {
                await unfollowAccount(targetAccountId);
            } else {
                await followAccount(targetAccountId);
            }
        } catch (err) {
            setIsFollowing(currentlyFollowing);
            setFollowerCount((count) => currentlyFollowing ? count + 1 : count - 1);
            console.error('Error al actualizar seguimiento:', err);
        }
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
                <Header />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px' }}>
                    <p style={{ color: '#6b7280', fontWeight: 'bold', fontSize: '18px' }}>Cargando perfil...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
                <Header />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px' }}>
                    <p style={{ color: '#b91c1c', fontWeight: 'bold', fontSize: '18px' }}>{error || 'Perfil no encontrado'}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '40px' }}>
            <Header />

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 20px' }}>
                {/* Profile card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    padding: '32px',
                    marginBottom: '28px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '28px' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '96px',
                            height: '96px',
                            borderRadius: '50%',
                            border: '2px solid #e5e7eb',
                            overflow: 'hidden',
                            flexShrink: 0,
                            backgroundColor: '#f3f4f6',
                        }}>
                            <SafeImage
                                src={profile.pfpUri}
                                alt={displayName}
                                variant="avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: 0 }}>{displayName}</h1>

                                {session && !isOwnProfile && (
                                    <button
                                        onClick={handleFollowToggle}
                                        style={{
                                            padding: '8px 20px',
                                            borderRadius: '9999px',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            border: isFollowing ? '1px solid #d1d5db' : 'none',
                                            backgroundColor: isFollowing ? '#f3f4f6' : '#2563eb',
                                            color: isFollowing ? '#374151' : 'white',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                                    </button>
                                )}

                                {isOwnProfile && (
                                    <button
                                        onClick={() => navigate('/perfil')}
                                        style={{
                                            padding: '8px 20px',
                                            borderRadius: '6px',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            border: '1px solid #d1d5db',
                                            backgroundColor: 'white',
                                            color: '#374151',
                                        }}
                                    >
                                        Mi Perfil
                                    </button>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                <span style={{
                                    border: '1px solid #22c55e',
                                    borderRadius: '9999px',
                                    padding: '2px 16px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#166534',
                                }}>
                                    {profile.role}
                                </span>
                                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                                    {formatMemberSince(profile.joinedAt)}
                                </span>
                                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                                    <strong style={{ color: '#374151' }}>{followerCount}</strong> {followerCount === 1 ? 'seguidor' : 'seguidores'}
                                </span>
                            </div>

                            <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: '1.6' }}>
                                {profile.bio || 'Apasionado de la biodiversidad y la conservación...'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Articles section */}
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' }}>
                    Artículos publicados
                </h2>

                {articles.length === 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        padding: '40px',
                        textAlign: 'center',
                        color: '#6b7280',
                    }}>
                        Este usuario aún no tiene artículos publicados.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {articles.map((article) => (
                            <div
                                key={article.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => navigate(`/articulos/${article.id}`)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        navigate(`/articulos/${article.id}`);
                                    }
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.2s',
                                }}
                            >
                                {/* Cover */}
                                <div style={{
                                    width: '72px',
                                    height: '72px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '6px',
                                    flexShrink: 0,
                                    overflow: 'hidden',
                                }}>
                                    <SafeImage
                                        src={article.coverUri}
                                        alt={article.title}
                                        variant="cover"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>
                                        {article.title}
                                    </h3>
                                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                                        {article.categoryName} · {formatDate(article.publishedAt)}
                                    </p>
                                    <p style={{ fontSize: '13px', color: '#374151', marginTop: '4px' }}>
                                        {article.summary}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}