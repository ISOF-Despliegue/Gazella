import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getMyArticles, deleteMyArticle } from "../services/articles/articles"
import { getCurrentSession } from "../services/auth";
import type { MyArticle } from "../types/article";
import { Header } from "../components/Header";
import { SafeImage } from "../components/SafeImage";


type TabFilter = "todos" | "publicados" | "enRevision" | "borradores" | "rechazados"

function formatDate(value?: string) : string {
    if (!value) {
        return "—";
    }
    const d = value.includes("T") ? new Date(value) : new Date(value + "T00:00:00");
    if (Number.isNaN(d.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

function getEsMxStatus(status: string) : string {
    let esMxStatus = "Desconocido";
    switch (status) {
        case "Published": {
            esMxStatus = "Publicado";
            break;
        }
        case "UnderReview": {
            esMxStatus = "En revisión";
            break;
        }
        case "Draft": {
            esMxStatus = "Borrador";
            break;
        }
        case "Rejected": {
            esMxStatus = "Rechazado";
            break;
        }
        case "Removed": {
            esMxStatus = "Eliminado";
            break;
        }
    }
    return esMxStatus;
}

function getBackgroundColor(isEditable: boolean, status: string) {
  if (isEditable) {
    return "#dcfce7";
  }
  if (status === "UnderReview") {
    return "#f3f4f6";
  }
  return "#fee2e2";
};

function getTextColor(isEditable: boolean, status: string) {
  if (isEditable) {
    return "#15803d";
  }
  if (status === "UnderReview") {
    return "#374151";
  }
  return "#dc2626";
};

export function MyArticlesPage() {
    const navigate = useNavigate();

    const [articles, setArticles] = useState<MyArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabFilter>("todos");
    const [popupMessage, setPopupMessage] = useState<{ title: string; text: string; type: "success" | "error" | "info"; onClose?: () => void } | null>(null);

    const [confirmDeleteArticle, setConfirmDeleteArticle] = useState<MyArticle | null>(null);
    const [isDeleting, setIsDeleting] = useState(false); 

    useEffect(() => {
        const currentSession = getCurrentSession();
        if (!currentSession?.sub) {
            navigate("/login");
            return;
        }

        setIsLoading(true);
        getMyArticles()
            .then(setArticles)
            .catch(() => setError("No fue posible cargar tus articulos"))
            .finally(() => setIsLoading(false))
    }, [navigate]);

    const categorized: Record<TabFilter, MyArticle[]> = {
        todos: articles,
        publicados: articles.filter((a) => a.status === "Published"),
        enRevision: articles.filter((a) => a.status === "UnderReview"),
        borradores: articles.filter((a) => a.status === "Draft"),
        rechazados: articles.filter((a) => a.status === "Rejected")
    }

    const tabLabels: Record<TabFilter, string> = {
        todos: `Todos (${articles.length})`,
        publicados: `Publicados (${categorized.publicados.length})`,
        enRevision: `En revision (${categorized.enRevision.length})`,
        borradores: `Borradores (${categorized.borradores.length})`,
        rechazados: `Rechazados (${categorized.rechazados.length})`
    }

    const displayed = categorized[activeTab];

    const handleDeleteArticle = async(article: MyArticle) => {
        const currentSession = getCurrentSession();
        
        if (!currentSession?.sub) {
            setConfirmDeleteArticle(null);
            setPopupMessage({ 
                title: "Sesión expirada", 
                text: "Por favor inicia sesión nuevamente para eliminar el artículo.", 
                type: "error",
                onClose: () => navigate("/login")
            });
            return;
        }
        
        setIsDeleting(true);

        try {
            await deleteMyArticle(article.id, currentSession.sub);
            setArticles((prev) => prev.map((a) => a.id === article.id ? {...a, status: "Removed"} : a));
            setPopupMessage({ 
                title: "Éxito", 
                text: "El artículo ha sido eliminado correctamente.", 
                type: "success" 
            });
        } catch {
            setPopupMessage({ 
                title: "Error", 
                text: "No fue posible eliminar el artículo en este momento.", 
                type: "error" 
            });
        } finally {
            setIsDeleting(false);
            setConfirmDeleteArticle(null);
        }
    }

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Header />
            <div style={{ maxWidth: "960px", margin: "32px auto", padding: "0 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Mis articulos</h2>
                    <button
                        onClick={() => navigate("/nuevo-articulo")}
                        style={{ padding: "10px 18px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}
                    >
                        + Escribir un nuevo articulo
                    </button>
                </div>

                <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: "24px" }}>
                    {(["todos", "publicados", "enRevision", "borradores", "rechazados"] as TabFilter[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: "10px 20px", border: "none",
                                borderBottom: activeTab === tab ? "2px solid #16a34a" : "2px solid transparent",
                                backgroundColor: "transparent", cursor: "pointer", fontSize: "14px",
                                fontWeight: activeTab === tab ? "600" : "400",
                                color: activeTab === tab ? "#16a34a" : "#6b7280", borderRadius: 0,
                            }}
                        >
                            {tabLabels[tab]}
                        </button>
                    ))}
                </div>

                {isLoading && <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>Cargando articulos...</div>}
                {error && <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", color: "#dc2626" }}>{error}</div>}

                {!isLoading && !error && displayed.length === 0 && (
                    <div style={{ textAlign: "center", padding: "60px", backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", color: "#6b7280" }}>
                        No tienes articulos en esta categoría.
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {displayed.map((article) => {
                        const isUnderReview = article.status === "UnderReview";
                        const isPublished = article.status === "Published";
                        const isRemoved = article.status === "Removed";
                        const isEditable = !isUnderReview && !isRemoved;
                        return (
                            <div key={article.id} style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "20px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                                <div
                                    onClick={() => navigate(`/articulos/${article.id}`)}
                                    className="group cursor-pointer"
                                    style={{ width: "80px", height: "64px", borderRadius: "8px", backgroundColor: "#d1fae5", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
                                >
                                    <SafeImage
                                        src={article.coverUri}
                                        alt={article.title}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        variant="cover"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>{article.title}</p>
                                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }} >
                                        <span style={{ fontSize: "12px", color: "#6b7280" }}>{article.category}</span>
                                        <span style={{ fontSize: "12px", color: "#6b7280" }}>{formatDate(article.publishedAt)}</span>
                                        <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "9999px", backgroundColor: getBackgroundColor(isEditable, article.status), color: getTextColor(isEditable, article.status), fontWeight: "500" }}>
                                            {getEsMxStatus(article.status)}
                                        </span>
                                    </div>
                                    {isPublished && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap" }}>Me gusta: {article.likes}</span>
                                            <span style={{ fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap" }}>Comentarios: {article.comments}</span>
                                        </div>
                                    )}
                                    {isUnderReview && (
                                        <div style={{ backgroundColor: "#fef3c7", padding: "5px", borderRadius: "10px" }}>
                                            <p style={{ margin: 0, color: "#92400e", fontSize: "13px", fontWeight: "600", lineHeight: "1.5" }}>
                                                No es posible editar un articulo mientras esta siendo revisado
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                                    {isEditable && (
                                        <button onClick={() => navigate(`/articulos/editar/${article.id}`)} style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "13px" }}>
                                            Editar
                                        </button>
                                    )}
                                    {!isRemoved && (
                                        <button onClick={() => setConfirmDeleteArticle(article)} style={{ padding: "8px 16px", border: "1px solid #fecaca", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "13px", color: "#dc2626" }}>
                                            Eliminar articulo
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {confirmDeleteArticle && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "28px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>Eliminar articulo</h2>
                        <p style={{ fontSize: "14px", color: "#374151", marginBottom: "12px" }}>
                            ¿Estás seguro de que deseas eliminar el articulo <strong>{confirmDeleteArticle.title}</strong>? Esta acción no se puede deshacer
                        </p>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => setConfirmDeleteArticle(null)} style={{ flex: 1, padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "14px" }}>
                                No, conservar articulo
                            </button>
                            <button onClick={() => handleDeleteArticle(confirmDeleteArticle)} disabled={isDeleting} style={{ flex: 1, padding: "10px", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                                {isDeleting ? "Eliminando..." : "Sí, eliminar articulo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {popupMessage && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: "16px" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "28px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: 0, color: popupMessage.type === "error" ? "#dc2626" : (popupMessage.type === "success" ? "#15803d" : "#374151") }}>
                            {popupMessage.title}
                        </h2>
                        <p style={{ fontSize: "14px", color: "#374151", margin: 0, lineHeight: "1.5" }}>
                            {popupMessage.text}
                        </p>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                            <button 
                                onClick={() => {
                                    const action = popupMessage.onClose;
                                    setPopupMessage(null);
                                    if (action) action();
                                }} 
                                style={{ padding: "10px 20px", backgroundColor: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600", transition: "background-color 0.2s" }}
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
