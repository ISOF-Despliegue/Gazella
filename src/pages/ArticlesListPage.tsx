import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { getCategories, searchArticles } from '../services/articles/articles';
import { SafeImage } from '../components/SafeImage';
import { type Category, type ArticleSearchEntry } from '../types/article';

interface OrderOption {
    display: string;
    key: string;
}

const ORDER_OPTIONS: OrderOption[] = [
    { display: 'Más reciente', key: 'published_at' },
    { display: 'Más relevante', key: 'views' },
    { display: 'Más comentado', key: 'comments' },
    { display: 'Más me gusta', key: 'likes' }
];

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const YEARS = ['2023', '2024', '2025', '2026'];

export function ArticlesListPage() {
    const navigate = useNavigate();
    
    const [titleInput, setTitleInput] = useState<string>(() => sessionStorage.getItem('searchTitle') || '');
    const [searchTitle, setSearchTitle] = useState<string>(() => sessionStorage.getItem('searchTitle') || '');
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryName, setSelectedCategoryName] = useState<string>(() => sessionStorage.getItem('category') || ''); 
    const [selectedOrderKey, setSelectedOrderKey] = useState<string>(() => sessionStorage.getItem('orderKey') || 'published_at');
    const [authorInput, setAuthorInput] = useState<string>(() => sessionStorage.getItem('authorSearch') || '');
    const [authorSearch, setAuthorSearch] = useState<string>(() => sessionStorage.getItem('authorSearch') || '');
    const [selectedMonth, setSelectedMonth] = useState(() => sessionStorage.getItem('month') || 'Sep');
    const [selectedYear, setSelectedYear] = useState(() => sessionStorage.getItem('year') || '2025');
    
    const [articles, setArticles] = useState<ArticleSearchEntry[]>([]);
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(() => Number(sessionStorage.getItem('currentPage')) || 1);
    const [pageCount, setPageCount] = useState<number>(1);
    const [totalEntries, setTotalEntries] = useState<number>(0);
    const [pageInputValue, setPageInputValue] = useState<string>("1");

    const monthIndex = MONTHS.indexOf(selectedMonth);
    const publishedAfter = monthIndex !== -1 && selectedYear 
        ? new Date(Date.UTC(Number.parseInt(selectedYear), monthIndex, 1, 0, 0, 0)).toISOString()
        : '';

    useEffect(() => {
        const fetchCategories = async () => {
            const mockData = await getCategories();
            setCategories(mockData);
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        setPageInputValue(currentPage.toString());

        const fetchArticlesData = async () => {
            try {
                const result = await searchArticles({
                    pageIndex: currentPage,
                    pageSize: pageSize,
                    title: searchTitle || undefined,
                    category: selectedCategoryName || undefined,
                    authorName: authorSearch || undefined,
                    publishedAfter: publishedAfter || undefined,
                    sortBy: selectedOrderKey || undefined
                });

                setArticles(result?.entries ?? []);
                setTotalEntries(result?.totalEntries ?? 0);
                setPageCount(result?.pageCount ?? 1);
                
                if (currentPage > (result?.pageCount ?? 1) && (result?.pageCount ?? 0) > 0) {
                    setCurrentPage(result.pageCount);
                }

            } catch (error) {
                console.error("Error al buscar artículos:", error);
                setArticles([]);
            }
        };

        fetchArticlesData();

    }, [currentPage, pageSize, selectedCategoryName, authorSearch, selectedMonth, selectedYear, selectedOrderKey, searchTitle]);

    useEffect(() => {
        sessionStorage.setItem('searchTitle', searchTitle);
        sessionStorage.setItem('category', selectedCategoryName);
        sessionStorage.setItem('orderKey', selectedOrderKey);
        sessionStorage.setItem('authorSearch', authorSearch);
        sessionStorage.setItem('month', selectedMonth);
        sessionStorage.setItem('year', selectedYear);
        sessionStorage.setItem('currentPage', currentPage.toString());
    }, [searchTitle, selectedCategoryName, selectedOrderKey, authorSearch, selectedMonth, selectedYear, currentPage]);

    const handleClearFilters = () => {
        setTitleInput('');
        setSearchTitle('');
        setSelectedCategoryName('');
        setAuthorInput('');
        setAuthorSearch('');
        setSelectedOrderKey('published_at');
        setSelectedMonth('Sep');
        setSelectedYear('2025');
        setCurrentPage(1);
    };

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '' || /^\d+$/.test(val)) {
            setPageInputValue(val);
        }
    };

    const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            let newPage = Number.parseInt(pageInputValue, 10);
            
            if (Number.isNaN(newPage)) {
                setPageInputValue(currentPage.toString());
            } else {
                if (newPage > pageCount) {
                    newPage = pageCount;
                }
                if (newPage < 1) {
                    newPage = 1;
                }
                
                setCurrentPage(newPage);
                setPageInputValue(newPage.toString()); // Visually adjust input to valid page if it was out of range
            }
        }
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(pageCount, prev + 1));
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', paddingBottom: '40px' }}>

            <Header/>

            <div style={{ display: 'flex', padding: '24px 40px', gap: '24px' }}>

                {/* Filter panel */}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>Filtros:</h3>
                        <button 
                            onClick={handleClearFilters}
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                        >
                            Limpiar filtros
                        </button>
                    </div>

                    {/* Category */}
                    <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Categoría</h4>
                        <div style={{ maxHeight: '130px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                            {categories.map((cat) => (
                                <label key={cat.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="category"
                                        value={cat.name}
                                        checked={selectedCategoryName === cat.name}
                                        onChange={(e) => {
                                            setSelectedCategoryName(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        style={{ marginTop: '2px' }}
                                    />
                                    <span style={{ lineHeight: '1.2' }}>{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Author */}
                    <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Autor</h4>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 10px', gap: '6px' }}>
                            <input
                                type="text"
                                placeholder="Buscar por autor"
                                maxLength={128}
                                value={authorInput}
                                onChange={(e) => {
                                    setAuthorInput(e.target.value.trimStart());
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (authorInput.length > 0 && authorInput.trim().length === 0) return;
                                        
                                        setAuthorSearch(authorInput.trim());
                                        setAuthorInput(authorInput.trim());
                                        setCurrentPage(1);
                                    }
                                }}
                                style={{ border: 'none', outline: 'none', fontSize: '12px', width: '100%' }}
                            />
                            <button 
                                type="button"
                                aria-label="Buscar por autor"
                                onClick={() => {
                                    if (authorInput.length > 0 && authorInput.trim().length === 0) {
                                        return;
                                    }
                                    setAuthorSearch(authorInput.trim());
                                    setAuthorInput(authorInput.trim());
                                    setCurrentPage(1);
                                }}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    padding: 0, 
                                    fontSize: '12px', 
                                    color: '#9ca3af', 
                                    cursor: 'pointer' 
                                }}
                            >
                                🔍
                            </button>
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Fecha</h4>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px', fontSize: '12px', flex: 1 }}>
                                {MONTHS.map((m) => <option key={m}>{m}</option>)}
                            </select>
                            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px', fontSize: '12px', flex: 1 }}>
                                {YEARS.map((y) => <option key={y}>{y}</option>)}
                            </select>
                        </div>
                        <div style={{ fontSize: '10px', marginTop: '4px', color: 'gray' }}>{publishedAfter}</div>
                    </div>

                    {/* Order by */}
                    <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>Ordenar por:</h4>
                        <div style={{ maxHeight: '130px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                            {ORDER_OPTIONS.map((opt) => (
                                <label key={opt.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="order"
                                        value={opt.key}
                                        checked={selectedOrderKey === opt.key}
                                        onChange={(e) => setSelectedOrderKey(e.target.value)}
                                        style={{ marginTop: '2px' }}
                                    />
                                    <span style={{ lineHeight: '1.2' }}>{opt.display}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Article entries */}
                <main style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: 'calc(90vh - 100px)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
                            Lista de artículos publicados
                        </h2>
                        
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '9999px', padding: '8px 16px', width: '320px', backgroundColor: 'white' }}>
                            <input
                                type="text"
                                placeholder="Buscar artículos por titulo"
                                maxLength={128}
                                value={titleInput}
                                onChange={(e) => {
                                    setTitleInput(e.target.value.trimStart());
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setSearchTitle(titleInput.trim());
                                        setTitleInput(titleInput.trim());
                                        setCurrentPage(1);
                                    }
                                }}
                                style={{ outline: 'none', fontSize: '14px', width: '100%', border: 'none', background: 'transparent' }}
                            />
                            <button 
                                type="button"
                                aria-label="Buscar artículos por título"
                                onClick={() => {
                                    setSearchTitle(titleInput.trim());
                                    setTitleInput(titleInput.trim());
                                    setCurrentPage(1);
                                }}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    padding: 0, 
                                    marginRight: '8px', 
                                    color: '#9ca3af', 
                                    cursor: 'pointer' 
                                }}
                            >
                                🔍
                            </button>
                        </div>
                    </div>

                    {/* Article entries mapping */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', paddingRight: '8px', marginBottom: '16px' }}>
                        {articles.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                No se encontraron artículos con los criterios seleccionados.
                            </div>
                        ) : articles.map((article) => (
                            <div
                                key={article.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => navigate(`/articulos/${article.id}`)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        navigate(`/articulos/${article.id}`);
                                    }
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 16px', cursor: 'pointer' }}
                            >
                                {/* Picture */}
                                <div style={{ width: '72px', height: '72px', backgroundColor: '#e5e7eb', borderRadius: '6px', flexShrink: 0, overflow: 'hidden' }}>
                                    <SafeImage
                                        src={article.coverUri}
                                        alt={article.title}
                                        variant="cover"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>

                                {/* Data */}
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>{article.title}</h3>
                                    <p style={{ fontSize: '13px', color: '#374151', marginBottom: '2px' }}>
                                        <strong>Autor:</strong> {article.authorName}
                                    </p>
                                    <p style={{ fontSize: '13px', color: '#374151', marginBottom: '2px' }}>
                                        <strong>Categoría:</strong> {article.categoryName}
                                    </p>
                                    <p style={{ fontSize: '13px', color: '#374151' }}>
                                        <strong>Descripción:</strong> {article.summary}
                                    </p>
                                </div>

                                {/* Dates */}
                                <div style={{ textAlign: 'right', fontSize: '13px', color: '#374151', flexShrink: 0 }}>
                                    <p><strong>Publicado:</strong> {new Date(article.publishedAt).toLocaleDateString()}</p>
                                    <p><strong>Última edición:</strong> {new Date(article.lastUpdatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        paddingTop: '16px',
                        borderTop: '1px solid #e5e7eb',
                        marginTop: 'auto'
                    }}>
                        {/* Page size selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label htmlFor="pageSize" style={{ fontSize: '14px', color: '#374151' }}>Mostrar resultados:</label>
                            <select 
                                id="pageSize"
                                value={pageSize} 
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1); // Reset to first page when page size changes
                                }} 
                                style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', cursor: 'pointer' }}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        {/* Pagination info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#374151' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                Página
                                {/*no space*/}
                                <input
                                    type="text"
                                    value={pageInputValue}
                                    onChange={handlePageInputChange}
                                    onKeyDown={handlePageInputKeyDown}
                                    style={{ 
                                        width: '40px', 
                                        textAlign: 'center', 
                                        padding: '4px', 
                                        border: '1px solid #d1d5db', 
                                        borderRadius: '4px',
                                        outline: 'none',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                            <span>de {pageCount}</span>
                            <span style={{ color: '#6b7280', borderLeft: '1px solid #d1d5db', paddingLeft: '12px' }}>
                                Total: {totalEntries}
                            </span>
                        </div>

                        {/* Pagination controls ◄ ► */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {currentPage > 1 ? (
                                <button 
                                    onClick={handlePrevPage}
                                    style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    ◄
                                </button>
                            ) : (
                                <div style={{ width: '38px' }} /> /* Alignment placeholder */
                            )}

                            {currentPage < pageCount ? (
                                <button 
                                    onClick={handleNextPage}
                                    style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    ►
                                </button>
                            ) : (
                                <div style={{ width: '38px' }} />
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
