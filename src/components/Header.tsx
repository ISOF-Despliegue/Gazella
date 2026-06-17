import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocalProfile, getMyAccount, type EditableAccountProfile } from '../services/accounts';
import { getCurrentSession, logout, type AuthSession } from '../services/auth';
import { BackButton } from '../components/BackButton';
import { assets } from '../assets/assets';
import { SafeImage } from './SafeImage';

function getFullName(profile: EditableAccountProfile | null, session: AuthSession | null) {
    if (profile?.name) {
        return [profile.name, profile.parentalSurname, profile.maternalSurname]
            .filter(Boolean)
            .join(' ');
    }

    return session?.email?.split('@')[0] ?? 'usuario';
}

export function Header() {
    const navigate = useNavigate();
        const [session, setSession] = useState<AuthSession | null>(getCurrentSession());
        const [profile, setProfile] = useState<EditableAccountProfile | null>(null);
    
        useEffect(() => {
            const currentSession = getCurrentSession();

            if (!currentSession) {
                return;
            }

            setSession(currentSession);
            setProfile(getLocalProfile(currentSession.email));

            getMyAccount()
                .then((account) => {
                    setProfile(account);
                })
                .catch(() => undefined)
        }, [navigate]);


    const displayName = useMemo(() => getFullName(profile, session), [profile, session]);
        console.log('session roles:', session?.roles);
        console.log('profile role:', profile?.role);
        const roleLabel = session?.roles[0] ?? profile?.role ?? 'sin rol asignado';
        const initials = displayName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('') || 'U';
    
        const handleLogout = async () => {
            await logout();
            navigate('/login');
        };


    return (
        <div>
                {(() => { console.log('session roles:', session?.roles, 'profile role:', profile?.role); return null; })()}
                <nav style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 40px',
                backgroundColor: 'white',
                borderBottom: '1px solid #e5e7eb',
                gap: '24px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <BackButton fallbackPath="/dashboard" />
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        <img
                            src={assets.gazella}
                            alt="Gazella"
                            style={{ width: '62px', objectFit: 'contain' }}
                        />
                        <h1 style={{ fontSize: '40px', fontWeight: 'bold' }}>Gazella</h1>
                    </button>
                </div>

                {session ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {profile?.pfpUri ? (
                                <SafeImage
                                    src={profile.pfpUri}
                                    alt="avatar"
                                />
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
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                backgroundColor: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                padding: '8px 16px',
                                fontSize: '13px',
                                fontWeight: '600',
                            }}
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                )}
            </nav>
        </div>
    );
}
