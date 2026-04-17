import { Navbar } from '../components/Navbar';
import { ArticleCard } from '../components/ArticleCard';
import { ProjectCard } from '../components/ProjectCard';
import { type Article } from '../types/article';
import { type Project } from '../types/project';

const MOCK_ARTICLES: Article[] = [
    {
        id: 1,
        title: 'La Sexta Extinción Masiva',
        author: 'Abel Yong',
        summary: 'La extinción es un problema...',
        likes: 0,
    },
    {
        id: 2,
        title: 'La Basura nos está Acabando',
        author: 'Carlos Castillo',
        summary: 'Basura en los océanos...',
        likes: 0,
    },
];

const MOCK_PROJECTS: Project[] = [
    {
        id: 1,
        title: 'Recolección de Tapas PET',
        description: 'Recolectaremos tapas y...',
        location: 'Av. Xalapa #123',
        date: '20 de marzo de 2026',
        volunteersEnrolled: 15,
        volunteersMax: 20,
    },
    {
        id: 2,
        title: 'Recolección de Basura',
        description: 'Recolectaremos basura y...',
        location: 'Av. Xalapa #123',
        date: '22 de marzo de 2026',
        volunteersEnrolled: 11,
        volunteersMax: 20,
    },
];

export function HomePage() {
    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Navbar />

            {/* Banner */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f0f7f0',
                padding: '32px 60px',
                borderBottom: '1px solid #e5e7eb',
            }}>
                <img src="/src/assets/arbol.png" alt="árbol" style={{ width: '130px', objectFit: 'contain' }} />
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '0.05em' }}>¡ÚNETE A LA CONSERVACIÓN!</h2>
                    <button style={{
                        padding: '10px 28px',
                        border: '2px solid #333',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '15px',
                    }}>Quiero ser voluntario</button>
                </div>
                <img src="/src/assets/arbol.png" alt="árbol" style={{ width: '130px', objectFit: 'contain' }} />
            </div>

            {/* Contenido principal */}
            <div style={{ display: 'flex', gap: '40px', padding: '32px 60px' }}>

                {/* Artículos destacados */}
                <section style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '0.05em' }}>ARTÍCULOS DESTACADOS</h2>
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
                    <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '0.05em' }}>PRÓXIMOS PROYECTOS DE VOLUNTARIADO</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {MOCK_PROJECTS.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}