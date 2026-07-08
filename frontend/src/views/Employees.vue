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
          
          <router-link v-if="authStore.isHR" to="/employees" class="flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 transition">
            <span>👥</span>
            <span>Employees</span>
          </router-link>
          
          <router-link to="/attendance" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
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
      <header class="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">Employee Management</h1>
        <button v-if="authStore.isHR" @click="openAddModal" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition">
          + Add Employee
        </button>
      </header>

      <main class="p-8">
        <!-- Search -->
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-4 flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search employees..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <button v-if="authStore.isHR" @click="exportCSV" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            📥 Export CSV
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-500">Loading employees...</p>
        </div>

        <!-- Employee Table -->
        <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-if="filteredEmployees.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No employees found. Click "Add Employee" to add one.
                  </td>
                </tr>
                <tr v-for="emp in filteredEmployees" :key="emp._id || emp.id" class="hover:bg-gray-50 transition">
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ emp.employeeId }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ emp.name }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ emp.department }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ emp.email }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full" :class="getStatusClass(emp.status)">
                      {{ emp.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <button v-if="authStore.isHR" @click="editEmployee(emp)" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                      <button v-if="authStore.isHR" @click="deleteEmployee(emp._id || emp.id)" class="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                      <span v-else class="text-gray-400 text-sm">View Only</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ editingEmployee ? 'Edit Employee' : 'Add Employee' }}</h2>
        <form @submit.prevent="saveEmployee" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input v-model="form.name" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <input v-model="form.department" type="text" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input v-model="form.email" type="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="form.status" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="submit" class="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition">
              {{ editingEmployee ? 'Update' : 'Add' }}
            </button>
            <button type="button" @click="closeModal" class="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Credentials Modal -->
    <div v-if="showCredentials" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-md w-full">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">✅</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800">Employee Added!</h2>
          <p class="text-gray-500 mt-2">Share these login credentials with the employee</p>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
          <div class="flex justify-between">
            <span class="text-gray-600">Username:</span>
            <span class="font-mono font-bold text-gray-800">{{ newCredentials.username }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Password:</span>
            <span class="font-mono font-bold text-blue-600">{{ newCredentials.password }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Email:</span>
            <span class="font-mono text-gray-800">{{ newCredentials.email }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button @click="copyCredentials" class="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            📋 Copy
          </button>
          <button @click="showCredentials = false" class="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'
import api from '../api'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const employees = ref<any[]>([])
const searchQuery = ref('')
const showModal = ref(false)
const showCredentials = ref(false)
const editingEmployee = ref<any>(null)
const loading = ref(false)
const newCredentials = ref({ username: '', password: '', email: '' })

const form = ref({
  name: '',
  department: '',
  email: '',
  status: 'active',
})

const filteredEmployees = computed(() => {
  let result = [...employees.value]
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(emp =>
      emp.name?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.employeeId?.toLowerCase().includes(q)
    )
  }
  
  result.sort((a, b) => {
    const idA = parseInt(a.employeeId?.replace('EMP', '') || '0')
    const idB = parseInt(b.employeeId?.replace('EMP', '') || '0')
    return idA - idB
  })
  
  return result
})

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    active: 'bg-green-100 text-green-600',
    inactive: 'bg-yellow-100 text-yellow-600',
    terminated: 'bg-red-100 text-red-600',
  }
  return classes[status] || 'bg-gray-100 text-gray-600'
}

const loadEmployees = async () => {
  loading.value = true
  try {
    const response = await api.get('/employees')
    employees.value = response.data.employees || []
  } catch (error) {
    console.error('Failed to load employees:', error)
    toast.error('Failed to load employees')
    employees.value = []
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  editingEmployee.value = null
  form.value = { name: '', department: '', email: '', status: 'active' }
  showModal.value = true
}

const saveEmployee = async () => {
  try {
    if (editingEmployee.value) {
      const id = editingEmployee.value._id || editingEmployee.value.id
      await api.put(`/employees/${id}`, form.value)
      toast.success('Employee updated successfully')
    } else {
      const response = await api.post('/employees', form.value)
      
      if (response.data.loginCredentials) {
        newCredentials.value = response.data.loginCredentials
        showCredentials.value = true
      }
      
      toast.success('Employee added successfully!')
    }
    
    closeModal()
    await loadEmployees()
  } catch (error: any) {
    console.error('Save error:', error)
    toast.error(error.response?.data?.message || 'Failed to save employee')
  }
}

const editEmployee = (emp: any) => {
  editingEmployee.value = emp
  form.value = {
    name: emp.name || '',
    department: emp.department || '',
    email: emp.email || '',
    status: emp.status || 'active',
  }
  showModal.value = true
}

const deleteEmployee = async (id: string) => {
  if (!confirm('Are you sure you want to delete this employee?')) return
  
  try {
    await api.delete(`/employees/${id}`)
    toast.success('Employee deleted successfully')
    await loadEmployees()
  } catch (error) {
    console.error('Delete error:', error)
    toast.error('Failed to delete employee')
  }
}

const closeModal = () => {
  showModal.value = false
  editingEmployee.value = null
  form.value = { name: '', department: '', email: '', status: 'active' }
}

const copyCredentials = () => {
  const text = `Login Credentials:
Username: ${newCredentials.value.username}
Password: ${newCredentials.value.password}
Email: ${newCredentials.value.email}`

  navigator.clipboard.writeText(text)
  toast.success('Credentials copied to clipboard!')
}

const exportCSV = () => {
  if (employees.value.length === 0) {
    toast.warning('No employees to export')
    return
  }
  
  let csv = 'ID,Name,Department,Email,Status\n'
  employees.value.forEach(emp => {
    csv += `${emp.employeeId},${emp.name},${emp.department},${emp.email},${emp.status}\n`
  })
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'employees.csv'
  a.click()
  URL.revokeObjectURL(url)
  toast.success('CSV exported successfully')
}

const handleLogout = () => {
  authStore.logout()
  toast.info('Logged out successfully')
  router.push('/login')
}

onMounted(() => {
  loadEmployees()
})
</script>