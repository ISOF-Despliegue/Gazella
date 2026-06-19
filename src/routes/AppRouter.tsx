import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { VerifyCodePage } from "../pages/VerifyCodePage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ArticlesListPage } from "../pages/ArticlesListPage";
import { AuthCallbackPage } from "../pages/AuthCallbackPage";
import { ProfilePage } from "../pages/ProfilePage";
import { EditProfilePage } from "../pages/EditProfilePage";
import { WriteArticlePage } from "../pages/WriteArticlePage";
import { ReadArticlePage } from "../pages/ReadArticlePage";
import { PendingArticlesPage } from "../pages/PendingArticlesPage";
import { ReviewArticlePage } from "../pages/ReviewArticlePage";
import { ProjectsListPage } from "../pages/ProjectsListPage";
import { ProjectDetailPage } from "../pages/ProjectDetailPage";
import { MyEnrollmentsPage } from "../pages/MyEnrollmentsPage";
import { MyProjectsPage } from "../pages/MyProjectsPage";
import { CreateProjectPage } from "../pages/CreateProjectPage";
import { RoleGuard } from "../components/RoleGuard";
import { AuthorStatsPage } from "../pages/AuthorStatsPage";
import { ManagePublishedArticlesPage } from "../pages/ManagePublishedArticlesPage";
import { trackCurrentRoute } from "../components/BackButton";
import { MyArticlesPage } from '../pages/MyArticlesPage';
import { EditArticlePage } from "../pages/EditArticlePage";
import { ProjectStatsPage } from "../pages/ProjectStatsPage";
import { UserProfilePage } from "../pages/UserProfilePage";

function NavigationHistoryTracker() {
    const location = useLocation();

    useEffect(() => {
        trackCurrentRoute(`${location.pathname}${location.search}${location.hash}`);
    }, [location]);

    return null;
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <NavigationHistoryTracker />
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/recuperar" element={<ForgotPasswordPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/registro" element={<RegisterPage />} />
                <Route path="/verificar" element={<VerifyCodePage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/perfil/editar" element={<EditProfilePage />} />
                <Route path="/perfil/:userId" element={<UserProfilePage />} />
                <Route path="/usuario/:userId" element={<UserProfilePage />} />
                <Route path="/articulos" element={<ArticlesListPage />} />
                <Route path="/nuevo-articulo" element={<WriteArticlePage />} />
                <Route path="/articulos/:articleId" element={<ReadArticlePage />} />
                <Route path="/articulos/editar/:articleId" element={<EditArticlePage/>} />
                <Route path="/editor/articulos" element={<RoleGuard allowedRoles={["editor", "moderator"]}><PendingArticlesPage /></RoleGuard>} />
                <Route path="/editor/articulos/:articleId/revision" element={<RoleGuard allowedRoles={["editor", "moderator"]}><ReviewArticlePage /></RoleGuard>} />
                <Route path="/editor/articulos/publicados" element={<RoleGuard allowedRoles={["editor", "moderator"]}><ManagePublishedArticlesPage /></RoleGuard>} />
                <Route path="/mis-articulos/estadisticas" element={<RoleGuard><AuthorStatsPage /></RoleGuard>} />
                <Route path="/mis-articulos" element={<MyArticlesPage/>} />
                <Route path="/proyectos" element={<ProjectsListPage />} />
                <Route path="/proyectos/:projectId" element={<ProjectDetailPage />} />
                <Route path="/mis-inscripciones" element={<MyEnrollmentsPage />} />
                <Route path="/mis-proyectos" element={<MyProjectsPage />} />
                <Route path="/mis-proyectos/crear" element={<CreateProjectPage />} />
                <Route path="/mis-proyectos/editar/:projectId" element={<CreateProjectPage />} />
                <Route path="/mis-proyectos/estadisticas" element={<ProjectStatsPage />} />
            </Routes>
        </BrowserRouter>
    );
}
