import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ArticleCard } from '../components/ArticleCard';
import { ProjectCard } from '../components/ProjectCard';
import { type Article } from '../types/article';
import { type Project } from '../types/project';
import { getCurrentSession } from '../services/auth';
import { getFeaturedArticles } from '../services/articles/articles';
import { getUpcomingProjects } from '../services/projects';
import { assets } from '../assets/assets';

export function HomePage() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<Article[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [articlesStatus, setArticlesStatus] = useState('Cargando articulos...');
    const [projectsStatus, setProjectsStatus] = useState('Cargando proyectos...');

    useEffect(() => {
        getFeaturedArticles()
            .then((items) => {
                setArticles(items);
                setArticlesStatus(items.length ? '' : 'Todavia no hay articulos destacados.');
            })
            .catch(() => setArticlesStatus('No se pudieron cargar los articulos destacados.'));

        getUpcomingProjects()
            .then((items) => {
                setProjects(items);
                setProjectsStatus(items.length ? '' : 'Todavia no hay proyectos de voluntariado.');
            })
            .catch(() => setProjectsStatus('El servicio de proyectos no esta disponible por ahora.'));
    }, []);

    const handleVolunteerClick = () => {
        if (getCurrentSession()) {
            navigate('/dashboard');
            return;
        }

        navigate('/registro');
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Navbar />

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f0f7f0',
                padding: '32px 60px',
                borderBottom: '1px solid #e5e7eb',
            }}>
                <img src={assets.arbol} alt="arbol" style={{ width: '130px', objectFit: 'contain' }} />
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '0.05em' }}>
                        UNETE A LA CONSERVACION
                    </h2>
                    <button
                        onClick={handleVolunteerClick}
                        style={{
                            padding: '10px 28px',
                            border: '2px solid #333',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '15px',
                        }}
                    >
                        Quiero ser voluntario
                    </button>
                </div>
                <img src={assets.arbol} alt="arbol" style={{ width: '130px', objectFit: 'contain' }} />
            </div>

            <div style={{ display: 'flex', gap: '40px', padding: '32px 60px' }}>
                <section style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '0.05em' }}>
                        ARTICULOS DESTACADOS
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {articles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                        {articlesStatus && (
                            <p style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px', color: '#6b7280' }}>
                                {articlesStatus}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => navigate('/articulos')}
                        style={{
                            marginTop: '16px',
                            padding: '8px 20px',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '13px',
                        }}
                    >
                        Ver todos los articulos
                    </button>
                </section>

                <section style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '0.05em' }}>
                        PROXIMOS PROYECTOS DE VOLUNTARIADO
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} onEnroll={handleVolunteerClick} />
                        ))}
                        {projectsStatus && (
                            <p style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '16px', color: '#6b7280' }}>
                                {projectsStatus}
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
