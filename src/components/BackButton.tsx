import { useNavigate } from 'react-router-dom';
import { getCurrentSession } from '../services/auth';

type BackButtonProps = {
    fallbackPath?: string;
    label?: string;
};

export function BackButton({ fallbackPath = '/home', label = 'Regresar' }: BackButtonProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        const session = getCurrentSession();
        const safeFallback = session && ['/login', '/registro', '/verificar', '/home'].includes(fallbackPath)
            ? '/dashboard'
            : fallbackPath;

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
