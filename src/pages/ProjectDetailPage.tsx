import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProjectById, enrollInProject, cancelEnrollment, getMyEnrollments } from "../services/projects";
import { type Project } from "../types/project";
import { BackButton } from "../components/BackButton";
import { assets } from "../assets/assets";
import { getCurrentSession } from "../services/auth";

type EnrollmentStatus = "none" | "confirmed" | "cancelled";

export function ProjectDetailPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const session = getCurrentSession();

    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>("none");
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    useEffect(() => {
        if (!projectId) return;
        setIsLoading(true);
        setError(null);

        Promise.all([
            getProjectById(projectId),
            session ? getMyEnrollments() : Promise.resolve([]),
        ])
            .then(([proj, enrollments]) => {
                setProject(proj);
                const match = enrollments.find((e) => e.project_id === projectId);
                if (match) {
                    setEnrollmentStatus(match.enrollment_status === "Confirmed" ? "confirmed" : "cancelled");
                }
            })
            .catch(() => setError("No fue posible cargar el proyecto."))
            .finally(() => setIsLoading(false));
    }, [projectId]);

    const occupancyPct = project
        ? Math.round((project.volunteersEnrolled / Math.max(project.volunteersMax, 1)) * 100)
        : 0;

    const isFull = project ? project.volunteersEnrolled >= project.volunteersMax : false;

    const handleEnroll = async () => {
        if (!session) { navigate("/login"); return; }
        setIsActionLoading(true);
        setActionMessage(null);
        try {
            await enrollInProject(projectId!);
            setEnrollmentStatus("confirmed");
            setProject((prev) => prev ? { ...prev, volunteersEnrolled: prev.volunteersEnrolled + 1 } : prev);
            setActionMessage("¡Te has inscrito exitosamente al proyecto!");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Ocurrió un error al procesar tu inscripción.";
            setActionMessage(msg);
        } finally {
            setIsActionLoading(false);
            setShowConfirmDialog(false);
        }
    };

    const handleCancelEnrollment = async () => {
        setIsActionLoading(true);
        setActionMessage(null);
        try {
            await cancelEnrollment(projectId!);
            setEnrollmentStatus("cancelled");
            setProject((prev) => prev ? { ...prev, volunteersEnrolled: Math.max(0, prev.volunteersEnrolled - 1) } : prev);
            setActionMessage("Tu inscripción ha sido cancelada correctamente.");
        } catch {
            setActionMessage("No fue posible cancelar tu inscripción. Por favor intenta más tarde.");
        } finally {
            setIsActionLoading(false);
            setShowCancelDialog(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
                <p style={{ color: "#6b7280" }}>Cargando proyecto...</p>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#f5f5f5", gap: "16px" }}>
                <p style={{ color: "#dc2626" }}>{error ?? "Proyecto no encontrado."}</p>
                <button onClick={() => navigate("/proyectos")} style={{ padding: "10px 20px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: "pointer" }}>
                    Volver a proyectos
                </button>
            </div>
        );
    }

    const statusColor: Record<string, string> = {
        Active: "#dcfce7",
        active: "#dcfce7",
        Draft: "#f3f4f6",
        Cancelled: "#fee2e2",
        Completed: "#dbeafe",
    };
    const statusLabel: Record<string, string> = {
        Active: "Activo",
        active: "Activo",
        Draft: "Borrador",
        Cancelled: "Cancelado",
        Completed: "Concluido",
    };

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            {/* Navbar */}
            <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", backgroundColor: "white", borderBottom: "1px solid #e5e7eb", gap: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <BackButton fallbackPath="/proyectos" />
                    <img src={assets.gazella} alt="Gazella" style={{ width: "70px", objectFit: "contain" }} />
                    <h1 style={{ fontSize: "22px", fontWeight: "bold", lineHeight: "1.2" }}>
                        Conservación de<br />la biodiversidad
                    </h1>
                </div>
                {session && (
                    <button onClick={() => navigate("/dashboard")} style={{ padding: "8px 16px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>
                        Mi panel
                    </button>
                )}
            </nav>

            <div style={{ maxWidth: "1000px", margin: "32px auto", padding: "0 24px", display: "flex", gap: "28px" }}>
                {/* Main content */}
                <div style={{ flex: 1 }}>
                    <div style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                        {/* Cover image */}
                        <div style={{ width: "100%", height: "280px", backgroundColor: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                            {project.coverUri ? (
                                <img src={project.coverUri} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <span style={{ fontSize: "64px" }}>🌿</span>
                            )}
                        </div>

                        <div style={{ padding: "24px 28px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                                <span style={{ padding: "4px 10px", borderRadius: "9999px", backgroundColor: statusColor[project.status] ?? "#f3f4f6", fontSize: "12px", fontWeight: "600" }}>
                                    {statusLabel[project.status] ?? project.status}
                                </span>
                                {project.category && (
                                    <span style={{ padding: "4px 10px", borderRadius: "9999px", backgroundColor: "#dbeafe", fontSize: "12px", fontWeight: "500", color: "#1d4ed8" }}>
                                        {project.category}
                                    </span>
                                )}
                            </div>

                            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>{project.title}</h1>

                            <p style={{ fontSize: "15px", color: "#374151", lineHeight: "1.7", marginBottom: "24px" }}>{project.description}</p>

                            {/* Meta grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                                {[
                                    { icon: "📍", label: "Lugar", value: project.location },
                                    { icon: "📅", label: "Fecha de inicio", value: project.date },
                                    { icon: "🏁", label: "Fecha de fin", value: project.endDate ? new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(new Date(project.endDate + "T00:00:00")) : "Por confirmar" },
                                    { icon: "👥", label: "Voluntarios", value: `${project.volunteersEnrolled} / ${project.volunteersMax}` },
                                ].map(({ icon, label, value }) => (
                                    <div key={label} style={{ padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                                        <span style={{ fontSize: "12px", color: "#6b7280" }}>{icon} {label}</span>
                                        <p style={{ fontWeight: "600", fontSize: "14px", marginTop: "4px" }}>{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Progress bar */}
                            <div style={{ marginBottom: "8px" }}>
                                <div style={{ height: "8px", backgroundColor: "#e5e7eb", borderRadius: "9999px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${occupancyPct}%`, backgroundColor: occupancyPct >= 90 ? "#ef4444" : "#16a34a", borderRadius: "9999px", transition: "width 0.3s" }} />
                                </div>
                                <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{occupancyPct}% del cupo ocupado</p>
                            </div>

                            {actionMessage && (
                                <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: actionMessage.startsWith("¡") || actionMessage.includes("correctamente") ? "#dcfce7" : "#fef2f2", border: `1px solid ${actionMessage.startsWith("¡") || actionMessage.includes("correctamente") ? "#bbf7d0" : "#fecaca"}`, color: actionMessage.startsWith("¡") || actionMessage.includes("correctamente") ? "#15803d" : "#dc2626", fontSize: "14px", marginTop: "16px" }}>
                                    {actionMessage}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ width: "260px", flexShrink: 0 }}>
                    {/* Enroll card */}
                    <div style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "20px", marginBottom: "16px" }}>
                        {enrollmentStatus === "confirmed" ? (
                            <>
                                <div style={{ backgroundColor: "#dcfce7", padding: "10px", borderRadius: "8px", textAlign: "center", fontSize: "14px", color: "#15803d", fontWeight: "600", marginBottom: "12px" }}>
                                    ✓ Inscrito
                                </div>
                                <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px", textAlign: "center" }}>
                                    Recibirás una notificación por correo con los detalles.
                                </p>
                                <button
                                    onClick={() => setShowCancelDialog(true)}
                                    disabled={isActionLoading}
                                    style={{ width: "100%", padding: "10px", border: "1px solid #fecaca", borderRadius: "6px", backgroundColor: "white", color: "#dc2626", cursor: "pointer", fontSize: "14px" }}
                                >
                                    Cancelar inscripción
                                </button>
                            </>
                        ) : isFull ? (
                            <div style={{ textAlign: "center", padding: "12px", backgroundColor: "#fef2f2", borderRadius: "8px", fontSize: "14px", color: "#dc2626" }}>
                                Este proyecto ya no tiene lugares disponibles.
                            </div>
                        ) : project.status !== "Active" && project.status !== "active" ? (
                            <div style={{ textAlign: "center", padding: "12px", backgroundColor: "#f3f4f6", borderRadius: "8px", fontSize: "14px", color: "#6b7280" }}>
                                Este proyecto no está disponible para inscripciones.
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => session ? setShowConfirmDialog(true) : navigate("/login")}
                                    style={{ width: "100%", padding: "12px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "15px", fontWeight: "600", marginBottom: "10px" }}
                                >
                                    Inscribirme
                                </button>
                                {!session && (
                                    <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "center" }}>
                                        Necesitas iniciar sesión para inscribirte.
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Info card */}
                    <div style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "20px" }}>
                        <h3 style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "12px" }}>Voluntarios inscritos</h3>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {Array.from({ length: Math.min(project.volunteersEnrolled, 8) }).map((_, i) => (
                                <div key={i} style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                                    👤
                                </div>
                            ))}
                            {project.volunteersEnrolled > 8 && (
                                <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#6b7280" }}>
                                    +{project.volunteersEnrolled - 8}
                                </div>
                            )}
                        </div>
                        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "10px" }}>
                            {project.volunteersEnrolled} persona{project.volunteersEnrolled !== 1 ? "s" : ""} inscrita{project.volunteersEnrolled !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* Confirm enroll dialog */}
            {showConfirmDialog && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "28px", width: "380px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Confirmar inscripción</h2>
                        <p style={{ fontSize: "14px", color: "#374151", marginBottom: "12px" }}>¿Deseas inscribirte en el proyecto <strong>{project.title}</strong>?</p>
                        <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>📅 {project.date}</div>
                        <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>📍 {project.location}</div>
                        <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>👥 Cupo disponible: {project.volunteersMax - project.volunteersEnrolled} lugares</div>
                        <div style={{ padding: "10px", backgroundColor: "#fefce8", borderRadius: "6px", fontSize: "13px", color: "#854d0e", marginBottom: "20px" }}>
                            Nota: Recibirás una notificación por correo con los detalles.
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => setShowConfirmDialog(false)} style={{ flex: 1, padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "14px" }}>
                                Cancelar
                            </button>
                            <button onClick={handleEnroll} disabled={isActionLoading} style={{ flex: 1, padding: "10px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                                {isActionLoading ? "Procesando..." : "Confirmar inscripción"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel enrollment dialog */}
            {showCancelDialog && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "28px", width: "380px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px" }}>⚠ Cancelar inscripción...</h2>
                        <p style={{ fontSize: "14px", color: "#374151", marginBottom: "16px" }}>
                            ¿Estás seguro de que deseas cancelar tu inscripción en <strong>{project.title}</strong>?
                        </p>
                        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
                            Esta acción liberará tu lugar y no podrá deshacerse si el cupo se llena.
                        </p>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => setShowCancelDialog(false)} style={{ flex: 1, padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "14px" }}>
                                No, conservar inscripción
                            </button>
                            <button onClick={handleCancelEnrollment} disabled={isActionLoading} style={{ flex: 1, padding: "10px", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                                {isActionLoading ? "Procesando..." : "Sí, cancelar inscripción"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}