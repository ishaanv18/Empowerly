import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Check if it's a deleted user error
            const errorMessage = error.response?.data?.error;
            if (errorMessage && errorMessage.includes('deleted')) {
                alert('Your account has been deleted by an administrator. You will be logged out.');
            }

            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    login: (data) => api.post('/auth/login', data),
    resendOTP: (email) => api.post('/auth/resend-otp', { email }),
};

// Attendance APIs
export const attendanceAPI = {
    checkIn: () => api.post('/attendance/checkin'),
    checkOut: () => api.post('/attendance/checkout'),
    getTodayAttendance: () => api.get('/attendance/today'),
    getMyAttendance: () => api.get('/attendance/history'),
    getHistory: () => api.get('/attendance/history'),
    getToday: () => api.get('/attendance/today'),
    getStatus: () => api.get('/attendance/status'),
    getMonthly: (year, month) => api.get(`/attendance/month/${year}/${month}`),
    getReport: (startDate, endDate) => api.get('/attendance/report', {
        params: { startDate, endDate }
    }),
    getMonthlyStats: (year, month) => api.get('/attendance/stats/monthly', {
        params: { year, month }
    }),
    getAllAttendance: () => api.get('/attendance/all'),
};

// Leave APIs
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

// Chat APIs
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

// User Search APIs
export const userAPI = {
    searchUsers: (query) => api.get('/users/search', { params: { query } }),
    getUsersByDepartment: (department) => api.get(`/users/department/${department}`),
    getAllUsers: () => api.get('/users/all'),
};

// Chatbot APIs
export const chatbotAPI = {
    ask: (message) => api.post('/chatbot/ask', { message }),
};

// Meeting APIs
export const meetingAPI = {
    create: (data) => api.post('/meetings', data),
    getAll: () => api.get('/meetings'),
    getUpcoming: () => api.get('/meetings/upcoming'),
    getById: (id) => api.get(`/meetings/${id}`),
    getByLink: (meetingLink) => api.get(`/meetings/link/${meetingLink}`),
    invite: (id, userIds) => api.post(`/meetings/${id}/invite`, { userIds }),
    join: (id) => api.post(`/meetings/${id}/join`),
    leave: (id) => api.post(`/meetings/${id}/leave`),
    end: (id) => api.delete(`/meetings/${id}`),
    updateParticipant: (id, userId, status) =>
        api.put(`/meetings/${id}/participants/${userId}`, { status }),
    clearAll: () => api.delete('/meetings/clear-all'),
};

// Performance Review APIs
export const performanceReviewAPI = {
    // Cycles (HR only)
    createCycle: (data) => api.post('/reviews/cycles', data),
    getAllCycles: () => api.get('/reviews/cycles'),
    publishCycle: (id) => api.put(`/reviews/cycles/${id}/publish`),
    closeCycle: (id) => api.put(`/reviews/cycles/${id}/close`),
    extendDeadline: (id, minutes = 30) => api.put(`/reviews/cycles/${id}/extend?minutes=${minutes}`),
    deleteCycle: (id) => api.delete(`/reviews/cycles/${id}`),
    fixData: () => api.post('/reviews/fix-data'),

    // Employee
    getMyReview: (cycleId) => api.get(`/reviews/my-review/${cycleId}`),
    submitSelfAssessment: (data) => api.post('/reviews/self-assessment', data),

    // HR
    getReviewsByCycle: (cycleId) => api.get(`/reviews/cycle/${cycleId}`),
    evaluateReview: (id, data) => api.put(`/reviews/${id}/evaluate`, data),
    approveReview: (id) => api.put(`/reviews/${id}/approve`),
    rejectReview: (id) => api.put(`/reviews/${id}/reject`),

    // Admin
    getAllReviews: () => api.get('/reviews/all'),
};

// Payroll API
export const payrollAPI = {
    // HR endpoints
    createPayroll: (data) => api.post('/payroll', data),
    generateEntries: (payrollId) => api.post(`/payroll/${payrollId}/generate`),
    updateEntry: (entryId, data) => api.put(`/payroll/entry/${entryId}`, data),
    submitForApproval: (payrollId) => api.post(`/payroll/${payrollId}/submit`),
    getAllPayrolls: () => api.get('/payroll'),
    getPayrollDetails: (payrollId) => api.get(`/payroll/${payrollId}`),
    getPayrollEntries: (payrollId) => api.get(`/payroll/${payrollId}/entries`),

    // Admin endpoints
    approvePayroll: (payrollId, data) => api.post(`/payroll/${payrollId}/approve`, data),
    rejectPayroll: (payrollId, data) => api.post(`/payroll/${payrollId}/reject`, data),
    deletePayroll: (payrollId) => api.delete(`/payroll/${payrollId}`),

    // Employee endpoints
    getMyPayslips: () => api.get('/payroll/payslips/my'),
    getPayslip: (month, year) => api.get(`/payroll/payslips/${month}/${year}`),

    // Salary Structure endpoints
    getSalaryStructure: (employeeId) => api.get(`/payroll/salary-structure/${employeeId}`),
    getAllSalaryStructures: () => api.get('/payroll/salary-structures'),
};

