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

export const EditArticlePage = () => {
    const { articleId } = useParams<{ articleId: string }>();
    const localProfile = getLocalProfile();

    // Estados del formulario
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [coverUri, setCoverUri] = useState('');
    const [content, setContent] = useState<OutputData | null>(null);

    // Estados de metadatos y control
    const [status, setStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    
    // Estados de interfaz
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Cargar el borrador y las categorías
    useEffect(() => {
        if (!articleId) return;

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
                alert("No se pudo cargar el artículo para editar.");
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
            alert('No se pudo subir la imagen de portada.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (isPublishing: boolean) => {
        if (!title.trim() || !content) {
            return alert('El título y el contenido son obligatorios.');
        }

        setIsSaving(true);
        try {
            const authorName = localProfile 
                ? `${localProfile.name || ''} ${localProfile.parentalSurname || ''} ${localProfile.maternalSurname || ''}`.trim() 
                : "Autor desconocido";

            // Construir el payload respetando la interfaz Draft
            const payload = {
                id: articleId,
                title,
                summary,
                categoryId,
                coverUri,
                authorId: localProfile?.id || "",
                authorName,
                authorPfpUri: localProfile?.pfpUri || "",
                content: JSON.stringify(content)
            };

            if (isPublishing) {
                await publishDraft(payload);
                alert('¡Artículo enviado para publicación!');
            } else {
                await updateDraft(payload);
                alert('Borrador guardado exitosamente.');
                if (status === "Published") {
                    setStatus("Draft");
                }
            }
            
        } catch (error) {
            console.error('Error al guardar el artículo:', error);
            alert('Ocurrió un error al procesar la solicitud.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", flexDirection: "column" }}>
                <Header />
                <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <p style={{ color: "#6b7280", fontWeight: "500" }}>Cargando editor...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", flexDirection: "column" }}>
            <Header />

            {/* CONTENEDOR DE NIVEL SUPERIOR */}
            <main style={{ flex: 1, maxWidth: "1400px", width: "100%", margin: "0 auto", padding: "32px 24px", display: "flex", gap: "28px", alignItems: "flex-start" }}>
                
                {/* LADO IZQUIERDO (~3/4 de la pantalla) */}
                <section style={{ flex: "3", display: "flex", flexDirection: "column", gap: "24px" }}>
                    
                    {/* ETIQUETA DE ESTADO (Opcional) */}
                    {status === "Published" && (
                        <div style={{ backgroundColor: "#fef3c7", borderLeft: "4px solid #f59e0b", padding: "16px 20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                            <p style={{ margin: 0, color: "#92400e", fontSize: "14px", fontWeight: "600", lineHeight: "1.5" }}>
                                Este articulo ya fue publicado. Si lo guardas como borrador volverá al estado Borrador, si lo vuelves a publicar volverá al estado En Revision hasta que un editor lo apruebe.
                            </p>
                        </div>
                    )}

                    {status === "Rejected" && (
                        <div style={{ backgroundColor: "#fee2e2", borderLeft: "4px solid #ef4444", padding: "16px 20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                            <p style={{ margin: 0, color: "#b91c1c", fontSize: "14px", fontWeight: "600", lineHeight: "1.5" }}>
                                Tu articulo fue rechazado para publicación. Por favor revisa y atiende las correcciones pertinentes.
                            </p>
                        </div>
                    )}

                    {/* CONTENEDOR DE CAMPOS (Título, Descripción, Categoría) */}
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "28px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "20px" }}>
                        
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", color: "#374151", marginBottom: "8px" }}>Título del artículo</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ingresa el título aquí..."
                                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px", outline: "none", boxSizing: "border-box" }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", color: "#374151", marginBottom: "8px" }}>Descripción breve</label>
                            <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                maxLength={500}
                                placeholder="Resumen del artículo (máximo 500 caracteres)..."
                                style={{ width: "100%", minHeight: "80px", padding: "12px 16px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", color: "#374151", marginBottom: "8px" }}>Categoría</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", outline: "none", backgroundColor: "white", boxSizing: "border-box" }}
                            >
                                <option value="">Selecciona una categoría...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ÁREA DE EDITOR JS */}
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "28px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", minHeight: "500px" }}>
                        {/* Se renderiza Editor pasándole el initialData ya parseado */}
                        <Editor initialData={content || undefined} onChange={(data) => setContent(data)} />
                    </div>

                </section>

                {/* LADO DERECHO (~1/4 de la pantalla) */}
                <aside style={{ flex: "1", display: "flex", flexDirection: "column", gap: "24px" }}>
                    
                    {/* SECCIÓN PORTADA */}
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                        <label style={{ display: "block", fontSize: "15px", fontWeight: "bold", color: "#111827", marginBottom: "16px" }}>Portada</label>
                        
                        <div style={{ width: "100%", height: "160px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e5e7eb", backgroundColor: "#f9fafb", marginBottom: "16px" }}>
                            {coverUri ? (
                                <SafeImage src={coverUri} alt="Portada actual" variant="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "13px" }}>
                                    Sin portada
                                </div>
                            )}
                        </div>

                        <label style={{ display: "block", width: "100%", padding: "10px", textAlign: "center", backgroundColor: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "6px", cursor: isUploading ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "600", transition: "background-color 0.2s" }}>
                            {isUploading ? "Subiendo..." : (coverUri ? "Cambiar portada" : "Subir portada")}
                            <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={isUploading} style={{ display: "none" }} />
                        </label>
                    </div>

                    {/* SECCIÓN OPCIONAL: RAZÓN DE RECHAZO */}
                    {status === "Rejected" && rejectionReason && (
                        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #fca5a5" }}>
                            <label style={{ display: "block", fontSize: "15px", fontWeight: "bold", color: "#b91c1c", marginBottom: "12px" }}>Razón del rechazo</label>
                            <div style={{ maxHeight: "200px", overflowY: "auto", fontSize: "13px", color: "#4b5563", backgroundColor: "#fef2f2", padding: "14px", borderRadius: "8px", border: "1px solid #fecaca", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                                {rejectionReason}
                            </div>
                        </div>
                    )}

                    {/* BOTONES DE ACCIÓN */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                        <button 
                            onClick={() => handleSave(false)} 
                            disabled={isSaving}
                            style={{ width: "100%", padding: "14px", backgroundColor: "white", color: "#374151", border: "1px solid #d1d5db", borderRadius: "8px", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "bold", opacity: isSaving ? 0.7 : 1 }}
                        >
                            Guardar borrador
                        </button>
                        
                        <button 
                            onClick={() => handleSave(true)} 
                            disabled={isSaving}
                            style={{ width: "100%", padding: "14px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "bold", opacity: isSaving ? 0.7 : 1, boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)" }}
                        >
                            {isSaving ? "Procesando..." : "Publicar articulo"}
                        </button>
                    </div>

                </aside>
            </main>
        </div>
    );
};
