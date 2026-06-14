import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';
import { ProjectCard } from '../components/ProjectCard';
import { type FeaturedArticle } from '../types/article';
import { getFeaturedArticles } from '../services/articles/articles';
import { type Project } from '../types/project';
import { getLocalProfile, getMyAccount, type EditableAccountProfile } from '../services/accounts';
import { getCurrentSession, logout, type AuthSession } from '../services/auth';
import { getUpcomingProjects } from '../services/projects';
import { BackButton } from '../components/BackButton';
import { assets } from '../assets/assets';

function getFullName(profile: EditableAccountProfile | null, session: AuthSession | null) {
    if (profile?.name) {
        return [profile.name, profile.parentalSurname, profile.maternalSurname]
            .filter(Boolean)
            .join(' ');
    }

    return session?.email?.split('@')[0] ?? 'usuario';
}

export function DashboardPage() {
    const navigate = useNavigate();
    const [session, setSession] = useState<AuthSession | null>(null);

    const [profile, setProfile] = useState<EditableAccountProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);

    const [isLoadingArticles, setIsLoadingArticles] = useState(true);
    const [articles, setArticles] = useState<FeaturedArticle[]>([]);

    useEffect(() => {
        const currentSession = getCurrentSession();

        if (!currentSession) {
            navigate('/login');
            return;
        }

        setSession(currentSession);
        setProfile(getLocalProfile(currentSession.email));

        getMyAccount()
            .then((account) => {
                setProfile(account);
            })
            .catch(() => undefined)
            .finally(() => setIsLoadingProfile(false));

        getFeaturedArticles(3)
            .then(setArticles)
            .catch(() => setArticles([]))
            .finally(() => setIsLoadingArticles(false));
        
        getUpcomingProjects()
            .then(setProjects)
            .catch(() => setProjects([]))
            .finally(() => setIsLoadingProjects(false));
    }, [navigate]);

    const displayName = useMemo(() => getFullName(profile, session), [profile, session]);
    const roleLabel = profile?.role ?? session?.roles[0] ?? 'sin rol asignado';
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'U';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isOrganizer = session?.roles?.includes('organizer');
    const isEditor = session?.roles?.some((role) => ['editor', 'moderator'].includes(role.toLowerCase()));

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <nav style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 40px',
                backgroundColor: 'white',
                borderBottom: '1px solid #e5e7eb',
                gap: '24px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <BackButton fallbackPath="/home" />
                    <img src={assets.gazella} alt="Gazella" style={{ width: '70px', objectFit: 'contain' }} />
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: '1.2' }}>
                        Conservacion de<br />la biodiversidad
                    </h1>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #d1d5db',
                    borderRadius: '9999px',
                    padding: '8px 16px',
                    width: '320px',
                    backgroundColor: 'white',
                }}>
                    <span style={{ marginRight: '8px', color: '#9ca3af' }}>Buscar</span>
                    <input
                        type="text"
                        placeholder="Busca articulos o proyectos"
                        style={{ outline: 'none', fontSize: '14px', width: '100%', border: 'none', background: 'transparent' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#374151',
                        overflow: 'hidden',
                    }}>
                        {profile?.pfpUri ? (
                            <img src={profile.pfpUri} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : initials}
                    </div>
                    <button
                        onClick={() => navigate('/perfil')}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            lineHeight: 1.2,
                            minWidth: '120px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            textAlign: 'left',
                        }}
                    >
                        <span style={{ fontWeight: '600', fontSize: '15px' }}>{displayName}</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{roleLabel}</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: 'white',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            padding: '8px 12px',
                            fontSize: '13px',
                        }}
                    >
                        Salir
                    </button>
                </div>
            </nav>

            <div style={{ padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '20px 28px',
                }}>
                    <img src={assets.gorrito} alt="Panel de usuario" style={{ width: '56px', objectFit: 'contain' }} />
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                            Bienvenido, {displayName}
                        </h2>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                            {isLoadingProfile ? 'Cargando tu perfil...' : `Panel de usuario - ${roleLabel}`}
                        </p>
                        {profile?.email && (
                            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{profile.email}</p>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    {[
                        { label: 'Escribir nuevo articulo', path: '/nuevo-articulo' },
                        { label: 'Mis articulos', path: '/mis-articulos' },
                        { label: 'Estadisticas de autor', path: '/mis-articulos/estadisticas' },
                        isOrganizer
                            ? { label: 'Mis proyectos', path: '/mis-proyectos' }
                            : { label: 'Mis proyectos', path: '/mis-inscripciones' },
                        ...(isEditor ? [
                            { label: 'Pendientes de revision', path: '/editor/articulos' },
                            { label: 'Gestionar publicados', path: '/editor/articulos/publicados' },
                        ] : []),
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                padding: '16px 20px',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '500',
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '40px' }}>
                    <section style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '0.05em' }}>ARTICULOS DESTACADOS</h2>
                        
                        {isLoadingArticles && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                                Cargando articulos...
                            </div>
                        )}

                        {!isLoadingArticles && articles.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px', border: '1px dashed #e5e7eb', borderRadius: '8px' }}>
                                No hay articulos destacados por el momento.
                            </div>
                        )}

                        {!isLoadingArticles && articles.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {articles.map((article) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => navigate('/articulos')}
                            style={{
                                marginTop: '16px',
                                padding: '8px 20px',
                                border: '1px solid #333',
                                borderRadius: '4px',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                fontSize: '13px',
                            }}
                        >
                            Ver todos los articulos
                        </button>
                    </section>

                    <section style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '0.05em' }}>PROXIMOS PROYECTOS DE VOLUNTARIADO</h2>
                        
                        {isLoadingProjects && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                                Cargando proyectos...
                            </div>
                        )}

                        {!isLoadingProjects && projects.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px', border: '1px dashed #e5e7eb', borderRadius: '8px' }}>
                                No hay proyectos disponibles por el momento.
                            </div>
                        )}

                        {!isLoadingProjects && projects.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {projects.map((project) => (
                                    <div
                                        key={project.id} style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/proyectos/${project.id}`)}>
                                        <ProjectCard project={project} />
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => navigate('/proyectos')}
                            style={{ marginTop: '16px', padding: '8px 20px', border: '1px solid #333', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', fontSize: '13px' }}
                        >
                            Ver todos los proyectos
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}
