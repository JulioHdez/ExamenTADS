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
  console.log('=== NAVEGACIÓN ===')
  console.log('De:', from.path, '→ A:', to.path)
  
  const authStore = useAuthStore()
  
  console.log('Estado de autenticación:', {
    isLoggedIn: authStore.isLoggedIn,
    hasToken: !!authStore.token,
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user
  })
  
  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    if (authStore.isLoggedIn) {
      console.log('✓ Usuario autenticado, permitiendo acceso')
      next()
    } else {
      console.log('✗ Usuario no autenticado, redirigiendo a login')
      next('/')
    }
  }
  // Verificar si la ruta es solo para invitados (como login)
  else if (to.meta.requiresGuest) {
    if (authStore.isLoggedIn) {
      console.log('→ Usuario ya autenticado, redirigiendo a dashboard')
      next('/dashboard')
    } else {
      console.log('→ Usuario no autenticado, permitiendo acceso a login')
      next()
    }
  }
  // Rutas sin restricciones
  else {
    console.log('→ Ruta sin restricciones, permitiendo acceso')
    next()
  }
})

console.log('Router creado:', router)

export default router
