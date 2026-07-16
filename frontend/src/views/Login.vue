<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <div class="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <span class="text-white text-3xl font-bold">EMS</span>
            </div>
          </div>
          <h1 class="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p class="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {{ success }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Username / Email</label>
            <input
              v-model="username"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
              placeholder="Enter your username"
              autocomplete="username"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                placeholder="Enter your password"
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <span v-if="showPassword">🙈</span>
                <span v-else>👁️</span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              v-model="role"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
            >
              <option value="hr">HR / Admin</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-xs text-gray-400">
            Contact your HR for login credentials
          </p>
          <p class="text-xs text-gray-400 mt-2">
            Demo: admin / tan7178
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const username = ref('')
const password = ref('')
const role = ref('hr')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleLogin = async () => {
  // Clear previous messages
  error.value = ''
  success.value = ''

  // Validate input
  if (!username.value || !password.value) {
    error.value = 'Please enter username and password'
    return
  }

  loading.value = true

  try {
    const result = await authStore.login({
      username: username.value,
      password: password.value,
    })

    if (result.success) {
      success.value = 'Login successful! Redirecting...'
      
      // Store role for redirection
      const userRole = authStore.user?.role || role.value
      
      // Redirect based on role
      setTimeout(() => {
        if (userRole === 'hr') {
          router.push('/hr/dashboard')
        } else {
          router.push('/employee/dashboard')
        }
      }, 500)
    } else {
      error.value = result.message || 'Login failed. Please check your credentials.'
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.message || 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}

// Auto-fill demo credentials (for testing)
const fillDemoCredentials = () => {
  username.value = 'admin'
  password.value = 'tan7178'
  role.value = 'hr'
}
</script>