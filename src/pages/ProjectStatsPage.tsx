import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProjects, getProjectVolunteers, type VolunteerEntry } from "../services/projects";
import { type Project } from "../types/project";
import { Header } from "../components/Header";
import { getCurrentSession } from "../services/auth";

interface ProjectStats {
    project: Project;
    volunteers: VolunteerEntry[];
    cancelledCount: number;
    occupancyPct: number;
}

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) return "hace menos de 1 h";
    if (diffHours < 24) return `hace ${diffHours} h`;
    return `hace ${diffDays} día${diffDays !== 1 ? "s" : ""}`;
}

export function ProjectStatsPage() {
    const navigate = useNavigate();

    const [stats, setStats] = useState<ProjectStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const session = getCurrentSession();
        if (!session) { navigate("/login"); return; }
        if (!session.roles?.includes("organizer")) { navigate("/dashboard"); return; }
        
        setIsLoading(true);
        getMyProjects()
            .then(async (projects) => {
                const activeProjects = projects.filter(
                    (p) => p.status === "Active" || p.status === "active"
                );

                const statsData = await Promise.all(
                    activeProjects.map(async (project) => {
                        try {
                            const result = await getProjectVolunteers(project.id, {
                                pageIndex: 0,
                                pageSize: 50,
                            });
                            console.log(`Volunteers for ${project.title}:`, result);
                            const volunteers = result.volunteers ?? [];
                            const confirmed = volunteers.filter((v) => v.enrollment_status === "Confirmed");
                            const cancelled = volunteers.filter((v) => v.enrollment_status === "Cancelled");
                            const occupancyPct = Math.round(
                                (confirmed.length / Math.max(project.volunteersMax, 1)) * 100
                            );
                            return {
                                project,
                                volunteers,
                                cancelledCount: cancelled.length,
                                occupancyPct,
                            };
                        } catch {
                            return {
                                project,
                                volunteers: [],
                                cancelledCount: 0,
                                occupancyPct: 0,
                            };
                        }
                    })
                );
                setStats(statsData);
            })
            .catch(() => setError("No fue posible cargar las estadísticas."))
            .finally(() => setIsLoading(false));
    }, [navigate]);

    const totalActive = stats.length;
    const totalVolunteers = stats.reduce(
        (sum, s) => sum + s.volunteers.filter((v) => v.enrollment_status === "Confirmed").length,
        0
    );
    const totalCapacity = stats.reduce((sum, s) => sum + s.project.volunteersMax, 0);
    const globalOccupancy = totalCapacity > 0
        ? Math.round((totalVolunteers / totalCapacity) * 100)
        : 0;

    // Actividad reciente — últimas inscripciones y cancelaciones ordenadas por fecha
    const recentActivity = stats
        .flatMap((s) =>
            s.volunteers.map((v) => ({
                volunteerName: v.full_name || v.email,
                projectTitle: s.project.title,
                projectId: s.project.id,
                status: v.enrollment_status,
                date: v.enrolled_at,
            }))
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

    if (isLoading) {
        return (
            <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
                <Header />
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#6b7280" }}>
                    Cargando estadísticas...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
                <Header />
                <div style={{ maxWidth: "900px", margin: "32px auto", padding: "0 24px" }}>
                    <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", color: "#dc2626" }}>
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Header />

            <div style={{ maxWidth: "1000px", margin: "32px auto", padding: "0 24px" }}>
                <h2 style={{ fontSize: "26px", fontWeight: "bold", marginBottom: "24px" }}>
                    Estadísticas de Proyectos
                </h2>

                {/* Métricas globales */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "28px" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "28px 20px", textAlign: "center" }}>
                        <p style={{ fontSize: "42px", fontWeight: "bold", color: "#111827", marginBottom: "8px" }}>{totalActive}</p>
                        <p style={{ fontSize: "14px", color: "#6b7280" }}>Proyectos activos</p>
                    </div>
                    <div style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "28px 20px", textAlign: "center" }}>
                        <p style={{ fontSize: "42px", fontWeight: "bold", color: "#111827", marginBottom: "8px" }}>{totalVolunteers}</p>
                        <p style={{ fontSize: "14px", color: "#6b7280" }}>Voluntarios inscritos</p>
                    </div>
                    <div style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "28px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ position: "relative", width: "100px", height: "100px", marginBottom: "12px" }}>
                            <svg width="100" height="100" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                                <circle
                                    cx="50" cy="50" r="40"
                                    fill="none"
                                    stroke={globalOccupancy >= 90 ? "#ef4444" : "#16a34a"}
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - globalOccupancy / 100)}`}
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: "20px", fontWeight: "bold", color: "#111827" }}>{globalOccupancy}%</span>
                            </div>
                        </div>
                        <p style={{ fontSize: "14px", color: "#6b7280" }}>Tasa de ocupación</p>
                    </div>
                </div>

                {/* Resumen por proyecto */}
                <div style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "24px", marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Resumen por proyecto</h3>

                    {stats.length === 0 ? (
                        <p style={{ color: "#6b7280", fontSize: "14px" }}>No tienes proyectos activos actualmente.</p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                                    {["Proyecto", "Estado", "Inscritos", "Cupo Máx.", "% Ocupación", "Cancelaciones"].map((h) => (
                                        <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#374151" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {stats.map(({ project, volunteers, cancelledCount, occupancyPct }) => {
                                    const confirmed = volunteers.filter((v) => v.enrollment_status === "Confirmed").length;
                                    const isFull = confirmed >= project.volunteersMax;
                                    return (
                                        <tr key={project.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: "12px", fontSize: "14px" }}>
                                                <button
                                                    onClick={() => navigate(`/mis-proyectos`)}
                                                    style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "600", color: "#16a34a", fontSize: "14px", padding: 0, textAlign: "left" }}
                                                >
                                                    {project.title}
                                                </button>
                                            </td>
                                            <td style={{ padding: "12px", fontSize: "13px" }}>
                                                <span style={{ padding: "2px 8px", borderRadius: "9999px", backgroundColor: isFull ? "#fef9c3" : "#dcfce7", color: isFull ? "#854d0e" : "#15803d", fontWeight: "500" }}>
                                                    {isFull ? "Lleno" : "Activo"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px", fontSize: "14px", textAlign: "center" }}>{confirmed}</td>
                                            <td style={{ padding: "12px", fontSize: "14px", textAlign: "center" }}>{project.volunteersMax}</td>
                                            <td style={{ padding: "12px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <div style={{ flex: 1, height: "8px", backgroundColor: "#e5e7eb", borderRadius: "9999px", overflow: "hidden", minWidth: "80px" }}>
                                                        <div style={{ height: "100%", width: `${occupancyPct}%`, backgroundColor: occupancyPct >= 90 ? "#ef4444" : "#16a34a", borderRadius: "9999px" }} />
                                                    </div>
                                                    <span style={{ fontSize: "13px", color: "#374151", whiteSpace: "nowrap" }}>{occupancyPct}%</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: "12px", fontSize: "14px", textAlign: "center" }}>{cancelledCount}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Actividad reciente */}
                <div style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "24px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Actividad reciente</h3>

                    {recentActivity.length === 0 ? (
                        <p style={{ color: "#6b7280", fontSize: "14px" }}>No hay actividad reciente.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {recentActivity.map((activity, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#374151" }}>
                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: activity.status === "Confirmed" ? "#16a34a" : "#dc2626", flexShrink: 0 }} />
                                    <span>
                                        <strong>{activity.volunteerName}</strong>{" "}
                                        {activity.status === "Confirmed" ? "se inscribió a" : "canceló inscripción a"}{" "}
                                        <button
                                            onClick={() => navigate(`/mis-proyectos`)}
                                            style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a", fontWeight: "600", fontSize: "14px", padding: 0 }}
                                        >
                                            {activity.projectTitle}
                                        </button>
                                    </span>
                                    <span style={{ marginLeft: "auto", fontSize: "12px", color: "#9ca3af", whiteSpace: "nowrap" }}>
                                        {formatRelativeTime(activity.date)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
