import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function VerifyCodePage() {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const navigate = useNavigate();

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto avanzar al siguiente input
        if (value && index < 5) {
            const next = document.getElementById(`code-${index + 1}`);
            next?.focus();
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
            {/* Logo */}
            <img
                src="/src/assets/gazella.png"
                alt="Gazella"
                style={{ width: '80px', marginBottom: '24px', objectFit: 'contain' }}
            />

            {/* Mensaje */}
            <p style={{
                fontSize: '16px',
                color: '#374151',
                textAlign: 'center',
                maxWidth: '440px',
                lineHeight: '1.7',
                marginBottom: '40px',
            }}>
                Hemos enviado un código de seguridad de un solo uso a <strong>carlos@gmail.com</strong><br />
                Debería llegar en los próximos minutos.<br />
                Si no lo ves en tu bandeja de entrada, por favor revisa tu carpeta de spam/correo no deseado.<br />
                Por favor, ingrésalo a continuación:
            </p>

            {/* Inputs del código */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
                {/* Primer grupo */}
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

                {/* Guión */}
                <span style={{ fontSize: '24px', color: '#374151', margin: '0 8px' }}>—</span>

                {/* Segundo grupo */}
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

            {/* Botón verificar */}
            <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        padding: '14px',
                        backgroundColor: 'white',
                        border: '2px solid #1a1a1a',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                    }}
                >
                    Verificar código
                </button>

                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                    >
                        Regresar
                    </button>
                </div>
            </div>
        </div>
    );
}