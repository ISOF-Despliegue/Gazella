import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithPassword } from '../services/auth';
import { assets } from '../assets/assets';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError('');
        setIsSubmitting(true);

        try {
            await loginWithPassword(email.trim(), password);
            navigate('/dashboard');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo iniciar sesion.';
            setError(message);
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

                {error && (
                    <p style={{ color: '#b91c1c', fontSize: '14px', textAlign: 'center', margin: 0 }}>
                        {error}
                    </p>
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
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', color: '#374151' }}
                    >
                        Olvidé mi contraseña
                    </button>
                </div>
            </div>
        </div>
    );
}
