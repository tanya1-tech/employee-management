import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============================================
// AUTH API
// ============================================
export const authApi = {
  login: (username: string, password: string) => {
    return api.post('/auth/login', { username, password })
  },
  getCurrentUser: () => {
    return api.get('/auth/me')
  },
  changePassword: (currentPassword: string, newPassword: string) => {
    return api.post('/auth/change-password', { currentPassword, newPassword })
  },
  resetPassword: (userId: string, newPassword?: string) => {
    return api.post('/auth/reset-password', { userId, newPassword })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}

// ============================================
// EMPLOYEE API
// ============================================
export const employeeApi = {
  getAll: () => {
    return api.get('/employees')
  },
  getById: (id: string) => {
    return api.get(`/employees/${id}`)
  },
  create: (data: {
    name: string
    department: string
    email: string
    phone?: string
    position?: string
    status?: string
  }) => {
    return api.post('/employees', data)
  },
  update: (id: string, data: any) => {
    return api.put(`/employees/${id}`, data)
  },
  delete: (id: string) => {
    return api.delete(`/employees/${id}`)
  },
}

// ============================================
// ATTENDANCE API
// ============================================
export const attendanceApi = {
  getByDate: (date: string) => {
    return api.get(`/attendance?date=${date}`)
  },
  getByDateRange: (startDate: string, endDate: string) => {
    return api.get(`/attendance/range?startDate=${startDate}&endDate=${endDate}`)
  },
  getToday: () => {
    return api.get('/attendance/today')
  },
  getSummary: () => {
    return api.get('/attendance/summary')
  },
  getStats: () => {
    return api.get('/attendance/stats')
  },
  getByEmployee: (employeeId: string) => {
    return api.get(`/attendance/employee/${employeeId}`)
  },
  getTodayStatus: () => {
    return api.get('/attendance/today-status')
  },
  mark: (data: {
    employeeId?: string
    status: string
    checkInTime?: Date
    checkOutTime?: Date
    date?: string
  }) => {
    return api.post('/attendance', data)
  },
  checkIn: (data?: { employeeId?: string; date?: string }) => {
    return api.post('/attendance/check-in', data || {})
  },
  checkOut: (data?: { employeeId?: string; date?: string }) => {
    return api.post('/attendance/check-out', data || {})
  },
  update: (id: string, data: {
    status?: string
    checkInTime?: Date
    checkOutTime?: Date
    date?: string
    remarks?: string
  }) => {
    return api.put(`/attendance/${id}`, data)
  },
  delete: (id: string) => {
    return api.delete(`/attendance/${id}`)
  },
  exportCSV: (startDate: string, endDate: string) => {
    return api.get(`/attendance/export?startDate=${startDate}&endDate=${endDate}`, {
      responseType: 'blob',
    })
  },
}

// ============================================
// DASHBOARD API
// ============================================
export const dashboardApi = {
  getStats: () => {
    return api.get('/dashboard/stats')
  },
}

// ============================================
// DEFAULT EXPORT
// ============================================
export default api