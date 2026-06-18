import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { requestRecoveryEmail, requestVerificationEmail, verifyEmail, completeAccountRecovery } from '../services/auth';
import { BackButton } from '../components/BackButton';
import { assets } from '../assets/assets';

type VerifyMode = 'verification' | 'recovery';

const PENDING_EMAIL_KEY = 'gazella.pendingActionEmail';
const PENDING_MODE_KEY = 'gazella.pendingActionMode';

export function VerifyCodePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const locationState = (location.state as { email?: string; mode?: VerifyMode } | null) ?? {};
    const initialEmail = locationState.email || sessionStorage.getItem(PENDING_EMAIL_KEY) || '';
    const initialMode = locationState.mode || (sessionStorage.getItem(PENDING_MODE_KEY) as VerifyMode) || 'verification';

    const [email, setEmail] = useState(initialEmail);
    const [mode] = useState<VerifyMode>(initialMode);
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (locationState.email) {
            sessionStorage.setItem(PENDING_EMAIL_KEY, locationState.email);
        }
        if (locationState.mode) {
            sessionStorage.setItem(PENDING_MODE_KEY, locationState.mode);
        }
    }, [locationState.email, locationState.mode]);

    const persistPendingState = (nextEmail: string, nextMode: VerifyMode) => {
        sessionStorage.setItem(PENDING_EMAIL_KEY, nextEmail);
        sessionStorage.setItem(PENDING_MODE_KEY, nextMode);
    };

    const clearPendingState = () => {
        sessionStorage.removeItem(PENDING_EMAIL_KEY);
        sessionStorage.removeItem(PENDING_MODE_KEY);
    };

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

        if (!email.trim()) {
            setError('Ingresa tu correo electrónico para continuar.');
            return;
        }

        if (mode === 'recovery') {
            if (!password) {
                setError('Ingresa una nueva contraseña para recuperar tu cuenta.');
                return;
            }
            if (password !== confirmPassword) {
                setError('Las contraseñas no coinciden.');
                return;
            }
        }

        setIsSubmitting(true);

        try {
            if (mode === 'verification') {
                await verifyEmail(email.trim(), code.join(''));
                clearPendingState();
                navigate('/login');
            } else {
                await completeAccountRecovery(email.trim(), code.join(''), password);
                clearPendingState();
                navigate('/login');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo completar la verificación.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendCode = async () => {
        setError('');
        setMessage('');

        if (!email.trim()) {
            setError('Por favor ingresa tu correo electrónico.');
            return;
        }

        setIsSubmitting(true);

        try {
            if (mode === 'verification') {
                await requestVerificationEmail(email.trim());
            } else {
                await requestRecoveryEmail(email.trim());
            }
            persistPendingState(email.trim(), mode);
            setMessage('Te enviamos un nuevo código. Revisa tu correo.');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo enviar el código.';
            setError(message);
        } finally {
            setIsSubmitting(false);
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
                <BackButton fallbackPath={mode === 'recovery' ? '/recuperar' : '/registro'} />
            </div>

            <img
                src={assets.gazella}
                alt="Gazella"
                style={{ width: '80px', marginBottom: '24px', objectFit: 'contain' }}
            />

            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
                {mode === 'recovery' ? 'Recuperar cuenta' : 'Verificar correo'}
            </h1>

            <p style={{
                fontSize: '16px',
                color: '#374151',
                textAlign: 'center',
                maxWidth: '440px',
                lineHeight: '1.7',
                marginBottom: '24px',
            }}>
                {mode === 'recovery'
                    ? 'Ingresa tu correo y el código que te enviamos para recuperar tu cuenta. Si ya tienes código, ingrésalo junto con una nueva contraseña.'
                    : 'Hemos enviado un código de seguridad de un solo uso a tu correo. Si no lo recibes, revisa tu carpeta de spam.'}
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

                {mode === 'recovery' && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '6px', padding: '12px 16px', gap: '12px' }}>
                            <span style={{ fontSize: '20px', color: '#9ca3af' }}>🔒</span>
                            <input
                                type="password"
                                placeholder="Nueva contraseña"
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
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '6px', padding: '12px 16px', gap: '12px' }}>
                            <span style={{ fontSize: '20px', color: '#9ca3af' }}>🔒</span>
                            <input
                                type="password"
                                placeholder="Confirmar nueva contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '16px',
                                    width: '100%',
                                    color: '#374151',
                                }}
                            />
                        </div>
                    </>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
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

                    <span style={{ fontSize: '24px', color: '#374151', margin: '0 8px' }}>{'-'}</span>

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

                <button
                    onClick={handleVerify}
                    disabled={isSubmitting || !email.trim() || (mode === 'recovery' && (!password || !confirmPassword))}
                    style={{
                        padding: '14px',
                        backgroundColor: 'white',
                        border: '2px solid #1a1a1a',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        opacity: isSubmitting || !email.trim() || (mode === 'recovery' && (!password || !confirmPassword)) ? 0.65 : 1,
                    }}
                >
                    {isSubmitting ? (mode === 'recovery' ? 'Recuperando...' : 'Verificando...') : (mode === 'recovery' ? 'Recuperar cuenta' : 'Verificar código')}
                </button>

                <button
                    onClick={handleSendCode}
                    disabled={isSubmitting || !email.trim()}
                    style={{
                        padding: '14px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '16px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        opacity: isSubmitting || !email.trim() ? 0.65 : 1,
                    }}
                >
                    {mode === 'recovery' ? 'Enviar código de recuperación' : 'Enviar código de verificación'}
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

                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    );
}
