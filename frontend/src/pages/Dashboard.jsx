import { useState, useEffect } from 'react';
import { HiOutlineUsers, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineCalendar } from 'react-icons/hi';
import PageHeader from '../components/PageHeader';
import { LoadingState, ErrorBanner, StatusBadge, DepartmentBadge, EmptyState } from '../components/StatusComponents';
import { employeeApi, attendanceApi } from '../api';

export default function Dashboard() {
    const [employees, setEmployees] = useState([]);
    const [summary, setSummary] = useState([]);
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const today = new Date().toISOString().split('T')[0];

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [empRes, summaryRes, attendanceRes] = await Promise.all([
                employeeApi.list(),
                attendanceApi.summary(),
                attendanceApi.getAll({ date: today }),
            ]);
            setEmployees(empRes.data);
            setSummary(summaryRes.data);
            setRecentAttendance(attendanceRes.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const totalEmployees = employees.length;
    const presentToday = recentAttendance.filter(a => a.status === 'Present').length;
    const absentToday = recentAttendance.filter(a => a.status === 'Absent').length;
    const unmarked = totalEmployees - presentToday - absentToday;

    if (loading) return <LoadingState message="Loading dashboard..." />;

    return (
        <div>
            <PageHeader
                title="Dashboard"
                subtitle={`Welcome back! Here's an overview for ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
            />

            {error && <ErrorBanner message={error} onRetry={fetchData} />}

            <div className="stats-grid">
                <div className="card stat-card accent">
                    <div className="stat-card-icon"><HiOutlineUsers /></div>
                    <div className="stat-card-value">{totalEmployees}</div>
                    <div className="stat-card-label">Total Employees</div>
                </div>
                <div className="card stat-card success">
                    <div className="stat-card-icon"><HiOutlineCheckCircle /></div>
                    <div className="stat-card-value">{presentToday}</div>
                    <div className="stat-card-label">Present Today</div>
                </div>
                <div className="card stat-card danger">
                    <div className="stat-card-icon"><HiOutlineXCircle /></div>
                    <div className="stat-card-value">{absentToday}</div>
                    <div className="stat-card-label">Absent Today</div>
                </div>
                <div className="card stat-card warning">
                    <div className="stat-card-icon"><HiOutlineCalendar /></div>
                    <div className="stat-card-value">{unmarked}</div>
                    <div className="stat-card-label">Unmarked Today</div>
                </div>
            </div>

            {/* Attendance Summary Table */}
            <div className="table-container" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="table-header">
                    <h3>Attendance Summary</h3>
                </div>
                {summary.length === 0 ? (
                    <EmptyState icon="📊" title="No data yet" message="Add employees and mark attendance to see summary data" />
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Name</th>
                                    <th>Department</th>
                                    <th>Present Days</th>
                                    <th>Absent Days</th>
                                    <th>Total Days</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.map(s => (
                                    <tr key={s.employee_id}>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.employee_id}</td>
                                        <td>{s.full_name}</td>
                                        <td><DepartmentBadge department={s.department} /></td>
                                        <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>{s.total_present}</td>
                                        <td style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{s.total_absent}</td>
                                        <td style={{ fontWeight: 600 }}>{s.total_days}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Today's Attendance */}
            <div className="table-container">
                <div className="table-header">
                    <h3>Today's Attendance</h3>
                    <span className="badge badge-department">{today}</span>
                </div>
                {recentAttendance.length === 0 ? (
                    <EmptyState icon="📅" title="No attendance marked today" message="Go to the Attendance page to mark today's attendance" />
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Employee Name</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAttendance.map(a => (
                                    <tr key={a.id}>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{a.employee_id}</td>
                                        <td>{a.employee_name}</td>
                                        <td><StatusBadge status={a.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
