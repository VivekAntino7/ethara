import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Employee API ────────────────────────────────────────────────

export const employeeApi = {
    list: (params = {}) => api.get('/employees', { params }),
    get: (employeeId) => api.get(`/employees/${employeeId}`),
    create: (data) => api.post('/employees', data),
    delete: (employeeId) => api.delete(`/employees/${employeeId}`),
    departments: () => api.get('/employees/departments/list'),
};

// ── Attendance API ──────────────────────────────────────────────

export const attendanceApi = {
    mark: (data) => api.post('/attendance', data),
    getByEmployee: (employeeId, params = {}) =>
        api.get(`/attendance/${employeeId}`, { params }),
    getAll: (params = {}) => api.get('/attendance', { params }),
    summary: () => api.get('/attendance/summary/all'),
};

export default api;
