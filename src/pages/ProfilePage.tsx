import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocalProfile, getMyAccount, getFollowersFor, saveLocalProfile, type EditableAccountProfile } from '../services/accounts';
import { getCurrentSession, type AuthSession } from '../services/auth';
import { SafeImage } from '../components/SafeImage';
import { Header } from '../components/Header';

const MOCK_PROFILE_ARTICLES = [
    { title: 'La importancia de separar basura', date: '20 Abr 2026', status: 'Publicado' },
    { title: 'La importancia de separar basura', date: '25 Abr 2026', status: 'En revision' },
];

function getFullName(profile: EditableAccountProfile | null, session: AuthSession | null) {
    if (profile?.name) {
        return [profile.name, profile.parentalSurname, profile.maternalSurname]
            .filter(Boolean)
            .join(' ');
    }
    return session?.email?.split('@')[0] ?? 'usuario';
}

function formatMemberSince(date?: string) {
    if (!date) {
        return 'Miembro reciente';
    }
    return `Miembro desde ${new Intl.DateTimeFormat('es-MX', { month: 'short', year: 'numeric' }).format(new Date(date))}`;
}

export function ProfilePage() {
    const navigate = useNavigate();
    const [session, setSession] = useState<AuthSession | null>(null);
    const [profile, setProfile] = useState<EditableAccountProfile | null>(null);
    const [followersCount, setFollowersCount] = useState(0);

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
                saveLocalProfile(account);
                return account.id;
            })
            .then((accountId) => {
                if (!accountId) return;
                return getFollowersFor(accountId);
            })
            .then((followers) => {
                if (followers && Array.isArray(followers)) {
                    setFollowersCount(followers.length);
                }
            })
            .catch(() => undefined);
    }, [navigate]);

    const displayName = useMemo(() => getFullName(profile, session), [profile, session]);
    const roleLabel = session?.roles[0] ?? profile?.role ?? 'sin rol asignado';
    // @ts-ignore: Unused variable allowed here temporarily
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'U';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'white', padding: '24px 36px' }}>
            <Header/>

            <main style={{ border: '1px solid #bdbdbd', borderRadius: '8px', padding: '26px', minHeight: '590px' }}>
                <section style={{
                    border: '1px solid #c7c7c7',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
                    padding: '16px 20px',
                    marginBottom: '28px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '28px' }}>
                            <div style={{
                                width: '84px',
                                height: '84px',
                                borderRadius: '50%',
                                border: '1px solid #1f2937',
                                overflow: 'hidden',
                                flexShrink: 0,
                            }}>
                                <SafeImage
                                    src={profile?.pfpUri}
                                    alt={displayName}
                                    variant="avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>{displayName}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '10px' }}>
                                    <span style={{
                                        border: '1px solid #22c55e',
                                        borderRadius: '9999px',
                                        padding: '3px 20px',
                                        fontSize: '12px',
                                    }}>
                                        {roleLabel}
                                    </span>
                                    <span style={{ fontSize: '13px', color: '#374151' }}>{formatMemberSince(profile?.joinedAt)}</span>
                                </div>
                                <p style={{ fontSize: '14px', margin: 0 }}>
                                    "{profile?.bio || 'Apasionado de la biodiversidad y la conservacion...'}"
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/perfil/editar')}
                            style={{ border: '1px solid #1f2937', borderRadius: '4px', backgroundColor: 'white', padding: '6px 10px', cursor: 'pointer', fontSize: '16px' }}
                        >
                            Editar Perfil
                        </button>
                    </div>

                    <hr style={{ margin: '18px 0 12px', border: 0, borderTop: '1px solid #d1d5db' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
                        <div>
                            <strong style={{ fontSize: '22px' }}>0</strong>
                            <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0' }}>Articulos publicados</p>
                        </div>
                        <div>
                            <strong style={{ fontSize: '22px' }}>0</strong>
                            <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0' }}>Proyectos participados</p>
                        </div>
                        <div>
                            <strong style={{ fontSize: '22px' }}>{followersCount}</strong>
                            <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0' }}>Seguidores</p>
                        </div>
                    </div>
                </section>

                <div style={{ display: 'inline-flex', marginBottom: '12px' }}>
                    {['Mis articulos', 'Mis proyectos', 'Siguiendo'].map((tab, index) => (
                        <button
                            key={tab}
                            style={{
                                border: '1px solid #4b5563',
                                borderLeftWidth: index === 0 ? '1px' : 0,
                                backgroundColor: index === 0 ? 'white' : '#f3f4f6',
                                padding: '8px 14px',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                cursor: 'pointer',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                    {MOCK_PROFILE_ARTICLES.map((article) => (
                        <article
                            key={`${article.title}-${article.date}-${article.status}`}
                            style={{ border: '1px solid #c7c7c7', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.18)', padding: '16px' }}
                        >
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>{article.title}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                                <span style={{ fontSize: '13px', color: '#6b7280' }}>{article.date}</span>
                                <span style={{
                                    border: `1px solid ${article.status === 'Publicado' ? '#22c55e' : '#d4a600'}`,
                                    borderRadius: '9999px',
                                    padding: '3px 20px',
                                    fontSize: '12px',
                                }}>
                                    {article.status}
                                </span>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    );
}
