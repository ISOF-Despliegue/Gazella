import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProjects, cancelProject, getProjectVolunteers, type VolunteerEntry } from "../services/projects";
import { type Project } from "../types/project";
import { Header } from "../components/Header";
import { getCurrentSession } from "../services/auth";

type TabFilter = "activos" | "finalizados" | "borradores";

function formatDate(value?: string): string {
    if (!value) return "—";
    const d = value.includes("T") ? new Date(value) : new Date(value + "T00:00:00");
    if (isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export function MyProjectsPage() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabFilter>("activos");
    const [actionMessage, setActionMessage] = useState<{ text: string; type: "ok" | "err" } | null>(null);

    const [volunteersProjectId, setVolunteersProjectId] = useState<string | null>(null);
    const [volunteersProjectTitle, setVolunteersProjectTitle] = useState<string>("");
    const [volunteers, setVolunteers] = useState<VolunteerEntry[]>([]);
    const [volunteersTotal, setVolunteersTotal] = useState(0);
    const [volunteersMax, setVolunteersMax] = useState(0);
    const [volunteersLoading, setVolunteersLoading] = useState(false);

    const [confirmCancelProject, setConfirmCancelProject] = useState<Project | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        const session = getCurrentSession();
        if (!session) { navigate("/login"); return; }
        const isOrganizer = session.roles?.includes("organizer");
        if (!isOrganizer) { navigate("/dashboard"); return; }

        setIsLoading(true);
        getMyProjects()
            .then(setProjects)
            .catch(() => setError("No fue posible cargar tus proyectos."))
            .finally(() => setIsLoading(false));
    }, [navigate]);

    const categorized: Record<TabFilter, Project[]> = {
        activos: projects.filter((p) => p.status === "Active" || p.status === "active"),
        finalizados: projects.filter((p) => p.status === "Completed" || p.status === "Cancelled"),
        borradores: projects.filter((p) => p.status === "Draft"),
    };

    const tabLabels: Record<TabFilter, string> = {
        activos: `Activos (${categorized.activos.length})`,
        finalizados: `Finalizados (${categorized.finalizados.length})`,
        borradores: `Borradores (${categorized.borradores.length})`,
    };

    const displayed = categorized[activeTab];

    const handleCancelProject = async (project: Project) => {
        setIsCancelling(true);
        try {
            await cancelProject(project.id);
            setProjects((prev) => prev.map((p) => p.id === project.id ? { ...p, status: "Cancelled" } : p));
            setActionMessage({ text: "El proyecto ha sido cancelado y se notificará a los voluntarios inscritos.", type: "ok" });
        } catch {
            setActionMessage({ text: "No fue posible cancelar el proyecto. Por favor intenta más tarde.", type: "err" });
        } finally {
            setIsCancelling(false);
            setConfirmCancelProject(null);
        }
    };

    const openVolunteers = async (project: Project) => {
        setVolunteersProjectId(project.id);
        setVolunteersProjectTitle(project.title);
        setVolunteersMax(project.volunteersMax);
        setVolunteersLoading(true);
        try {
            const result = await getProjectVolunteers(project.id, { pageSize: 50 });
            setVolunteers(result.volunteers ?? []);
            setVolunteersTotal(result.totalVolunteers ?? result.volunteers?.length ?? 0);
        } catch {
            setVolunteers([]);
            setVolunteersTotal(0);
        } finally {
            setVolunteersLoading(false);
        }
    };

    const confirmedCount = volunteers.filter((v) => v.enrollment_status === "Confirmed").length;

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Header />

            <div style={{ maxWidth: "960px", margin: "32px auto", padding: "0 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Mis proyectos</h2>
                    <button
                        onClick={() => navigate("/mis-proyectos/crear")}
                        style={{ padding: "10px 18px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}
                    >
                        + Crear nuevo proyecto
                    </button>
                </div>

                <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: "24px" }}>
                    {(["activos", "finalizados", "borradores"] as TabFilter[]).map((tab) => (
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

                {actionMessage && (
                    <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: actionMessage.type === "ok" ? "#dcfce7" : "#fef2f2", border: `1px solid ${actionMessage.type === "ok" ? "#bbf7d0" : "#fecaca"}`, color: actionMessage.type === "ok" ? "#15803d" : "#dc2626", fontSize: "14px", marginBottom: "16px" }}>
                        {actionMessage.text}
                    </div>
                )}

                {isLoading && <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>Cargando proyectos...</div>}
                {error && <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", color: "#dc2626" }}>{error}</div>}

                {!isLoading && !error && displayed.length === 0 && (
                    <div style={{ textAlign: "center", padding: "60px", backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", color: "#6b7280" }}>
                        No tienes proyectos en esta categoría.
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {displayed.map((project) => {
                        const pct = Math.round((project.volunteersEnrolled / Math.max(project.volunteersMax, 1)) * 100);
                        const isActive = project.status === "Active" || project.status === "active";
                        return (
                            <div key={project.id} style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "20px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                                <div style={{ width: "80px", height: "64px", borderRadius: "8px", backgroundColor: "#d1fae5", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {project.coverUri ? (
                                        <img src={project.coverUri} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <span style={{ fontSize: "28px" }}>🌿</span>
                                    )}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>{project.title}</p>
                                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
                                        <span style={{ fontSize: "12px", color: "#6b7280" }}>📍 {project.location}</span>
                                        <span style={{ fontSize: "12px", color: "#6b7280" }}>📅 {project.date}</span>
                                        <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "9999px", backgroundColor: isActive ? "#dcfce7" : project.status === "Draft" ? "#f3f4f6" : "#fee2e2", color: isActive ? "#15803d" : project.status === "Draft" ? "#374151" : "#dc2626", fontWeight: "500" }}>
                                            {isActive ? "Activo" : project.status === "Draft" ? "Borrador" : project.status === "Cancelled" ? "Cancelado" : "Finalizado"}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{ flex: 1, height: "6px", backgroundColor: "#e5e7eb", borderRadius: "9999px", overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct >= 90 ? "#ef4444" : "#16a34a", borderRadius: "9999px" }} />
                                        </div>
                                        <span style={{ fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap" }}>Voluntarios: {project.volunteersEnrolled}/{project.volunteersMax}</span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                                    <button onClick={() => navigate(`/mis-proyectos/editar/${project.id}`)} style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "13px" }}>
                                        Editar
                                    </button>
                                    <button onClick={() => openVolunteers(project)} style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "13px" }}>
                                        Ver voluntarios
                                    </button>
                                    {isActive && (
                                        <button onClick={() => setConfirmCancelProject(project)} style={{ padding: "8px 16px", border: "1px solid #fecaca", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "13px", color: "#dc2626" }}>
                                            Cancelar proyecto
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {volunteersProjectId && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div style={{ backgroundColor: "white", borderRadius: "12px", width: "680px", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", overflow: "hidden" }}>
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>Voluntarios inscritos</h2>
                                <p style={{ fontSize: "13px", color: "#6b7280" }}>{volunteersProjectTitle}</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <span style={{ fontSize: "14px", color: "#6b7280", padding: "4px 12px", backgroundColor: "#f3f4f6", borderRadius: "9999px" }}>
                                    {confirmedCount}/{volunteersMax} inscritos · {volunteersTotal} total
                                </span>
                                <button onClick={() => setVolunteersProjectId(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#9ca3af" }}>✕</button>
                            </div>
                        </div>

                        <div style={{ overflowY: "auto", flex: 1 }}>
                            {volunteersLoading ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Cargando voluntarios...</div>
                            ) : volunteers.length === 0 ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>No hay voluntarios registrados.</div>
                            ) : (
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: "#f9fafb" }}>
                                            {["Correo", "Fecha de inscripción", "Estado", "Perfil"].map((h) => (
                                                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {volunteers.map((v) => (
                                            <tr key={v.volunteer_id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                                <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>{v.email}</td>
                                                <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>{formatDate(v.enrolled_at)}</td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "9999px", backgroundColor: v.enrollment_status === "Confirmed" ? "#dcfce7" : "#fee2e2", color: v.enrollment_status === "Confirmed" ? "#15803d" : "#dc2626", fontWeight: "500" }}>
                                                        {v.enrollment_status === "Confirmed" ? "Confirmado" : "Cancelado"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <button 
                                                        onClick={() => navigate(`/usuario/${v.volunteer_id}`)}
                                                        style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: "4px", backgroundColor: "white", cursor: "pointer", fontSize: "12px" }}>
                                                        Ver Perfil
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {confirmCancelProject && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "28px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>Cancelar proyecto</h2>
                        <p style={{ fontSize: "14px", color: "#374151", marginBottom: "12px" }}>
                            ¿Estás seguro de que deseas cancelar el proyecto <strong>{confirmCancelProject.title}</strong>?
                        </p>
                        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
                            Se notificará a todos los voluntarios inscritos sobre la cancelación.
                        </p>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => setConfirmCancelProject(null)} style={{ flex: 1, padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "14px" }}>
                                No, conservar proyecto
                            </button>
                            <button onClick={() => handleCancelProject(confirmCancelProject)} disabled={isCancelling} style={{ flex: 1, padding: "10px", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                                {isCancelling ? "Cancelando..." : "Sí, cancelar proyecto"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}