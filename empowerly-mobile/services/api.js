import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/theme';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Request interceptor — attach token from AsyncStorage
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.multiRemove(['token', 'user']);
        }
        return Promise.reject(error);
    }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    login: (data) => api.post('/auth/login', data),
    resendOTP: (email) => api.post('/auth/resend-otp', { email }),
};

// ─── Attendance ────────────────────────────────────────────────────────────────
export const attendanceAPI = {
    checkIn: () => api.post('/attendance/checkin'),
    checkOut: () => api.post('/attendance/checkout'),
    getTodayAttendance: () => api.get('/attendance/today'),
    getMyAttendance: () => api.get('/attendance/history'),
    getHistory: () => api.get('/attendance/history'),
    getToday: () => api.get('/attendance/today'),
    getStatus: () => api.get('/attendance/status'),
    getMonthly: (year, month) => api.get(`/attendance/month/${year}/${month}`),
    getReport: (startDate, endDate) => api.get('/attendance/report', { params: { startDate, endDate } }),
    getMonthlyStats: (year, month) => api.get('/attendance/stats/monthly', { params: { year, month } }),
    getAllAttendance: () => api.get('/attendance/all'),
};

// ─── Leave ─────────────────────────────────────────────────────────────────────
export const leaveAPI = {
    apply: (data) => api.post('/leave/apply', data),
    getMyLeaves: () => api.get('/leave/my-leaves'),
    getPending: () => api.get('/leave/pending'),
    getAll: () => api.get('/leave/all'),
    approve: (leaveId, remarks) => api.post(`/leave/approve/${leaveId}`, { remarks }),
    reject: (leaveId, remarks) => api.post(`/leave/reject/${leaveId}`, { remarks }),
    revoke: (leaveId) => api.delete(`/leave/revoke/${leaveId}`),
    getById: (leaveId) => api.get(`/leave/${leaveId}`),
    getBalance: () => api.get('/leave/balance'),
    getBalanceForYear: (year) => api.get(`/leave/balance/${year}`),
    getReport: (year) => api.get(`/leave/report/${year}`),
};

// ─── Chat ──────────────────────────────────────────────────────────────────────
export const chatAPI = {
    sendMessage: (receiverId, content) => api.post('/chat/send', { receiverId, content }),
    getConversations: () => api.get('/chat/conversations'),
    getMessages: (conversationId) => api.get(`/chat/messages/${conversationId}/all`),
    markAsRead: (conversationId) => api.post(`/chat/read/${conversationId}`),
    getUnreadCount: () => api.get('/chat/unread-count'),
    deleteMessageForMe: (messageId) => api.delete(`/chat/messages/${messageId}/delete-for-me`),
    deleteMessageForEveryone: (messageId) => api.delete(`/chat/messages/${messageId}/delete-for-everyone`),
    clearAllChats: () => api.delete('/chat/clear-all'),
};

// ─── Users ─────────────────────────────────────────────────────────────────────
export const userAPI = {
    searchUsers: (query) => api.get('/users/search', { params: { query } }),
    getUsersByDepartment: (department) => api.get(`/users/department/${department}`),
    getAllUsers: () => api.get('/users/all'),
};

// ─── Chatbot ───────────────────────────────────────────────────────────────────
export const chatbotAPI = {
    ask: (message) => api.post('/chatbot/ask', { message }),
};

// ─── Meetings ──────────────────────────────────────────────────────────────────
export const meetingAPI = {
    create: (data) => api.post('/meetings', data),
    getAll: () => api.get('/meetings'),
    getUpcoming: () => api.get('/meetings/upcoming'),
    getById: (id) => api.get(`/meetings/${id}`),
    join: (id) => api.post(`/meetings/${id}/join`),
    leave: (id) => api.post(`/meetings/${id}/leave`),
    end: (id) => api.delete(`/meetings/${id}`),
};

