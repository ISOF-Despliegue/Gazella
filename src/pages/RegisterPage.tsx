import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import { saveLocalProfile } from '../services/accounts';
import { BackButton } from '../components/BackButton';
import { assets } from '../assets/assets';

export function RegisterPage() {
    const [nombre, setNombre] = useState('');
    const [apellidoPaterno, setApellidoPaterno] = useState('');
    const [apellidoMaterno, setApellidoMaterno] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'volunteer' | 'editor'>('volunteer');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const allowEditorRegistration = import.meta.env.VITE_ALLOW_EDITOR_REGISTRATION === 'true';

    const handleRegister = async () => {
        setError('');

        if (password !== confirmPassword) {
            setError('Las contrasenas no coinciden.');
            return;
        }

        setIsSubmitting(true);

        try {
            const trimmedEmail = email.trim();
            const trimmedName = nombre.trim();
            const trimmedParentalSurname = apellidoPaterno.trim();
            const trimmedMaternalSurname = apellidoMaterno.trim();

            const response = await register({
                email: trimmedEmail,
                password,
                name: trimmedName,
                parentalSurname: trimmedParentalSurname || undefined,
                maternalSurname: trimmedMaternalSurname || undefined,
                role: allowEditorRegistration ? role : undefined,
            });

            // Check if the user was already registered but not verified
            if (response.code === 'ALREADY_REGISTERED_NOT_VERIFIED') {
                saveLocalProfile({
                    email: trimmedEmail,
                    name: trimmedName,
                    parentalSurname: trimmedParentalSurname || null,
                    maternalSurname: trimmedMaternalSurname || null,
                    bio: null,
                    pfpUri: null,
                    role,
                    joinedAt: new Date().toISOString(),
                });
                navigate('/verificar', { state: { email: trimmedEmail, mode: 'verification' as const } });
                return;
            }

            saveLocalProfile({
                email: trimmedEmail,
                name: trimmedName,
                parentalSurname: trimmedParentalSurname || null,
                maternalSurname: trimmedMaternalSurname || null,
                bio: null,
                pfpUri: null,
                role,
                joinedAt: new Date().toISOString(),
            });

            navigate('/verificar', { state: { email: trimmedEmail, mode: 'verification' as const } });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo completar el registro.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        padding: '12px 16px',
        gap: '12px',
    };

    const inputStyle = {
        border: 'none',
        outline: 'none',
        fontSize: '16px',
        width: '100%',
        color: '#374151',
    };

    const iconStyle = { fontSize: '20px', color: '#9ca3af' };

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

            {/* Logo */}
            <img
                src={assets.gazella}
                alt="Gazella"
                style={{ width: '80px', marginBottom: '16px', objectFit: 'contain' }}
            />

            {/* Subtítulo */}
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
                Ingresa tus datos para registrarte
            </p>

            {/* Formulario */}
            <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Nombre */}
                <div style={inputContainerStyle}>
                    <span style={iconStyle}>👤</span>
                    <input
                        type="text"
                        placeholder="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                {/* Apellido paterno */}
                <div style={inputContainerStyle}>
                    <span style={iconStyle}>👤</span>
                    <input
                        type="text"
                        placeholder="Apellido paterno"
                        value={apellidoPaterno}
                        onChange={(e) => setApellidoPaterno(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                {/* Apellido materno */}
                <div style={inputContainerStyle}>
                    <span style={iconStyle}>👤</span>
                    <input
                        type="text"
                        placeholder="Apellido materno"
                        value={apellidoMaterno}
                        onChange={(e) => setApellidoMaterno(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                {/* Email */}
                <div style={inputContainerStyle}>
                    <span style={iconStyle}>✉️</span>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                {/* Contraseña */}
                <div style={inputContainerStyle}>
                    <span style={iconStyle}>🔒</span>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                {/* Confirmar contraseña */}
                <div style={inputContainerStyle}>
                    <span style={iconStyle}>🔒</span>
                    <input
                        type="password"
                        placeholder="Confirmar contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                {allowEditorRegistration && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                            Rol para pruebas
                        </label>
                        <select
                            value={role}
                            onChange={(event) => setRole(event.target.value as 'volunteer' | 'editor')}
                            style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '12px 16px', fontSize: '16px' }}
                        >
                            <option value="volunteer">Voluntario</option>
                            <option value="editor">Editor</option>
                        </select>
                    </div>
                )}

                {/* Botón registrarse */}
                <button
                    data-testid="btn-registrarme"
                    onClick={handleRegister}
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
                    {isSubmitting ? 'Registrando...' : 'Registrarme'}
                </button>

                {error && (
                    <p style={{ color: '#b91c1c', fontSize: '14px', textAlign: 'center', margin: 0 }}>
                        {error}
                    </p>
                )}

                {/* Regresar */}
                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                    >
                        Regresar
                    </button>
                </div>

            </div>
        </div>
    );
}
