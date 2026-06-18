
export interface EngagementRingProps {
    rate: number;
    size?: number;
    strokeWidth?: number;
}

export const EngagementRing = ({ rate, size = 120, strokeWidth = 10 }: EngagementRingProps) => {
    const normalizedRate = Math.min(1, Math.max(0, rate));
    const percentage = normalizedRate * 100;
    
    const center = size / 2;
    const radius = center - (strokeWidth / 2); 
    const circumference = 2 * Math.PI * radius; 
    
    const offset = circumference - (normalizedRate * circumference);

    return (
        <div style={{ position: "relative", width: `${size}px`, height: `${size}px`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg 
                width={size} 
                height={size} 
                viewBox={`0 0 ${size} ${size}`} 
                style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} // Rotamos para que empiece arriba
            >
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                />
                
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#bbf7d0"
                    strokeWidth={strokeWidth * 0.8}
                    strokeLinecap="round"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        transition: "stroke-dashoffset 0.5s ease-in-out"
                    }}
                />
            </svg>
            
            <div style={{ position: "absolute", textAlign: "center" }}>
                <div style={{ fontSize: `${size * 0.2}px`, fontWeight: "800", color: "#111827" }}>
                    {percentage.toFixed(1)}%
                </div>
                <div style={{ fontSize: `${size * 0.1}px`, color: "#6b7280", marginTop: "2px" }}>
                    Interacción
                </div>
            </div>
        </div>
    );
};
