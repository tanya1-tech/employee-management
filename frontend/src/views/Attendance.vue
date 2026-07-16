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
          
          <router-link to="/attendance" class="flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 transition">
            <span>📋</span>
            <span>{{ authStore.isHR ? 'Attendance' : 'My Attendance' }}</span>
          </router-link>
          
          <router-link to="/profile" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
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
      <header class="bg-white shadow-sm px-8 py-4 flex items-center justify-between flex-wrap gap-4">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ authStore.isHR ? 'Attendance Management' : 'My Attendance' }}
        </h1>
        <div class="flex gap-2 flex-wrap">
          <button 
            @click="handleCheckIn"
            :disabled="checkInLoading || todayStatus.isCheckedIn"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="checkInLoading" class="animate-spin">⏳</span>
            <span v-else>✅</span>
            Check In
          </button>
          
          <button 
            @click="handleCheckOut"
            :disabled="checkOutLoading || !todayStatus.isCheckedIn || todayStatus.isCheckedOut"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="checkOutLoading" class="animate-spin">⏳</span>
            <span v-else>🚪</span>
            Check Out
          </button>
          
          <button v-if="authStore.isHR" @click="exportCSV" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            📥 Export CSV
          </button>
          
          <button @click="loadAttendance" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            🔄 Refresh
          </button>
        </div>
      </header>

      <main class="p-8">
        <!-- Today's Status Card -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">📅 Today's Status</h3>
              <p class="text-sm text-gray-500">{{ formatDateDisplay(new Date().toISOString().split('T')[0]) }}</p>
            </div>
            
            <div class="flex items-center gap-6 flex-wrap">
              <div>
                <span class="text-sm text-gray-500">Status:</span>
                <span class="ml-2 px-3 py-1 rounded-full text-sm font-medium" :class="getStatusBadgeClass(todayStatus.status)">
                  {{ todayStatus.isCheckedOut ? '✅ Checked Out' : todayStatus.isCheckedIn ? '🟢 Checked In' : todayStatus.status || 'Not Marked' }}
                </span>
              </div>
              
              <div v-if="todayStatus.checkInTime">
                <span class="text-sm text-gray-500">Check In:</span>
                <span class="ml-2 font-medium text-green-600">{{ todayStatus.checkInTime }}</span>
              </div>
              
              <div v-if="todayStatus.checkOutTime">
                <span class="text-sm text-gray-500">Check Out:</span>
                <span class="ml-2 font-medium text-red-600">{{ todayStatus.checkOutTime }}</span>
              </div>
              
              <div v-if="todayStatus.duration">
                <span class="text-sm text-gray-500">Duration:</span>
                <span class="ml-2 font-medium text-blue-600">
                  {{ todayStatus.duration.hours }}h {{ todayStatus.duration.minutes }}m
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Date Selector -->
        <div class="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4 flex-wrap">
            <label class="font-medium text-gray-700">Select Date:</label>
            <input 
              type="date" 
              v-model="selectedDate" 
              @change="loadAttendance"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div class="text-sm text-gray-500">
            {{ formatDateDisplay(selectedDate) }}
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Total Employees</p>
                <p class="text-2xl font-bold text-gray-800">{{ totalEmployees }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl">👥</div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Present</p>
                <p class="text-2xl font-bold text-green-600">{{ stats.present }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-xl">✅</div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Absent</p>
                <p class="text-2xl font-bold text-red-600">{{ stats.absent }}</p>
              </div>
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 text-xl">❌</div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Late</p>
                <p class="text-2xl font-bold text-yellow-600">{{ stats.late }}</p>
              </div>
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 text-xl">⏰</div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-500">Loading attendance for {{ formatDateDisplay(selectedDate) }}...</p>
        </div>

        <!-- Attendance Table -->
        <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-800">
              {{ authStore.isHR ? 'All Employees' : 'My Attendance' }}
            </h2>
            <span class="text-sm text-gray-500">{{ attendanceRecords.length }} records for {{ formatDateDisplay(selectedDate) }}</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th v-if="authStore.isHR" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th v-if="authStore.isHR" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-if="attendanceRecords.length === 0">
                  <td :colspan="authStore.isHR ? 7 : 5" class="px-6 py-8 text-center text-gray-500">
                    No attendance records found for {{ formatDateDisplay(selectedDate) }}
                  </td>
                </tr>
                <tr v-for="(record, index) in attendanceRecords" :key="record._id || index" class="hover:bg-gray-50 transition">
                  <td class="px-6 py-4 text-sm text-gray-500">{{ index + 1 }}</td>
                  <td v-if="authStore.isHR" class="px-6 py-4 text-sm font-medium text-gray-900">{{ record.employeeName || record.name }}</td>
                  <td v-if="authStore.isHR" class="px-6 py-4 text-sm text-gray-600">{{ record.department || '-' }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full" :class="getStatusClass(record.status)">
                      {{ record.status || 'Not Marked' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ record.checkIn || '-' }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ record.checkOut || '-' }}</td>
                  <td class="px-6 py-4">
                    <select 
                      v-model="record.status" 
                      @change="updateAttendance(record)"
                      class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="not-marked">Not Marked</option>
                      <option value="present">✅ Present</option>
                      <option value="absent">❌ Absent</option>
                      <option value="late">⏰ Late</option>
                      <option value="half-day">🌓 Half Day</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
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
import api from '../api'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const checkInLoading = ref(false)
const checkOutLoading = ref(false)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const totalEmployees = ref(0)
const attendanceRecords = ref<any[]>([])
const stats = ref({ present: 0, absent: 0, late: 0 })

const todayStatus = ref({
  status: 'not-marked',
  checkInTime: null as string | null,
  checkOutTime: null as string | null,
  isCheckedIn: false,
  isCheckedOut: false,
  duration: null as { hours: number; minutes: number } | null,
})

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    present: 'bg-green-100 text-green-600',
    absent: 'bg-red-100 text-red-600',
    late: 'bg-yellow-100 text-yellow-600',
    'half-day': 'bg-orange-100 text-orange-600',
    'not-marked': 'bg-gray-100 text-gray-500',
  }
  return classes[status] || 'bg-gray-100 text-gray-500'
}

