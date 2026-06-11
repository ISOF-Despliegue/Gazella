import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { getPendingArticles } from "../services/articles";
import type { PendingArticle } from "../types/article";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export function PendingArticlesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const notice = (location.state as { notice?: string } | null)?.notice;
    const [articles, setArticles] = useState<PendingArticle[]>([]);
    const [status, setStatus] = useState("Cargando artículos pendientes...");
    const [query, setQuery] = useState("");

    useEffect(() => {
        getPendingArticles()
            .then((items) => {
                setArticles(items);
                setStatus(items.length ? "" : "No hay artículos pendientes de revisión.");
            })
            .catch(() => setStatus("No se pudieron cargar los artículos pendientes."));
    }, []);

    const filteredArticles = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("es");
        if (!normalizedQuery) return articles;

        return articles.filter((article) =>
            [article.title, article.authorName, article.categoryName]
                .some((value) => value.toLocaleLowerCase("es").includes(normalizedQuery))
        );
    }, [articles, query]);

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="mx-auto w-full max-w-7xl p-5 sm:p-8 lg:p-10">
                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
                    {notice && (
                        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
                            {notice}
                        </div>
                    )}
                    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center">
                        <div>
                            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-green-700">Panel de editor</p>
                            <h1 className="text-3xl font-bold text-gray-900">Artículos pendientes de revisión</h1>
                            <p className="mt-2 text-sm text-gray-500">
                                Revisa el contenido enviado antes de aprobar su publicación.
                            </p>
                        </div>
                        <span className="w-fit rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800">
                            {articles.length} pendientes
                        </span>
                    </div>

                    <div className="mb-5 flex justify-end">
                        <label className="relative w-full sm:max-w-sm">
                            <span className="sr-only">Buscar artículos</span>
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Buscar por título, autor o categoría"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                            />
                        </label>
                    </div>

                    {status ? (
                        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                            {status}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                                        <th className="px-3 py-4">Título</th>
                                        <th className="px-3 py-4">Autor</th>
                                        <th className="px-3 py-4">Categoría</th>
                                        <th className="px-3 py-4">Enviado</th>
                                        <th className="px-3 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredArticles.map((article) => (
                                        <tr key={article.id} className="border-b border-gray-100 transition hover:bg-green-50/50">
                                            <td className="px-3 py-5">
                                                <p className="font-semibold text-gray-900">{article.title}</p>
                                                <p className="mt-1 max-w-md truncate text-xs text-gray-500">{article.summary}</p>
                                            </td>
                                            <td className="px-3 py-5 text-sm text-gray-700">{article.authorName}</td>
                                            <td className="px-3 py-5">
                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                                    {article.categoryName}
                                                </span>
                                            </td>
                                            <td className="px-3 py-5 text-sm text-gray-600">{formatDate(article.submittedAt)}</td>
                                            <td className="px-3 py-5 text-right">
                                                <button
                                                    onClick={() => navigate(`/editor/articulos/${article.id}/revision`)}
                                                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800"
                                                >
                                                    Revisar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!filteredArticles.length && (
                                <p className="py-10 text-center text-sm text-gray-500">No hay resultados para esa búsqueda.</p>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
