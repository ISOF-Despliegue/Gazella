import { useNavigate } from 'react-router-dom';
export function Navbar() {
    const navigate = useNavigate();
    return (
        <div>
            {/* Título */}
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' }}>Conservación de la biodiversidad</h1>
            </div>

            {/* Barra de navegación */}
            <nav style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 40px',
                backgroundColor: 'white',
                borderTop: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
            }}>
                {/* Logo */}
                <div>
                    <img src="/src/assets/gazella.png" alt="Logo Gazella" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                </div>

                {/* Buscador */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #d1d5db',
                    borderRadius: '9999px',
                    padding: '6px 16px',
                    width: '340px',
                    backgroundColor: 'white',
                }}>
                    <span style={{ marginRight: '8px', color: '#9ca3af' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Busca artículos o proyectos"
                        style={{ outline: 'none', fontSize: '14px', width: '100%', border: 'none', background: 'transparent' }}
                    />
                </div>

                {/* Botones */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                    >Iniciar Sesión</button>
                    <button
                        onClick={() => navigate('/registro')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                    >Registrarse</button>
                </div>
            </nav>
        </div>
    );
}