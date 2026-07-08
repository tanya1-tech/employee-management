import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
})

// ============================================
// REQUEST INTERCEPTOR
// ============================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || '')
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
    }
    return response
  },
  async (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - Redirecting to login...')
      
      // Remove token and user data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.log('⛔ Forbidden - You don\'t have permission')
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.log('🔥 Server error:', error.response?.data?.message || 'Internal server error')
    }
    
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.log('🌐 Network error - Please check your connection')
    }
    
    return Promise.reject(error)
  }
)

// ============================================
// GENERIC API METHODS
// ============================================

export const apiService = {
  // GET request
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.get<T>(url, config)
  },

  // POST request
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.post<T>(url, data, config)
  },

  // PUT request
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.put<T>(url, data, config)
  },

  // DELETE request
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.delete<T>(url, config)
  },

  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.patch<T>(url, data, config)
  },
}

// ============================================
// AUTH API
// ============================================
export const authApi = {
  // Login user
  login: (username: string, password: string) => {
    return api.post('/auth/login', { username, password })
  },

  // Get current user
  getCurrentUser: () => {
    return api.get('/auth/me')
  },

  // Change password
  changePassword: (currentPassword: string, newPassword: string) => {
    return api.post('/auth/change-password', { currentPassword, newPassword })
  },

  // Reset password (HR only)
  resetPassword: (userId: string, newPassword?: string) => {
    return api.post('/auth/reset-password', { userId, newPassword })
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}

// ============================================
// EMPLOYEE API
// ============================================
export const employeeApi = {
  // Get all employees
  getAll: () => {
    return api.get('/employees')
  },

  // Get employee by ID
  getById: (id: string) => {
    return api.get(`/employees/${id}`)
  },

  // Create employee
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

  // Update employee
  update: (id: string, data: any) => {
    return api.put(`/employees/${id}`, data)
  },

  // Delete employee
  delete: (id: string) => {
    return api.delete(`/employees/${id}`)
  },
}

  // ============================================
// ATTENDANCE API
// ============================================
export const attendanceApi = {
  // Get attendance by date
  getByDate: (date: string) => {
    return api.get(`/attendance?date=${date}`)
  },

  // Get today's status (check-in/out)
  getTodayStatus: () => {
    return api.get('/attendance/today-status')
  },

  // Get attendance with date range
  getByDateRange: (startDate: string, endDate: string) => {
    return api.get(`/attendance/range?startDate=${startDate}&endDate=${endDate}`)
  },

  // Get today's attendance (HR only)
  getToday: () => {
    return api.get('/attendance/today')
  },

  // Get attendance summary (HR only)
  getSummary: () => {
    return api.get('/attendance/summary')
  },

  // Get attendance stats (for dashboard)
  getStats: () => {
    return api.get('/attendance/stats')
  },

  // Get employee attendance
  getByEmployee: (employeeId: string) => {
    return api.get(`/attendance/employee/${employeeId}`)
  },

  // Mark attendance
  mark: (data: {
    employeeId?: string
    status: string
    checkInTime?: Date
    checkOutTime?: Date
    date?: string
  }) => {
    return api.post('/attendance', data)
  },

  // Update attendance (HR only)
  update: (id: string, data: {
    status?: string
    checkInTime?: Date
    checkOutTime?: Date
    date?: string
    remarks?: string
  }) => {
    return api.put(`/attendance/${id}`, data)
  },

  // Delete attendance (HR only)
  delete: (id: string) => {
    return api.delete(`/attendance/${id}`)
  },
  
  // Check-in
  checkIn: (data?: { employeeId?: string, date?: string }) => {
    return api.post('/attendance/check-in', data || {})
  },

  // Check-out
  checkOut: (data?: { employeeId?: string, date?: string }) => {
    return api.post('/attendance/check-out', data || {})
  },

  // Export attendance to CSV (HR only)
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
  // Get dashboard stats (HR only)
  getStats: () => {
    return api.get('/dashboard/stats')
  },
}

// ============================================
// EXPORT DEFAULT
// ============================================
export default api