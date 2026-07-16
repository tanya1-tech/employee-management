import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ✅ ALL ATTENDANCE API METHODS
export const attendanceApi = {
  // Get today's status for the logged-in employee
  getTodayStatus: () => api.get('/attendance/today-status'),
  
  // Check in
  checkIn: () => api.post('/attendance/check-in'),
  
  // Check out
  checkOut: () => api.post('/attendance/check-out'),
  
  // Export CSV
  exportCSV: (startDate: string, endDate: string) => 
    api.get(`/attendance/export?startDate=${startDate}&endDate=${endDate}`, { 
      responseType: 'blob' 
    }),
}

export default api