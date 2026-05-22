import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { requestVerificationEmail, verifyEmail } from '../services/auth';
import { BackButton } from '../components/BackButton';
import { assets } from '../assets/assets';

export function VerifyCodePage() {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = (location.state as { email?: string } | null)?.email ?? '';

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            const next = document.getElementById(`code-${index + 1}`);
            next?.focus();
        }
    };

    const handleVerify = async () => {
        setError('');
        setMessage('');
        setIsSubmitting(true);

        try {
            await verifyEmail(email, code.join(''));
            navigate('/login');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo verificar el codigo.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setMessage('');

        try {
            await requestVerificationEmail(email);
            setMessage('Te enviamos un nuevo codigo.');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo reenviar el codigo.';
            setError(message);
        }
    };

    const inputStyle = {
        width: '52px',
        height: '52px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        textAlign: 'center' as const,
        fontSize: '20px',
        outline: 'none',
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
                <BackButton fallbackPath="/registro" />
            </div>

            <img
                src={assets.gazella}
                alt="Gazella"
                style={{ width: '80px', marginBottom: '24px', objectFit: 'contain' }}
            />

            <p style={{
                fontSize: '16px',
                color: '#374151',
                textAlign: 'center',
                maxWidth: '440px',
                lineHeight: '1.7',
                marginBottom: '40px',
            }}>
                Hemos enviado un codigo de seguridad de un solo uso a <strong>{email || 'tu correo'}</strong><br />
                Deberia llegar en los proximos minutos.<br />
                Si no lo ves en tu bandeja de entrada, por favor revisa tu carpeta de spam/correo no deseado.<br />
                Por favor, ingresalo a continuacion:
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[0, 1, 2].map((i) => (
                        <input
                            key={i}
                            id={`code-${i}`}
                            type="text"
                            maxLength={1}
                            value={code[i]}
                            onChange={(e) => handleChange(i, e.target.value)}
                            style={inputStyle}
                        />
                    ))}
                </div>

                <span style={{ fontSize: '24px', color: '#374151', margin: '0 8px' }}>-</span>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {[3, 4, 5].map((i) => (
                        <input
                            key={i}
                            id={`code-${i}`}
                            type="text"
                            maxLength={1}
                            value={code[i]}
                            onChange={(e) => handleChange(i, e.target.value)}
                            style={inputStyle}
                        />
                    ))}
                </div>
            </div>

            <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                    onClick={handleVerify}
                    disabled={isSubmitting || !email}
                    style={{
                        padding: '14px',
                        backgroundColor: 'white',
                        border: '2px solid #1a1a1a',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        opacity: isSubmitting || !email ? 0.65 : 1,
                    }}
                >
                    {isSubmitting ? 'Verificando...' : 'Verificar codigo'}
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

                <button
                    onClick={handleResend}
                    disabled={!email}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                >
                    Reenviar codigo
                </button>

                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={() => navigate('/registro')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                    >
                        Regresar
                    </button>
                </div>
            </div>
        </div>
    );
}
