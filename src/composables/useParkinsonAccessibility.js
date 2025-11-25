import { ref, watch } from 'vue'

const isParkinsonModeEnabled = ref(
  typeof window !== 'undefined' 
    ? localStorage.getItem('parkinson-mode-enabled') === 'true'
    : false
)

let initialized = false
let styleElement = null

// Aplicar estilos de accesibilidad para Parkinson
const applyParkinsonAccessibility = (enabled) => {
  if (typeof window === 'undefined' || !document.head) return
  
  if (enabled) {
    // Crear o actualizar estilos
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'parkinson-accessibility-styles'
      document.head.appendChild(styleElement)
    }
    
    styleElement.textContent = `
      /* Aumentar área de clic para todos los elementos interactivos */
      button, a, input[type="button"], input[type="submit"], 
      input[type="checkbox"], input[type="radio"], select,
      .clickable, [role="button"], [onclick] {
        min-height: 44px !important;
        min-width: 44px !important;
        padding: 12px 16px !important;
        margin: 4px !important;
      }
      
      /* Aumentar tamaño de fuente para mejor legibilidad */
      body {
        font-size: 16px !important;
      }
      
      /* Reducir animaciones que pueden causar confusión */
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      /* Aumentar espaciado entre elementos */
      * {
        letter-spacing: 0.5px !important;
        word-spacing: 2px !important;
      }
      
      /* Simplificar bordes y sombras */
      button, a, input, select, textarea {
        border-width: 2px !important;
        box-shadow: none !important;
      }
      
      /* Aumentar área de hover */
      button:hover, a:hover, input:hover, select:hover {
        transform: scale(1.05) !important;
        transition: transform 0.2s ease !important;
      }
      
      /* Deshabilitar efectos de parallax o movimiento */
      [style*="transform"], [style*="translate"] {
        transform: none !important;
      }
      
      /* Aumentar contraste en elementos interactivos */
      button, a, input, select {
        border: 2px solid currentColor !important;
      }
      
      /* Simplificar scrollbars */
      ::-webkit-scrollbar {
        width: 16px !important;
        height: 16px !important;
      }
      
      ::-webkit-scrollbar-thumb {
        background-color: #4a5568 !important;
        border-radius: 8px !important;
        border: 2px solid transparent !important;
        background-clip: content-box !important;
      }
      
      /* Aumentar tamaño de inputs y textareas */
      input[type="text"], input[type="email"], input[type="password"],
      input[type="number"], input[type="date"], input[type="time"],
      textarea, select {
        font-size: 16px !important;
        padding: 12px !important;
        border-width: 2px !important;
      }
      
      /* Mejorar visibilidad de focus */
      *:focus {
        outline: 3px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }
    `
  } else {
    // Remover estilos
    if (styleElement) {
      styleElement.remove()
      styleElement = null
    }
  }
}

export const useParkinsonAccessibility = () => {
  // Inicializar solo una vez
  if (!initialized && typeof window !== 'undefined') {
    initialized = true
    
    // Aplicar el estado guardado al cargar
    if (isParkinsonModeEnabled.value) {
      setTimeout(() => {
        if (document.head) {
          applyParkinsonAccessibility(isParkinsonModeEnabled.value)
        }
      }, 100)
    }
    
    // Observar cambios en el estado
    watch(isParkinsonModeEnabled, (newValue) => {
      if (document.head) {
        applyParkinsonAccessibility(newValue)
        if (typeof window !== 'undefined' && localStorage) {
          try {
            localStorage.setItem('parkinson-mode-enabled', newValue.toString())
          } catch (error) {
            console.warn('Error al guardar modo Parkinson:', error)
          }
        }
      }
    })
  }
  
  const toggleParkinsonMode = () => {
    isParkinsonModeEnabled.value = !isParkinsonModeEnabled.value
  }
  
  return {
    isParkinsonModeEnabled,
    toggleParkinsonMode
  }
}

