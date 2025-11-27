import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    return {
      user: null,
      token: token,
      isAuthenticated: false,
      loading: false,
      userRole: null,
      userType: null // 'docente' o 'profesor'
    }
  },

  getters: {
    isLoggedIn: (state) => {
      try {
        return !!state.token && state.isAuthenticated
      } catch {
        return false
      }
    },
    userInfo: (state) => state.user,
    isAdmin: (state) => {
      try {
        if (!state.userRole && !state.userType) return false
        return state.userRole === 'Administrador' || state.userRole === 1 || state.userType === 'docente'
      } catch {
        return false
      }
    },
    isProfesor: (state) => {
      try {
        if (!state.userRole && !state.userType) return false
        return state.userType === 'profesor' || state.userRole === 'Profesor' || state.userRole === 2
      } catch {
        return false
      }
    }
  },

  actions: {
    async login(credentials) {
      this.loading = true
      try {
        console.log('Intentando login con credenciales:', { email: credentials.email })
        
        // Intentar primero con docentes
        try {
          const docenteResponse = await api.post('/docentes/login/email', {
            email: credentials.email,
            password: credentials.password
          })
          
          console.log('Respuesta del servidor (docente):', docenteResponse.data)
          
          if (docenteResponse.data && docenteResponse.data.success) {
            const token = docenteResponse.data.data.token
            const docente = docenteResponse.data.data.docente
            
            // Decodificar token para obtener información del rol
            const payload = JSON.parse(atob(token.split('.')[1]))
            
            this.token = token
            this.user = {
              id: docente.id_docente,
              name: docente.nombre,
              email: docente.email,
              role: 'docente',
              id_rol: payload.id_rol,
              nombre_rol: payload.nombre_rol
            }
            this.userRole = payload.nombre_rol || payload.id_rol
            this.userType = 'docente'
            this.isAuthenticated = true
            
            localStorage.setItem('auth_token', token)
            localStorage.setItem('user_type', 'docente')
            localStorage.setItem('user_role', payload.nombre_rol || payload.id_rol)
            
            console.log('Login exitoso como docente:', this.user)
            
            return { success: true, data: docenteResponse.data, userType: 'docente' }
          }
        } catch (docenteError) {
          // Si falla con docentes, intentar con profesores
          console.log('No se encontró como docente, intentando como profesor...')
          
          try {
            const profesorResponse = await api.post('/profesores/login/correo', {
              email: credentials.email,
              password: credentials.password
            })
            
            console.log('Respuesta del servidor (profesor):', profesorResponse.data)
            
            if (profesorResponse.data && profesorResponse.data.success) {
              const token = profesorResponse.data.data.token
              const profesor = profesorResponse.data.data.profesor
              
              // Decodificar token para obtener información del rol
              const payload = JSON.parse(atob(token.split('.')[1]))
              
              this.token = token
              this.user = {
                id: profesor.id_profesor,
                name: profesor.nombre,
                email: profesor.correo,
                role: 'profesor',
                id_rol: profesor.id_rol,
                nombre_rol: profesor.nombre_rol,
                id_carrera: profesor.id_carrera,
                nombre_carrera: profesor.nombre_carrera
              }
              this.userRole = profesor.nombre_rol || profesor.id_rol
              this.userType = 'profesor'
              this.isAuthenticated = true
              
              localStorage.setItem('auth_token', token)
              localStorage.setItem('user_type', 'profesor')
              localStorage.setItem('user_role', profesor.nombre_rol || profesor.id_rol)
              
              console.log('Login exitoso como profesor:', this.user)
              
              return { success: true, data: profesorResponse.data, userType: 'profesor' }
            }
          } catch (profesorError) {
            console.error('Error en login de profesor:', profesorError)
            throw profesorError
          }
        }
        
        // Si llegamos aquí, ambos intentos fallaron
        return { 
          success: false, 
          error: 'Credenciales incorrectas' 
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

    logout() {
      console.log('Ejecutando logout...')
      
      // Limpiar localStorage PRIMERO (antes de limpiar el estado)
      try {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_type')
        localStorage.removeItem('user_role')
        
        // Limpiar preferencias de accesibilidad
        localStorage.removeItem('dyslexia-mode-enabled')
        localStorage.removeItem('accessibility-dyslexiaMode')
        
        console.log('localStorage limpiado')
      } catch (error) {
        console.error('Error al limpiar localStorage:', error)
      }
      
      // Desactivar modo dislexia si está activo
      if (typeof window !== 'undefined' && document.body) {
        try {
          // Remover clase de dislexia del body
          document.body.classList.remove('dyslexia-mode-enabled')
          
          // Remover estilos de dislexia
          const dyslexiaStyle = document.getElementById('dyslexia-accessibility-styles')
          if (dyslexiaStyle) {
            dyslexiaStyle.remove()
          }
        } catch (error) {
          console.warn('Error al desactivar modo dislexia:', error)
        }
      }
      
      // Limpiar estado local inmediatamente
      this.token = null
      this.user = null
      this.isAuthenticated = false
      this.userRole = null
      this.userType = null
      
      // Intentar cerrar sesión en el backend (no bloqueante)
      api.post('/auth/logout').catch(() => {
        // Si el endpoint no existe, no es crítico
        console.log('Endpoint de logout no disponible')
      })
      
      console.log('Sesión cerrada correctamente')
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
      try {
        const token = localStorage.getItem('auth_token')
        const userType = localStorage.getItem('user_type')
        const userRole = localStorage.getItem('user_role')
        
        if (token) {
          try {
            // Decodificar el token para obtener la información del usuario
            const payload = JSON.parse(atob(token.split('.')[1]))
            
            if (payload && (payload.id_docente || payload.id_profesor)) {
              this.token = token
              this.isAuthenticated = true
              this.userType = payload.tipo || userType || (payload.id_docente ? 'docente' : 'profesor')
              this.userRole = payload.nombre_rol || payload.id_rol || userRole || null
              
              if (payload.id_docente) {
                this.user = {
                  id: payload.id_docente,
                  name: payload.nombre,
                  email: payload.email,
                  role: 'docente',
                  id_rol: payload.id_rol,
                  nombre_rol: payload.nombre_rol
                }
              } else if (payload.id_profesor) {
                this.user = {
                  id: payload.id_profesor,
                  name: payload.nombre,
                  email: payload.correo,
                  role: 'profesor',
                  id_rol: payload.id_rol,
                  nombre_rol: payload.nombre_rol,
                  id_carrera: payload.id_carrera,
                  nombre_carrera: payload.nombre_carrera
                }
              }
              
              console.log('Estado de autenticación restaurado desde localStorage:', this.user)
              return true
            }
          } catch (e) {
            console.error('Error al restaurar autenticación:', e)
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_type')
            localStorage.removeItem('user_role')
            this.token = null
            this.isAuthenticated = false
            this.user = null
            this.userType = null
            this.userRole = null
            return false
          }
        }
        return false
      } catch (error) {
        console.error('Error crítico en initializeAuth:', error)
        return false
      }
    }
  }
})
