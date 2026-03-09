export default function PageHeader({ title, subtitle, children }) {
    return (
        <div className="page-header">
            <div className="page-header-info">
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
            </div>
            {children && <div className="page-header-actions">{children}</div>}
        </div>
    );
}
