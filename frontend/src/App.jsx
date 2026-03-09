import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HiMenu } from 'react-icons/hi';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';

export default function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <Router>
            <div className="app-layout">
                <div className="mobile-header">
                    <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
                        <HiMenu />
                    </button>
                    <span className="mobile-brand">HRMS Lite</span>
                    <div style={{ width: '40px' }}></div> {/* Spacer for symmetry */}
                </div>

                <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

                {isSidebarOpen && (
                    <div className="sidebar-overlay" onClick={closeSidebar} />
                )}

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/employees" element={<Employees />} />
                        <Route path="/attendance" element={<Attendance />} />
                    </Routes>
                </main>
            </div>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#1c1c2e',
                        color: '#e8e8f0',
                        border: '1px solid #2a2a40',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                    },
                    success: {
                        iconTheme: { primary: '#22c55e', secondary: '#1c1c2e' },
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#1c1c2e' },
                    },
                }}
            />
        </Router>
    );
}
