import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './style.css'
import App from './App.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('./views/Login.vue') },
  { path: '/dashboard', component: () => import('./views/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/employees', component: () => import('./views/Employees.vue'), meta: { requiresAuth: true, hrOnly: true } },
  { path: '/attendance', component: () => import('./views/Attendance.vue'), meta: { requiresAuth: true } },
  { path: '/profile', component: () => import('./views/Profile.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  if (to.meta.hrOnly && user.role !== 'hr') {
    next('/dashboard')
    return
  }

  if (to.path === '/login' && token) {
    next('/dashboard')
    return
  }

  next()
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Toast)

app.mount('#app')