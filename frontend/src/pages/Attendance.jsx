import { useState, useEffect } from 'react';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { LoadingState, EmptyState, ErrorBanner, StatusBadge } from '../components/StatusComponents';
import { employeeApi, attendanceApi } from '../api';

export default function Attendance() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [marking, setMarking] = useState(false);

    // Date filter for viewing records
    const [filterStart, setFilterStart] = useState('');
    const [filterEnd, setFilterEnd] = useState('');

    useEffect(() => {
        const loadEmployees = async () => {
            setLoading(true);
            try {
                const res = await employeeApi.list();
                setEmployees(res.data);
                if (res.data.length > 0) {
                    setSelectedEmployee(res.data[0].employee_id);
                }
            } catch (err) {
                setError(err.response?.data?.detail || 'Failed to load employees');
            } finally {
                setLoading(false);
            }
        };
        loadEmployees();
    }, []);

    // Fetch attendance records when employee changes
    useEffect(() => {
        if (!selectedEmployee) return;
        fetchRecords();
    }, [selectedEmployee]);

    const fetchRecords = async () => {
        if (!selectedEmployee) return;
        setRecordsLoading(true);
        try {
            const params = {};
            if (filterStart) params.start_date = filterStart;
            if (filterEnd) params.end_date = filterEnd;
            const res = await attendanceApi.getByEmployee(selectedEmployee, params);
            setRecords(res.data);
        } catch (err) {
            toast.error('Failed to load attendance records');
        } finally {
            setRecordsLoading(false);
        }
    };

    const handleMark = async (status) => {
        if (!selectedEmployee) {
            toast.error('Please select an employee');
            return;
        }
        setMarking(true);
        try {
            await attendanceApi.mark({
                employee_id: selectedEmployee,
                date: attendanceDate,
                status: status,
            });
            toast.success(`Marked ${status} for ${attendanceDate}`);
            fetchRecords();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to mark attendance');
        } finally {
            setMarking(false);
        }
    };

    const applyFilter = () => {
        fetchRecords();
    };

    const clearFilter = () => {
        setFilterStart('');
        setFilterEnd('');
        // Fetch without filters
        setRecordsLoading(true);
        attendanceApi.getByEmployee(selectedEmployee)
            .then(res => setRecords(res.data))
            .catch(() => toast.error('Failed to reload'))
            .finally(() => setRecordsLoading(false));
    };

    const selectedEmpName = employees.find(e => e.employee_id === selectedEmployee)?.full_name || '';

    if (loading) return <LoadingState message="Loading attendance module..." />;

    return (
        <div>
            <PageHeader title="Attendance" subtitle="Mark and track daily attendance" />

            {error && <ErrorBanner message={error} />}

            {employees.length === 0 ? (
                <EmptyState
                    icon="👥"
                    title="No employees found"
                    message="Add employees first to start tracking attendance"
                />
            ) : (
                <>
                    {/* Mark Attendance Card */}
                    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                        <h3 style={{ marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>Mark Attendance</h3>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
                                <label className="form-label" htmlFor="att-employee">Employee</label>
                                <select
                                    id="att-employee"
                                    className="form-input form-select"
                                    value={selectedEmployee}
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                >
                                    {employees.map(emp => (
                                        <option key={emp.employee_id} value={emp.employee_id}>
                                            {emp.employee_id} — {emp.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0, flex: '0 1 180px' }}>
                                <label className="form-label" htmlFor="att-date">Date</label>
                                <input
                                    type="date"
                                    id="att-date"
                                    className="form-input"
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleMark('Present')}
                                    disabled={marking}
                                    id="mark-present-btn"
                                >
                                    <HiOutlineCheckCircle /> Present
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleMark('Absent')}
                                    disabled={marking}
                                    id="mark-absent-btn"
                                >
                                    <HiOutlineXCircle /> Absent
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Records */}
                    <div className="table-container">
                        <div className="table-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3>Attendance Records — {selectedEmpName}</h3>
                                <span className="badge badge-department">{records.length} records</span>
                            </div>
                            {/* Date Filter */}
                            <div className="filter-bar">
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>From</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={filterStart}
                                        onChange={(e) => setFilterStart(e.target.value)}
                                        style={{ height: '36px', fontSize: 'var(--font-size-sm)' }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>To</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={filterEnd}
                                        onChange={(e) => setFilterEnd(e.target.value)}
                                        style={{ height: '36px', fontSize: 'var(--font-size-sm)' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-2)', alignSelf: 'flex-end' }}>
                                    <button className="btn btn-sm btn-primary" onClick={applyFilter} id="filter-btn">Filter</button>
                                    {(filterStart || filterEnd) && (
                                        <button className="btn btn-sm btn-ghost" onClick={clearFilter}>Clear</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {recordsLoading ? (
                            <LoadingState message="Loading records..." />
                        ) : records.length === 0 ? (
                            <EmptyState
                                icon="📅"
                                title="No attendance records"
                                message={filterStart || filterEnd ? 'No records found for the selected date range' : 'No attendance has been marked for this employee yet'}
                            />
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Day</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map(r => {
                                            const d = new Date(r.date + 'T00:00:00');
                                            return (
                                                <tr key={r.id}>
                                                    <td style={{ fontWeight: 500 }}>{d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                                    <td style={{ color: 'var(--color-text-secondary)' }}>{d.toLocaleDateString('en-US', { weekday: 'long' })}</td>
                                                    <td><StatusBadge status={r.status} /></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
