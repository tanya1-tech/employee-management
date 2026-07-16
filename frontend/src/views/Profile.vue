<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50">
      <div class="p-6">
        <div class="flex items-center space-x-3 mb-10">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xl">E</span>
          </div>
          <span class="text-xl font-bold text-gray-800">EMS</span>
        </div>

        <nav class="space-y-2">
          <router-link to="/dashboard" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
            <span>📊</span>
            <span>Dashboard</span>
          </router-link>
          
          <router-link v-if="authStore.isHR" to="/employees" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
            <span>👥</span>
            <span>Employees</span>
          </router-link>
          
          <router-link to="/attendance" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
            <span>📋</span>
            <span>{{ authStore.isHR ? 'Attendance' : 'My Attendance' }}</span>
          </router-link>
          
          <router-link to="/profile" class="flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 transition">
            <span>👤</span>
            <span>Profile</span>
          </router-link>
          
          <button @click="handleLogout" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="ml-64">
      <header class="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">Profile</h1>
      </header>

      <main class="p-8">
        <div class="max-w-2xl mx-auto">
          <!-- Profile Info -->
          <div class="bg-white rounded-xl shadow-sm p-8">
            <div class="flex items-center space-x-6 mb-8">
              <div class="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {{ authStore.user?.name?.[0]?.toUpperCase() || authStore.user?.username?.[0]?.toUpperCase() || 'U' }}
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-800">{{ authStore.user?.name || authStore.user?.username || 'User' }}</h2>
                <p class="text-gray-500">{{ authStore.user?.role?.toUpperCase() || 'Employee' }}</p>
                <p class="text-sm text-gray-400">{{ authStore.user?.employeeId || 'No ID' }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="border-b border-gray-100 pb-4">
                <label class="block text-sm text-gray-500">Full Name</label>
                <p class="text-gray-900 font-medium">{{ authStore.user?.name || 'Not set' }}</p>
              </div>
              <div class="border-b border-gray-100 pb-4">
                <label class="block text-sm text-gray-500">Username</label>
                <p class="text-gray-900 font-medium">{{ authStore.user?.username || 'Not set' }}</p>
              </div>
              <div class="border-b border-gray-100 pb-4">
                <label class="block text-sm text-gray-500">Email</label>
                <p class="text-gray-900 font-medium">{{ authStore.user?.email || 'Not set' }}</p>
              </div>
              <div class="border-b border-gray-100 pb-4">
                <label class="block text-sm text-gray-500">Role</label>
                <p class="text-gray-900 font-medium">{{ authStore.user?.role?.toUpperCase() || 'Not set' }}</p>
              </div>
              <div>
                <label class="block text-sm text-gray-500">Employee ID</label>
                <p class="text-gray-900 font-medium">{{ authStore.user?.employeeId || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- Change Password Card -->
          <div class="bg-white rounded-xl shadow-sm p-8 mt-6">
            <h3 class="text-xl font-bold text-gray-800 mb-6">🔐 Change Password</h3>
            <p class="text-sm text-gray-500 mb-6">Update your password. You'll need your current password to make changes.</p>

            <form @submit.prevent="changePassword" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  required
                  minlength="6"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Confirm new password"
                />
              </div>

              <div v-if="passwordError" class="text-red-600 text-sm">{{ passwordError }}</div>
              <div v-if="passwordSuccess" class="text-green-600 text-sm">{{ passwordSuccess }}</div>

              <button
                type="submit"
                :disabled="passwordLoading"
                class="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
              >
                <span v-if="passwordLoading">Updating...</span>
                <span v-else>Update Password</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'
import api from '../api'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// ============================================
// CHANGE PASSWORD
// ============================================
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordError = ref('')
const passwordSuccess = ref('')
const passwordLoading = ref(false)

const changePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'New password must be at least 6 characters'
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Passwords do not match'
    return
  }

  passwordLoading.value = true

  try {
    const response = await api.post('/api/auth/change-password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })

    if (response.data.success) {
      passwordSuccess.value = response.data.message || 'Password changed successfully!'
      passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
      toast.success('Password changed successfully!')
    } else {
      passwordError.value = response.data.message || 'Failed to change password'
    }
  } catch (error: any) {
    passwordError.value = error.response?.data?.message || 'Failed to change password'
    toast.error(passwordError.value)
  } finally {
    passwordLoading.value = false
  }
}

const handleLogout = () => {
  authStore.logout()
  toast.info('Logged out successfully')
  router.push('/login')
}
</script>