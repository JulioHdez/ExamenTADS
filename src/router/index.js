import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'

console.log('Router cargando...')

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/login',
    name: 'LoginRedirect',
    redirect: '/'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
]

console.log('Rutas definidas:', routes)

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación para autenticación
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    if (authStore.isLoggedIn) {
      next()
    } else {
      next('/')
    }
  }
  // Verificar si la ruta es solo para invitados (como login)
  else if (to.meta.requiresGuest) {
    if (authStore.isLoggedIn) {
      next('/dashboard')
    } else {
      next()
    }
  }
  // Rutas sin restricciones
  else {
    next()
  }
})

console.log('Router creado:', router)

export default router
