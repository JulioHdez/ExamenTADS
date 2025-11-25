import { ref, computed, watch } from 'vue'
import { useAccessibilityPreferences } from './useAccessibilityPreferences'

// Estado global del modo oscuro
const isDarkMode = ref(false)
let initialized = false
let watcher = null

export function useDarkMode() {
  const { updatePreference } = useAccessibilityPreferences()
  
  // Inicializar solo una vez
  if (!initialized && typeof window !== 'undefined' && typeof document !== 'undefined') {
    initialized = true

    // Aplicar tema al documento
    const applyTheme = () => {
      if (typeof window === 'undefined' || !document.documentElement) return
      
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    // Guardar preferencia (backend si está autenticado, localStorage si no)
    const saveThemePreference = async () => {
      if (typeof window === 'undefined') return
      
      try {
        // Intentar guardar en backend
        await updatePreference('darkMode', isDarkMode.value)
        
        // También guardar en localStorage como backup
        if (localStorage) {
          localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value))
        }
      } catch (error) {
        console.warn('Error al guardar preferencia de tema:', error)
        // Fallback a localStorage
        if (localStorage) {
          try {
            localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value))
          } catch (e) {
            console.warn('Error al guardar en localStorage:', e)
          }
        }
      }
    }

    // Inicializar desde localStorage (no desde backend en la inicialización)
    // El backend se carga cuando el usuario inicia sesión desde App.vue
    const initializeDarkMode = () => {
      if (typeof window === 'undefined' || !document.documentElement) return
      
      try {
        // Cargar desde localStorage
        if (localStorage) {
          const savedTheme = localStorage.getItem('darkMode')
          if (savedTheme !== null) {
            isDarkMode.value = JSON.parse(savedTheme)
            applyTheme()
            return
          }
        }
        
        // Si no hay nada guardado, detectar preferencia del sistema
        if (window.matchMedia) {
          isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
          applyTheme()
        }
      } catch (error) {
        console.warn('Error al inicializar modo oscuro:', error)
      }
    }

    // Watch para cambios en el modo oscuro (solo una vez)
    watcher = watch(isDarkMode, () => {
      applyTheme()
      saveThemePreference()
    })

    // Inicializar al cargar (con delay para asegurar que el DOM esté listo)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeDarkMode, { once: true })
    } else {
      // DOM ya está listo
      setTimeout(initializeDarkMode, 0)
    }
  }

  // Toggle del modo oscuro
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
  }

  // Computed para clases CSS
  const darkModeClass = computed(() => ({
    'dark': isDarkMode.value
  }))

  return {
    isDarkMode: computed(() => isDarkMode.value),
    toggleDarkMode,
    darkModeClass
  }
}
