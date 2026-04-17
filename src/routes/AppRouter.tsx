import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { VerifyCodePage } from "../pages/VerifyCodePage";
import { DashboardPage } from "../pages/DashboardPage";
import { ArticlesListPage } from "../pages/ArticlesListPage";
export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/registro" element={<RegisterPage />} />
                <Route path="/verificar" element={<VerifyCodePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/articulos" element={<ArticlesListPage />} />
            </Routes>
        </BrowserRouter>
    );
}