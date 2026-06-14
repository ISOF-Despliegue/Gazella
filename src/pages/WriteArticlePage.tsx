import { useState, useEffect, type ChangeEvent } from 'react';
import { type OutputData } from '@editorjs/editorjs';
import { Editor } from '../components/Editor';
import { getCategories } from '../services/articles/articles';
import { publishDraft, submitDraft } from "../services/articles/drafts"
import { uploadMedia } from '../services/media';
import { getLocalProfile } from '../services/accounts';
import { Header } from '../components/Header';
import { ArticleContent } from '../components/ArticleContent';

interface Category {
    id: string;
    name: string;
}

export const WriteArticlePage = () => {
    const localProfile = getLocalProfile();
    const authorId = localProfile?.id || "";
    const authorName = `${localProfile?.parentalSurname} ${localProfile?.maternalSurname} ${localProfile?.name}`;
    const authorPfpUri = localProfile?.pfpUri || "";

    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [coverUri, setCoverUri] = useState('');
    const [content, setContent] = useState<OutputData | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

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
        if (!title.trim() || !content) {
            return alert('Faltan datos requeridos (Título y Contenido)');
        }
        try {
            const draftBody = {
                id: "",
                title: title,
                summary: summary,
                categoryId: categoryId,
                coverUri: coverUri,
                content: JSON.stringify(content),
                authorId: authorId,
                authorName: authorName,
                authorPfpUri: authorPfpUri
            }
            await submitDraft(draftBody);
            alert('Borrador guardado con éxito.');
        } catch (e) {
            console.error(e);
        }
    };

    const handlePublish = async () => {
        if (!title.trim() || !content) {
            return alert('Faltan datos requeridos (Título y Contenido)');
        }
        try {
            const draftBody = {
                id: "",
                title: title,
                summary: summary,
                categoryId: categoryId,
                coverUri: coverUri,
                content: JSON.stringify(content),
                authorId: authorId,
                authorName: authorName,
                authorPfpUri: authorPfpUri
            }

            const submission = await submitDraft(draftBody);
            const publicationBody = {
                id: submission.id,
                title: title,
                summary: summary,
                categoryId: categoryId,
                coverUri: coverUri,
                content: JSON.stringify(content),
                authorId: authorId,
                authorName: authorName,
                authorPfpUri: authorPfpUri
            }

            await publishDraft(publicationBody);
            alert('¡Artículo publicado con éxito!');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col w-full">
            <Header />

            <div style={{ display: 'flex', padding: '20px 40px', gap: '20px' }} />

            {/* CONTENEDOR PRINCIPAL GRIS */}
            <main className="flex-1 w-full flex justify-center items-start p28">
                
                {/* ÁREA DE TRABAJO (CONTENEDOR BLANCO) */}
                <div className="w-full max-w-5xl bg-white border border-gray-300 rounded-2xl shadow-sm p-8 sm:p-12 flex flex-col gap-4">
                    
                    {/* SECCIÓN 1: TÍTULO SUPERIOR */}
                    <div className="border-b border-gray-200">
                        <h2 className="text-3xl font-bold text-gray-800">
                            Escribe tu artículo de conservación
                        </h2>
                    </div>

                    {/* SECCIÓN 2: FILA DE METADATOS */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        
                        {/* 1. Título del artículo */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">Título del articulo</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ingresa el título..."
                                className="w-full h-12 border-2 border-gray-300 rounded-lg px-4 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* 2. Descripción breve */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <label className="text-sm font-bold text-gray-700">Descripción breve</label>
                                <span className="text-xs text-gray-400 font-mono">{summary.length}/500</span>
                            </div>
                            <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                maxLength={500}
                                placeholder="Resumen del artículo..."
                                className="w-full h-12 border-2 border-gray-300 rounded-lg px-4 py-2 text-sm resize-none overflow-y-auto focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* 3. Categoría */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">Categoría</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                disabled={isLoadingCategories}
                                className="w-full h-12 border-2 border-gray-300 rounded-lg px-4 text-sm bg-white focus:border-blue-500 focus:outline-none transition-colors"
                            >
                                <option value="">Selecciona...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 4. Portada */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">Portada</label>
                            <div className="flex items-center gap-3 h-12">
                                <label className="flex-1 cursor-pointer bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-lg flex items-center justify-center h-full text-sm font-bold transition-colors">
                                    {isUploading ? 'Subiendo...' : 'Subir Imagen'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverUpload}
                                        disabled={isUploading}
                                        className="hidden"
                                    />
                                </label>
                                {coverUri && (
                                    <img src={coverUri} alt="Miniatura" className="w-12 h-12 object-cover rounded-lg border-2 border-gray-300 shrink-0" />
                                )}
                            </div>
                        </div>

                    </div>

                    {/* SECCIÓN 3: LIENZO DE ESCRITURA */}
                    <div className="w-full flex justify-center">
                        <div className="w-full max-w-4xl border-2 border-gray-300 rounded-xl p-8 h-[300px] overflow-y-auto bg-white shadow-inner focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
                            <Editor onChange={(data) => setContent(data)} />
                        </div>
                    </div>

                    {/* SECCIÓN 4: BOTONES DE ACCIÓN */}
                    <div className="flex justify-end items-center gap-4 border-t border-gray-100 pt-4">
                        <button
                            onClick={handleSaveDraft}
                            className="px-6 py-3 border-2 border-gray-400 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Guardar Borrador
                        </button>
                        <button
                            onClick={() => setShowPreview(true)}
                            className="px-6 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-sm font-bold text-gray-800 hover:bg-gray-200 transition-colors"
                        >
                            Vista Previa
                        </button>
                        <button
                            onClick={handlePublish}
                            className="px-8 py-3 bg-blue-600 border-2 border-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Publicar Articulo
                        </button>
                    </div>

                </div>
            </main>

            {/* MODAL DE VISTA PREVIA */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h2 className="font-bold text-xl text-gray-800">Vista Previa</h2>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-500 hover:text-gray-800 font-bold px-4 py-2 rounded-lg border-2 border-gray-300 bg-white"
                            >
                                Cerrar
                            </button>
                        </div>
                        <ArticleContent content={JSON.stringify(content)}/>
                    </div>
                </div>
            )}
        </div>
    );
};