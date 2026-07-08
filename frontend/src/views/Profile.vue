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
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

          <!-- Check-in / Check-out & Change Password -->
          <div class="space-y-6">
            <!-- Check-in / Check-out Card -->
            <div class="bg-white rounded-xl shadow-sm p-8">
              <h3 class="text-xl font-bold text-gray-800 mb-6">⏰ Today's Attendance</h3>
              
              <div v-if="todayStatus.loading" class="text-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
              
              <div v-else>
                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm text-gray-500">Status</span>
                  <span class="px-3 py-1 rounded-full text-sm font-medium" :class="getStatusBadgeClass(todayStatus.status)">
                    {{ todayStatus.status || 'Not Marked' }}
                  </span>
                </div>

                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm text-gray-500">Check In</span>
                  <span class="font-medium text-gray-800">{{ todayStatus.checkInTime || '--:--' }}</span>
                </div>

                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm text-gray-500">Check Out</span>
                  <span class="font-medium text-gray-800">{{ todayStatus.checkOutTime || '--:--' }}</span>
                </div>

                <div v-if="todayStatus.duration" class="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-500">Total Duration</span>
                  <span class="font-medium text-blue-600">
                    {{ todayStatus.duration.hours }}h {{ todayStatus.duration.minutes }}m
                  </span>
                </div>

                <div class="flex gap-3">
                  <button 
                    @click="handleCheckIn"
                    :disabled="todayStatus.isCheckedIn || todayStatus.loading"
                    class="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✅ Check In
                  </button>
                  <button 
                    @click="handleCheckOut"
                    :disabled="!todayStatus.isCheckedIn || todayStatus.isCheckedOut || todayStatus.loading"
                    class="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🚪 Check Out
                  </button>
                </div>
              </div>
            </div>

            <!-- Change Password Card -->
            <div class="bg-white rounded-xl shadow-sm p-8">
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
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'
import api, { attendanceApi } from '../api'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// ============================================
// TODAY'S STATUS
// ============================================
const todayStatus = ref({
  loading: false,
  status: 'not-marked',
  checkInTime: null as string | null,
  checkOutTime: null as string | null,
  isCheckedIn: false,
  isCheckedOut: false,
  duration: null as { hours: number; minutes: number } | null,
})

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    present: 'bg-green-100 text-green-600',
    absent: 'bg-red-100 text-red-600',
    late: 'bg-yellow-100 text-yellow-600',
    'half-day': 'bg-orange-100 text-orange-600',
    'not-marked': 'bg-gray-100 text-gray-500',
  }
  return classes[status] || 'bg-gray-100 text-gray-500'
}

const formatTime = (date: string | null) => {
  if (!date) return '--:--'
  try {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '--:--'
  }
}

const loadTodayStatus = async () => {
  todayStatus.value.loading = true
  try {
    const response = await attendanceApi.getTodayStatus()
    if (response.data.success) {
      todayStatus.value = {
        loading: false,
        status: response.data.status || 'not-marked',
        checkInTime: response.data.checkInTime ? formatTime(response.data.checkInTime) : null,
        checkOutTime: response.data.checkOutTime ? formatTime(response.data.checkOutTime) : null,
        isCheckedIn: response.data.isCheckedIn || false,
        isCheckedOut: response.data.isCheckedOut || false,
        duration: response.data.duration || null,
      }
    }
  } catch (error) {
    console.error('Failed to load today status:', error)
  } finally {
    todayStatus.value.loading = false
  }
}

const handleCheckIn = async () => {
  try {
    todayStatus.value.loading = true
    const response = await attendanceApi.checkIn()
    if (response.data.success) {
      toast.success(response.data.message)
      await loadTodayStatus()
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Check-in failed')
  } finally {
    todayStatus.value.loading = false
  }
}

const handleCheckOut = async () => {
  try {
    todayStatus.value.loading = true
    const response = await attendanceApi.checkOut()
    if (response.data.success) {
      toast.success(response.data.message)
      await loadTodayStatus()
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Check-out failed')
  } finally {
    todayStatus.value.loading = false
  }
}

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
    const response = await api.post('/auth/change-password', {
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

onMounted(() => {
  loadTodayStatus()
})
</script>