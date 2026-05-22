import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getLocalProfile,
    getMyAccount,
    saveLocalProfile,
    updateMyAccount,
    type EditableAccountProfile,
} from '../services/accounts';
import { getCurrentSession, type AuthSession } from '../services/auth';
import { BackButton } from '../components/BackButton';

function getFullName(profile: EditableAccountProfile | null, session: AuthSession | null) {
    if (profile?.name) {
        return [profile.name, profile.parentalSurname, profile.maternalSurname]
            .filter(Boolean)
            .join(' ');
    }

    return session?.email?.split('@')[0] ?? 'usuario';
}

export function EditProfilePage() {
    const navigate = useNavigate();
    const [session, setSession] = useState<AuthSession | null>(null);
    const [profile, setProfile] = useState<EditableAccountProfile | null>(null);
    const [name, setName] = useState('');
    const [parentalSurname, setParentalSurname] = useState('');
    const [maternalSurname, setMaternalSurname] = useState('');
    const [bio, setBio] = useState('');
    const [pfpUri, setPfpUri] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const currentSession = getCurrentSession();
        if (!currentSession) {
            navigate('/login');
            return;
        }

        setSession(currentSession);
        const localProfile = getLocalProfile(currentSession.email);
        if (localProfile) {
            setProfile(localProfile);
        }

        getMyAccount()
            .then((account) => {
                setProfile(account);
                saveLocalProfile(account);
            })
            .catch(() => undefined);
    }, [navigate]);

    useEffect(() => {
        if (!profile) return;

        setName(profile.name ?? '');
        setParentalSurname(profile.parentalSurname ?? '');
        setMaternalSurname(profile.maternalSurname ?? '');
        setBio(profile.bio ?? '');
        setPfpUri(profile.pfpUri ?? '');
    }, [profile]);

    const displayName = useMemo(() => getFullName(profile, session), [profile, session]);
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'U';

    const handleSubmit = async () => {
        setError('');
        setIsSaving(true);

        const nextProfile: EditableAccountProfile = {
            ...profile,
            email: profile?.email ?? session?.email ?? '',
            name: name.trim(),
            parentalSurname: parentalSurname.trim() || null,
            maternalSurname: maternalSurname.trim() || null,
            bio: bio.trim() || null,
            pfpUri: pfpUri.trim() || null,
            role: profile?.role ?? session?.roles[0] ?? 'volunteer',
            joinedAt: profile?.joinedAt ?? new Date().toISOString(),
        };

        try {
            await updateMyAccount({
                name: nextProfile.name,
                parentalSurname: nextProfile.parentalSurname,
                maternalSurname: nextProfile.maternalSurname,
                bio: nextProfile.bio,
                pfpUri: nextProfile.pfpUri,
            });
            saveLocalProfile(nextProfile);
            navigate('/perfil');
        } catch (err) {
            saveLocalProfile(nextProfile);
            const message = err instanceof Error ? err.message : 'No se pudo guardar el perfil.';
            setError(`${message} Los cambios quedaron guardados localmente en este navegador.`);
        } finally {
            setIsSaving(false);
        }
    };

    const inputStyle = {
        border: '1px solid #555',
        height: '34px',
        padding: '6px 12px',
        fontSize: '15px',
        width: '100%',
        boxSizing: 'border-box' as const,
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'white', padding: '24px 36px' }}>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <BackButton fallbackPath="/perfil" />
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        <img src="/src/assets/gazella.png" alt="Gazella" style={{ width: '62px', objectFit: 'contain' }} />
                        <h1 style={{ fontSize: '40px', fontWeight: 'bold' }}>Conservacion de la biodiversidad</h1>
                    </button>
                </div>
                <button
                    onClick={() => navigate('/perfil')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
                >
                    <span style={{ color: '#6b7280' }}>{initials}</span>
                    {displayName.split(' ')[0]}
                </button>
            </header>

            <main style={{ border: '1px solid #bdbdbd', borderRadius: '8px', padding: '34px 50px' }}>
                <h2 style={{ fontSize: '34px', fontWeight: 'bold', marginBottom: '22px' }}>Editar Perfil</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: '36px' }}>
                    <aside style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '118px',
                            height: '118px',
                            borderRadius: '50%',
                            border: '1px solid #1f2937',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                        }}>
                            {pfpUri ? (
                                <img src={pfpUri} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '14px' }}>foto perfil</span>
                            )}
                        </div>
                        <button
                            onClick={() => setPfpUri(window.prompt('URL de la foto de perfil') ?? pfpUri)}
                            style={{ border: '1px solid #1f2937', backgroundColor: 'white', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '15px' }}
                        >
                            Cambiar foto
                        </button>
                        <button
                            onClick={() => setPfpUri('')}
                            style={{ border: '1px solid #1f2937', backgroundColor: 'white', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '15px' }}
                        >
                            Eliminar foto
                        </button>
                    </aside>

                    <section>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 26px' }}>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: 'bold' }}>
                                Nombre
                                <input value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} />
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: 'bold' }}>
                                Apellido paterno
                                <input value={parentalSurname} onChange={(event) => setParentalSurname(event.target.value)} style={inputStyle} />
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: 'bold' }}>
                                Apellido materno
                                <input value={maternalSurname} onChange={(event) => setMaternalSurname(event.target.value)} style={inputStyle} />
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: 'bold' }}>
                                Correo electronico
                                <input value={profile?.email ?? session?.email ?? ''} disabled style={{ ...inputStyle, color: '#6b7280', backgroundColor: '#f3f4f6' }} />
                            </label>
                        </div>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: 'bold', marginTop: '34px' }}>
                            Biografia
                            <textarea
                                value={bio}
                                onChange={(event) => setBio(event.target.value)}
                                style={{ ...inputStyle, minHeight: '105px', resize: 'vertical' }}
                            />
                        </label>

                        <hr style={{ margin: '28px 0', border: 0, borderTop: '1px solid #d1d5db' }} />

                        {error && (
                            <p style={{ color: '#92400e', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={() => navigate('/perfil')}
                                style={{ border: '1px solid #1f2937', backgroundColor: 'white', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer', fontSize: '15px' }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                style={{
                                    border: '1px solid #22c55e',
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    opacity: isSaving ? 0.65 : 1,
                                }}
                            >
                                {isSaving ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
