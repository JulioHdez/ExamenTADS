import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && state.isAuthenticated,
    userInfo: (state) => state.user
  },

  actions: {
    async login(credentials) {
      this.loading = true
      try {
        console.log('Intentando login con credenciales:', { email: credentials.email })
        
        // Conectar al backend real
        const response = await api.post('/docentes/login/email', {
          email: credentials.email,
          password: credentials.password
        })
        
        console.log('Respuesta del servidor:', response.data)
        
        if (response.data && response.data.success) {
          // Usar el token real del backend
          const token = response.data.data.token
          
          this.token = token
          this.user = {
            id: response.data.data.docente.id_docente,
            name: response.data.data.docente.nombre,
            email: response.data.data.docente.email,
            role: 'docente'
          }
          this.isAuthenticated = true
          
          localStorage.setItem('auth_token', token)
          
          console.log('Login exitoso, usuario autenticado:', this.user)
          
          return { success: true, data: response.data }
        } else {
          console.log('Login fallido:', response.data)
          return { 
            success: false, 
            error: response.data?.message || 'Credenciales incorrectas' 
          }
        }
      } catch (error) {
        console.error('Error en login:', error)
        console.error('Detalles del error:', error.response)
        return { 
          success: false, 
          error: error.response?.data?.message || 'Error de conexión. Verifica que el backend esté ejecutándose en http://localhost:3001' 
        }
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      try {
        const response = await api.post('/auth/register', userData)
        return { success: true, data: response.data }
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Error al registrarse' 
        }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
      } finally {
        this.token = null
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('auth_token')
      }
    },

    async fetchUser() {
      if (!this.token) return

      try {
        const response = await api.get('/auth/me')
        this.user = response.data
        this.isAuthenticated = true
      } catch (error) {
        this.logout()
      }
    },

    // Inicializar el estado desde el token en localStorage
    initializeAuth() {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          // Decodificar el token para obtener la información del usuario
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (payload && payload.id_docente) {
            this.token = token
            this.isAuthenticated = true
            this.user = {
              id: payload.id_docente,
              name: payload.nombre,
              email: payload.email,
              role: 'docente'
            }
            console.log('Estado de autenticación restaurado desde localStorage:', this.user)
            return true
          }
        } catch (e) {
          console.error('Error al restaurar autenticación:', e)
          localStorage.removeItem('auth_token')
          return false
        }
      }
      return false
    }
  }
})
