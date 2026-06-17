import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProject, updateProject, getProjectById } from "../services/projects";
import { type CreateProjectInput } from "../types/project";
import { Header } from "../components/Header";
import { getCurrentSession, type AuthSession } from "../services/auth";

const CATEGORIES = [
    { label: "Medio Ambiente", value: "550e8400-e29b-41d4-a716-446655440000" },
    { label: "Biodiversidad", value: "550e8400-e29b-41d4-a716-446655440001" },
    { label: "Flora y Fauna", value: "550e8400-e29b-41d4-a716-446655440002" },
    { label: "Residuos", value: "550e8400-e29b-41d4-a716-446655440003" },
    { label: "Acción Climática", value: "550e8400-e29b-41d4-a716-446655440004" },
];

function resolveCategoryId(categoryNameOrId: string): string {
    if (!categoryNameOrId) return "";
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (isValidUuid.test(categoryNameOrId)) return categoryNameOrId;
    const match = CATEGORIES.find((c) => c.label.toLowerCase() === categoryNameOrId.toLowerCase());
    return match?.value ?? "";
}

const EMPTY_FORM: Omit<CreateProjectInput, "isDraft"> = {
    title: "", description: "", location: "", categoryId: "", coverUri: "", startDate: "", endDate: "", maxVolunteers: 20,
};

