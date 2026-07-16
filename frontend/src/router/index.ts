import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Import views
const Login = () => import('../views/Login.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const Profile = () => import('../views/Profile.vue')
const Employees = () => import('../views/Employees.vue')
const Attendance = () => import('../views/Attendance.vue')

const routes = [
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
  // Catch all route - 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check authentication
  const isAuthenticated = authStore.checkAuth()
  
  // If route requires auth and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }
  
  // If route requires specific role
  if (to.meta.role && isAuthenticated) {
    const userRole = authStore.user?.role
    if (to.meta.role !== userRole) {
      // HR trying to access employee only routes, or vice versa
      next('/dashboard')
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