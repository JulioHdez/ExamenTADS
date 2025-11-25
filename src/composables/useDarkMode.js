import { ref, computed, watch } from 'vue'

// Estado global del modo oscuro
const isDarkMode = ref(false)
let initialized = false
let watcher = null

export function useDarkMode() {
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

    // Guardar preferencia en localStorage
    const saveThemePreference = () => {
      if (typeof window === 'undefined' || !localStorage) return
      
      try {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value))
      } catch (error) {
        console.warn('Error al guardar preferencia de tema:', error)
      }
    }

    // Inicializar desde localStorage
    const initializeDarkMode = () => {
      if (typeof window === 'undefined' || !localStorage || !document.documentElement) return
      
      try {
        const savedTheme = localStorage.getItem('darkMode')
        if (savedTheme !== null) {
          isDarkMode.value = JSON.parse(savedTheme)
        } else {
          // Detectar preferencia del sistema
          if (window.matchMedia) {
            isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
          }
        }
        applyTheme()
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
