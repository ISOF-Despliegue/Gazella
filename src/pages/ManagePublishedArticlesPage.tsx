import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { assets } from "../assets/assets";
import { deletePublishedArticle, getPublishedArticles } from "../services/articles";
import type { PublishedArticle } from "../types/article";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

function getStatusLabel(status: PublishedArticle["status"]) {
    return status === "deleted" ? "Eliminado" : "Publicado";
}

const pageStyle: React.CSSProperties = {
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
};

const navStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 40px",
    backgroundColor: "white",
    borderBottom: "1px solid #e5e7eb",
};

export function ManagePublishedArticlesPage() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState<PublishedArticle[]>([]);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [notice, setNotice] = useState("");
    const [status, setStatus] = useState("Cargando artículos publicados...");

    useEffect(() => {
        getPublishedArticles()
            .then((response) => {
                setArticles(response.publishedArticles);
                setStatus(response.publishedArticles.length ? "" : "No hay artículos publicados.");
            })
            .catch(() => setStatus("No se pudieron cargar los artículos publicados."));
    }, []);

    const filteredArticles = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("es");

        return articles.filter((article) => {
            const matchesQuery = !normalizedQuery
                || [article.title, article.authorName].some((value) => value.toLocaleLowerCase("es").includes(normalizedQuery));
            const matchesStatus = !statusFilter || article.status === statusFilter;
            return matchesQuery && matchesStatus;
        });
    }, [articles, query, statusFilter]);

    const handleDelete = async (article: PublishedArticle) => {
        if (article.status === "deleted") return;

        await deletePublishedArticle(article.id);
        setArticles((current) =>
            current.map((item) => item.id === article.id ? { ...item, status: "deleted" } : item)
        );
        setNotice(`"${article.title}" se marcó como eliminado.`);
    };

    return (
        <div style={pageStyle}>
            <nav style={navStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <BackButton fallbackPath="/dashboard" />
                    <img src={assets.gazella} alt="Gazella" style={{ width: "70px", objectFit: "contain" }} />
                    <h1 style={{ fontSize: "22px", fontWeight: "bold", lineHeight: 1.2 }}>
                        Conservación de<br />la biodiversidad
                    </h1>
                </div>
            </nav>

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
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "820px" }}>
                                <thead>
                                    <tr>
                                        {["Título", "Autor", "Publicado", "Me gusta", "Comentarios", "Estado", "Acciones"].map((heading) => (
                                            <th
                                                key={heading}
                                                style={{ textAlign: heading === "Acciones" ? "right" : "left", padding: "12px 10px", fontSize: "13px", fontWeight: "700", color: "#111827", borderBottom: "1px solid #e5e7eb" }}
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredArticles.map((article) => (
                                        <tr key={article.id} style={{ backgroundColor: article.status === "deleted" ? "#f4eeee" : "white" }}>
                                            <td style={{ padding: "12px 10px", fontSize: "14px", fontWeight: "700", color: "#111827" }}>{article.title}</td>
                                            <td style={{ padding: "12px 10px", fontSize: "14px", color: "#111827" }}>{article.authorName}</td>
                                            <td style={{ padding: "12px 10px", fontSize: "14px", color: "#111827" }}>{formatDate(article.publishedAt)}</td>
                                            <td style={{ padding: "12px 10px", fontSize: "14px", color: "#111827" }}>{article.likesCount}</td>
                                            <td style={{ padding: "12px 10px", fontSize: "14px", color: "#111827" }}>{article.commentsCount}</td>
                                            <td style={{ padding: "12px 10px" }}>
                                                <span style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    border: `1px solid ${article.status === "deleted" ? "#ef4444" : "#22c55e"}`,
                                                    color: article.status === "deleted" ? "#991b1b" : "#166534",
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
                                                        onClick={() => navigate(`/articulo/${article.id}`)}
                                                        style={{ border: "1px solid #4f46e5", backgroundColor: "#c7d2fe", color: "#1e1b4b", borderRadius: "4px", padding: "5px 12px", cursor: "pointer", fontWeight: "700" }}
                                                    >
                                                        Ver
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(article)}
                                                        disabled={article.status === "deleted"}
                                                        style={{ border: "1px solid #ef4444", backgroundColor: "#fecaca", color: "#7f1d1d", borderRadius: "4px", padding: "5px 12px", cursor: article.status === "deleted" ? "not-allowed" : "pointer", fontWeight: "700", opacity: article.status === "deleted" ? 0.55 : 1 }}
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
                </section>
            </main>
        </div>
    );
}
