import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { LoadingState, EmptyState, ErrorBanner, DepartmentBadge } from '../components/StatusComponents';
import { employeeApi } from '../api';

const INITIAL_FORM = { employee_id: '', full_name: '', email: '', department: '' };

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await employeeApi.list({ search: search || undefined });
            setEmployees(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, [search]);

    const validateForm = () => {
        const errors = {};
        if (!formData.employee_id.trim()) errors.employee_id = 'Employee ID is required';
        if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
        if (!formData.department.trim()) errors.department = 'Department is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmitting(true);
        try {
            await employeeApi.create(formData);
            toast.success('Employee added successfully!');
            setShowAddModal(false);
            setFormData(INITIAL_FORM);
            setFormErrors({});
            fetchEmployees();
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (typeof detail === 'string') {
                toast.error(detail);
            } else if (Array.isArray(detail)) {
                detail.forEach(d => toast.error(d.msg || JSON.stringify(d)));
            } else {
                toast.error('Failed to add employee');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!showDeleteModal) return;
        setSubmitting(true);
        try {
            await employeeApi.delete(showDeleteModal.employee_id);
            toast.success('Employee deleted successfully');
            setShowDeleteModal(null);
            fetchEmployees();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to delete employee');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
    };

    return (
        <div>
            <PageHeader title="Employees" subtitle="Manage your workforce">
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)} id="add-employee-btn">
                    <HiOutlinePlus /> Add Employee
                </button>
            </PageHeader>

            {error && <ErrorBanner message={error} onRetry={fetchEmployees} />}

            <div className="table-container">
                <div className="table-header">
                    <h3>All Employees ({employees.length})</h3>
                    <div className="search-bar">
                        <HiOutlineSearch className="search-icon" />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by name, ID, or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            id="employee-search"
                        />
                    </div>
                </div>

                {loading ? (
                    <LoadingState message="Loading employees..." />
                ) : employees.length === 0 ? (
                    <EmptyState
                        icon="👥"
                        title={search ? 'No results found' : 'No employees yet'}
                        message={search ? `No employees match "${search}"` : 'Click "Add Employee" to add your first employee'}
                    />
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Added On</th>
                                    <th style={{ width: '60px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => (
                                    <tr key={emp.employee_id}>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{emp.employee_id}</td>
                                        <td style={{ fontWeight: 500 }}>{emp.full_name}</td>
                                        <td style={{ color: 'var(--color-text-secondary)' }}>{emp.email}</td>
                                        <td><DepartmentBadge department={emp.department} /></td>
                                        <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                            {new Date(emp.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <button
                                                className="btn-icon"
                                                onClick={() => setShowDeleteModal(emp)}
                                                title="Delete employee"
                                                id={`delete-${emp.employee_id}`}
                                            >
                                                <HiOutlineTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Employee Modal */}
            <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormErrors({}); setFormData(INITIAL_FORM); }} title="Add New Employee">
                <form onSubmit={handleAdd}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="emp-id">Employee ID</label>
                        <input
                            type="text"
                            id="emp-id"
                            className={`form-input ${formErrors.employee_id ? 'error' : ''}`}
                            placeholder="e.g. EMP001"
                            value={formData.employee_id}
                            onChange={(e) => handleFormChange('employee_id', e.target.value)}
                        />
                        {formErrors.employee_id && <div className="form-error">{formErrors.employee_id}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="emp-name">Full Name</label>
                        <input
                            type="text"
                            id="emp-name"
                            className={`form-input ${formErrors.full_name ? 'error' : ''}`}
                            placeholder="e.g. John Doe"
                            value={formData.full_name}
                            onChange={(e) => handleFormChange('full_name', e.target.value)}
                        />
                        {formErrors.full_name && <div className="form-error">{formErrors.full_name}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="emp-email">Email Address</label>
                        <input
                            type="email"
                            id="emp-email"
                            className={`form-input ${formErrors.email ? 'error' : ''}`}
                            placeholder="e.g. john@company.com"
                            value={formData.email}
                            onChange={(e) => handleFormChange('email', e.target.value)}
                        />
                        {formErrors.email && <div className="form-error">{formErrors.email}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="emp-dept">Department</label>
                        <input
                            type="text"
                            id="emp-dept"
                            className={`form-input ${formErrors.department ? 'error' : ''}`}
                            placeholder="e.g. Engineering"
                            value={formData.department}
                            onChange={(e) => handleFormChange('department', e.target.value)}
                        />
                        {formErrors.department && <div className="form-error">{formErrors.department}</div>}
                    </div>
                    <div className="modal-footer" style={{ padding: 0, paddingTop: 'var(--space-2)' }}>
                        <button type="button" className="btn btn-ghost" onClick={() => { setShowAddModal(false); setFormErrors({}); setFormData(INITIAL_FORM); }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Employee'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!showDeleteModal} onClose={() => setShowDeleteModal(null)} title="Delete Employee">
                <div className="confirm-content">
                    <div className="confirm-icon">🗑️</div>
                    <h4>Are you sure?</h4>
                    <p>
                        This will permanently delete <strong>{showDeleteModal?.full_name}</strong> ({showDeleteModal?.employee_id})
                        and all their attendance records.
                    </p>
                    <div className="confirm-actions">
                        <button className="btn btn-ghost" onClick={() => setShowDeleteModal(null)}>Cancel</button>
                        <button className="btn btn-danger" onClick={handleDelete} disabled={submitting}>
                            {submitting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
