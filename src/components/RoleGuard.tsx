import { Navigate } from "react-router-dom";
import { getCurrentSession, hasAnyRole } from "../services/auth";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export function RoleGuard({ children, allowedRoles = [] }: Readonly<RoleGuardProps>) {
    const session = getCurrentSession();

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !hasAnyRole(session, allowedRoles)) {
        return <Navigate to="/dashboard" replace state={{ notice: "No tienes permisos para abrir ese panel." }} />;
    }

    return <>{children}</>;
}
