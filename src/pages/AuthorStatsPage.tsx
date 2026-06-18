import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { EngagementRing } from "../components/EngagementRing"
import { assets } from "../assets/assets";
import { getMyAuthorStats } from "../services/articles/articles";
import type { AuthorStats } from "../types/article";

function dateFormat(datetime: string) {
  const fallback = "Fecha no especificada";

  const date = new Date(datetime);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  try {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  } catch {
    return fallback;
  }
}

function getRecentActivityText(stats: AuthorStats) {
    const latestComment = stats.recentActivity.latestCommentPostedAt
        ? `Comentario más reciente: ${dateFormat(stats.recentActivity.latestCommentPostedAt)}`
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
    const navigate = useNavigate();

    const [stats, setStats] = useState<AuthorStats | null>(null);
    const [loadingStatus, setLoadingStatus] = useState("Cargando estadísticas...");

    useEffect(() => {
        getMyAuthorStats()
            .then((data) => {
                setStats(data);
                setLoadingStatus("");
            })
            .catch(() => setLoadingStatus("No se pudieron cargar tus estadísticas."));
    }, []);

    const sortedArticles = useMemo(() => {
        if (!stats?.topArticles) {
            return [];
        }
        return [...stats.topArticles].sort((a, b) => b.likesCount - a.likesCount);
    }, [stats?.topArticles]);

    const maxLikes = useMemo(
        () => Math.max(1, ...(sortedArticles.map((article) => article.likesCount))),
        [sortedArticles],
    );

    const mostPopular = sortedArticles[0];
    const recentActivity = stats ? getRecentActivityText(stats) : [];

    return (
        <div style={pageStyle}>
            <nav style={navStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <BackButton fallbackPath="/dashboard" preferFallback />
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
                            {loadingStatus}
                        </div>
                    ) : stats.publishedArticlesCount === 0 ? (
                        <div style={{ textAlign: "center", padding: "80px 20px" }}>
                            <p style={{ fontSize: "16px", color: "#4b5563", marginBottom: "24px", lineHeight: "1.5" }}>
                                Aún no tienes artículos publicados. Las estadísticas estarán disponibles cuando publiques tu primer artículo.
                            </p>
                            <button
                                onClick={() => navigate("/nuevo-articulo")}
                                style={{
                                    padding: "12px 24px",
                                    backgroundColor: "#16a34a",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    transition: "background-color 0.2s"
                                }}
                            >
                                Escribir nuevo articulo
                            </button>
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
                                    {sortedArticles.map((article) => (
                                        <div
                                            key={article.id}
                                            style={{ display: "grid", cursor: 'pointer', gridTemplateColumns: "240px 1fr 40px", alignItems: "center", gap: "14px" }}
                                            onClick={() => navigate("/mis-articulos")}
                                        >
                                            <span style={{ fontSize: "13px", color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{article.title}</span>
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
                                    <p onClick={() => navigate(`/articulos/${mostPopular?.id}`)} style={{ cursor: "pointer", fontSize: "13px", color: "#374151", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{mostPopular?.title ?? "Sin artículos"}</p>
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

                                <article style={{ ...cardStyle, padding: "22px", minHeight: "130px", display: "flex", flexDirection: "column" }}>
                                    <h3 style={{ fontSize: "17px", fontWeight: "bold", marginBottom: "15px" }}>Tasa de interacción</h3>
                                    
                                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <EngagementRing rate={stats.engagementRate} size={110} strokeWidth={10} />
                                    </div>

                                    <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center", marginTop: "15px", borderTop: "1px solid #f3f4f6", paddingTop: "8px" }}>
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
