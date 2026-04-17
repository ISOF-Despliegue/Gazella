import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function RegisterPage() {
    const [nombre, setNombre] = useState('');
    const [apellidoPaterno, setApellidoPaterno] = useState('');
    const [apellidoMaterno, setApellidoMaterno] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

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
            {/* Logo */}
            <img
                src="/src/assets/gazella.png"
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

                {/* Botón registrarse */}
                <button
                    onClick={() => navigate('/verificar')}
                    style={{
                        padding: '14px',
                        backgroundColor: 'white',
                        border: '2px solid #1a1a1a',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginTop: '8px',
                    }}
                >
                    Registrarme
                </button>

                {/* Regresar */}
                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={() => navigate('/verificar')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                    >
                        Regresar
                    </button>
                </div>

            </div>
        </div>
    );
}