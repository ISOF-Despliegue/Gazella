import { type Article } from '../types/article';

interface ArticleCardProps {
    article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
    return (
        <div style={{
            display: 'flex',
            gap: '12px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '12px',
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                color: '#6b7280',
                textAlign: 'center',
                padding: '4px',
            }}>Imagen alusiva al artículo</div>
            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>{article.title}</h3>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Descripción: {article.summary}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Autor: {article.author}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Resumen: {article.summary}</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>👍 Me gusta</button>
                    <button style={{ fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }}>💬 Comentar</button>
                </div>
            </div>
        </div>
    );
}