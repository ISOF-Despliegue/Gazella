import { useState } from 'react';
import { ArticleContent } from '../components/ArticleContent';
import { Header } from '../components/Header';

// --- DATOS SIMULADOS PARA LA PRIMERA ITERACIÓN ---
const MOCK_ARTICLE = {
    title: "El impacto de la reforestación inteligente en ecosistemas locales y la conservación de la fauna",
    author: {
        name: "Dra. Elena Ramos",
        bio: "Bióloga especializada en conservación de ecosistemas y restauración ambiental. Investigadora principal en proyectos de Gazella.",
        pfpUri: "https://i.pravatar.cc/150?u=elena"
    },
    publishedAt: "12 de Junio, 2026",
    category: "Conservación",
    likes: 342,
    commentsCount: 15,
    content: JSON.stringify({
        blocks: [
            { type: "paragraph", data: { text: "La reforestación no es simplemente plantar árboles; es un proceso complejo de restauración ecológica. Cuando introducimos especies nativas, estamos reconstruyendo el hogar de cientos de especies..." } },
            { type: "paragraph", data: { text: "Estudios recientes demuestran que la biodiversidad se recupera hasta un 40% más rápido si se respeta la topografía original del terreno." } },
            { type: "paragraph", data: { text: "Este es un bloque de relleno para simular un artículo largo. ".repeat(20) } },
            { type: "header", data: { text: "El rol de la comunidad", level: 2 } },
            { type: "paragraph", data: { text: "Más texto de relleno para forzar el scroll del artículo. ".repeat(30) } }
        ]
    })
};

const MOCK_COMMENTS = [
    { id: 1, authorName: "Carlos Ruiz", pfp: "https://i.pravatar.cc/150?u=carlos", text: "Excelente artículo, muy revelador." },
    { id: 2, authorName: "Ana Silva", pfp: "https://i.pravatar.cc/150?u=ana", text: "¿Hay fuentes sobre el estudio del 40%?" },
    { id: 3, authorName: "Luis Méndez", pfp: "https://i.pravatar.cc/150?u=luis", text: "Me gustaría sumarme como voluntario a las iniciativas de plantación." },
    { id: 4, authorName: "María Gómez", pfp: "https://i.pravatar.cc/150?u=maria", text: "Totalmente de acuerdo, la flora nativa es vital." },
    { id: 4, authorName: "María Gómez", pfp: "https://i.pravatar.cc/150?u=maria", text: "Totalmente de acuerdo, la flora nativa es vital." },
    { id: 4, authorName: "María Gómez", pfp: "https://i.pravatar.cc/150?u=maria", text: "Totalmente de acuerdo, la flora nativa es vital." },
    { id: 4, authorName: "María Gómez", pfp: "https://i.pravatar.cc/150?u=maria", text: "Totalmente de acuerdo, la flora nativa es vital." },
    { id: 4, authorName: "María Gómez", pfp: "https://i.pravatar.cc/150?u=maria", text: "Totalmente de acuerdo, la flora nativa es vital." },
];

