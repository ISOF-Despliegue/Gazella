import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentSession } from '../services/auth';

const PUBLIC_PATHS = ['/', '/login', '/registro', '/verificar', '/auth/callback', '/home'];
const CURRENT_ROUTE_KEY = 'gazella.currentRoute';
const PREVIOUS_ROUTE_KEY = 'gazella.previousRoute';

type BackButtonProps = {
    fallbackPath?: string;
    label?: string;
    preferFallback?: boolean;
};

function isPublicPath(path: string) {
    return PUBLIC_PATHS.some((publicPath) => path === publicPath || path.startsWith(`${publicPath}?`));
}

function getTrackedPreviousRoute(currentRoute: string) {
    if (typeof window === 'undefined') {
        return null;
    }

    const previousRoute = window.sessionStorage.getItem(PREVIOUS_ROUTE_KEY);

    if (!previousRoute || previousRoute === currentRoute) {
        return null;
    }

    return previousRoute;
}

export function BackButton({ fallbackPath = '/dashboard', label = 'Regresar', preferFallback = false }: BackButtonProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        const session = getCurrentSession();
        const currentRoute = `${location.pathname}${location.search}${location.hash}`;
        const previousRoute = getTrackedPreviousRoute(currentRoute);
        const safeFallback = session && isPublicPath(fallbackPath)
            ? '/dashboard'
            : fallbackPath;

        if (!preferFallback && previousRoute && !(session && isPublicPath(previousRoute))) {
            navigate(previousRoute);
            return;
        }

        navigate(safeFallback);
    };

    return (
        <button
            type="button"
            onClick={handleBack}
            aria-label={label}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#111827',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                padding: '8px 12px',
                width: 'fit-content',
            }}
        >
            <span aria-hidden="true" style={{ fontSize: '18px', lineHeight: 1 }}>{'<'}</span>
            {label}
        </button>
    );
}

export function trackCurrentRoute(path: string) {
    if (typeof window === 'undefined') {
        return;
    }

    const currentRoute = window.sessionStorage.getItem(CURRENT_ROUTE_KEY);

    if (currentRoute && currentRoute !== path) {
        window.sessionStorage.setItem(PREVIOUS_ROUTE_KEY, currentRoute);
    }

    window.sessionStorage.setItem(CURRENT_ROUTE_KEY, path);
}
