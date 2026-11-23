import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:         (data)           => api.post('/auth/login', data),
  register:      (data)           => api.post('/auth/register', data),
  getMe:         ()               => api.get('/auth/me'),
  updateProfile: (userId, data)   => api.put(`/auth/profile/${userId}`, data),
};

export const doctorAPI = {
  // Public - no auth needed
  getAll:         (params = {})   => api.get('/doctors/public/all', { params }),
  search:         (q)             => api.get('/doctors/public/all', { params: { q } }),
  getSpecialties: ()              => api.get('/doctors/public/specialties'),
  getById:        (id)            => api.get(`/doctors/public/${id}`),
  getReviews:     (id)            => api.get(`/doctors/public/${id}/reviews`),
  getBookedSlots: (id, date)      => api.get(`/doctors/public/${id}/booked-slots`, { params: { date } }),
  // Protected - auth needed
  getMyProfile:   (userId)        => api.get('/doctors/my-profile', { params: { userId } }),
  updateProfile:  (id, data)      => api.put(`/doctors/${id}`, data),
  addReview:      (id, data)      => api.post(`/doctors/${id}/reviews`, data),
  deleteDoctor:   (id)            => api.delete(`/doctors/${id}`),
  // Admin
  getAllAdmin:    ()              => api.get('/doctors/admin/all'),
  approve:        (id)            => api.put(`/doctors/admin/approve/${id}`),
  reject:         (id, reason)    => api.put(`/doctors/admin/reject/${id}`, { reason }),
};

export const appointmentAPI = {
  book:                   (patientId, data) => api.post(`/appointments?patientId=${patientId}`, data),
  updateStatus:           (id, data)        => api.patch(`/appointments/${id}/status`, data),
  reschedule:             (id, data)        => api.patch(`/appointments/${id}/reschedule`, data),
  getPatientAppointments: (patientId)       => api.get(`/appointments/patient/${patientId}`),
  getDoctorAppointments:  (doctorId)        => api.get(`/appointments/doctor/${doctorId}`),
  getAllAppointments:      ()               => api.get('/appointments/admin/all'),
  getStats:               ()               => api.get('/appointments/stats'),
};

export const notificationAPI = {
  getAll:       (userId) => api.get(`/notifications/${userId}`),
  getUnreadCount: (userId) => api.get(`/notifications/${userId}/unread-count`),
  markAsRead:   (id)     => api.patch(`/notifications/${id}/read`),
  markAllAsRead:(userId) => api.patch(`/notifications/user/${userId}/read-all`),
};

export default api;
