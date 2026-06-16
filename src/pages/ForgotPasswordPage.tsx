import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestRecoveryEmail } from '../services/auth';
import { BackButton } from '../components/BackButton';
import { assets } from '../assets/assets';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setError('');
        setMessage('');

        if (!email.trim()) {
            setError('Ingresa tu correo electrónico para continuar.');
            return;
        }

        setIsSubmitting(true);

        try {
            await requestRecoveryEmail(email.trim());
            setMessage('Hemos enviado un código de recuperación a tu correo.');
            navigate('/verificar', { state: { email: email.trim(), mode: 'recovery' as const } });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo enviar el correo de recuperación.';
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
            <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
                <BackButton fallbackPath="/login" />
            </div>

            <img
                src={assets.gazella}
                alt="Gazella"
                style={{ width: '80px', marginBottom: '24px', objectFit: 'contain' }}
            />

            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
                Recuperar contraseña
            </h1>

            <p style={{
                fontSize: '16px',
                color: '#374151',
                textAlign: 'center',
                maxWidth: '440px',
                lineHeight: '1.7',
                marginBottom: '32px',
            }}>
                Ingresa el correo de tu cuenta para recibir un código de recuperación. Después podrás crear una nueva contraseña.
            </p>

            <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '6px', padding: '12px 16px', gap: '12px' }}>
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

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={{
                        padding: '14px',
                        backgroundColor: 'white',
                        border: '2px solid #1a1a1a',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        opacity: isSubmitting ? 0.65 : 1,
                    }}
                >
                    {isSubmitting ? 'Enviando...' : 'Enviar código de recuperación'}
                </button>

                {error && (
                    <p style={{ color: '#b91c1c', fontSize: '14px', textAlign: 'center', margin: 0 }}>
                        {error}
                    </p>
                )}

                {message && (
                    <p style={{ color: '#166534', fontSize: '14px', textAlign: 'center', margin: 0 }}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
