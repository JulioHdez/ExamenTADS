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
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Credenciales predeterminadas para demostración
        const defaultCredentials = {
          email: 'luisleal2.123654@gmail.com',
          password: 'admin123'
        }

        // Simular que el backend no está disponible, usar credenciales predeterminadas
        if (credentials.email === defaultCredentials.email && 
            credentials.password === defaultCredentials.password) {
          
          // Simular respuesta del servidor
          const mockResponse = {
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: 1,
              name: 'Administrador',
              email: credentials.email,
              role: 'admin'
            }
          }
          
          this.token = mockResponse.token
          this.user = mockResponse.user
          this.isAuthenticated = true
          
          localStorage.setItem('auth_token', mockResponse.token)
          
          return { success: true, data: mockResponse }
        } else {
          // Credenciales incorrectas
          return { 
            success: false, 
            error: 'Credenciales incorrectas' 
          }
        }
      } catch (error) {
        return { 
          success: false, 
          error: 'Error inesperado. Por favor, inténtalo de nuevo.' 
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