const MOCK_RELATED = [
    { id: 1, title: "Monitoreo de Aves Migratorias", cover: "https://images.unsplash.com/photo-1550853024-fae8cd4be47f?auto=format&fit=crop&w=300&q=80", summary: "Técnicas modernas para el rastreo de especies." },
    { id: 2, title: "Limpieza de Ríos: Guía 2026", cover: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=300&q=80", summary: "Impacto de los microplásticos en la cuenca baja." },
    { id: 3, title: "Huella de Carbono", cover: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=300&q=80", summary: "Cómo medir el impacto de tu proyecto." },
];

export const ReadArticlePage = () => {
    const [commentInput, setCommentInput] = useState('');

    return (
        // El contenedor base ocupa exactamente el 100% de la altura de la ventana (h-screen)
        <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
            <Header /> {/* Tu Header/Navbar superior */}

            {/* MAIN: El espacio restante debajo del Navbar */}
            <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 flex gap-6 overflow-hidden">
                
                {/* LADO IZQUIERDO: Contenedor Principal del Artículo (Ocupa ~3/4 del espacio) */}
                <section className="flex-[3] flex flex-col bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden h-full">
                    
                    {/* CABECERA FIJA (Título y Metadatos) */}
                    <div className="p-6 md:p-8 border-b border-gray-200 shrink-0 bg-white z-10">
                        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                            {MOCK_ARTICLE.title}
                        </h1>
                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-gray-500">
                            <span className="flex items-center gap-1">
                                <span className="text-gray-400">Autor:</span> <span className="text-gray-800">{MOCK_ARTICLE.author.name}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="text-gray-400">Publicado:</span> <span className="text-gray-800">{MOCK_ARTICLE.publishedAt}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="text-gray-400">Categoría:</span> <span className="text-gray-800">{MOCK_ARTICLE.category}</span>
                            </span>
                        </div>
                    </div>

                    {/* CUERPO SCROLLEABLE (Artículo + Interacciones + Comentarios) */}
                    <div className="flex-1 overflow-y-auto scroll-smooth p-6 md:p-10 bg-white">
                        
                        {/* Contenido del Artículo */}
                        <div className="max-w-4xl mx-auto">
                            <ArticleContent content={MOCK_ARTICLE.content} />
                        </div>

                        {/* Barra de Interacción (Likes, Comentarios, Compartir) */}
                        <div className="max-w-4xl mx-auto flex items-center justify-start gap-8 mt-12 pt-6 border-t border-gray-100">
                            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                                {/* Icono Corazón */}
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                <span className="font-semibold">{MOCK_ARTICLE.likes} Likes</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                                {/* Icono Chat */}
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                <span className="font-semibold">{MOCK_ARTICLE.commentsCount} Comentarios</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                                {/* Icono Compartir */}
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                <span className="font-semibold">Compartir</span>
                            </button>
                        </div>

                        {/* Sección de Comentarios */}
                        <div className="max-w-4xl mx-auto mt-12 bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Comentarios</h3>
                            
                            {/* Soporte de scroll independiente para la lista de comentarios */}
                            <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-2">
                                {MOCK_COMMENTS.map((comment) => (
                                    <div key={comment.id} className="flex gap-4">
                                        <img src={comment.pfp} alt={comment.authorName} className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200" />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 text-sm">{comment.authorName}</span>
                                            <p className="text-gray-700 mt-1 text-sm leading-relaxed">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* PIE FIJO (Input para escribir comentario, siempre visible) */}
                    <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50 shrink-0 flex items-center gap-4 z-10">
                        <img src="https://i.pravatar.cc/150?u=yo" alt="Mi perfil" className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-300" />
                        <input
                            type="text"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Escribe un comentario y únete a la conversación..."
                            className="flex-1 h-12 border border-gray-300 rounded-full px-5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                        />
                        <button className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-sm transition-colors shadow-sm shrink-0">
                            Enviar
                        </button>
                    </div>

                </section>

                {/* LADO DERECHO: Barra Lateral (Ocupa ~1/4 del espacio) */}
                <aside className="flex-[1] hidden lg:flex flex-col gap-6 overflow-y-auto h-full pb-4">
                    
                    {/* Ficha: Sobre el Autor */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-sm flex flex-col items-center text-center shrink-0">
                        <h3 className="w-full text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Sobre el autor</h3>
                        <img src={MOCK_ARTICLE.author.pfpUri} alt={MOCK_ARTICLE.author.name} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-50 shadow-sm" />
                        <h4 className="font-extrabold text-gray-900 text-lg">{MOCK_ARTICLE.author.name}</h4>
                        <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                            {MOCK_ARTICLE.author.bio}
                        </p>
                    </div>

                    {/* Ficha: Artículos Destacados */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-sm flex flex-col shrink-0">
                        <h3 className="text-xs text-center font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Artículos Destacados</h3>
                        <div className="flex flex-col gap-5">
                            {MOCK_RELATED.map((related) => (
                                <div key={related.id} className="group cursor-pointer flex flex-col gap-2">
                                    <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                                        <img src={related.cover} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <h4 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {related.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                        {related.summary}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </aside>

            </main>
        </div>
    );
};
