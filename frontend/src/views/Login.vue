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
            class="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-[1.02] disabled:opacity-50"
          >
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-xs text-gray-400">
            Contact your HR for login credentials
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
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const username = ref('')
const password = ref('')
const role = ref('hr')
const showPassword = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    toast.error('Please enter username and password')
    return
  }

  loading.value = true
  try {
    const result = await authStore.login({
      username: username.value,
      password: password.value,
    })

    if (result.success) {
      toast.success('Login successful!')
      router.push('/dashboard')
    } else {
      toast.error(result.message || 'Login failed')
    }
  } catch (error) {
    console.error('Login error:', error)
    toast.error('An error occurred')
  } finally {
    loading.value = false
  }
}

// In your Login.vue or login function
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('🔍 API URL:', API_URL);
console.log('🔍 Full URL:', `${API_URL}/api/auth/login`);

try {
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    username: this.username,
    password: this.password
  });
  console.log('✅ Response:', response.data);
} catch (error) {
  console.error('❌ Full error:', error);
  console.error('❌ Request URL:', error.config?.url);
  console.error('❌ Response status:', error.response?.status);
  console.error('❌ Response data:', error.response?.data);
}
</script>