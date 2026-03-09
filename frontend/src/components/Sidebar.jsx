import { NavLink } from 'react-router-dom';
import { HiOutlineViewGrid, HiOutlineUsers, HiOutlineCalendar } from 'react-icons/hi';

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <h1>HRMS Lite</h1>
                <p>Human Resource Management</p>
            </div>
            <nav className="sidebar-nav">
                <div className="sidebar-nav-label">Main Menu</div>
                <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon"><HiOutlineViewGrid /></span>
                    Dashboard
                </NavLink>
                <NavLink to="/employees" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon"><HiOutlineUsers /></span>
                    Employees
                </NavLink>
                <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon"><HiOutlineCalendar /></span>
                    Attendance
                </NavLink>
            </nav>
            <div style={{ padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    HRMS Lite v1.0
                </div>
            </div>
        </aside>
    );
}
