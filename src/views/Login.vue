<template>
  <div class="login-container">
    <!-- Menú de Accesibilidad -->
    <AccessibilityMenu />
    
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">Sistema Estudiantil</h1>
        <p class="login-subtitle">Inicia sesión para acceder al panel de control</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Correo electrónico</label>
          <input
            id="email"
            v-model="credentials.email"
            @blur="validateEmail"
            @input="clearEmailError"
            type="email"
            class="form-control"
            :class="{ 'error': errors.email }"
            placeholder="usuario@ejemplo.com"
            required
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <div class="password-input-container">
            <input
              id="password"
              v-model="credentials.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control password-input"
              :class="{ 'error': errors.password }"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              class="password-toggle-btn"
              @click="togglePasswordVisibility"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <svg v-if="!showPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>


        <button 
          type="submit" 
          class="btn btn-primary login-btn"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import AccessibilityMenu from '@/components/ui/AccessibilityMenu.vue'
import { useDarkMode } from '@/composables/useDarkMode'
import { useZoom } from '@/composables/useZoom'
import { useGreyMode } from '@/composables/useGreyMode'
import { useColorBlindness } from '@/composables/useColorBlindness'
import { useCursorSize } from '@/composables/useCursorSize'
import { useTextHighlight } from '@/composables/useTextHighlight'
import { useParkinsonAccessibility } from '@/composables/useParkinsonAccessibility'

const router = useRouter()
const authStore = useAuthStore()
const { showError, showSuccess } = useNotifications()

// Estado del formulario
const credentials = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const showPassword = ref(false)

// Credenciales predeterminadas para demostración
const defaultCredentials = {
  email: 'admin@sistema.com',
  password: 'admin123'
}

// Función de validación de email más estricta
const isValidEmail = (email) => {
  // Verificar que no esté vacío
  if (!email || email.trim() === '') {
    return false
  }
  
  // Verificar que tenga @
  if (!email.includes('@')) {
    return false
  }
  
  // Verificar que tenga al menos un punto después del @
  const parts = email.split('@')
  if (parts.length !== 2 || !parts[1].includes('.')) {
    return false
  }
  
  // Verificar que el dominio tenga al menos 2 caracteres
  const domain = parts[1]
  const domainParts = domain.split('.')
  if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
    return false
  }
  
  // Verificar que no tenga espacios
  if (email.includes(' ')) {
    return false
  }
  
  // Expresión regular para validar formato completo
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

// Validación del formulario
const validateForm = () => {
  let isValid = true
  
  // Limpiar errores anteriores
  errors.email = ''
  errors.password = ''

  // Validar email
  if (!credentials.email) {
    errors.email = 'El correo electrónico es requerido'
    isValid = false
  } else if (!isValidEmail(credentials.email)) {
    errors.email = 'Dirección de correo inválida. El correo debe tener @ y un dominio válido (.com, .mx, etc.)'
    isValid = false
  }

  // Validar contraseña
  if (!credentials.password) {
    errors.password = 'La contraseña es requerida'
    isValid = false
  } else if (credentials.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }

  return isValid
}

// Manejo del login
const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // Usar el store de autenticación que ya maneja credenciales predeterminadas
    const result = await authStore.login(credentials)
    
    console.log('Resultado del login:', result)
    
    if (result && result.success) {
      console.log('Login exitoso, redirigiendo según rol...')
      console.log('Token guardado:', authStore.token)
      console.log('Usuario:', authStore.user)
      console.log('Tipo de usuario:', result.userType)
      
      showSuccess(
        '¡Bienvenido!',
        'Has iniciado sesión correctamente'
      )
      
      // Redireccionar según el tipo de usuario y forzar recarga completa de la página
      if (result.userType === 'profesor' || authStore.isProfesor) {
        window.location.href = '/profesor-dashboard'
      } else {
        window.location.href = '/dashboard'
      }
      console.log('Redirección completada')
    } else {
      // Manejar error de credenciales incorrectas
      const errorMessage = result?.error || 'Credenciales incorrectas'
      console.log('Login fallido:', errorMessage)
      
      showError(
        'Credenciales incorrectas',
        'El usuario o contraseña son incorrectos. Por favor, verifica tus datos e intenta nuevamente.'
      )
      
      // Limpiar los campos del formulario después de un pequeño delay para asegurar que el mensaje se muestre
      setTimeout(() => {
        credentials.email = ''
        credentials.password = ''
        errors.email = ''
        errors.password = ''
      }, 100)
    }
  } catch (error) {
    console.error('Error completo en login:', error)
    
    // Solo mostrar error si no es un error de credenciales (que ya se maneja en el else)
    if (!error.response || error.response.status !== 401) {
      showError(
        'Error de conexión',
        'No se pudo conectar con el servidor. Por favor, inténtalo de nuevo más tarde.'
      )
    } else {
      // Error 401 - credenciales incorrectas
      showError(
        'Credenciales incorrectas',
        'El usuario o contraseña son incorrectos. Por favor, verifica tus datos e intenta nuevamente.'
      )
    }
    
    // Limpiar los campos del formulario en caso de error
    setTimeout(() => {
      credentials.email = ''
      credentials.password = ''
      errors.email = ''
      errors.password = ''
    }, 100)
  } finally {
    loading.value = false
  }
}

// Auto-rellenar credenciales de demostración (opcional)
const fillDemoCredentials = () => {
  credentials.email = defaultCredentials.email
  credentials.password = defaultCredentials.password
}

