import { useNavigate } from 'react-router-dom';
import { type FeaturedArticle } from '../types/article';
import { SafeImage } from './SafeImage';

interface ArticleCardProps {
    article: FeaturedArticle;
}

export function ArticleCard({ article }: Readonly<ArticleCardProps>) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/articulos/${article.id}`)}
            className="group cursor-pointer"
            style={{
                display: 'flex',
                gap: '12px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '12px',
            }}
        >
            <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                flexShrink: 0,
                overflow: 'hidden',
            }}>
                <SafeImage
                    src={article.coverUri}
                    alt={article.title}
                    variant="cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>{article.title}</h3>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Descripción: {article.summary}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                    Autor:{' '}
                    <span
                        style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/perfil/${article.authorId}`);
                        }}
                    >
                        {article.authorName}
                    </span>
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Resumen: {article.summary}</p>
            </div>
        </div>
    );
}