import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentSession } from '../services/auth';

const PUBLIC_PATHS = ['/', '/login', '/registro', '/verificar', '/auth/callback', '/home'];
const ROUTE_STACK_KEY = 'gazella.routeStack';
const MAX_STACK_SIZE = 50;

type BackButtonProps = {
    fallbackPath?: string;
    label?: string;
    preferFallback?: boolean;
};

function isPublicPath(path: string) {
    return PUBLIC_PATHS.some((publicPath) => path === publicPath || path.startsWith(`${publicPath}?`));
}

function getRouteStack() {
    if (typeof window === 'undefined') {
        return [] as string[];
    }

    const raw = window.sessionStorage.getItem(ROUTE_STACK_KEY);
    if (!raw) {
        return [] as string[];
    }

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.filter((route) => typeof route === 'string');
        }
    } catch {
        // ignore invalid stack data
    }

    return [] as string[];
}

function setRouteStack(stack: string[]) {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.setItem(ROUTE_STACK_KEY, JSON.stringify(stack));
}

export function BackButton({ fallbackPath = '/dashboard', label = 'Regresar', preferFallback = false }: BackButtonProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        const session = getCurrentSession();
        const safeFallback = session && isPublicPath(fallbackPath)
            ? '/dashboard'
            : fallbackPath;

        if (preferFallback) {
            navigate(safeFallback);
            return;
        }

        const routeStack = getRouteStack();
        if (routeStack.length <= 1) {
            navigate(safeFallback);
            return;
        }

        // Pop current route and use the previous page in the stack.
        routeStack.pop();
        const previousRoute = routeStack.pop();
        if (!previousRoute || (session && isPublicPath(previousRoute))) {
            navigate(safeFallback);
            return;
        }

        setRouteStack(routeStack);
        navigate(previousRoute);
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

    const routeStack = getRouteStack();
    const currentRoute = routeStack[routeStack.length - 1];
    if (currentRoute !== path) {
        routeStack.push(path);
        if (routeStack.length > MAX_STACK_SIZE) {
            routeStack.splice(0, routeStack.length - MAX_STACK_SIZE);
        }
        setRouteStack(routeStack);
    }
}
