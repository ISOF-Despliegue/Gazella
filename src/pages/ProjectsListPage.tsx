import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../services/projects";
import { type Project } from "../types/project";
import { ProjectCard } from "../components/ProjectCard";
import { Header } from "../components/Header";

const CATEGORIES = [
    { label: "Todos", value: "" },
    { label: "Biodiversidad", value: "biodiversidad" },
    { label: "Flora y Fauna", value: "flora-y-fauna" },
    { label: "Residuos", value: "residuos" },
    { label: "Acción Climática", value: "accion-climatica" },
];

const ORDER_OPTIONS = [
    { label: "Más próximo", value: "soonest" },
    { label: "Más reciente", value: "newest" },
];

export function ProjectsListPage() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [orderBy, setOrderBy] = useState("soonest");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [totalProjects, setTotalProjects] = useState(0);

    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getProjects({
                pageIndex: currentPage - 1,
                pageSize: 8,
                searchTerm: searchTerm || undefined,
                categoryId: selectedCategory || undefined,
                orderBy: orderBy || undefined,
            });
            setProjects(result.mappedProjects);
            setPageCount(result.pageCount ?? 1);
            setTotalProjects(result.totalProjects ?? result.mappedProjects.length);
        } catch {
            setError("No fue posible cargar los proyectos. Por favor intenta más tarde.");
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, selectedCategory, orderBy]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchProjects();
    };

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Header />

            <div style={{ display: "flex", padding: "32px 40px", gap: "32px", maxWidth: "1200px", margin: "0 auto" }}>
                {/* Sidebar de filtros */}
                <aside style={{ width: "220px", flexShrink: 0 }}>
                    <div style={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "16px", color: "#374151" }}>Filtros</h3>

                        <form onSubmit={handleSearch} style={{ marginBottom: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "6px", padding: "6px 10px", backgroundColor: "white" }}>
                                <span style={{ marginRight: "6px", color: "#9ca3af", fontSize: "13px" }}>🔍</span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar proyecto..."
                                    style={{ outline: "none", fontSize: "13px", width: "100%", border: "none", background: "transparent" }}
                                />
                            </div>
                        </form>

                        <div style={{ marginBottom: "20px" }}>
                            <p style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Categoría</p>
                            {CATEGORIES.map((cat) => (
                                <label key={cat.value} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", cursor: "pointer", fontSize: "14px" }}>
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={selectedCategory === cat.value}
                                        onChange={() => { setSelectedCategory(cat.value); setCurrentPage(1); }}
                                    />
                                    {cat.label}
                                </label>
                            ))}
                        </div>

                        <div>
                            <p style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ordenar por</p>
                            {ORDER_OPTIONS.map((opt) => (
                                <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", cursor: "pointer", fontSize: "14px" }}>
                                    <input
                                        type="radio"
                                        name="orderBy"
                                        checked={orderBy === opt.value}
                                        onChange={() => { setOrderBy(opt.value); setCurrentPage(1); }}
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>

                        {(selectedCategory || searchTerm) && (
                            <button
                                onClick={() => { setSelectedCategory(""); setSearchTerm(""); setCurrentPage(1); }}
                                style={{ marginTop: "16px", width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "13px", color: "#6b7280" }}
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                </aside>

                {/* Lista de proyectos */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
                            Lista de proyectos activos
                            {!isLoading && <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7280", marginLeft: "10px" }}>({totalProjects} proyectos)</span>}
                        </h2>
                    </div>

                    {isLoading && (
                        <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
                            Cargando proyectos...
                        </div>
                    )}

                    {error && (
                        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px", color: "#dc2626", marginBottom: "16px" }}>
                            {error}
                        </div>
                    )}

                    {!isLoading && !error && projects.length === 0 && (
                        <div style={{ textAlign: "center", padding: "60px", color: "#6b7280", backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                            <p style={{ fontSize: "16px", marginBottom: "8px" }}>No se encontraron proyectos con los criterios seleccionados.</p>
                            <p style={{ fontSize: "14px" }}>Intenta modificar o eliminar los filtros aplicados.</p>
                        </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/proyectos/${project.id}`)}
                            >
                                <ProjectCard project={project} />
                            </div>
                        ))}
                    </div>

                    {pageCount > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "32px" }}>
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: currentPage === 1 ? "not-allowed" : "pointer", color: currentPage === 1 ? "#9ca3af" : "#374151" }}
                            >
                                ← Anterior
                            </button>
                            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    style={{ padding: "8px 14px", border: "1px solid", borderRadius: "6px", cursor: "pointer", backgroundColor: page === currentPage ? "#16a34a" : "white", borderColor: page === currentPage ? "#16a34a" : "#d1d5db", color: page === currentPage ? "white" : "#374151", fontWeight: page === currentPage ? "600" : "400" }}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                disabled={currentPage === pageCount}
                                onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                                style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "white", cursor: currentPage === pageCount ? "not-allowed" : "pointer", color: currentPage === pageCount ? "#9ca3af" : "#374151" }}
                            >
                                Siguiente →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
