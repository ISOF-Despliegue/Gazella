import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArticleContent } from "../components/ArticleContent";
import { Header } from "../components/Header";
import { SafeImage } from "../components/SafeImage";
import { getArticle } from "../services/articles/articles";
import { approveArticle, rejectArticle } from "../services/articles/drafts";
import type { Article } from "../types/article";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date(value));
}

export function ReviewArticlePage() {
    const navigate = useNavigate();
    const { articleId = "" } = useParams();
    const [article, setArticle] = useState<Article | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [status, setStatus] = useState("Cargando artículo...");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        getArticle(articleId)
            .then((item) => {
                setArticle(item);
                setStatus("");
            })
            .catch(() => setStatus("No se pudo cargar el artículo solicitado."));
    }, [articleId]);

    const handleApprove = async () => {
        if (!article || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await approveArticle(article.id);
            navigate("/editor/articulos", {
                replace: true,
                state: { notice: "Artículo aprobado correctamente." },
            });
        } catch {
            setStatus("No se pudo aprobar el artículo.");
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!article || isSubmitting) return;
        if (!rejectionReason.trim()) {
            setStatus("Escribe el motivo del rechazo antes de continuar.");
            return;
        }

        setIsSubmitting(true);
        try {
            await rejectArticle(article.id, { rejectionReason: rejectionReason.trim() });
            navigate("/editor/articulos", {
                replace: true,
                state: { notice: "Artículo rechazado correctamente." },
            });
        } catch {
            setStatus("No se pudo rechazar el artículo.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="mx-auto w-full max-w-7xl p-5 sm:p-8 lg:p-10">
                <div className="mb-6">
                    <button
                        onClick={() => navigate("/editor/articulos")}
                        className="text-sm font-semibold text-green-800 hover:underline"
                    >
                        ← Volver a pendientes
                    </button>
                </div>

                {status && !article ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
                        {status}
                    </div>
                ) : article && (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 p-6 sm:p-8">
                                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-700">
                                    Revisión de artículo pendiente
                                </p>
                                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{article.title}</h1>
                                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                                    <span>Por <strong className="text-gray-700">{article.authorName}</strong></span>
                                    <span>Categoría: <strong className="text-gray-700">{article.category}</strong></span>
                                    <span>Enviado: <strong className="text-gray-700">{formatDate(article.lastUpdatedAt)}</strong></span>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8">
                                <div className="mb-8 flex h-64 items-center justify-center overflow-hidden rounded-xl bg-green-50 sm:h-80">
                                    <SafeImage
                                        src={article.coverUri}
                                        alt={`Portada de ${article.title}`}
                                        className="h-full w-full object-cover"
                                        placeholderStyle={{ width: "150px", height: "150px", objectFit: "contain", opacity: 0.35 }}
                                    />
                                </div>
                                <p className="mb-8 border-l-4 border-green-600 pl-4 text-lg italic leading-7 text-gray-600">
                                    {article.summary}
                                </p>
                                <ArticleContent content={article.content} />
                            </div>
                        </article>

                        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
                            <section className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900">Aprobar artículo</h2>
                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    El artículo se publicará y su autor recibirá una notificación.
                                </p>
                                <button
                                    onClick={handleApprove}
                                    disabled={isSubmitting}
                                    className="mt-5 w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting ? "Procesando..." : "Aprobar y publicar"}
                                </button>
                            </section>

                            <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-900">Rechazar artículo</h2>
                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    Explica qué debe corregir el autor antes de enviarlo nuevamente.
                                </p>
                                <label className="mt-4 block text-sm font-semibold text-gray-700" htmlFor="rejection-reason">
                                    Motivo del rechazo
                                </label>
                                <textarea
                                    id="rejection-reason"
                                    value={rejectionReason}
                                    onChange={(event) => setRejectionReason(event.target.value)}
                                    placeholder="Describe de forma clara los cambios necesarios..."
                                    className="mt-2 min-h-36 w-full resize-y rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />
                                <button
                                    onClick={handleReject}
                                    disabled={isSubmitting}
                                    className="mt-4 w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting ? "Procesando..." : "Rechazar"}
                                </button>
                            </section>

                            {status && (
                                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                    {status}
                                </p>
                            )}
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}