// ─── Performance Reviews ────────────────────────────────────────────────────────
export const performanceReviewAPI = {
    createCycle: (data) => api.post('/reviews/cycles', data),
    getAllCycles: () => api.get('/reviews/cycles'),
    publishCycle: (id) => api.put(`/reviews/cycles/${id}/publish`),
    closeCycle: (id) => api.put(`/reviews/cycles/${id}/close`),
    deleteCycle: (id) => api.delete(`/reviews/cycles/${id}`),
    getMyReview: (cycleId) => api.get(`/reviews/my-review/${cycleId}`),
    submitSelfAssessment: (data) => api.post('/reviews/self-assessment', data),
    getReviewsByCycle: (cycleId) => api.get(`/reviews/cycle/${cycleId}`),
    evaluateReview: (id, data) => api.put(`/reviews/${id}/evaluate`, data),
    approveReview: (id) => api.put(`/reviews/${id}/approve`),
    rejectReview: (id) => api.put(`/reviews/${id}/reject`),
    getAllReviews: () => api.get('/reviews/all'),
};

// ─── Payroll ───────────────────────────────────────────────────────────────────
export const payrollAPI = {
    createPayroll: (data) => api.post('/payroll', data),
    generateEntries: (payrollId) => api.post(`/payroll/${payrollId}/generate`),
    updateEntry: (entryId, data) => api.put(`/payroll/entry/${entryId}`, data),
    submitForApproval: (payrollId) => api.post(`/payroll/${payrollId}/submit`),
    getAllPayrolls: () => api.get('/payroll'),
    getPayrollDetails: (payrollId) => api.get(`/payroll/${payrollId}`),
    getPayrollEntries: (payrollId) => api.get(`/payroll/${payrollId}/entries`),
    approvePayroll: (payrollId, data) => api.post(`/payroll/${payrollId}/approve`, data),
    rejectPayroll: (payrollId, data) => api.post(`/payroll/${payrollId}/reject`, data),
    deletePayroll: (payrollId) => api.delete(`/payroll/${payrollId}`),
    getMyPayslips: () => api.get('/payroll/payslips/my'),
    getPayslip: (month, year) => api.get(`/payroll/payslips/${month}/${year}`),
    getSalaryStructure: (employeeId) => api.get(`/payroll/salary-structure/${employeeId}`),
    getAllSalaryStructures: () => api.get('/payroll/salary-structures'),
};

// ─── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
};

// ─── Documents ─────────────────────────────────────────────────────────────────
export const documentAPI = {
    generateOfferLetter: (data) => api.post('/documents/offer-letter', data),
    generateAppointmentLetter: (data) => api.post('/documents/appointment-letter', data),
    getHistory: () => api.get('/documents/history'),
    deleteDocument: (type, id) => api.delete(`/documents/${type}/${id}`),
};

// ─── Skills ────────────────────────────────────────────────────────────────────
export const skillAPI = {
    generateSuggestions: () => api.post('/skills/generate'),
    getMySuggestions: () => api.get('/skills/my-suggestions'),
    getActiveSuggestion: () => api.get('/skills/active'),
    markSkillCompleted: (skill) => api.put('/skills/complete', { skill }),
};

// ─── Motivation ────────────────────────────────────────────────────────────────
export const motivationAPI = {
    createPost: (data) => api.post('/motivation', data),
    getAllPosts: () => api.get('/motivation'),
    getMyPosts: () => api.get('/motivation/my-posts'),
    toggleLike: (postId) => api.post(`/motivation/${postId}/like`),
    addComment: (postId, content) => api.post(`/motivation/${postId}/comment`, { content }),
    deletePost: (postId) => api.delete(`/motivation/${postId}`),
};

// ─── Security ──────────────────────────────────────────────────────────────────
export const securityAPI = {
    getSecurityStats: () => api.get('/security/stats'),
    getActiveAlerts: () => api.get('/security/alerts/active'),
    getAllAlerts: () => api.get('/security/alerts'),
    resolveAlert: (alertId, resolution) => api.put(`/security/alerts/${alertId}/resolve`, { resolution }),
};

// ─── Feedback ──────────────────────────────────────────────────────────────────
export const feedbackAPI = {
    submitFeedback: (data) => api.post('/feedback', data),
    getAllFeedback: () => api.get('/feedback'),
    getPublicFeedback: () => api.get('/feedback/public'),
    updateStatus: (id, status) => api.put(`/feedback/${id}/status`, { status }),
    getStatistics: () => api.get('/feedback/statistics'),
};

// ─── Audit Logs ────────────────────────────────────────────────────────────────
export const auditLogAPI = {
    getAllLogs: (params) => api.get('/audit-logs', { params }),
    searchLogs: (params) => api.get('/audit-logs/search', { params }),
    getStats: (params) => api.get('/audit-logs/stats', { params }),
};

export default api;
