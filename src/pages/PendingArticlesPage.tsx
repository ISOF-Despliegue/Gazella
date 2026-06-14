import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type ArticlePendingReview, getPendingReview } from "../services/articles/drafts";
import { Header } from "../components/Header";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export function PendingArticlesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const notice = (location.state as { notice?: string } | null)?.notice;
    const [articles, setArticles] = useState<ArticlePendingReview[]>([]);
    const [status, setStatus] = useState("Cargando artículos pendientes...");
    const [query, setQuery] = useState("");
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageCount, setPageCount] = useState<number>(1);
    const [totalPending, setTotalPending] = useState<number>(0);
    const [pageInputValue, setPageInputValue] = useState<string>("1");

    useEffect(() => {
        setPageInputValue(currentPage.toString());

        getPendingReview(currentPage, pageSize)
            .then((result) => {
                setArticles(result.articlesPending);
                setTotalPending(result.totalPending);
                setPageCount(result.pageCount);
                
                if (currentPage > result.pageCount && result.pageCount > 0) {
                    setCurrentPage(result.pageCount);
                }

                setStatus(result.articlesPending.length ? "" : "No hay artículos pendientes de revisión.");
            })
            .catch(() => setStatus("No se pudieron cargar los artículos pendientes."));
    }, [currentPage, pageSize]);

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
                setPageInputValue(newPage.toString());
            }
        }
    };

    const handlePrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage((prev) => Math.min(pageCount, prev + 1));

    const filteredArticles = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("es");
        if (!normalizedQuery) return articles;

        return articles.filter((article) =>
            [article.title, article.authorName, article.category]
                .some((value) => value.toLocaleLowerCase("es").includes(normalizedQuery))
        );
    }, [articles, query]);

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Header/>
            <main style={{ maxWidth: "960px", margin: "32px auto", padding: "0 24px" }}>
                <section style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "28px" }}>
                    {notice && (
                        <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", color: "#15803d", fontSize: "14px", marginBottom: "18px" }}>
                            {notice}
                        </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "18px", marginBottom: "24px" }}>
                        <div>
                            <h2 style={{ fontSize: "26px", fontWeight: "bold", marginBottom: "6px" }}>
                                Artículos pendientes de revisión
                            </h2>
                            <p style={{ color: "#6b7280", fontSize: "14px" }}>
                                Revisa el contenido enviado antes de aprobar su publicación.
                            </p>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "18px" }}>
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Buscar por título, autor o categoría"
                                style={{ width: "250px", border: "1px solid #d1d5db", borderRadius: "6px", padding: "11px 14px", outline: "none", fontSize: "14px" }}
                            />
                        </div>
                        <span style={{ padding: "6px 14px", borderRadius: "9999px", backgroundColor: "#fef3c7", color: "#92400e", fontWeight: "700", fontSize: "13px" }}>
                            {totalPending} pendientes
                        </span>
                    </div>

                    {status ? (
                        <div style={{ textAlign: "center", padding: "60px", color: "#6b7280", border: "1px dashed #e5e7eb", borderRadius: "10px" }}>
                            {status}
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 360px)" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}>
                                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                                    <tr>
                                        {["Título", "Autor", "Categoría", "Enviado", "Acciones"].map((heading) => (
                                            <th
                                                key={heading}
                                                style={{ 
                                                    textAlign: heading === "Acciones" ? "right" : "left", 
                                                    padding: "12px 10px", 
                                                    fontSize: "13px", 
                                                    fontWeight: "700", 
                                                    color: "#111827", 
                                                    borderBottom: "1px solid #e5e7eb",
                                                    backgroundColor: "white"
                                                }}
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredArticles.map((article) => (
                                        <tr key={article.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: "5px 10px" }}>
                                                <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>{article.title}</p>
                                            </td>
                                            <td style={{ padding: "14px 10px", fontSize: "14px" }}>{article.authorName}</td>
                                            <td style={{ padding: "14px 10px", fontSize: "14px" }}>{article.category}</td>
                                            <td style={{ padding: "14px 10px", fontSize: "14px" }}>{formatDate(article.submittedAt)}</td>
                                            <td style={{ padding: "14px 10px", textAlign: "right" }}>
                                                <button
                                                    onClick={() => navigate(`/editor/articulos/${article.id}/revision`)}
                                                    style={{ border: "1px solid #15803d", backgroundColor: "#bbf7d0", color: "#14532d", borderRadius: "4px", padding: "6px 12px", cursor: "pointer", fontWeight: "700" }}
                                                >
                                                    Revisar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredArticles.length === 0 && (
                                <div style={{ textAlign: "center", padding: "44px", color: "#6b7280" }}>
                                    No hay resultados para esa búsqueda.
                                </div>
                            )}
                        </div>
                    )}
                    {!status && (
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            paddingTop: '16px',
                            borderTop: '1px solid #e5e7eb',
                            marginTop: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label htmlFor="pageSize" style={{ fontSize: '14px', color: '#374151' }}>Mostrar resultados:</label>
                                <select 
                                    id="pageSize"
                                    value={pageSize} 
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1); 
                                    }} 
                                    style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px 8px', fontSize: '13px', cursor: 'pointer' }}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#374151' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    Página
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
                                    Total: {totalPending}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                {currentPage > 1 ? (
                                    <button 
                                        onClick={handlePrevPage}
                                        style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        ◄
                                    </button>
                                ) : (
                                    <div style={{ width: '38px' }} />
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
                    )}
                </section>
            </main>
        </div>
    );
}
