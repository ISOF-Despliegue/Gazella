import { useNavigate } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';
import { ProjectCard } from '../components/ProjectCard';
import { type Article } from '../types/article';
import { type Project } from '../types/project';

const MOCK_ARTICLES: Article[] = [
    { id: 1, title: 'La Sexta Extinción Masiva', author: 'Abel Yong', summary: 'La extinción es un problema...', likes: 0 },
    { id: 2, title: 'La Basura nos está Acabando', author: 'Carlos Castillo', summary: 'Basura en los océanos...', likes: 0 },
];

const MOCK_PROJECTS: Project[] = [
    { id: 1, title: 'Recolección de Tapas PET', description: 'Recolectaremos tapas y...', location: 'Av. Xalapa #123', date: '20 de marzo de 2026', volunteersEnrolled: 15, volunteersMax: 20 },
    { id: 2, title: 'Recolección de Basura', description: 'Recolectaremos basura y...', location: 'Av. Xalapa #123', date: '22 de marzo de 2026', volunteersEnrolled: 11, volunteersMax: 20 },
];

export function DashboardPage() {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>

            {/* Navbar logueado */}
            <nav style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 40px',
                backgroundColor: 'white',
                borderBottom: '1px solid #e5e7eb',
            }}>
                {/* Logo + Título */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src="/src/assets/gazella.png" alt="Gazella" style={{ width: '70px', objectFit: 'contain' }} />
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: '1.2' }}>
                        Conservación de<br />la biodiversidad
                    </h1>
                </div>

                {/* Buscador */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #d1d5db',
                    borderRadius: '9999px',
                    padding: '8px 16px',
                    width: '320px',
                    backgroundColor: 'white',
                }}>
                    <span style={{ marginRight: '8px', color: '#9ca3af' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Busca artículos o proyectos"
                        style={{ outline: 'none', fontSize: '14px', width: '100%', border: 'none', background: 'transparent' }}
                    />
                </div>

                {/* Usuario */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '20px', color: '#6b7280' }}>👤</span>
                    <span style={{ fontWeight: '500', fontSize: '15px' }}>Carlos</span>
                </div>
            </nav>

            <div style={{ padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Banner bienvenida */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '20px 28px',
                }}>
                    <img src="/src/assets/gorrito.png" alt="gorrito" style={{ width: '56px', objectFit: 'contain' }} />
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>¡Bienvenido, Carlos!</h2>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Este es tu panel de control</p>
                    </div>
                </div>

                {/* Acciones rápidas */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    {[
                        { icon: '📝', label: 'Escribir nuevo artículo', path: '/nuevo-articulo' },
                        { icon: '📄', label: 'Mis artículos', path: '/articulos' },
                        { icon: '👥', label: 'Mis proyectos', path: '/mis-proyectos' },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px 20px',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '500',
                            }}
                        >
                            <span style={{ fontSize: '22px' }}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Contenido principal */}
                <div style={{ display: 'flex', gap: '40px' }}>

                    {/* Artículos */}
                    <section style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '0.05em' }}>ARTÍCULOS DESTACADOS</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {MOCK_ARTICLES.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                        <button style={{
                            marginTop: '16px',
                            padding: '8px 20px',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '13px',
                        }}>Ver todos los artículos</button>
                    </section>

                    {/* Proyectos */}
                    <section style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '0.05em' }}>PRÓXIMOS PROYECTOS DE VOLUNTARIADO</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {MOCK_PROJECTS.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}