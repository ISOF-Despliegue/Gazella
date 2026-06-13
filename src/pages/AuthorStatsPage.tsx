import { useEffect, useMemo, useState } from "react";
import { BackButton } from "../components/BackButton";
import { assets } from "../assets/assets";
import { getMyAuthorStats } from "../services/articles/articles";
import type { AuthorStats } from "../types/article";

function getRecentActivityText(stats: AuthorStats) {
    const latestComment = stats.recentActivity.latestCommentPostedAt
        ? "Nuevo comentario hace 2 h"
        : "Sin comentarios recientes";

    return [latestComment, `${stats.recentActivity.likesToday} nuevos me gusta hoy`];
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

const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
};

export function AuthorStatsPage() {
    const [stats, setStats] = useState<AuthorStats | null>(null);
    const [status, setStatus] = useState("Cargando estadísticas...");

    useEffect(() => {
        getMyAuthorStats()
            .then((data) => {
                setStats(data);
                setStatus("");
            })
            .catch(() => setStatus("No se pudieron cargar tus estadísticas."));
    }, []);

    const maxLikes = useMemo(
        () => Math.max(1, ...(stats?.topArticles.map((article) => article.likesCount) ?? [1])),
        [stats],
    );

    const mostPopular = stats?.topArticles[0];
    const recentActivity = stats ? getRecentActivityText(stats) : [];

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
                <section style={{ ...cardStyle, padding: "28px" }}>
                    <h2 style={{ fontSize: "26px", fontWeight: "bold", marginBottom: "22px" }}>
                        Estadísticas de Mis Artículos
                    </h2>

                    {!stats ? (
                        <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
                            {status}
                        </div>
                    ) : (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px" }}>
                                {[
                                    { value: stats.totalLikes, label: "Total de Me Gusta" },
                                    { value: stats.totalComments, label: "Total de Comentarios" },
                                    { value: stats.publishedArticlesCount, label: "Artículos publicados" },
                                ].map((summary) => (
                                    <article key={summary.label} style={{ ...cardStyle, padding: "26px 20px", textAlign: "center" }}>
                                        <p style={{ fontSize: "34px", fontWeight: "800", marginBottom: "8px" }}>
                                            {summary.value}
                                        </p>
                                        <p style={{ fontSize: "15px", fontWeight: "700", color: "#6b7280" }}>
                                            {summary.label}
                                        </p>
                                    </article>
                                ))}
                            </div>

                            <section style={{ ...cardStyle, padding: "18px", marginTop: "26px" }}>
                                <h3 style={{ fontSize: "17px", fontWeight: "bold", marginBottom: "18px" }}>
                                    Me Gusta por Artículo
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {stats.topArticles.map((article) => (
                                        <div
                                            key={article.id}
                                            style={{ display: "grid", gridTemplateColumns: "240px 1fr 40px", alignItems: "center", gap: "14px" }}
                                        >
                                            <span style={{ fontSize: "13px", color: "#374151" }}>{article.title}</span>
                                            <div style={{ height: "18px", border: "1px solid #d1d5db", borderRadius: "3px", backgroundColor: "#f9fafb", overflow: "hidden" }}>
                                                <div
                                                    style={{
                                                        height: "100%",
                                                        width: `${(article.likesCount / maxLikes) * 100}%`,
                                                        backgroundColor: "#bbf7d0",
                                                    }}
                                                />
                                            </div>
                                            <span style={{ fontSize: "13px", textAlign: "right" }}>{article.likesCount || "-"}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px", marginTop: "26px" }}>
                                <article style={{ ...cardStyle, padding: "22px", minHeight: "130px" }}>
                                    <h3 style={{ fontSize: "17px", fontWeight: "bold", marginBottom: "28px" }}>Artículo más popular</h3>
                                    <p style={{ fontSize: "13px", color: "#374151" }}>{mostPopular?.title ?? "Sin artículos"}</p>
                                    {mostPopular && (
                                        <p style={{ fontSize: "13px", fontWeight: "700", marginTop: "8px" }}>
                                            {mostPopular.likesCount} me gusta · {mostPopular.commentsCount} comentarios
                                        </p>
                                    )}
                                </article>

                                <article style={{ ...cardStyle, padding: "22px", minHeight: "130px" }}>
                                    <h3 style={{ fontSize: "17px", fontWeight: "bold", marginBottom: "28px" }}>Actividad reciente</h3>
                                    {recentActivity.map((item) => (
                                        <p key={item} style={{ fontSize: "13px", color: "#374151", marginBottom: "10px" }}>{item}</p>
                                    ))}
                                </article>

                                <article style={{ ...cardStyle, padding: "22px", minHeight: "130px" }}>
                                    <h3 style={{ fontSize: "17px", fontWeight: "bold", marginBottom: "24px" }}>Tasa de interacción</h3>
                                    <p style={{ fontSize: "18px", fontWeight: "800", marginBottom: "10px" }}>{stats.engagementRate.toFixed(1)}%</p>
                                    <p style={{ fontSize: "13px", color: "#374151" }}>
                                        promedio (likes + comentarios / lecturas)
                                    </p>
                                </article>
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}
