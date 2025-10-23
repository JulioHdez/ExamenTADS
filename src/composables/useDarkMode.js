import { ref, computed, watch } from 'vue'

// Estado global del modo oscuro
const isDarkMode = ref(false)

// Inicializar desde localStorage
const initializeDarkMode = () => {
  const savedTheme = localStorage.getItem('darkMode')
  if (savedTheme !== null) {
    isDarkMode.value = JSON.parse(savedTheme)
  } else {
    // Detectar preferencia del sistema
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
}

// Aplicar tema al documento
const applyTheme = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Guardar preferencia en localStorage
const saveThemePreference = () => {
  localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value))
}

// Toggle del modo oscuro
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  applyTheme()
  saveThemePreference()
}

// Computed para clases CSS
const darkModeClass = computed(() => ({
  'dark': isDarkMode.value
}))

// Watch para cambios en el modo oscuro
watch(isDarkMode, () => {
  applyTheme()
  saveThemePreference()
})

// Inicializar al cargar
if (typeof window !== 'undefined') {
  initializeDarkMode()
}

export function useDarkMode() {
  return {
    isDarkMode: computed(() => isDarkMode.value),
    toggleDarkMode,
    darkModeClass
  }
}
