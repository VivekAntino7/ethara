import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';

export default function App() {
    return (
        <Router>
            <div className="app-layout">
                <Sidebar />
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
