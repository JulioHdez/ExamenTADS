import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import ProfesorDashboard from '../views/ProfesorDashboard.vue'

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
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/profesor-dashboard',
    name: 'ProfesorDashboard',
    component: ProfesorDashboard,
    meta: { requiresAuth: true, requiresProfesor: true }
  }
]

console.log('Rutas definidas:', routes)

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación para autenticación
router.beforeEach((to, from, next) => {
  try {
    console.log('=== NAVEGACIÓN ===')
    console.log('De:', from.path, '→ A:', to.path)
    
    const authStore = useAuthStore()
    
    console.log('Estado de autenticación:', {
      isLoggedIn: authStore.isLoggedIn,
      hasToken: !!authStore.token,
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user,
      userType: authStore.userType,
      userRole: authStore.userRole
    })
    
    // Verificar si la ruta requiere autenticación
    if (to.meta.requiresAuth) {
      if (authStore.isLoggedIn) {
        // Verificar si requiere rol específico
        const isProfesor = authStore.isProfesor || false
        const isAdmin = authStore.isAdmin || false
        
        if (to.meta.requiresAdmin && isProfesor) {
          console.log('✗ Ruta requiere administrador, redirigiendo a dashboard de profesor')
          next('/profesor-dashboard')
          return
        }
        if (to.meta.requiresProfesor && isAdmin) {
          console.log('✗ Ruta requiere profesor, redirigiendo a dashboard de administrador')
          next('/dashboard')
          return
        }
        console.log('✓ Usuario autenticado, permitiendo acceso')
        next()
      } else {
        console.log('✗ Usuario no autenticado, redirigiendo a login')
        next('/')
      }
    }
    // Verificar si la ruta es solo para invitados (como login)
    else if (to.meta.requiresGuest) {
      // Verificar tanto el store como localStorage para asegurar que no hay sesión activa
      const hasTokenInStorage = typeof window !== 'undefined' && localStorage.getItem('auth_token')
      const isLoggedIn = authStore.isLoggedIn || hasTokenInStorage
      
      if (isLoggedIn && hasTokenInStorage) {
        console.log('→ Usuario ya autenticado, redirigiendo según rol')
        // Redirigir según el tipo de usuario
        const isProfesor = authStore.isProfesor || false
        if (isProfesor) {
          next('/profesor-dashboard')
        } else {
          next('/dashboard')
        }
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
  } catch (error) {
    console.error('Error en router guard:', error)
    // En caso de error, permitir acceso a login
    if (to.path !== '/') {
      next('/')
    } else {
      next()
    }
  }
})

console.log('Router creado:', router)

export default router