// Validación en tiempo real del email
const validateEmail = () => {
  if (!credentials.email) {
    errors.email = 'El correo electrónico es requerido'
    return false
  } else if (!isValidEmail(credentials.email)) {
    errors.email = 'Dirección de correo inválida. El correo debe tener @ y un dominio válido (.com, .mx, etc.)'
    return false
  } else {
    errors.email = ''
    return true
  }
}

// Limpiar error de email cuando el usuario empiece a escribir
const clearEmailError = () => {
  if (errors.email) {
    errors.email = ''
  }
}

// Alternar visibilidad de la contraseña
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Limpiar preferencias de accesibilidad al mostrar el login
onMounted(() => {
  // Resetear todas las preferencias a valores por defecto
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const { zoomPercentage, resetZoom } = useZoom()
  const { isGreyMode, toggleGreyMode } = useGreyMode()
  const { setColorBlindnessType } = useColorBlindness()
  const { cursorSize, decreaseCursorSize, increaseCursorSize } = useCursorSize()
  const { isTextHighlightEnabled, toggleTextHighlight } = useTextHighlight()
  const { isParkinsonModeEnabled, toggleParkinsonMode } = useParkinsonAccessibility()
  
  // Resetear a valores por defecto
  if (isDarkMode.value) {
    toggleDarkMode()
  }
  
  if (zoomPercentage.value !== '100%') {
    resetZoom()
  }
  
  if (isGreyMode.value) {
    toggleGreyMode()
  }
  
  setColorBlindnessType('none')
  
  // Resetear cursor size a 100% (ajustar directamente)
  const currentCursorSize = cursorSize.value
  if (currentCursorSize > 100) {
    const steps = Math.ceil((currentCursorSize - 100) / 25)
    for (let i = 0; i < steps; i++) {
      decreaseCursorSize()
    }
  } else if (currentCursorSize < 100) {
    const steps = Math.ceil((100 - currentCursorSize) / 25)
    for (let i = 0; i < steps; i++) {
      increaseCursorSize()
    }
  }
  
  if (isTextHighlightEnabled.value) {
    toggleTextHighlight()
  }
  
  if (isParkinsonModeEnabled.value) {
    toggleParkinsonMode()
  }
  
  // Limpiar posición del menú y preferencias de localStorage
  if (typeof window !== 'undefined' && localStorage) {
    try {
      localStorage.removeItem('accessibility-menu-position-x')
      localStorage.removeItem('accessibility-menu-position-y')
      // También limpiar otras preferencias de accesibilidad
      localStorage.removeItem('darkMode')
      localStorage.removeItem('zoomLevel')
      localStorage.removeItem('greyMode')
      localStorage.removeItem('color-blindness-type')
      localStorage.removeItem('cursor-size-percentage')
      localStorage.removeItem('text-highlight-enabled')
      localStorage.removeItem('parkinson-mode-enabled')
      localStorage.removeItem('voice-reader')
    } catch (error) {
      console.warn('Error al limpiar preferencias:', error)
    }
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
  position: relative;
  transition: background 0.3s ease;
}


/* Dark mode styles */
.dark .login-container {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.8);
  padding: 3.5rem;
  width: 100%;
  max-width: 600px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

/* Dark mode card */
.dark .login-card {
  background: #1e293b;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(51, 65, 85, 0.3);
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #007bff, #0056b3);
}

.login-header {
  text-align: center;
  margin-bottom: 3rem;
}

.login-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.025em;
  transition: color 0.3s ease;
}

.dark .login-title {
  color: #f1f5f9;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  font-size: 1.125rem;
  color: #64748b;
  margin: 0;
  font-weight: 400;
  transition: color 0.3s ease;
}

.dark .login-subtitle {
  color: #94a3b8;
}

.login-form {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 2rem;
}

.form-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
  letter-spacing: 0.025em;
  transition: color 0.3s ease;
}

.dark .form-label {
  color: #e2e8f0;
}

.form-control {
  width: 100%;
  padding: 1.25rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  background-color: #f8fafc;
  color: #1e293b;
  font-weight: 500;
}

.dark .form-control {
  background-color: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

.dark .form-control:focus {
  background-color: #1e293b;
  border-color: #3b82f6;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-control.error {
  border-color: #ef4444;
  background-color: #fef2f2;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.dark .form-control.error {
  background-color: #7f1d1d;
  border-color: #fca5a5;
  box-shadow: 0 0 0 3px rgba(252, 165, 165, 0.1);
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

.dark .error-message {
  color: #fca5a5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Password input container */
.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  padding-right: 3rem; /* Espacio para el botón */
}

.password-toggle-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #64748b;
  z-index: 10;
}

.password-toggle-btn:hover {
  background-color: #f1f5f9;
  color: #3b82f6;
}

.dark .password-toggle-btn {
  color: #94a3b8;
}

.dark .password-toggle-btn:hover {
  background-color: #334155;
  color: #60a5fa;
}

.eye-icon {
  width: 20px;
  height: 20px;
  transition: all 0.2s ease;
}

.password-toggle-btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}


.login-btn {
  width: 100%;
  padding: 1.25rem 2rem;
  font-size: 1.125rem;
  font-weight: 700;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.025em;
  text-transform: none;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 123, 255, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* Responsive */
@media (max-width: 768px) {
  .login-container {
    padding: 1.5rem;
  }
  
  .login-card {
    padding: 2.5rem;
    max-width: 500px;
  }
  
  .login-title {
    font-size: 2.4rem;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-card {
    padding: 2rem;
    max-width: 100%;
  }
  
  .login-title {
    font-size: 2rem;
  }
  
  .form-control {
    padding: 1rem;
    font-size: 1rem;
  }
  
  .login-btn {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
