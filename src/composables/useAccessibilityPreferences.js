import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

// Estado global para las preferencias
const preferences = ref(null)
const isLoading = ref(false)
const lastSyncTime = ref(null)

// Función para guardar preferencias en el backend
export const savePreferencesToBackend = async (prefs) => {
  const authStore = useAuthStore()
  
  // Solo guardar en backend si el usuario está autenticado
  if (!authStore.isLoggedIn) {
    return false
  }

  try {
    isLoading.value = true
    
    // Preparar los datos para enviar
    const dataToSave = {
      dark_mode: prefs.darkMode ?? false,
      zoom_level: prefs.zoomLevel ?? 100,
      grey_mode: prefs.greyMode ?? false,
      color_blindness_type: prefs.colorBlindnessType ?? 'none',
      cursor_size: prefs.cursorSize ?? 100,
      text_highlight: prefs.textHighlight ?? false,
      parkinson_mode: prefs.parkinsonMode ?? false,
      voice_reader: prefs.voiceReader ?? false,
      dyslexia_mode: prefs.dyslexiaMode ?? false,
      menu_position_x: prefs.menuPositionX ?? null,
      menu_position_y: prefs.menuPositionY ?? null
    }

    const response = await api.post('/preferencias/me', dataToSave)
    
    if (response.data.success) {
      preferences.value = response.data.data
      lastSyncTime.value = new Date()
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error al guardar preferencias en el backend:', error)
    return false
  } finally {
    isLoading.value = false
  }
}

// Función para cargar preferencias desde el backend
export const loadPreferencesFromBackend = async () => {
  const authStore = useAuthStore()
  
  // Solo cargar desde backend si el usuario está autenticado
  if (!authStore.isLoggedIn) {
    return null
  }

  try {
    isLoading.value = true
    const response = await api.get('/preferencias/me')
    
    // Si hay preferencias guardadas, retornarlas
    // Si no hay (data es null), retornar null para mantener valores actuales
    if (response.data.success && response.data.data) {
      preferences.value = response.data.data
      lastSyncTime.value = new Date()
      
      // Retornar las preferencias en formato compatible con los composables
      return {
        darkMode: response.data.data.dark_mode ?? false,
        zoomLevel: response.data.data.zoom_level ?? 100,
        greyMode: response.data.data.grey_mode ?? false,
        colorBlindnessType: response.data.data.color_blindness_type ?? 'none',
        cursorSize: response.data.data.cursor_size ?? 100,
        textHighlight: response.data.data.text_highlight ?? false,
        parkinsonMode: response.data.data.parkinson_mode ?? false,
        voiceReader: response.data.data.voice_reader ?? false,
        dyslexiaMode: response.data.data.dyslexia_mode ?? false,
        menuPositionX: response.data.data.menu_position_x ?? null,
        menuPositionY: response.data.data.menu_position_y ?? null
      }
    }
    
    // No hay preferencias guardadas - retornar null para mantener valores actuales
    return null
  } catch (error) {
    console.error('Error al cargar preferencias desde el backend:', error)
    return null
  } finally {
    isLoading.value = false
  }
}

// Mapeo de campos camelCase (frontend) a snake_case (backend)
const fieldMapping = {
  'darkMode': 'dark_mode',
  'zoomLevel': 'zoom_level',
  'greyMode': 'grey_mode',
  'colorBlindnessType': 'color_blindness_type',
  'cursorSize': 'cursor_size',
  'textHighlight': 'text_highlight',
  'parkinsonMode': 'parkinson_mode',
  'voiceReader': 'voice_reader',
  'dyslexiaMode': 'dyslexia_mode',
  'menuPositionX': 'menu_position_x',
  'menuPositionY': 'menu_position_y'
}

// Función para actualizar una preferencia específica en el backend
export const updatePreferenceInBackend = async (campo, valor) => {
  const authStore = useAuthStore()
  
  if (!authStore.isLoggedIn) {
    return false
  }

  try {
    // Convertir el nombre del campo de camelCase a snake_case
    const backendField = fieldMapping[campo] || campo
    
    // Preparar el valor según el tipo
    let valorFinal = valor
    if (typeof valor === 'boolean') {
      valorFinal = valor
    } else if (typeof valor === 'number') {
      valorFinal = valor
    } else {
      valorFinal = valor.toString()
    }
    
    const response = await api.patch('/preferencias/me', {
      campo: backendField,
      valor: valorFinal
    })
    
    if (response.data && response.data.success) {
      preferences.value = response.data.data
      lastSyncTime.value = new Date()
      console.log(`Preferencia ${campo} guardada correctamente en el backend`)
      return true
    }
    
    return false
  } catch (error) {
    // Si el error es 404, significa que la ruta no existe (servidor no reiniciado)
    if (error.response && error.response.status === 404) {
      console.warn('Ruta de preferencias no encontrada. Asegúrate de que el servidor esté reiniciado.')
    } else {
      console.error('Error al actualizar preferencia en el backend:', error)
      if (error.response) {
        console.error('Detalles del error:', error.response.data)
      }
    }
    return false
  }
}

// Función para guardar preferencias en localStorage (fallback cuando no hay usuario)
export const savePreferencesToLocalStorage = (prefs) => {
  if (typeof window === 'undefined' || !localStorage) return
  
  try {
    Object.keys(prefs).forEach(key => {
      if (prefs[key] !== null && prefs[key] !== undefined) {
        localStorage.setItem(`accessibility-${key}`, JSON.stringify(prefs[key]))
      }
    })
  } catch (error) {
    console.error('Error al guardar en localStorage:', error)
  }
}

// Función para cargar preferencias desde localStorage
export const loadPreferencesFromLocalStorage = () => {
  if (typeof window === 'undefined' || !localStorage) return null
  
  try {
    const keys = [
      'darkMode', 'zoomLevel', 'greyMode', 'colorBlindnessType',
      'cursorSize', 'textHighlight', 'parkinsonMode', 'voiceReader', 'dyslexiaMode',
      'menuPositionX', 'menuPositionY'
    ]
    
    const prefs = {}
    keys.forEach(key => {
      const value = localStorage.getItem(`accessibility-${key}`)
      if (value !== null) {
        try {
          prefs[key] = JSON.parse(value)
        } catch {
          prefs[key] = value
        }
      }
    })
    
    return Object.keys(prefs).length > 0 ? prefs : null
  } catch (error) {
    console.error('Error al cargar desde localStorage:', error)
    return null
  }
}

// Función para aplicar preferencias a los composables (exportada para uso externo)
export const applyPreferencesToComposables = async (prefs) => {
  if (!prefs) return
  
  // Esperar un poco para asegurar que el DOM y los composables estén listos
  await new Promise(resolve => setTimeout(resolve, 200))
  
  try {
    // Importar composables dinámicamente para evitar dependencias circulares
    const { useDarkMode } = await import('./useDarkMode')
    const { useZoom } = await import('./useZoom')
    const { useGreyMode } = await import('./useGreyMode')
    const { useColorBlindness } = await import('./useColorBlindness')
    const { useCursorSize } = await import('./useCursorSize')
    const { useTextHighlight } = await import('./useTextHighlight')
    const { useParkinsonAccessibility } = await import('./useParkinsonAccessibility')
    const { useDyslexia } = await import('./useDyslexia')
    
    const { isDarkMode, toggleDarkMode } = useDarkMode()
    const { zoomLevel, zoomIn, zoomOut } = useZoom()
    const { isGreyMode, toggleGreyMode } = useGreyMode()
    const { colorBlindnessType, setColorBlindnessType } = useColorBlindness()
    const { cursorSize, increaseCursorSize, decreaseCursorSize } = useCursorSize()
    const { isTextHighlightEnabled, toggleTextHighlight } = useTextHighlight()
    const { isParkinsonModeEnabled, toggleParkinsonMode } = useParkinsonAccessibility()
    const { isDyslexiaModeEnabled, toggleDyslexiaMode } = useDyslexia()
    
    // Aplicar dark mode (solo si es diferente)
    if (prefs.darkMode !== undefined && isDarkMode.value !== prefs.darkMode) {
      toggleDarkMode()
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // Aplicar zoom (solo si es diferente)
    if (prefs.zoomLevel !== undefined) {
      const targetZoom = typeof prefs.zoomLevel === 'string' 
        ? parseInt(prefs.zoomLevel.toString().replace('%', ''), 10)
        : prefs.zoomLevel
      const currentZoom = typeof zoomLevel.value === 'string'
        ? parseInt(zoomLevel.value.toString().replace('%', ''), 10)
        : zoomLevel.value
      
      if (currentZoom !== targetZoom) {
        const diff = targetZoom - currentZoom
        const steps = Math.round(diff / 10)
        if (steps > 0) {
          for (let i = 0; i < steps; i++) {
            zoomIn()
            await new Promise(resolve => setTimeout(resolve, 10))
          }
        } else if (steps < 0) {
          for (let i = 0; i < Math.abs(steps); i++) {
            zoomOut()
            await new Promise(resolve => setTimeout(resolve, 10))
          }
        }
      }
    }
    
    // Aplicar grey mode (solo si es diferente)
    if (prefs.greyMode !== undefined && isGreyMode.value !== prefs.greyMode) {
      toggleGreyMode()
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // Aplicar color blindness (solo si es diferente)
    if (prefs.colorBlindnessType !== undefined && colorBlindnessType.value !== prefs.colorBlindnessType) {
      setColorBlindnessType(prefs.colorBlindnessType)
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // Aplicar cursor size (solo si es diferente)
    if (prefs.cursorSize !== undefined) {
      const currentSize = cursorSize.value
      const targetSize = prefs.cursorSize
      if (currentSize !== targetSize) {
        const diff = targetSize - currentSize
        const steps = Math.round(diff / 25)
        if (steps > 0) {
          for (let i = 0; i < steps; i++) {
            increaseCursorSize()
            await new Promise(resolve => setTimeout(resolve, 10))
          }
        } else if (steps < 0) {
          for (let i = 0; i < Math.abs(steps); i++) {
            decreaseCursorSize()
            await new Promise(resolve => setTimeout(resolve, 10))
          }
        }
      }
    }
    
    // Aplicar text highlight (solo si es diferente)
    if (prefs.textHighlight !== undefined && isTextHighlightEnabled.value !== prefs.textHighlight) {
      toggleTextHighlight()
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // Aplicar parkinson mode (solo si es diferente)
    if (prefs.parkinsonMode !== undefined && isParkinsonModeEnabled.value !== prefs.parkinsonMode) {
      toggleParkinsonMode()
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // Aplicar dyslexia mode (solo si es diferente)
    if (prefs.dyslexiaMode !== undefined && isDyslexiaModeEnabled.value !== prefs.dyslexiaMode) {
      toggleDyslexiaMode()
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  } catch (error) {
    console.error('Error al aplicar preferencias a los composables:', error)
  }
}

// Composable principal
export const useAccessibilityPreferences = () => {
  const authStore = useAuthStore()
  
  // Cargar preferencias al inicializar
  const initializePreferences = async () => {
    if (authStore.isLoggedIn) {
      // Intentar cargar desde el backend
      const backendPrefs = await loadPreferencesFromBackend()
      if (backendPrefs) {
        return backendPrefs
      }
    }
    
    // Si no hay backend o falla, cargar desde localStorage
    return loadPreferencesFromLocalStorage()
  }
  
  // Guardar preferencias (intenta backend primero, luego localStorage)
  const savePreferences = async (prefs) => {
    if (authStore.isLoggedIn) {
      const saved = await savePreferencesToBackend(prefs)
      if (saved) {
        // También guardar en localStorage como backup
        savePreferencesToLocalStorage(prefs)
        return true
      }
    }
    
    // Si no está autenticado o falla el backend, guardar solo en localStorage
    savePreferencesToLocalStorage(prefs)
    return true
  }
  
  // Actualizar una preferencia específica
  const updatePreference = async (campo, valor) => {
    if (authStore.isLoggedIn) {
      try {
        const updated = await updatePreferenceInBackend(campo, valor)
        if (updated) {
          // También actualizar localStorage como backup
          savePreferencesToLocalStorage({ [campo]: valor })
          return true
        }
        // Si falla el backend, continuar con localStorage
      } catch (error) {
        console.warn('Error al actualizar en backend, usando localStorage:', error)
      }
    }
    
    // Si no está autenticado o falla el backend, actualizar solo localStorage
    savePreferencesToLocalStorage({ [campo]: valor })
    return true
  }
  
  return {
    preferences,
    isLoading,
    lastSyncTime,
    initializePreferences,
    savePreferences,
    updatePreference,
    loadPreferencesFromBackend,
    loadPreferencesFromLocalStorage,
    applyPreferencesToComposables
  }
}

