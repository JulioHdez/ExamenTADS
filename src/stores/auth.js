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
        // Conectar al backend real
        const response = await api.post('/docentes/login/email', {
          email: credentials.email,
          password: credentials.password
        })
        
        if (response.data.success) {
          // Crear token simulado para el frontend
          const token = 'jwt-token-' + Date.now()
          
          this.token = token
          this.user = {
            id: response.data.data.id_docente,
            name: response.data.data.nombre,
            email: response.data.data.email,
            role: 'docente'
          }
          this.isAuthenticated = true
          
          localStorage.setItem('auth_token', token)
          
          return { success: true, data: response.data }
        } else {
          return { 
            success: false, 
            error: response.data.message || 'Credenciales incorrectas' 
          }
        }
      } catch (error) {
        console.error('Error en login:', error)
        return { 
          success: false, 
          error: error.response?.data?.message || 'Error de conexión. Verifica que el backend esté ejecutándose.' 
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
    }
  }
})
