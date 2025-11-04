import axios from 'axios'

// Configuración base de Axios
const api = axios.create({
  baseURL: '/api', // El proxy de Vite redirigirá esto al backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Aquí puedes agregar tokens de autenticación
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Manejo global de errores
    if (error.response?.status === 401) {
      // Token expirado o no válido
      // Solo redirigir si no estamos en la página de login
      // Verificar si la URL de la petición es de login
      const isLoginRequest = error.config?.url?.includes('/login')
      if (!isLoginRequest) {
        localStorage.removeItem('auth_token')
        // Solo redirigir si no estamos ya en la página de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
