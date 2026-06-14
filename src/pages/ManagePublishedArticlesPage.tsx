import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePublishedArticle, getPublishedArticles } from "../services/articles/management";
import type { PublishedArticle } from "../types/article";
import { Header } from "../components/Header";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

function getStatusLabel(status: PublishedArticle["status"]) {
    return status === "Removed" ? "Eliminado" : "Publicado";
}

const pageStyle: React.CSSProperties = {
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
};

export function ManagePublishedArticlesPage() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<PublishedArticle[]>([]);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [notice, setNotice] = useState("");
    const [status, setStatus] = useState("Cargando artículos publicados...");

    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageCount, setPageCount] = useState<number>(1);
    const [totalEntries, setTotalEntries] = useState<number>(0);
    const [pageInputValue, setPageInputValue] = useState<string>("1");

    useEffect(() => {
        setPageInputValue(currentPage.toString());

        getPublishedArticles(currentPage, pageSize)
            .then((response) => {
                setArticles(response.publishedArticles);
                setTotalEntries(response.totalEntries);
                setPageCount(response.pageCount);

                if (currentPage > response.pageCount && response.pageCount > 0) {
                    setCurrentPage(response.pageCount);
                }

                setStatus(response.publishedArticles.length ? "" : "No hay artículos publicados.");
            })
            .catch(() => setStatus("No se pudieron cargar los artículos publicados."));
    }, [currentPage, pageSize]);

    const filteredArticles = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("es");

        return articles.filter((article) => {
            const matchesQuery = !normalizedQuery
                || [article.title, article.authorName].some((value) => value.toLocaleLowerCase("es").includes(normalizedQuery));
            const matchesStatus = !statusFilter || article.status === statusFilter;
            return matchesQuery && matchesStatus;
        });
    }, [articles, query, statusFilter]);

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
                if (newPage > pageCount) newPage = pageCount;
                if (newPage < 1) newPage = 1;
                
                setCurrentPage(newPage);
                setPageInputValue(newPage.toString());
            }
        }
    };

    const handlePrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage((prev) => Math.min(pageCount, prev + 1));

    const handleDelete = async (article: PublishedArticle) => {
        if (article.status === "Removed") return;

        await deletePublishedArticle(article.id);
        setArticles((current) =>
            current.map((item) => item.id === article.id ? { ...item, status: "Removed" } : item)
        );
        setNotice(`"${article.title}" se marcó como eliminado.`);
    };

    return (
        <div style={pageStyle}>
            <Header/>

            <main style={{ maxWidth: "960px", margin: "32px auto", padding: "0 24px" }}>
                <section style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "28px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "18px", marginBottom: "28px" }}>
                        <h2 style={{ fontSize: "26px", fontWeight: "bold" }}>
                            Gestionar Artículos Publicados
                        </h2>

                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "6px", padding: "10px 14px", width: "260px" }}>
                                <span style={{ fontSize: "18px", color: "#111827", marginRight: "10px" }}>⌕</span>
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Buscar artículo"
                                    style={{ border: "none", outline: "none", fontSize: "14px", width: "100%" }}
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                style={{ border: "1px solid #d1d5db", borderRadius: "6px", padding: "11px 14px", fontSize: "14px", minWidth: "150px", backgroundColor: "white" }}
                            >
                                <option value="">Estado</option>
                                <option value="published">Publicado</option>
                                <option value="deleted">Eliminado</option>
                            </select>
                        </div>
                    </div>

                    {notice && (
                        <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", color: "#15803d", fontSize: "14px", marginBottom: "18px" }}>
                            {notice}
                        </div>
                    )}

                    {status ? (
                        <div style={{ textAlign: "center", padding: "60px", color: "#6b7280", border: "1px dashed #e5e7eb", borderRadius: "10px" }}>
                            {status}
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 360px)" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "820px" }}>
                                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                                    <tr>
                                        {["Título", "Autor", "Publicado", "Me gusta", "Comentarios", "Estado", "Acciones"].map((heading) => (
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
                                        <tr key={article.id} style={{ backgroundColor: article.status === "Removed" ? "#f4eeee" : "white" }}>
                                            <td style={{ padding: "12px 10px", fontSize: "14px", fontWeight: "700", color: "#111827" }}>{article.title}</td>
                                            <td style={{ padding: "12px 10px", fontSize: "14px", color: "#111827" }}>{article.authorName}</td>
                                            <td style={{ padding: "12px 10px", fontSize: "14px", color: "#111827" }}>{formatDate(article.publishedAt)}</td>
                                            <td style={{ padding: "12px 10px", fontSize: "14px", color: "#111827" }}>{article.likesCount}</td>
                                            <td style={{ padding: "12px 10px", fontSize: "14px", color: "#111827" }}>{article.commentsCount}</td>
                                            <td style={{ padding: "12px 10px" }}>
                                                <span style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    border: `1px solid ${article.status === "Removed" ? "#ef4444" : "#22c55e"}`,
                                                    color: article.status === "Removed" ? "#991b1b" : "#166534",
                                                    borderRadius: "9999px",
                                                    padding: "2px 8px",
                                                    fontSize: "12px",
                                                    fontWeight: "700",
                                                }}>
                                                    {getStatusLabel(article.status)}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px 10px", textAlign: "right" }}>
                                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                                    <button
                                                        onClick={() => navigate(`/articulos/${article.id}`)}
                                                        style={{ border: "1px solid #4f46e5", backgroundColor: "#c7d2fe", color: "#1e1b4b", borderRadius: "4px", padding: "5px 12px", cursor: "pointer", fontWeight: "700" }}
                                                    >
                                                        Ver
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(article)}
                                                        disabled={article.status === "Removed"}
                                                        style={{ border: "1px solid #ef4444", backgroundColor: "#fecaca", color: "#7f1d1d", borderRadius: "4px", padding: "5px 12px", cursor: article.status === "Removed" ? "not-allowed" : "pointer", fontWeight: "700", opacity: article.status === "Removed" ? 0.55 : 1 }}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredArticles.length === 0 && (
                                <div style={{ textAlign: "center", padding: "44px", color: "#6b7280" }}>
                                    No hay resultados para esos filtros.
                                </div>
                            )}
                        </div>
                    )}
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
                                Total: {totalEntries}
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
                </section>
            </main>
        </div>
    );
}
