import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginWithPassword } from '../services/auth';
import { assets } from '../assets/assets';
import { getMyAccount, saveLocalProfile } from '../services/accounts';

export function LoginPage() {
    const location = useLocation();
    const locationState = (location.state as { verified?: boolean; email?: string; recovered?: boolean } | null) ?? {};
    const initialVerifiedEmail = locationState.verified ? locationState.email : '';
    const [email, setEmail] = useState(initialVerifiedEmail || '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [notVerifiedEmail, setNotVerifiedEmail] = useState<string | null>(null);
    const [isNetworkError, setIsNetworkError] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(
        locationState.verified ? 'Correo verificado correctamente. Ahora puedes iniciar sesión.' : 
        locationState.recovered ? 'Contraseña actualizada correctamente. Ahora puedes iniciar sesión.' : null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError('');
        setNotVerifiedEmail(null);
        setIsNetworkError(false);
        setIsSubmitting(true);

        try {
            await loginWithPassword(email.trim(), password);
            try {
                const currentProfile = await getMyAccount();
                saveLocalProfile(currentProfile);
            } catch {
                // account-service no disponible, continuar de todas formas
            }
            navigate('/dashboard');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo iniciar sesion.';
            
            // Check if it's a network error (TypeError: Failed to fetch)
            if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('Network')) {
                setIsNetworkError(true);
                setError('No hay conexión con el servidor. Por favor intenta más tarde.');
            } else {
                setError(message);
            }

            // Check if the error message indicates the account is not verified
            if (message.toLowerCase().includes('not verified') || message.includes('no está verificada')) {
                setNotVerifiedEmail(email.trim());
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
        }}>
            {/* Logo */}
            <img
                src={assets.gazella}
                alt="Gazella"
                style={{ width: '80px', marginBottom: '16px', objectFit: 'contain' }}
            />

            {/* Título */}
            <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '40px' }}>
                Inicio de Sesión
            </h1>

            {/* Formulario */}
            <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Email */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    gap: '12px',
                }}>
                    <span style={{ fontSize: '20px', color: '#9ca3af' }}>✉️</span>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            fontSize: '16px',
                            width: '100%',
                            color: '#374151',
                        }}
                    />
                </div>

                {/* Contraseña */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    gap: '12px',
                }}>
                    <span style={{ fontSize: '20px', color: '#9ca3af' }}>🔒</span>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            fontSize: '16px',
                            width: '100%',
                            color: '#374151',
                        }}
                    />
                </div>

                {/* Botón ingresar */}
                <button
                    onClick={handleLogin}
                    disabled={isSubmitting}
                    style={{
                        padding: '14px',
                        backgroundColor: 'white',
                        border: '2px solid #1a1a1a',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginTop: '8px',
                        opacity: isSubmitting ? 0.65 : 1,
                    }}
                >
                    {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                </button>

                {successMessage && (
                    <p style={{ color: '#166534', fontSize: '14px', textAlign: 'center', margin: 0, padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '6px' }}>
                        {successMessage}
                    </p>
                )}

                {error && (
                    <p style={{ color: '#b91c1c', fontSize: '14px', textAlign: 'center', margin: 0 }}>
                        {error}
                    </p>
                )}

                {/* "Not verified" banner */}
                {notVerifiedEmail && (
                    <div style={{ textAlign: 'center', marginTop: '4px', marginBottom: '4px', padding: '12px', backgroundColor: '#fff7ed', borderRadius: '6px', border: '1px solid #fed7aa' }}>
                        <p style={{ color: '#9a3412', fontSize: '14px', margin: '0 0 8px 0' }}>
                            Esta cuenta aún no ha sido verificada.
                        </p>
                        <button
                            onClick={() => navigate('/verificar', { state: { email: notVerifiedEmail, mode: 'verification' as const } })}
                            style={{
                                background: '#ea580c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                            }}
                        >
                            Verificar correo ahora
                        </button>
                    </div>
                )}

                {/* Links */}
                <div style={{ textAlign: 'center', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                        onClick={() => navigate('/registro')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                    >
                        Registrarme
                    </button>
                    <button
                        onClick={() => navigate('/recuperar')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', color: '#374151' }}
                    >
                        Olvidé mi contraseña
                    </button>
                </div>
            </div>
        </div>
    );
}
