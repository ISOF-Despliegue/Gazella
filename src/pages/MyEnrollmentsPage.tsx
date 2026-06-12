import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyEnrollments, cancelEnrollment } from "../services/projects";
import { type EnrollmentApiEntry } from "../types/project";
import { BackButton } from "../components/BackButton";
import { assets } from "../assets/assets";
import { getCurrentSession } from "../services/auth";

type TabFilter = "activos" | "concluidos" | "cancelados";

function formatDate(value?: string): string {
    if (!value) return "—";
    // enrolled_at comes as ISO datetime; start_date as yyyy-MM-dd
    const d = value.includes("T") ? new Date(value) : new Date(value + "T00:00:00");
    if (isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export function MyEnrollmentsPage() {
    const navigate = useNavigate();
    const session = getCurrentSession();

    const [enrollments, setEnrollments] = useState<EnrollmentApiEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabFilter>("activos");
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [confirmCancel, setConfirmCancel] = useState<EnrollmentApiEntry | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!session) { navigate("/login"); return; }
        setIsLoading(true);
        getMyEnrollments()
            .then(setEnrollments)
            .catch(() => setError("No fue posible cargar tus proyectos. Por favor intenta más tarde."))
            .finally(() => setIsLoading(false));
    }, [navigate]);

    // Categorize using enrollment_status + project_status to determine "concluido"
    const categorized = {
        activos: enrollments.filter((e) => {
            if (e.enrollment_status !== "Confirmed") return false;
            return e.project_status === "Active" || e.project_status === "active";
        }),
        concluidos: enrollments.filter((e) => {
            if (e.enrollment_status !== "Confirmed") return false;
            return e.project_status === "Completed" || e.project_status === "Cancelled";
        }),
        cancelados: enrollments.filter((e) => e.enrollment_status === "Cancelled"),
    };

    const displayed = categorized[activeTab];

    const handleCancelEnrollment = async (enrollment: EnrollmentApiEntry) => {
        setCancellingId(enrollment.project_id);
        setActionMessage(null);
        try {
            await cancelEnrollment(enrollment.project_id);
            setEnrollments((prev) =>
                prev.map((e) =>
                    e.project_id === enrollment.project_id
                        ? { ...e, enrollment_status: "Cancelled" }
                        : e
                )
            );
            setActionMessage("Tu inscripción ha sido cancelada correctamente.");
            setActiveTab("cancelados");
        } catch {
            setActionMessage("No fue posible cancelar tu inscripción. Por favor intenta más tarde.");
        } finally {
            setCancellingId(null);
            setConfirmCancel(null);
        }
    };

    const tabLabels: Record<TabFilter, string> = {
        activos: `Activos (${categorized.activos.length})`,
        concluidos: `Concluidos (${categorized.concluidos.length})`,
        cancelados: `Cancelados (${categorized.cancelados.length})`,
    };

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            {/* Navbar */}
            <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", backgroundColor: "white", borderBottom: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <BackButton fallbackPath="/dashboard" />
                    <img src={assets.gazella} alt="Gazella" style={{ width: "70px", objectFit: "contain" }} />
                    <h1 style={{ fontSize: "22px", fontWeight: "bold", lineHeight: "1.2" }}>
                        Conservación de<br />la biodiversidad
                    </h1>
                </div>
            </nav>

            <div style={{ maxWidth: "900px", margin: "32px auto", padding: "0 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Mis proyectos</h2>
                    <button
                        onClick={() => navigate("/proyectos")}
                        style={{ padding: "10px 18px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}
                    >
                        + Explorar proyectos
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "0", marginBottom: "24px", borderBottom: "1px solid #e5e7eb" }}>
                    {(["activos", "concluidos", "cancelados"] as TabFilter[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: "10px 20px",
                                border: "none",
                                borderBottom: activeTab === tab ? "2px solid #16a34a" : "2px solid transparent",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: activeTab === tab ? "600" : "400",
                                color: activeTab === tab ? "#16a34a" : "#6b7280",
                                borderRadius: 0,
                            }}
                        >
                            {tabLabels[tab]}
                        </button>
                    ))}
                </div>

                {actionMessage && (
                    <div style={{
                        padding: "12px 16px",
                        borderRadius: "8px",
                        backgroundColor: actionMessage.includes("correctamente") ? "#dcfce7" : "#fef2f2",
                        border: `1px solid ${actionMessage.includes("correctamente") ? "#bbf7d0" : "#fecaca"}`,
                        color: actionMessage.includes("correctamente") ? "#15803d" : "#dc2626",
                        fontSize: "14px",
                        marginBottom: "16px",
                    }}>
                        {actionMessage}
                    </div>
                )}

                {isLoading && (
                    <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>Cargando tus proyectos...</div>
                )}

                {error && (
                    <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", color: "#dc2626" }}>{error}</div>
                )}

                {!isLoading && !error && displayed.length === 0 && (
                    <div style={{ textAlign: "center", padding: "60px", color: "#6b7280", backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                        {activeTab === "activos"
                            ? "— Sin más proyectos activos —"
                            : activeTab === "concluidos"
                            ? "— Sin más proyectos concluidos —"
                            : "— Sin proyectos cancelados —"}
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {displayed.map((enrollment) => {
                        const isActive = activeTab === "activos";
                        const isConcluded = activeTab === "concluidos";
                        return (
                            <div
                                key={enrollment.project_id}
                                style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px" }}
                            >
                                {/* Cover placeholder — API doesn't return cover_uri in enrollments */}
                                <div style={{ width: "72px", height: "56px", borderRadius: "8px", backgroundColor: "#d1fae5", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ fontSize: "28px" }}>🌿</span>
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: "600", fontSize: "15px", marginBottom: "4px" }}>
                                        {enrollment.project_title ?? "Proyecto"}
                                    </p>
                                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                        {enrollment.location && (
                                            <span style={{ fontSize: "12px", color: "#6b7280" }}>📍 {enrollment.location}</span>
                                        )}
                                        {enrollment.start_date && (
                                            <span style={{ fontSize: "12px", color: "#6b7280" }}>📅 {formatDate(enrollment.start_date)}</span>
                                        )}
                                        <span style={{
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            padding: "2px 8px",
                                            borderRadius: "9999px",
                                            backgroundColor: isActive ? "#dcfce7" : isConcluded ? "#dbeafe" : "#fee2e2",
                                            color: isActive ? "#15803d" : isConcluded ? "#1d4ed8" : "#dc2626",
                                        }}>
                                            {isActive ? "Confirmado" : isConcluded ? "Concluido" : "Cancelado"}
                                        </span>
                                    </div>
                                    {enrollment.enrolled_at && (
                                        <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                                            Inscrito el {formatDate(enrollment.enrolled_at)}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                    <button
                                        onClick={() => navigate(`/proyectos/${enrollment.project_id}`)}
                                        style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "13px" }}
                                    >
                                        Ver proyecto
                                    </button>
                                    {isActive && (
                                        <button
                                            onClick={() => setConfirmCancel(enrollment)}
                                            style={{ padding: "8px 14px", border: "1px solid #fecaca", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "13px", color: "#dc2626" }}
                                        >
                                            Cancelar inscripción
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Confirm cancel dialog */}
            {confirmCancel && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "28px", width: "380px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>⚠ Cancelar inscripción...</h2>
                        <p style={{ fontSize: "14px", color: "#374151", marginBottom: "12px" }}>
                            ¿Estás seguro de que deseas cancelar tu inscripción en{" "}
                            <strong>{confirmCancel.project_title}</strong>?
                        </p>
                        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
                            Esta acción liberará tu lugar y no podrá deshacerse si el cupo se llena.
                        </p>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                onClick={() => setConfirmCancel(null)}
                                style={{ flex: 1, padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "14px" }}
                            >
                                No, conservar inscripción
                            </button>
                            <button
                                onClick={() => handleCancelEnrollment(confirmCancel)}
                                disabled={cancellingId === confirmCancel.project_id}
                                style={{ flex: 1, padding: "10px", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}
                            >
                                {cancellingId === confirmCancel.project_id ? "Cancelando..." : "Sí, cancelar inscripción"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