const getStatusBadgeClass = (status: string) => getStatusClass(status)

const formatTime = (date: string | null) => {
  if (!date) return '--:--'
  try {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '--:--'
  }
}

const formatDateDisplay = (date: string) => {
  if (!date) return 'Today'
  try {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  } catch {
    return 'Today'
  }
}

// ✅ FIXED: Check if record is from today
const loadTodayStatus = async () => {
  try {
    const response = await api.get('/api/attendance/today-status')
    if (response.data.success) {
      const today = new Date()
      const todayStr = today.toDateString()
      
      // Check if the record date is today
      const recordDate = response.data.date ? new Date(response.data.date).toDateString() : null
      const isToday = recordDate === todayStr
      
      todayStatus.value = {
        status: response.data.status || 'not-marked',
        checkInTime: response.data.checkInTime ? formatTime(response.data.checkInTime) : null,
        checkOutTime: response.data.checkOutTime ? formatTime(response.data.checkOutTime) : null,
        // ✅ Only enable buttons if record is from TODAY
        isCheckedIn: isToday && (response.data.isCheckedIn || false),
        isCheckedOut: isToday && (response.data.isCheckedOut || false),
        duration: response.data.duration || null,
      }
    }
  } catch (error) {
    console.error('Failed to load today status:', error)
  }
}

const handleCheckIn = async () => {
  if (checkInLoading.value || todayStatus.value.isCheckedIn) return
  
  checkInLoading.value = true
  try {
    const response = await api.post('/api/attendance/check-in')
    if (response.data.success) {
      toast.success(response.data.message)
      await loadTodayStatus()
      await loadAttendance()
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Check-in failed')
  } finally {
    checkInLoading.value = false
  }
}

const handleCheckOut = async () => {
  if (checkOutLoading.value || !todayStatus.value.isCheckedIn || todayStatus.value.isCheckedOut) return
  
  checkOutLoading.value = true
  try {
    const response = await api.post('/api/attendance/check-out')
    if (response.data.success) {
      toast.success(response.data.message)
      await loadTodayStatus()
      await loadAttendance()
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Check-out failed')
  } finally {
    checkOutLoading.value = false
  }
}

const loadAttendance = async () => {
  loading.value = true
  try {
    const response = await api.get(`/api/attendance?date=${selectedDate.value}`)
    if (response.data.success) {
      attendanceRecords.value = response.data.attendance || []
      if (response.data.stats) {
        stats.value = {
          present: response.data.stats.present || 0,
          absent: response.data.stats.absent || 0,
          late: response.data.stats.late || 0,
        }
      }
      totalEmployees.value = attendanceRecords.value.length
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to load attendance')
  } finally {
    loading.value = false
  }
}

const updateAttendance = async (record: any) => {
  try {
    if (record.status === 'not-marked') return
    if (record.attendanceId) {
      await api.put(`/api/attendance/${record.attendanceId}`, { 
        status: record.status, 
        date: selectedDate.value 
      })
    } else {
      await api.post('/api/attendance', { 
        employeeId: record._id, 
        status: record.status, 
        date: selectedDate.value 
      })
    }
    toast.success(`${record.employeeName} marked as ${record.status}`)
    await loadAttendance()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to update attendance')
    await loadAttendance()
  }
}

const exportCSV = async () => {
  try {
    const response = await api.get(`/api/attendance/export?date=${selectedDate.value}`, { 
      responseType: 'blob' 
    })
    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `attendance_${selectedDate.value}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.success('CSV exported successfully!')
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to export CSV')
  }
}

const handleLogout = () => {
  authStore.logout()
  toast.info('Logged out successfully')
  router.push('/login')
}

onMounted(() => {
  loadTodayStatus()
  loadAttendance()
})
</script>