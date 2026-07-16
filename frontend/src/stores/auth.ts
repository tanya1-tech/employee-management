import { defineStore } from 'pinia'
import axios from 'axios'

// ✅ Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export interface User {
  id: string
  username: string
  email: string
  name: string
  role: 'hr' | 'employee'
  employeeId?: string
  department?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  token?: string
  user?: User
  message?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isHR: (state) => state.user?.role === 'hr',
    isEmployee: (state) => state.user?.role === 'employee',
    userFullName: (state) => state.user?.name || state.user?.username || '',
  },

  actions: {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
      this.loading = true
      this.error = null
      
      try {
        console.log('🔍 Login attempt:', credentials.username)
        console.log('🔍 API URL:', API_URL)
        console.log('🔍 Full URL:', `${API_URL}/api/auth/login`)

        const response = await axios.post(`${API_URL}/api/auth/login`, credentials)
        
        console.log('✅ Login response:', response.data)

        if (response.data.success) {
          this.token = response.data.token
          this.user = response.data.user
          this.isAuthenticated = true
          
          // Store in localStorage
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('user', JSON.stringify(response.data.user))
          
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
          
          return { 
            success: true, 
            data: response.data 
          } as any
        } else {
          this.error = response.data.message || 'Login failed'
          return { 
            success: false, 
            message: response.data.message || 'Login failed' 
          }
        }
      } catch (error: any) {
        console.error('❌ Login error:', error)
        
        let message = 'An error occurred during login'
        
        if (error.response) {
          // Server responded with error
          console.error('❌ Response status:', error.response.status)
          console.error('❌ Response data:', error.response.data)
          message = error.response.data?.message || 'Invalid credentials'
        } else if (error.request) {
          // No response from server
          console.error('❌ No response from server')
          message = 'Cannot connect to server. Please check if backend is running.'
        } else {
          // Other errors
          message = error.message || 'An error occurred'
        }
        
        this.error = message
        return { 
          success: false, 
          message 
        }
      } finally {
        this.loading = false
      }
    },

    async register(credentials: { username: string; email: string; password: string; name: string }) {
      this.loading = true
      this.error = null
      
      try {
        console.log('🔍 Register attempt:', credentials.username)
        
        const response = await axios.post(`${API_URL}/api/auth/register`, credentials)
        
        if (response.data.success) {
          return { success: true, data: response.data }
        } else {
          this.error = response.data.message || 'Registration failed'
          return { success: false, message: this.error }
        }
      } catch (error: any) {
        console.error('❌ Register error:', error)
        const message = error.response?.data?.message || 'Registration failed'
        this.error = message
        return { success: false, message }
      } finally {
        this.loading = false
      }
    },

    async changePassword(currentPassword: string, newPassword: string) {
      this.loading = true
      this.error = null
      
      try {
        const token = this.token || localStorage.getItem('token')
        
        const response = await axios.put(
          `${API_URL}/api/auth/change-password`,
          { currentPassword, newPassword },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        
        if (response.data.success) {
          return { success: true, message: response.data.message }
        } else {
          this.error = response.data.message || 'Password change failed'
          return { success: false, message: this.error }
        }
      } catch (error: any) {
        console.error('❌ Change password error:', error)
        const message = error.response?.data?.message || 'Password change failed'
        this.error = message
        return { success: false, message }
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      delete axios.defaults.headers.common['Authorization']
    },

    // Initialize auth state from localStorage
    initAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        try {
          this.token = token
          this.user = JSON.parse(user)
          this.isAuthenticated = true
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } catch (error) {
          console.error('Error parsing user data:', error)
          this.logout()
        }
      }
    },

    // Fetch current user from server
    async fetchCurrentUser() {
      try {
        const token = this.token || localStorage.getItem('token')
        if (!token) {
          return { success: false, message: 'No token found' }
        }
        
        const response = await axios.get(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.data.success) {
          this.user = response.data.user
          return { success: true, user: response.data.user }
        } else {
          return { success: false, message: response.data.message }
        }
      } catch (error: any) {
        console.error('❌ Fetch user error:', error)
        return { success: false, message: error.response?.data?.message || 'Failed to fetch user' }
      }
    }
  },
})