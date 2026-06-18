import { useState, useEffect, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { type OutputData } from '@editorjs/editorjs';
import { Editor } from '../components/Editor';
import { getCategories } from '../services/articles/articles';
import { publishDraft, submitDraft, updateDraft } from "../services/articles/drafts"
import { uploadMedia } from '../services/media';
import { getLocalProfile } from '../services/accounts';
import { Header } from '../components/Header';
import { ArticleContent } from '../components/ArticleContent';
import { getCurrentSession } from '../services/auth';

interface Category {
    id: string;
    name: string;
}

export const WriteArticlePage = () => {
    const navigate = useNavigate();

    const [draftId, setDraftId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [coverUri, setCoverUri] = useState('');
    const [content, setContent] = useState<OutputData | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    const [formErrors, setFormErrors] = useState({ title: false, categoryId: false, content: false });
    const [popupMessage, setPopupMessage] = useState<{ title: string; text: string; type: "success" | "error" | "info"; onClose?: () => void } | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data || []);
            } catch (error) {
                console.error('Error al cargar las categorías:', error);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

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
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveDraft = async () => {
        const session = getCurrentSession();
        const currentAuthorId = session?.sub;
        
        if (!currentAuthorId) {
            setPopupMessage({ title: "Sesión expirada", text: "Por favor inicia sesión nuevamente para guardar.", type: "error" });
            return;
        }

        const isTitleValid = !!title.trim();
        const isCategoryValid = !!categoryId;
        const isContentValid = !!content && !!content.blocks && content.blocks.length > 0;

        if (!isTitleValid || !isCategoryValid || !isContentValid) {
            setFormErrors({ title: !isTitleValid, categoryId: !isCategoryValid, content: !isContentValid });
            setPopupMessage({ title: "Faltan datos", text: "El título, la categoría y el contenido son requeridos.", type: "error" });
            return;
        }

        try {
            const profile = getLocalProfile();
            const currentAuthorName = profile 
                ? `${profile.name || ''} ${profile.parentalSurname || ''} ${profile.maternalSurname || ''}`.trim() 
                : "Autor desconocido";
            const currentAuthorPfpUri = profile?.pfpUri || "";

            const draftBody = {
                id: draftId || "",
                title,
                summary,
                categoryId,
                coverUri,
                content: JSON.stringify(content),
                authorId: currentAuthorId,
                authorName: currentAuthorName,
                authorPfpUri: currentAuthorPfpUri
            };

            if (!draftId) {
                const response = await submitDraft(draftBody);
                setDraftId(response.id);
                setPopupMessage({ title: "Éxito", text: "Borrador guardado correctamente.", type: "success" });
            } else {
                await updateDraft(draftBody);
                setPopupMessage({ title: "Éxito", text: "Borrador actualizado correctamente.", type: "success" });
            }
            
            setFormErrors({ title: false, categoryId: false, content: false });
            
        } catch (e) {
            console.error(e);
            setPopupMessage({ title: "Error", text: "Ocurrió un error al guardar el borrador.", type: "error" });
        }
    };

    const handlePublish = async () => {
        const session = getCurrentSession();
        const currentAuthorId = session?.sub;
        
        if (!currentAuthorId) {
            setPopupMessage({ title: "Sesión expirada", text: "Por favor inicia sesión nuevamente para publicar.", type: "error" });
            return;
        }

        const isTitleValid = !!title.trim();
        const isCategoryValid = !!categoryId;
        const isContentValid = !!content && !!content.blocks && content.blocks.length > 0;

        if (!isTitleValid || !isCategoryValid || !isContentValid) {
            setFormErrors({ title: !isTitleValid, categoryId: !isCategoryValid, content: !isContentValid });
            setPopupMessage({ title: "Faltan datos", text: "El título, la categoría y el contenido son requeridos. Por favor completa todos los campos antes de publicar.", type: "error" });
            return;
        }

        try {
            const profile = getLocalProfile();
            const currentAuthorName = profile 
                ? `${profile.name || ''} ${profile.parentalSurname || ''} ${profile.maternalSurname || ''}`.trim() 
                : "Autor desconocido";
            const currentAuthorPfpUri = profile?.pfpUri || "";

            const draftBody = {
                id: draftId || "",
                title,
                summary,
                categoryId,
                coverUri,
                content: JSON.stringify(content), 
                authorId: currentAuthorId, 
                authorName: currentAuthorName, 
                authorPfpUri: currentAuthorPfpUri
            };

            let currentDraftId = draftId;

            if (!currentDraftId) {
                const submission = await submitDraft(draftBody);
                currentDraftId = submission.id;
                setDraftId(currentDraftId);
            }
            
            const publicationBody = { ...draftBody, id: currentDraftId };

            await publishDraft(publicationBody);
            setFormErrors({ title: false, categoryId: false, content: false });
            
            setPopupMessage({ 
                title: "Éxito", 
                text: "Tu artículo ha sido enviado a revisión correctamente.", 
                type: "success",
                onClose: () => navigate("/mis-articulos") 
            });
        } catch (e) {
            console.error(e);
            setPopupMessage({ title: "Error", text: "Ocurrió un error al publicar el artículo.", type: "error" });
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", flexDirection: "column" }}>
            <Header />

            <main style={{ flex: 1, maxWidth: "87.5rem", width: "100%", margin: "0 auto", padding: "2rem 1.5rem", display: "flex", gap: "1.75rem", alignItems: "flex-start", boxSizing: "border-box" }}>
                
                {/* Left section */}
                <section style={{ flex: "3", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    
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
                                placeholder="Resumen del artículo..."
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
                                disabled={isLoadingCategories}
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

                {/* Right Section */}
                <aside style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    
                    <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 0.25rem 0.75rem rgba(0,0,0,0.05)" }}>
                        <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: "bold", color: "#111827", marginBottom: "1rem" }}>Portada</label>
                        
                        <div style={{ width: "100%", height: "10rem", borderRadius: "0.5rem", overflow: "hidden", border: "0.0625rem solid #e5e7eb", backgroundColor: "#f9fafb", marginBottom: "1rem" }}>
                            {coverUri ? (
                                <img src={coverUri} alt="Portada actual" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", backgroundColor: "white", borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 0.25rem 0.75rem rgba(0,0,0,0.05)" }}>
                        <button 
                            onClick={() => setShowPreview(true)}
                            style={{ width: "100%", padding: "0.875rem", backgroundColor: "#f3f4f6", color: "#1f2937", border: "0.0625rem solid #d1d5db", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: "bold", boxSizing: "border-box" }}
                        >
                            Vista previa
                        </button>

                        <button 
                            onClick={handleSaveDraft} 
                            style={{ width: "100%", padding: "0.875rem", backgroundColor: "white", color: "#374151", border: "0.0625rem solid #d1d5db", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: "bold", boxSizing: "border-box" }}
                        >
                            Guardar borrador
                        </button>

                        <button 
                            onClick={handlePublish} 
                            style={{ width: "100%", padding: "0.875rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: "bold", boxShadow: "0 0.125rem 0.25rem rgba(37, 99, 235, 0.2)", boxSizing: "border-box" }}
                        >
                            Publicar artículo
                        </button>
                    </div>

                </aside>
            </main>
            {showPreview && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "1rem", width: "100%", maxWidth: "62.5rem", maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 1.5rem 3rem rgba(0,0,0,0.25)" }}>
                        <div style={{ padding: "1.5rem", borderBottom: "0.0625rem solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f9fafb" }}>
                            <h2 style={{ fontWeight: "bold", fontSize: "1.25rem", color: "#1f2937", margin: 0 }}>Vista Previa</h2>
                            <button 
                                onClick={() => setShowPreview(false)}
                                style={{ color: "#6b7280", fontWeight: "bold", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "0.125rem solid #d1d5db", backgroundColor: "white", cursor: "pointer" }}
                            >
                                X
                            </button>
                        </div>
                        <div style={{ overflowY: "auto", flex: 1, padding: "1.5rem" }}>
                            <ArticleContent content={JSON.stringify(content)}/>
                        </div>
                        <button 
                            onClick={() => setShowPreview(false)}
                            style={{ color: "#6b7280", fontWeight: "bold", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "0.125rem solid #d1d5db", backgroundColor: "white", cursor: "pointer" }}
                        >
                            Volver a Editar
                        </button>
                        <button 
                            onClick={() => handlePublish()}
                            style={{ color: "white", fontWeight: "bold", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "0.125rem solid #d1d5db", backgroundColor: "#2563eb", cursor: "pointer" }}
                        >
                            Publicar
                        </button>
                    </div>
                </div>
            )}
            {popupMessage && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: "1rem" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "0.75rem", padding: "1.75rem", width: "100%", maxWidth: "25rem", boxShadow: "0 1.25rem 3.75rem rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: "1rem" }}>
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