// Admin API
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
};

// Document Generation APIs
export const documentAPI = {
    generateOfferLetter: (data) => api.post('/documents/offer-letter', data),
    generateAppointmentLetter: (data) => api.post('/documents/appointment-letter', data),
    downloadOfferLetter: (id) => api.get(`/documents/offer-letter/${id}`, { responseType: 'blob' }),
    downloadAppointmentLetter: (id) => api.get(`/documents/appointment-letter/${id}`, { responseType: 'blob' }),
    getHistory: () => api.get('/documents/history'),
    deleteDocument: (type, id) => api.delete(`/documents/${type}/${id}`),
    clearAllDocuments: () => api.delete('/documents/clear-all'),
};


// Skill Development APIs
export const skillAPI = {
    generateSuggestions: () => api.post('/skills/generate'),
    getMySuggestions: () => api.get('/skills/my-suggestions'),
    getActiveSuggestion: () => api.get('/skills/active'),
    markSkillCompleted: (skill) => api.put('/skills/complete', { skill }),
};

// Motivation Wall APIs
export const motivationAPI = {
    createPost: (data) => api.post('/motivation', data),
    getAllPosts: () => api.get('/motivation'),
    getPostsByCategory: (category) => api.get(`/motivation/category/${category}`),
    getMyPosts: () => api.get('/motivation/my-posts'),
    toggleLike: (postId) => api.post(`/motivation/${postId}/like`),
    addComment: (postId, content) => api.post(`/motivation/${postId}/comment`, { content }),
    deletePost: (postId) => api.delete(`/motivation/${postId}`),
    getPostById: (postId) => api.get(`/motivation/${postId}`),
    generateQuote: (category) => api.post('/motivation/generate-quote', { category }),
};

// Security & Monitoring APIs
export const securityAPI = {
    recordSession: (data) => api.post('/security/session', data),
    getAllSessions: (start, end) => api.get('/security/sessions', { params: { start, end } }),
    getUserSessions: (userId, start, end) => api.get(`/security/sessions/user/${userId}`, { params: { start, end } }),
    getLoginAttempts: (start, end) => api.get('/security/login-attempts', { params: { start, end } }),
    getUnusualLogins: () => api.get('/security/login-attempts/unusual'),
    getAllAlerts: () => api.get('/security/alerts'),
    getActiveAlerts: () => api.get('/security/alerts/active'),
    getAlertsBySeverity: (severity) => api.get(`/security/alerts/severity/${severity}`),
    reviewAlert: (alertId) => api.put(`/security/alerts/${alertId}/review`),
    resolveAlert: (alertId, resolution) => api.put(`/security/alerts/${alertId}/resolve`, { resolution }),
    getSecurityStats: () => api.get('/security/stats'),
};

// Contact Form APIs
export const contactAPI = {
    submitContactForm: (formData) => api.post('/contact/submit', formData),
    getAllMessages: () => api.get('/contact/messages'),
    getUnsentMessages: () => api.get('/contact/messages/unsent'),
    deleteMessage: (id) => api.delete(`/contact/messages/${id}`),
};


// Feedback APIs
export const feedbackAPI = {
    submitFeedback: (data) => api.post('/feedback', data),
    getAllFeedback: () => api.get('/feedback'),
    getPublicFeedback: () => api.get('/feedback/public'),
    getFeedbackByToken: (token) => api.get(`/feedback/token/${token}`),
    getFeedbackByStatus: (status) => api.get(`/feedback/status/${status}`),
    addPublicReply: (id, data) => api.post(`/feedback/${id}/reply/public`, data),
    addPrivateReply: (id, data) => api.post(`/feedback/${id}/reply/private`, data),
    updateStatus: (id, status) => api.put(`/feedback/${id}/status`, { status }),
    getStatistics: () => api.get('/feedback/statistics'),
    clearOldFeedback: (status) => api.delete('/feedback/clear', { params: { status } }),
};

export default api;
