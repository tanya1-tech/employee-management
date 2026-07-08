import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './style.css'
import App from './App.vue'

// Define routes

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('./views/Login.vue') },
  { 
    path: '/dashboard', 
    component: () => import('./views/Dashboard.vue'), 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/employees', 
    component: () => import('./views/Employees.vue'), 
    meta: { requiresAuth: true, hrOnly: true }  // Added hrOnly
  },
  { 
    path: '/attendance', 
    component: () => import('./views/Attendance.vue'), 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/profile', 
    component: () => import('./views/Profile.vue'), 
    meta: { requiresAuth: true } 
  },
]

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

// Auth guard - updated
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.hrOnly && user.role !== 'hr') {
    next('/dashboard')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

// Create app
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Toast)

app.mount('#app')