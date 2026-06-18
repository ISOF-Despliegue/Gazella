import { useState, useEffect, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { OutputData } from '@editorjs/editorjs';
import { Editor } from '../components/Editor';
import { Header } from '../components/Header';
import { SafeImage } from '../components/SafeImage';
import { getLocalProfile } from '../services/accounts';
import { uploadMedia } from '../services/media';
import { getCategories } from '../services/articles/articles';
import { getArticleAsDraft, updateDraft, publishDraft } from '../services/articles/drafts';
import type { Category } from '../types/article';
import { getCurrentSession } from '../services/auth';

export const EditArticlePage = () => {
    const navigate = useNavigate();

    const { articleId } = useParams<{ articleId: string }>();

    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [coverUri, setCoverUri] = useState('');
    const [content, setContent] = useState<OutputData | null>(null);

    const [status, setStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formErrors, setFormErrors] = useState({ title: false, categoryId: false, content: false });
    const [popupMessage, setPopupMessage] = useState<{ title: string; text: string; type: "success" | "error" | "info"; onClose?: () => void } | null>(null);

    useEffect(() => {
        if (!articleId) {
            return;
        }

        const loadData = async () => {
            setIsLoading(true);
            try {
                const [draftData, categoriesData] = await Promise.all([
                    getArticleAsDraft(articleId),
                    getCategories()
                ]);

                setCategories(categoriesData || []);
                setTitle(draftData.title || '');
                setSummary(draftData.summary || '');
                setCategoryId(draftData.categoryId || '');
                setCoverUri(draftData.coverUri || '');
                setStatus(draftData.status || '');
                setRejectionReason(draftData.rejectionReason || '');

                if (draftData.content) {
                    try {
                        setContent(JSON.parse(draftData.content));
                    } catch (e) {
                        console.error("Error al parsear el contenido JSON:", e);
                    }
                }
            } catch (error) {
                console.error("Error al cargar el artículo:", error);
                setPopupMessage({ title: "Error", text: "No se pudo cargar el artículo para editar.", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [articleId]);

    const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const response = await uploadMedia(file);
            if (response?.url) {
                setCoverUri(response.url);
            }
        } catch (error) {
            console.error('Error al subir la portada:', error);
            setPopupMessage({ title: "Error", text: "No se pudo subir la imagen de portada.", type: "error" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (isPublishing: boolean) => {
        const session = getCurrentSession();
        const currentAuthorId = session?.sub;

        if (!currentAuthorId) {
            setPopupMessage({ title: "Sesión expirada", text: "Por favor inicia sesión nuevamente para continuar.", type: "error" });
            return;
        }
        
        const isTitleValid = !!title.trim();
        const isCategoryValid = !!categoryId;
        const isContentValid = !!content && !!content.blocks && content.blocks.length > 0;

        if (!isTitleValid || !isCategoryValid || !isContentValid) {
            setFormErrors({ title: !isTitleValid, categoryId: !isCategoryValid, content: !isContentValid });
            setPopupMessage({ title: "Faltan datos", text: "El título, la categoría y el contenido son obligatorios.", type: "error" });
            return;
        }

        setIsSaving(true);
        try {
            const profile = getLocalProfile();
            const currentAuthorName = profile 
                ? `${profile.name || ''} ${profile.parentalSurname || ''} ${profile.maternalSurname || ''}`.trim() 
                : "Autor desconocido";
            const currentAuthorPfpUri = profile?.pfpUri || "";

            const payload = {
                id: articleId,
                title, summary, 
                categoryId,
                coverUri,
                authorId: currentAuthorId,
                authorName: currentAuthorName,
                authorPfpUri: currentAuthorPfpUri,
                content: JSON.stringify(content)
            };

            if (isPublishing) {
                await publishDraft(payload);
                setPopupMessage({ 
                    title: "Éxito", 
                    text: "¡Artículo enviado para publicación!", 
                    type: "success",
                    onClose: () => navigate("/mis-articulos")
                });
            } else {
                await updateDraft(payload);
                setPopupMessage({ title: "Éxito", text: "Borrador guardado exitosamente.", type: "success" });
                if (status === "Published") {
                    setStatus("Draft");
                }
            }
            setFormErrors({ title: false, categoryId: false, content: false });
        } catch (error) {
            console.error('Error al guardar el artículo:', error);
            setPopupMessage({ title: "Error", text: "Ocurrió un error al procesar la solicitud.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", flexDirection: "column" }}>
                <Header />
                <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <p style={{ color: "#6b7280", fontWeight: "500", fontSize: "1rem" }}>Cargando editor...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", flexDirection: "column" }}>
            <Header />

            <main style={{ flex: 1, maxWidth: "87.5rem", width: "100%", margin: "0 auto", padding: "2rem 1.5rem", display: "flex", gap: "1.75rem", alignItems: "flex-start", boxSizing: "border-box" }}>
                <section style={{ flex: "3", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    
                    {status === "Published" && (
                        <div style={{ backgroundColor: "#fef3c7", borderLeft: "0.25rem solid #f59e0b", padding: "1rem 1.25rem", borderRadius: "0.5rem", boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,0.05)" }}>
                            <p style={{ margin: 0, color: "#92400e", fontSize: "0.875rem", fontWeight: "600", lineHeight: "1.5" }}>
                                Este articulo ya fue publicado. Si lo guardas como borrador volverá al estado Borrador, si lo vuelves a publicar volverá al estado En Revision hasta que un editor lo apruebe.
                            </p>
                        </div>
                    )}

                    {status === "Rejected" && (
                        <div style={{ backgroundColor: "#fee2e2", borderLeft: "0.25rem solid #ef4444", padding: "1rem 1.25rem", borderRadius: "0.5rem", boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,0.05)" }}>
                            <p style={{ margin: 0, color: "#b91c1c", fontSize: "0.875rem", fontWeight: "600", lineHeight: "1.5" }}>
                                Tu articulo fue rechazado para publicación. Por favor revisa y atiende las correcciones pertinentes.
                            </p>
                        </div>
                    )}

                    <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.75rem", boxShadow: "0 0.25rem 0.75rem rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "bold", color: formErrors.title ? "#dc2626" : "#374151", transition: "color 0.2s" }}>Título del artículo</label>
                                <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontFamily: "monospace" }}>{title.length}/128</span>
                            </div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (formErrors.title && e.target.value.trim().length > 0) setFormErrors(prev => ({ ...prev, title: false }));
                                }}
                                maxLength={128}
                                placeholder="Ingresa el título aquí..."
                                style={{ 
                                    width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", fontSize: "0.9375rem", outline: "none", boxSizing: "border-box", transition: "all 0.2s",
                                    border: formErrors.title ? "0.0625rem solid #dc2626" : "0.0625rem solid #d1d5db",
                                    boxShadow: formErrors.title ? "0 0 0 0.125rem rgba(220, 38, 38, 0.15)" : "none"
                                }}
                            />
                        </div>

                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "bold", color: "#374151" }}>Descripción breve</label>
                                <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontFamily: "monospace" }}>{summary.length}/500</span>
                            </div>
                            <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                maxLength={500}
                                placeholder="Resumen del artículo (máximo 500 caracteres)..."
                                style={{ width: "100%", minHeight: "5rem", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "0.0625rem solid #d1d5db", fontSize: "0.875rem", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "bold", color: formErrors.categoryId ? "#dc2626" : "#374151", marginBottom: "0.5rem", transition: "color 0.2s" }}>Categoría</label>
                            <select
                                value={categoryId}
                                onChange={(e) => {
                                    setCategoryId(e.target.value);
                                    if (formErrors.categoryId && e.target.value !== "") setFormErrors(prev => ({ ...prev, categoryId: false }));
                                }}
                                style={{ 
                                    width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", fontSize: "0.875rem", outline: "none", backgroundColor: "white", boxSizing: "border-box", transition: "all 0.2s",
                                    border: formErrors.categoryId ? "0.0625rem solid #dc2626" : "0.0625rem solid #d1d5db",
                                    boxShadow: formErrors.categoryId ? "0 0 0 0.125rem rgba(220, 38, 38, 0.15)" : "none"
                                }}
                            >
                                <option value="">Selecciona una categoría...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* EditorJS */}
                    <div style={{ 
                        backgroundColor: "white", borderRadius: "0.75rem", padding: "1.75rem", minHeight: "31.25rem", transition: "all 0.2s", boxSizing: "border-box",
                        boxShadow: formErrors.content ? "0 0 0 0.125rem rgba(220, 38, 38, 0.15), 0 0.25rem 0.75rem rgba(0,0,0,0.05)" : "0 0.25rem 0.75rem rgba(0,0,0,0.05)",
                        border: formErrors.content ? "0.0625rem solid #dc2626" : "0.0625rem solid transparent"
                    }}>
                        <Editor 
                            initialData={content || undefined} 
                            onChange={(data) => {
                                setContent(data);
                                if (formErrors.content && data.blocks && data.blocks.length > 0) setFormErrors(prev => ({ ...prev, content: false }));
                            }} 
                        />
                    </div>

                </section>

                <aside style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    
                    <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 0.25rem 0.75rem rgba(0,0,0,0.05)" }}>
                        <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: "bold", color: "#111827", marginBottom: "1rem" }}>Portada</label>
                        
                        <div style={{ width: "100%", height: "10rem", borderRadius: "0.5rem", overflow: "hidden", border: "0.0625rem solid #e5e7eb", backgroundColor: "#f9fafb", marginBottom: "1rem" }}>
                            {coverUri ? (
                                <SafeImage src={coverUri} alt="Portada actual" variant="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.8125rem" }}>
                                    Sin portada
                                </div>
                            )}
                        </div>

                        <label style={{ display: "block", width: "100%", padding: "0.625rem", textAlign: "center", backgroundColor: "#f3f4f6", color: "#374151", border: "0.0625rem solid #d1d5db", borderRadius: "0.375rem", cursor: isUploading ? "not-allowed" : "pointer", fontSize: "0.875rem", fontWeight: "600", transition: "background-color 0.2s", boxSizing: "border-box" }}>
                            {isUploading ? "Subiendo..." : (coverUri ? "Cambiar portada" : "Subir portada")}
                            <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={isUploading} style={{ display: "none" }} />
                        </label>
                    </div>

                    {/* Optional Rejection Reason */}
                    {status === "Rejected" && rejectionReason && (
                        <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 0.25rem 0.75rem rgba(0,0,0,0.05)", border: "0.0625rem solid #fca5a5" }}>
                            <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: "bold", color: "#b91c1c", marginBottom: "0.75rem" }}>Razón del rechazo</label>
                            <div style={{ maxHeight: "12.5rem", overflowY: "auto", fontSize: "0.8125rem", color: "#4b5563", backgroundColor: "#fef2f2", padding: "0.875rem", borderRadius: "0.5rem", border: "0.0625rem solid #fecaca", lineHeight: "1.6", whiteSpace: "pre-wrap", boxSizing: "border-box" }}>
                                {rejectionReason}
                            </div>
                        </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 0.25rem 0.75rem rgba(0,0,0,0.05)" }}>
                        <button 
                            onClick={() => handleSave(false)} 
                            disabled={isSaving}
                            style={{ width: "100%", padding: "0.875rem", backgroundColor: "white", color: "#374151", border: "0.0625rem solid #d1d5db", borderRadius: "0.5rem", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "0.875rem", fontWeight: "bold", opacity: isSaving ? 0.7 : 1, boxSizing: "border-box" }}
                        >
                            {isSaving ? "Procesando..." : "Guardar borrador"}
                        </button>
                        
                        <button 
                            onClick={() => handleSave(true)} 
                            disabled={isSaving}
                            style={{ width: "100%", padding: "0.875rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "0.5rem", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "0.875rem", fontWeight: "bold", opacity: isSaving ? 0.7 : 1, boxShadow: "0 0.125rem 0.25rem rgba(37, 99, 235, 0.2)", boxSizing: "border-box" }}
                        >
                            {isSaving ? "Procesando..." : "Enviar a revisión"}
                        </button>
                    </div>

                </aside>
            </main>
            {popupMessage && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: "1rem" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.75rem", width: "100%", maxWidth: "25rem", boxShadow: "0 1.25rem 3.75rem rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: "1rem", boxSizing: "border-box" }}>
                        <h2 style={{ fontSize: "1.125rem", fontWeight: "bold", margin: 0, color: popupMessage.type === "error" ? "#dc2626" : (popupMessage.type === "success" ? "#15803d" : "#374151") }}>
                            {popupMessage.title}
                        </h2>
                        <p style={{ fontSize: "0.875rem", color: "#374151", margin: 0, lineHeight: "1.5" }}>
                            {popupMessage.text}
                        </p>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                            <button 
                                onClick={() => {
                                    const action = popupMessage.onClose;
                                    setPopupMessage(null);
                                    if (action) action();
                                }} 
                                style={{ padding: "0.625rem 1.25rem", backgroundColor: "#f3f4f6", color: "#374151", border: "0.0625rem solid #d1d5db", borderRadius: "0.375rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600", transition: "background-color 0.2s" }}
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
