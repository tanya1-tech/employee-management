import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Import views - use direct imports for now to avoid loading issues
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'

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
  console.log('🔍 Router guard checking auth...')
  
  // Check authentication
  const isAuthenticated = authStore.checkAuth()
  console.log('🔍 Is authenticated:', isAuthenticated)
  
  // If route requires auth and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login')
    next('/login')
    return
  }
  
  // If already logged in and trying to go to login page
  if (to.path === '/login' && isAuthenticated) {
    console.log('✅ Already logged in, redirecting to dashboard')
    next('/dashboard')
    return
  }
  
  next()
})

export default router