import { ref, watch } from 'vue'
import { useAccessibilityPreferences } from './useAccessibilityPreferences'

const isTextHighlightEnabled = ref(
  typeof window !== 'undefined' 
    ? localStorage.getItem('text-highlight-enabled') === 'true'
    : false
)

// Aplicar estilos de resaltado de texto
const applyTextHighlight = (enabled) => {
  if (typeof window === 'undefined' || !document.body) return
  
  if (enabled) {
    // Agregar clase al body para activar el resaltado
    document.body.classList.add('text-highlight-enabled')
    
    // Agregar estilos CSS dinámicos si no existen
    if (!document.getElementById('text-highlight-styles')) {
      const style = document.createElement('style')
      style.id = 'text-highlight-styles'
      style.textContent = `
        .text-highlight-enabled *:hover {
          outline: 2px solid rgba(59, 130, 246, 0.8) !important;
          outline-offset: 2px !important;
          border-radius: 4px !important;
          transition: all 0.1s ease !important;
        }
        
        .text-highlight-enabled p:hover,
        .text-highlight-enabled span:hover,
        .text-highlight-enabled div:hover,
        .text-highlight-enabled h1:hover,
        .text-highlight-enabled h2:hover,
        .text-highlight-enabled h3:hover,
        .text-highlight-enabled h4:hover,
        .text-highlight-enabled h5:hover,
        .text-highlight-enabled h6:hover,
        .text-highlight-enabled li:hover,
        .text-highlight-enabled td:hover,
        .text-highlight-enabled th:hover,
        .text-highlight-enabled label:hover {
          outline: 3px solid rgba(59, 130, 246, 0.9) !important;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.6) !important;
        }
        
        .dark .text-highlight-enabled *:hover {
          outline-color: rgba(96, 165, 250, 0.9) !important;
        }
        
        .dark .text-highlight-enabled p:hover,
        .dark .text-highlight-enabled span:hover,
        .dark .text-highlight-enabled div:hover,
        .dark .text-highlight-enabled h1:hover,
        .dark .text-highlight-enabled h2:hover,
        .dark .text-highlight-enabled h3:hover,
        .dark .text-highlight-enabled h4:hover,
        .dark .text-highlight-enabled h5:hover,
        .dark .text-highlight-enabled h6:hover,
        .dark .text-highlight-enabled li:hover,
        .dark .text-highlight-enabled td:hover,
        .dark .text-highlight-enabled th:hover,
        .dark .text-highlight-enabled label:hover {
          outline-color: rgba(96, 165, 250, 0.95) !important;
          box-shadow: 0 0 10px rgba(96, 165, 250, 0.7) !important;
        }
      `
      document.head.appendChild(style)
    }
  } else {
    // Remover clase del body
    document.body.classList.remove('text-highlight-enabled')
    
    // Opcional: remover estilos (pero mejor dejarlos para mejor rendimiento)
    // const style = document.getElementById('text-highlight-styles')
    // if (style) style.remove()
  }
}

export const useTextHighlight = () => {
  const { updatePreference } = useAccessibilityPreferences()
  
  // Inicializar resaltado de texto solo cuando se use el composable
  if (typeof window !== 'undefined') {
    // Aplicar el estado guardado al cargar
    if (isTextHighlightEnabled.value) {
      // Usar nextTick para asegurar que el DOM esté listo
      setTimeout(() => {
        if (document.body) {
          applyTextHighlight(isTextHighlightEnabled.value)
        }
      }, 100)
    }
    
    // Observar cambios en el estado
    watch(isTextHighlightEnabled, async (newValue) => {
      if (document.body) {
        applyTextHighlight(newValue)
        
        // Guardar en backend si está autenticado
        try {
          await updatePreference('textHighlight', newValue)
        } catch (error) {
          console.warn('Error al guardar resaltado de texto en backend:', error)
        }
        
        // También guardar en localStorage como backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('text-highlight-enabled', newValue.toString())
        }
      }
    })
  }
  
  const toggleTextHighlight = () => {
    isTextHighlightEnabled.value = !isTextHighlightEnabled.value
  }
  
  return {
    isTextHighlightEnabled,
    toggleTextHighlight
  }
}

