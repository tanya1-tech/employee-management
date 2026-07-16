import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Import views
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Profile from '../views/Profile.vue'
import Employees from '../views/Employees.vue'
import Attendance from '../views/Attendance.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/employees',
    name: 'Employees',
    component: Employees,
    meta: { requiresAuth: true, role: 'hr' }
  },
  {
    path: '/attendance',
    name: 'Attendance',
    component: Attendance,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes  
})

// Navigation guard - NO infinite loop
router.beforeEach((to, from, next) => {
  // Directly check localStorage - DON'T call authStore.checkAuth()
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  const isAuthenticated = !!token && !!user
  
  // If route requires auth and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }
  
  // If route requires specific role
  if (to.meta.role && isAuthenticated) {
    try {
      const userData = JSON.parse(user || '{}')
      const userRole = userData?.role
      if (to.meta.role !== userRole) {
        next('/dashboard')
        return
      }
    } catch {
      next('/login')
      return
    }
  }
  
  // If already logged in and trying to go to login page
  if (to.path === '/login' && isAuthenticated) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router