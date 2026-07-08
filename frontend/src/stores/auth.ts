import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export interface User {
  id: string
  username: string
  email: string
  role: 'hr' | 'employee'
  name: string
  employeeId?: string
  department?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)
  const isHR = computed(() => user.value?.role === 'hr')
  const isEmployee = computed(() => user.value?.role === 'employee')
  const userName = computed(() => user.value?.name || user.value?.username || 'User')
  const userRole = computed(() => user.value?.role || 'employee')

  const checkAuth = async () => {
    if (!token.value) return false
    
    try {
      const response = await api.get('/auth/me')
      if (response.data.success) {
        user.value = response.data.user
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      logout()
      return false
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password,
      })
      
      if (!response.data.success) {
        return { 
          success: false, 
          message: response.data.message || 'Login failed' 
        }
      }

      const { token: authToken, user: userData } = response.data
      
      token.value = authToken
      user.value = userData
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(userData)) // Store user in localStorage
      
      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    user,
    token,
    isAuthenticated,
    isHR,
    isEmployee,
    userName,
    userRole,
    checkAuth,
    login,
    logout,
  }
})