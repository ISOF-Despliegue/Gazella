import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { VerifyCodePage } from "../pages/VerifyCodePage";
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

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/registro" element={<RegisterPage />} />
                <Route path="/verificar" element={<VerifyCodePage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="/perfil/editar" element={<EditProfilePage />} />
                <Route path="/articulos" element={<ArticlesListPage />} />
                <Route path="/nuevo-articulo" element={<WriteArticlePage />} />
                <Route path="/articulo/:articleId" element={<ReadArticlePage />} />
                <Route path="/editor/articulos" element={<PendingArticlesPage />} />
                <Route path="/editor/articulos/:articleId/revision" element={<ReviewArticlePage />} />
                <Route path="/proyectos" element={<ProjectsListPage />} />
                <Route path="/proyectos/:projectId" element={<ProjectDetailPage />} />
                <Route path="/mis-inscripciones" element={<MyEnrollmentsPage />} />
                <Route path="/mis-proyectos" element={<MyProjectsPage />} />
                <Route path="/mis-proyectos/crear" element={<CreateProjectPage />} />
                <Route path="/mis-proyectos/editar/:projectId" element={<CreateProjectPage />} />
            </Routes>
        </BrowserRouter>
    );
}