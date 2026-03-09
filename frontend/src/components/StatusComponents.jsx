export function LoadingState({ message = 'Loading...' }) {
    return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">{message}</p>
        </div>
    );
}

export function EmptyState({ icon = '📋', title, message }) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">{icon}</div>
            <h4>{title}</h4>
            <p>{message}</p>
        </div>
    );
}

export function ErrorBanner({ message, onRetry }) {
    return (
        <div className="error-banner">
            <span>⚠️</span>
            <span style={{ flex: 1 }}>{message}</span>
            {onRetry && (
                <button className="btn btn-sm btn-ghost" onClick={onRetry}>
                    Retry
                </button>
            )}
        </div>
    );
}

export function StatusBadge({ status }) {
    const isPresent = status === 'Present';
    return (
        <span className={`badge ${isPresent ? 'badge-present' : 'badge-absent'}`}>
            <span className="badge-dot"></span>
            {status}
        </span>
    );
}

export function DepartmentBadge({ department }) {
    return <span className="badge badge-department">{department}</span>;
}
