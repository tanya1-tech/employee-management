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
          <!-- Check-in Button -->
          <button 
            @click="handleCheckIn"
            :disabled="checkInLoading || todayStatus.isCheckedIn"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="checkInLoading" class="animate-spin">⏳</span>
            <span v-else>✅</span>
            Check In
          </button>
          
          <!-- Check-out Button -->
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
                      @change="updateAttendance(record, index)"
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
import api, { attendanceApi } from '../api'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// ============================================
// STATE
// ============================================
const loading = ref(false)
const checkInLoading = ref(false)
const checkOutLoading = ref(false)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const totalEmployees = ref(0)
const attendanceRecords = ref<any[]>([])
const stats = ref({
  present: 0,
  absent: 0,
  late: 0,
})

const todayStatus = ref({
  status: 'not-marked',
  checkInTime: null as string | null,
  checkOutTime: null as string | null,
  isCheckedIn: false,
  isCheckedOut: false,
  duration: null as { hours: number; minutes: number } | null,
})

// ============================================
// HELPERS
// ============================================
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

const getStatusBadgeClass = (status: string) => {
  return getStatusClass(status)
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

// ============================================
// LOAD TODAY'S STATUS
// ============================================
const loadTodayStatus = async () => {
  try {
    const response = await attendanceApi.getTodayStatus()
    if (response.data.success) {
      todayStatus.value = {
        status: response.data.status || 'not-marked',
        checkInTime: response.data.checkInTime ? formatTime(response.data.checkInTime) : null,
        checkOutTime: response.data.checkOutTime ? formatTime(response.data.checkOutTime) : null,
        isCheckedIn: response.data.isCheckedIn || false,
        isCheckedOut: response.data.isCheckedOut || false,
        duration: response.data.duration || null,
      }
    }
  } catch (error: any) {
    console.error('Failed to load today status:', error)
    // Don't show error toast for 404, just use default values
    if (error.response?.status !== 404) {
      toast.error('Failed to load today status')
    }
  }
}

// ============================================
// CHECK-IN
// ============================================
const handleCheckIn = async () => {
  if (checkInLoading.value) return
  
  if (todayStatus.value.isCheckedIn) {
    toast.warning('You already checked in today!')
    return
  }
  
  checkInLoading.value = true
  try {
    console.log('✅ Attempting check-in...')
    const response = await attendanceApi.checkIn()
    
    if (response.data.success) {
      toast.success(response.data.message)
      
      // Update today's status immediately
      todayStatus.value = {
        ...todayStatus.value,
        status: 'present',
        checkInTime: formatTime(response.data.checkInTime),
        isCheckedIn: true,
      }
      
      // Refresh attendance data
      await loadTodayStatus()
      await loadAttendance()
    }
  } catch (error: any) {
    console.error('Check-in error:', error)
    toast.error(error.response?.data?.message || 'Check-in failed')
  } finally {
    checkInLoading.value = false
  }
}

// ============================================
// CHECK-OUT
// ============================================
const handleCheckOut = async () => {
  // Check if already checked out or not checked in
  if (checkOutLoading.value) return
  
  if (!todayStatus.value.isCheckedIn) {
    toast.warning('You need to check-in first before checking out!')
    return
  }
  
  if (todayStatus.value.isCheckedOut) {
    toast.warning('You already checked out today!')
    return
  }
  
  checkOutLoading.value = true
  try {
    console.log('🚪 Attempting check-out...')
    const response = await attendanceApi.checkOut()
    
    if (response.data.success) {
      toast.success(response.data.message)
      
      // Update today's status immediately
      if (response.data.duration) {
        todayStatus.value = {
          ...todayStatus.value,
          status: 'present',
          checkOutTime: formatTime(response.data.checkOutTime),
          isCheckedOut: true,
          duration: response.data.duration,
        }
      }
      
      // Refresh attendance data
      await loadTodayStatus()
      await loadAttendance()
    }
  } catch (error: any) {
    console.error('Check-out error:', error)
    const message = error.response?.data?.message || 'Check-out failed'
    toast.error(message)
    
    // If no check-in found, refresh status
    if (message.includes('No check-in found')) {
      await loadTodayStatus()
    }
  } finally {
    checkOutLoading.value = false
  }
}

// ============================================
// LOAD ATTENDANCE
// ============================================
const loadAttendance = async () => {
  loading.value = true
  try {
    const response = await api.get(`/attendance?date=${selectedDate.value}`)
    
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
    console.error('Failed to load attendance:', error)
    toast.error(error.response?.data?.message || 'Failed to load attendance')
  } finally {
    loading.value = false
  }
}

// ============================================
// UPDATE ATTENDANCE
// ============================================
const updateAttendance = async (record: any, index: number) => {
  try {
    if (record.status === 'not-marked') {
      return
    }

    const payload = {
      employeeId: record._id,
      status: record.status,
      checkInTime: new Date(),
      date: selectedDate.value,
    }

    if (record.attendanceId) {
      await api.put(`/attendance/${record.attendanceId}`, {
        status: record.status,
        date: selectedDate.value,
      })
    } else {
      await api.post('/attendance', payload)
    }
    
    toast.success(`${record.employeeName} marked as ${record.status}`)
    await loadAttendance()
  } catch (error: any) {
    console.error('Update error:', error)
    toast.error(error.response?.data?.message || 'Failed to update attendance')
    await loadAttendance()
  }
}

// ============================================
// EXPORT CSV
// ============================================
const exportCSV = async () => {
  try {
    toast.info('Generating CSV...')
    
    const response = await attendanceApi.exportCSV(selectedDate.value, selectedDate.value)
    
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
    console.error('Export error:', error)
    toast.error(error.response?.data?.message || 'Failed to export CSV')
  }
}

// ============================================
// LOGOUT
// ============================================
const handleLogout = () => {
  authStore.logout()
  toast.info('Logged out successfully')
  router.push('/login')
}

// ============================================
// LIFECYCLE
// ============================================
onMounted(() => {
  loadTodayStatus()
  loadAttendance()
})
</script>