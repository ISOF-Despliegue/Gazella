import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { assets } from "../assets/assets";
import { getPendingArticles } from "../services/articles";
import type { PendingArticle } from "../types/article";

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
    const [articles, setArticles] = useState<PendingArticle[]>([]);
    const [status, setStatus] = useState("Cargando artículos pendientes...");
    const [query, setQuery] = useState("");

    useEffect(() => {
        getPendingArticles()
            .then((items) => {
                setArticles(items);
                setStatus(items.length ? "" : "No hay artículos pendientes de revisión.");
            })
            .catch(() => setStatus("No se pudieron cargar los artículos pendientes."));
    }, []);

    const filteredArticles = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("es");
        if (!normalizedQuery) return articles;

        return articles.filter((article) =>
            [article.title, article.authorName, article.categoryName]
                .some((value) => value.toLocaleLowerCase("es").includes(normalizedQuery))
        );
    }, [articles, query]);

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", backgroundColor: "white", borderBottom: "1px solid #e5e7eb" }}>
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
                        <span style={{ padding: "6px 14px", borderRadius: "9999px", backgroundColor: "#fef3c7", color: "#92400e", fontWeight: "700", fontSize: "13px" }}>
                            {articles.length} pendientes
                        </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "18px" }}>
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar por título, autor o categoría"
                            style={{ width: "320px", border: "1px solid #d1d5db", borderRadius: "6px", padding: "11px 14px", outline: "none", fontSize: "14px" }}
                        />
                    </div>

                    {status ? (
                        <div style={{ textAlign: "center", padding: "60px", color: "#6b7280", border: "1px dashed #e5e7eb", borderRadius: "10px" }}>
                            {status}
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}>
                                <thead>
                                    <tr>
                                        {["Título", "Autor", "Categoría", "Enviado", "Acciones"].map((heading) => (
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
                                        <tr key={article.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: "14px 10px" }}>
                                                <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>{article.title}</p>
                                                <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", maxWidth: "360px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {article.summary}
                                                </p>
                                            </td>
                                            <td style={{ padding: "14px 10px", fontSize: "14px" }}>{article.authorName}</td>
                                            <td style={{ padding: "14px 10px", fontSize: "14px" }}>{article.categoryName}</td>
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
                </section>
            </main>
        </div>
    );
}
