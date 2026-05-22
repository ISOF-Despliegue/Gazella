import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/BackButton';

interface Article {
    id: number;
    title: string;
    author: string;
    category: string;
    description: string;
    publishedDate: string;
    lastEditDate: string;
    imageUrl?: string;
}

const MOCK_ARTICLES: Article[] = [
    { id: 1, title: 'La importancia de separar la basura', author: 'Abel Hernández Yong', category: 'Biodiversidad', description: 'Como separa tu basura y formar un hábito', publishedDate: '14 de abril de 2026', lastEditDate: '18 de abril de 2026' },
    { id: 2, title: 'La importancia de separar la basura', author: 'Abel Hernández Yong', category: 'Biodiversidad', description: 'Como separa tu basura y formar un hábito', publishedDate: '14 de abril de 2026', lastEditDate: '18 de abril de 2026' },
    { id: 3, title: 'La importancia de separar la basura', author: 'Abel Hernández Yong', category: 'Biodiversidad', description: 'Como separa tu basura y formar un hábito', publishedDate: '14 de abril de 2026', lastEditDate: '18 de abril de 2026' },
    { id: 4, title: 'La importancia de separar la basura', author: 'Abel Hernández Yong', category: 'Biodiversidad', description: 'Como separa tu basura y formar un hábito', publishedDate: '14 de abril de 2026', lastEditDate: '18 de abril de 2026' },
    { id: 5, title: 'La importancia de separar la basura', author: 'Abel Hernández Yong', category: 'Biodiversidad', description: 'Como separa tu basura y formar un hábito', publishedDate: '14 de abril de 2026', lastEditDate: '18 de abril de 2026' },
];

const CATEGORIES = ['Biodiversidad', 'Áreas Protegidas', 'Acción Climática', 'Flora y Fauna'];
const ORDER_OPTIONS = ['Más reciente (predeterminado)', 'Más relevante', 'Más comentado', 'Más me gusta'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const YEARS = ['2023', '2024', '2025', '2026'];

export function ArticlesListPage() {
    const navigate = useNavigate();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
    const [authorSearch, setAuthorSearch] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('Sep');
    const [selectedYear, setSelectedYear] = useState('2025');

    const toggleCategory = (cat: string) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    };

    const toggleOrder = (opt: string) => {
        setSelectedOrder((prev) =>
            prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
        );
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>

            {/* Navbar */}
            <nav style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 40px',
                backgroundColor: 'white',
                borderBottom: '1px solid #e5e7eb',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <BackButton fallbackPath="/dashboard" />
                    <img src="/src/assets/gazella.png" alt="Gazella" style={{ width: '70px', objectFit: 'contain' }} />
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: '1.2' }}>
                        Conservación de<br />la biodiversidad
                    </h1>
                </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '20px', color: '#6b7280' }}>👤</span>
                    <span style={{ fontWeight: '500', fontSize: '15px' }}>Carlos</span>
                </div>
            </nav>

            {/* Contenido */}
            <div style={{ display: 'flex', padding: '24px 40px', gap: '24px' }}>

                {/* Panel de filtros */}
                <aside style={{
                    width: '200px',
                    flexShrink: 0,
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    height: 'fit-content',
                }}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '16px' }}>Filtros:</h3>

                    {/* Categoría */}
                    <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Categoría</h4>
                        {CATEGORIES.map((cat) => (
                            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '6px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat)}
                                    onChange={() => toggleCategory(cat)}
                                />
                                {cat}
                            </label>
                        ))}
                    </div>

                    {/* Autor */}
                    <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Autor</h4>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            gap: '6px',
                        }}>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar a tu autor favorito"
                                value={authorSearch}
                                onChange={(e) => setAuthorSearch(e.target.value)}
                                style={{ border: 'none', outline: 'none', fontSize: '12px', width: '100%' }}
                            />
                        </div>
                    </div>

                    {/* Fecha */}
                    <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Fecha</h4>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px', fontSize: '12px', flex: 1 }}
                            >
                                {MONTHS.map((m) => <option key={m}>{m}</option>)}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px', fontSize: '12px', flex: 1 }}
                            >
                                {YEARS.map((y) => <option key={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Ordenar por */}
                    <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Ordenar por:</h4>
                        {ORDER_OPTIONS.map((opt) => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '6px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedOrder.includes(opt)}
                                    onChange={() => toggleOrder(opt)}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </aside>

                {/* Lista de artículos */}
                <main style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>Lista de artículos publicados</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {MOCK_ARTICLES.map((article) => (
                            <div
                                key={article.id}
                                onClick={() => navigate(`/articulo/${article.id}`)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                }}
                            >
                                {/* Imagen */}
                                <div style={{
                                    width: '72px',
                                    height: '72px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '6px',
                                    flexShrink: 0,
                                }} />

                                {/* Info izquierda */}
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>{article.title}</h3>
                                    <p style={{ fontSize: '13px', color: '#374151', marginBottom: '2px' }}>
                                        <strong>Autor:</strong> {article.author}
                                    </p>
                                    <p style={{ fontSize: '13px', color: '#374151', marginBottom: '2px' }}>
                                        <strong>Categoría:</strong> {article.category}
                                    </p>
                                    <p style={{ fontSize: '13px', color: '#374151' }}>
                                        <strong>Descripción:</strong> {article.description}
                                    </p>
                                </div>

                                {/* Fechas */}
                                <div style={{ textAlign: 'right', fontSize: '13px', color: '#374151', flexShrink: 0 }}>
                                    <p><strong>Publicado:</strong> {article.publishedDate}</p>
                                    <p><strong>Última edición:</strong> {article.lastEditDate}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