export function CreateProjectPage() {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId?: string }>();
    const isEditing = Boolean(projectId);

    const [form, setForm] = useState(EMPTY_FORM);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [session, setSession] = useState<AuthSession | null>(null);

    useEffect(() => {
        const session = getCurrentSession();
        if (!session) { navigate("/login"); return; }
        setSession(session);
        const isOrganizer = session.roles?.includes("organizer");
        if (!isOrganizer) { navigate("/dashboard"); return; }

        if (isEditing && projectId) {
            setIsLoading(true);
            getProjectById(projectId)
                .then((project) => {
                    setForm({
                        title: project.title,
                        description: project.description,
                        location: project.location,
                        categoryId: resolveCategoryId(project.category ?? ""),
                        coverUri: project.coverUri ?? "",
                        startDate: project.startDate ?? "",
                        endDate: project.endDate ?? "",
                        maxVolunteers: project.volunteersMax ?? 20,
                    });
                })
                .catch(() => setErrorMessage("No fue posible cargar el proyecto para editar."))
                .finally(() => setIsLoading(false));
        }
    }, [navigate, isEditing, projectId]);

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!form.title.trim()) errs.title = "El título es obligatorio.";
        if (!form.description.trim()) errs.description = "La descripción es obligatoria.";
        if (!form.location.trim()) errs.location = "El lugar es obligatorio.";
        if (!form.startDate) errs.startDate = "La fecha de inicio es obligatoria.";
        if (!form.endDate) errs.endDate = "La fecha de fin es obligatoria.";
        if (form.startDate && form.endDate && form.endDate < form.startDate) errs.endDate = "La fecha de fin debe ser posterior a la fecha de inicio.";
        if (!form.maxVolunteers || form.maxVolunteers < 1) errs.maxVolunteers = "Debe ser un número positivo.";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingImage(true);
        setUploadError(null);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const token = localStorage.getItem("gazella_access_token");
            const response = await fetch("/media", {
                method: "POST",
                headers: { Authorization: `Bearer ${token ?? ""}` },
                body: formData,
            });
            if (!response.ok) throw new Error("Error al subir la imagen");
            const data = await response.json() as { url: string };
            field("coverUri", data.url);
        } catch {
            setUploadError("No fue posible subir la imagen. Intenta de nuevo.");
        } finally {
            setIsUploadingImage(false);
            e.target.value = "";
        }
    };

    const handleSave = async (isDraft: boolean) => {
        if (!isDraft && !validate()) return;
        setIsSaving(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const { categoryId, ...restForm } = form;

        const input: Partial<CreateProjectInput> = {
            ...restForm,
            coverUri: form.coverUri?.trim() || undefined,
            organizerId: session?.sub,
            organizerName: session?.email?.split("@")[0] ?? "Organizador",
            isDraft,
            ...(categoryId && isValidUuid.test(categoryId) ? { categoryId } : {}),
        };

        try {
            if (isEditing && projectId) {
                await updateProject(projectId, input);
                setSuccessMessage(isDraft ? "Borrador guardado correctamente." : "Proyecto actualizado correctamente.");
            } else {
                await createProject(input as CreateProjectInput);
                setSuccessMessage(isDraft ? "Borrador guardado correctamente." : "Proyecto publicado exitosamente.");
                if (!isDraft) setTimeout(() => navigate("/mis-proyectos"), 1500);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Ocurrió un error al guardar el proyecto.";
            setErrorMessage(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const field = (key: keyof typeof form, value: string | number) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
    };

    const inputStyle = (hasError?: boolean): React.CSSProperties => ({
        width: "100%", padding: "10px 12px",
        border: `1px solid ${hasError ? "#fca5a5" : "#d1d5db"}`,
        borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box",
        backgroundColor: hasError ? "#fff5f5" : "white",
    });

    if (isLoading) {
        return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f5f5f5", color: "#6b7280" }}>Cargando proyecto...</div>;
    }

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Header />

            <div style={{ maxWidth: "900px", margin: "32px auto", padding: "0 24px", display: "flex", gap: "28px", alignItems: "flex-start" }}>
                <div style={{ flex: 1, backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "28px" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "24px" }}>
                        {isEditing ? "Editar proyecto de voluntariado" : "Crear proyecto de voluntariado"}
                    </h2>

                    {errorMessage && (
                        <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "14px", marginBottom: "16px" }}>
                            {errorMessage}
                        </div>
                    )}
                    {successMessage && (
                        <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", color: "#15803d", fontSize: "14px", marginBottom: "16px" }}>
                            {successMessage}
                        </div>
                    )}

                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>Título del proyecto *</label>
                        <input type="text" value={form.title} onChange={(e) => field("title", e.target.value)} placeholder="Escribe un título llamativo..." style={inputStyle(!!errors.title)} />
                        {errors.title && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.title}</p>}
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>Descripción *</label>
                        <textarea value={form.description} onChange={(e) => field("description", e.target.value)} placeholder="Describe el objetivo, actividades y lo que necesitan saber los voluntarios..." rows={4} style={{ ...inputStyle(!!errors.description), resize: "vertical", fontFamily: "inherit" }} />
                        {errors.description && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.description}</p>}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>Fecha de inicio *</label>
                            <input type="date" value={form.startDate} onChange={(e) => field("startDate", e.target.value)} style={inputStyle(!!errors.startDate)} />
                            {errors.startDate && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.startDate}</p>}
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>Fecha de fin *</label>
                            <input type="date" value={form.endDate} onChange={(e) => field("endDate", e.target.value)} style={inputStyle(!!errors.endDate)} />
                            {errors.endDate && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.endDate}</p>}
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>Lugar *</label>
                            <input type="text" value={form.location} onChange={(e) => field("location", e.target.value)} placeholder="Dirección o punto de reunión" style={inputStyle(!!errors.location)} />
                            {errors.location && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.location}</p>}
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>Máximo de voluntarios *</label>
                            <input type="number" value={form.maxVolunteers} onChange={(e) => field("maxVolunteers", parseInt(e.target.value, 10) || 0)} min={1} style={inputStyle(!!errors.maxVolunteers)} />
                            {errors.maxVolunteers && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{errors.maxVolunteers}</p>}
                        </div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>Categoría</label>
                        <select value={form.categoryId} onChange={(e) => field("categoryId", e.target.value)} style={{ ...inputStyle(), cursor: "pointer" }}>
                            <option value="">Seleccionar categoría</option>
                            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: "8px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>Imagen de portada</label>
                        <input type="file" accept="image/*" id="cover-upload" style={{ display: "none" }} onChange={handleImageUpload} />

                        {form.coverUri ? (
                            <div>
                                <div style={{ width: "100%", height: "160px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
                                    <img src={form.coverUri} alt="Portada" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => (e.currentTarget.style.display = "none")} />
                                </div>
                                <button onClick={() => document.getElementById("cover-upload")?.click()} disabled={isUploadingImage} style={{ marginTop: "8px", width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: isUploadingImage ? "wait" : "pointer", fontSize: "13px", color: "#374151" }}>
                                    {isUploadingImage ? "Subiendo..." : "Cambiar imagen"}
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => !isUploadingImage && document.getElementById("cover-upload")?.click()}
                                style={{ width: "100%", height: "160px", borderRadius: "8px", border: "2px dashed #d1d5db", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "14px", cursor: isUploadingImage ? "wait" : "pointer", gap: "8px" }}
                                onMouseEnter={(e) => { if (!isUploadingImage) e.currentTarget.style.borderColor = "#16a34a"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; }}
                            >
                                {isUploadingImage ? (
                                    <><span style={{ fontSize: "28px" }}>⏳</span><span>Subiendo imagen...</span></>
                                ) : (
                                    <><span style={{ fontSize: "28px" }}>🖼</span><span>Haz clic para seleccionar una imagen</span><span style={{ fontSize: "12px" }}>PNG, JPG, WEBP</span></>
                                )}
                            </div>
                        )}
                        {uploadError && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>{uploadError}</p>}
                    </div>
                </div>

                <div style={{ width: "220px", flexShrink: 0 }}>
                    <div style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "20px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>Publicación</h3>
                        <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>Estado: {isEditing ? "Editando" : "Borrador"}</p>
                        <button onClick={() => handleSave(true)} disabled={isSaving || isUploadingImage} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "14px", marginBottom: "8px" }}>
                            Guardar borrador
                        </button>
                        <button onClick={() => handleSave(false)} disabled={isSaving || isUploadingImage} style={{ width: "100%", padding: "10px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                            {isSaving ? "Guardando..." : "Publicar proyecto"}
                        </button>
                        {isEditing && (
                            <button onClick={() => navigate("/mis-proyectos")} style={{ width: "100%", padding: "10px", border: "1px solid #fecaca", borderRadius: "6px", backgroundColor: "white", color: "#dc2626", cursor: "pointer", fontSize: "14px" }}>
                                Volver sin guardar
                            </button>
                        )}
                        <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f0fdf4", borderRadius: "8px", fontSize: "12px", color: "#15803d" }}>
                            <p style={{ fontWeight: "600", marginBottom: "4px" }}>Notificaciones automáticas:</p>
                            <p>✓ Correo de confirmación a inscritos</p>
                            <p>✓ Recordatorio 24h antes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}