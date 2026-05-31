import { useState } from "react";
import { getSafeImageUrl } from "../utils/imageUrl";
import { assets } from "../assets/assets";

type PlaceholderVariant = "avatar" | "cover";

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    src: string | null | undefined;
    alt: string;
    variant?: PlaceholderVariant;
    placeholderStyle?: React.CSSProperties;
}

const PLACEHOLDER_STYLES: Record<PlaceholderVariant, React.CSSProperties> = {
    avatar: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: 0.4,
        padding: "12px",
    },
    cover: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: 0.3,
        padding: "8px",
    },
};

const PLACEHOLDER_ASSETS: Record<PlaceholderVariant, string> = {
    avatar: assets.gorrito,
    cover: assets.arbol,
};

/**
 * SafeImage — renders an image with automatic fallback.
 *
 * Falls back to a local placeholder when:
 * - src is empty, null or undefined
 * - src has an origin not in the allowed media service whitelist
 * - src is valid but the image fails to load (network error, 404, etc.)
 */
export function SafeImage({
    src,
    alt,
    variant = "cover",
    style,
    placeholderStyle,
    ...rest
}: SafeImageProps) {
    const safeUrl = getSafeImageUrl(src);
    const [hasError, setHasError] = useState(false);

    const isPlaceholder = !safeUrl || hasError;
    const placeholder = PLACEHOLDER_ASSETS[variant];
    const defaultPlaceholderStyle = PLACEHOLDER_STYLES[variant];

    if (isPlaceholder) {
        return (
            <img
                src={placeholder}
                alt={alt}
                style={{ ...defaultPlaceholderStyle, ...placeholderStyle }}
                {...rest}
            />
        );
    }

    return (
        <img
            src={safeUrl}
            alt={alt}
            style={style}
            onError={() => setHasError(true)}
            {...rest}
        />
    );
}