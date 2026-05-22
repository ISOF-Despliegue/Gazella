import { type Project } from '../types/project';

interface ProjectCardProps {
    project: Project;
    onEnroll?: (project: Project) => void;
}

export function ProjectCard({ project, onEnroll }: ProjectCardProps) {
    return (
        <div style={{
            display: 'flex',
            gap: '12px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '12px',
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                color: '#6b7280',
                textAlign: 'center',
                padding: '4px',
            }}>Imagen alusiva al proyecto</div>
            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>{project.title}</h3>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Descripción: {project.description}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Ubicación: {project.location}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Fecha: {project.date}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>Voluntarios: {project.volunteersEnrolled} / {project.volunteersMax}</p>
                    <button
                    onClick={() => onEnroll?.(project)}
                    style={{
                        fontSize: '12px',
                        padding: '4px 12px',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                    }}>Inscribirme</button>
                </div>
            </div>
        </div>
    );
}
