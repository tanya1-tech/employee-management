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
          <router-link
            to="/dashboard"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg transition"
            :class="[
              $route.path === '/dashboard' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <span>📊</span>
            <span>Dashboard</span>
          </router-link>
          
          <router-link
            v-if="authStore.isHR"
            to="/employees"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg transition"
            :class="[
              $route.path === '/employees' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <span>👥</span>
            <span>Employees</span>
          </router-link>
          
          <router-link
            to="/attendance"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg transition"
            :class="[
              $route.path === '/attendance' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <span>📋</span>
            <span>{{ authStore.isHR ? 'Attendance' : 'My Attendance' }}</span>
          </router-link>
          
          <router-link
            to="/profile"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg transition"
            :class="[
              $route.path === '/profile' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <span>👤</span>
            <span>Profile</span>
          </router-link>
          
          <button
            @click="handleLogout"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="ml-64">
      <header class="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ authStore.isHR ? 'Admin Dashboard' : 'My Dashboard' }}
        </h1>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-500">Welcome, {{ authStore.user?.name || authStore.user?.username || 'User' }}</span>
          <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            {{ (authStore.user?.name || authStore.user?.username || 'U')[0]?.toUpperCase() }}
          </div>
        </div>
      </header>

      <main class="p-8">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center h-64">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-4 text-gray-500">Loading dashboard...</p>
          </div>
        </div>

        <!-- Dashboard Content -->
        <div v-else>
          <!-- HR/Admin Dashboard -->
          <div v-if="authStore.isHR">
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500">Total Employees</p>
                    <p class="text-2xl font-bold text-gray-800">{{ adminStats.totalEmployees }}</p>
                  </div>
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl">👥</div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500">Present Today</p>
                    <p class="text-2xl font-bold text-green-600">{{ adminStats.presentToday }}</p>
                  </div>
                  <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xl">✅</div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500 hover:shadow-md transition">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500">Absent Today</p>
                    <p class="text-2xl font-bold text-red-600">{{ adminStats.absentToday }}</p>
                  </div>
                  <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 text-xl">❌</div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-md transition">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500">Attendance Rate</p>
                    <p class="text-2xl font-bold text-purple-600">{{ adminStats.attendanceRate }}%</p>
                  </div>
                  <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xl">📈</div>
                </div>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-800">Recent Activity</h2>
                <button @click="loadAdminDashboard" class="text-sm text-blue-600 hover:text-blue-800 transition">🔄 Refresh</button>
              </div>
              
              <div v-if="recentActivities.length === 0" class="text-center py-8 text-gray-500">
                <p class="text-4xl mb-2">📭</p>
                <p>No recent activity yet</p>
              </div>
              
              <div v-else class="space-y-4">
                <div v-for="activity in recentActivities" :key="activity.id" 
                     class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                      {{ activity.icon }}
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-800">{{ activity.description }}</p>
                      <p class="text-xs text-gray-500">{{ formatTime(activity.time) }}</p>
                    </div>
                  </div>
                  <span class="text-xs px-3 py-1 rounded-full font-medium" :class="activity.statusClass">
                    {{ activity.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Employee Dashboard -->
          <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500">Employee ID</p>
                    <p class="text-2xl font-bold text-gray-800">{{ authStore.user?.employeeId || 'N/A' }}</p>
                  </div>
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl">🆔</div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500">Today's Status</p>
                    <p class="text-2xl font-bold text-green-600">{{ employeeStats.todayStatus || 'Not Marked' }}</p>
                  </div>
                  <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xl">✅</div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-md transition">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500">Department</p>
                    <p class="text-2xl font-bold text-purple-600">{{ authStore.user?.department || 'N/A' }}</p>
                  </div>
                  <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-xl">🏢</div>
                </div>
              </div>

              <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500 hover:shadow-md transition">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-500">Total Days Present</p>
                    <p class="text-2xl font-bold text-orange-600">{{ employeeStats.totalPresent || 0 }}</p>
                  </div>
                  <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xl">📊</div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">My Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="border-b border-gray-100 pb-3">
                  <p class="text-sm text-gray-500">Full Name</p>
                  <p class="font-medium text-gray-800">{{ authStore.user?.name || 'N/A' }}</p>
                </div>
                <div class="border-b border-gray-100 pb-3">
                  <p class="text-sm text-gray-500">Username</p>
                  <p class="font-medium text-gray-800">{{ authStore.user?.username || 'N/A' }}</p>
                </div>
                <div class="border-b border-gray-100 pb-3">
                  <p class="text-sm text-gray-500">Email</p>
                  <p class="font-medium text-gray-800">{{ authStore.user?.email || 'N/A' }}</p>
                </div>
                <div class="border-b border-gray-100 pb-3">
                  <p class="text-sm text-gray-500">Role</p>
                  <p class="font-medium text-gray-800">{{ authStore.user?.role?.toUpperCase() || 'N/A' }}</p>
                </div>
              </div>
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

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)

// Admin stats
const adminStats = ref({
  totalEmployees: 20,
  presentToday: 12,
  absentToday: 8,
  attendanceRate: 60,
})
const recentActivities = ref<any[]>([
  { id: 1, icon: '👤', description: 'Tanya Poojari checked in', time: new Date().toISOString(), status: 'Present', statusClass: 'bg-green-100 text-green-600' },
  { id: 2, icon: '👤', description: 'Aisha Khan checked out', time: new Date(Date.now() - 3600000).toISOString(), status: 'Left', statusClass: 'bg-blue-100 text-blue-600' },
])

// Employee stats
const employeeStats = ref({
  todayStatus: 'Present',
  totalPresent: 2,
})
const employeeAttendance = ref<any[]>([
  { id: 1, date: new Date().toISOString(), status: 'present', checkIn: '09:00 AM' },
  { id: 2, date: new Date(Date.now() - 86400000).toISOString(), status: 'present', checkIn: '09:15 AM' },
])

// ✅ Helper functions - defined as functions that return values
function formatTime(date: string) {
  if (!date) return 'Just now'
  try {
    const d = new Date(date)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
    return d.toLocaleDateString()
  } catch (e) {
    return 'Recently'
  }
}

function formatDate(date: string) {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (e) {
    return 'N/A'
  }
}

function getStatusClass(status: string) {
  const classes: Record<string, string> = {
    present: 'bg-green-100 text-green-600',
    absent: 'bg-red-100 text-red-600',
    late: 'bg-yellow-100 text-yellow-600',
    'half-day': 'bg-orange-100 text-orange-600',
  }
  return classes[status] || 'bg-gray-100 text-gray-500'
}

const loadAdminDashboard = async () => {
  // Using static data for now
  console.log('Loading admin dashboard...')
}

const loadEmployeeDashboard = async () => {
  // Using static data for now
  console.log('Loading employee dashboard...')
}

const loadDashboard = async () => {
  loading.value = true
  try {
    console.log('🔍 Loading dashboard...')
    
    if (!authStore.checkAuth()) {
      console.log('❌ Auth check failed, redirecting to login')
      router.push('/login')
      return
    }
    
    console.log('✅ Auth check passed, user:', authStore.user?.username)
    console.log('✅ User role:', authStore.user?.role)
    
    if (authStore.isHR) {
      await loadAdminDashboard()
    } else {
      await loadEmployeeDashboard()
    }
    
  } catch (error) {
    console.error('Dashboard error:', error)
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadDashboard()
})
</script>