import { ref, watch } from 'vue'
import { useAccessibilityPreferences } from './useAccessibilityPreferences'

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
      /* Excluir el menú de accesibilidad */
      button:not(.accessibility-menu-container button):not(.radial-menu-item):not(.radial-submenu button):not(.submenu-btn),
      a:not(.accessibility-menu-container a),
      input[type="button"]:not(.accessibility-menu-container input),
      input[type="submit"]:not(.accessibility-menu-container input),
      input[type="checkbox"]:not(.accessibility-menu-container input),
      input[type="radio"]:not(.accessibility-menu-container input),
      select:not(.accessibility-menu-container select):not(.submenu-select),
      .clickable:not(.accessibility-menu-container .clickable),
      [role="button"]:not(.accessibility-menu-container [role="button"]),
      [onclick]:not(.accessibility-menu-container [onclick]) {
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
      /* Excluir el menú de accesibilidad desde el principio */
      body > *:not(.accessibility-menu-container),
      body > *:not(.accessibility-menu-container)::before,
      body > *:not(.accessibility-menu-container)::after,
      body > *:not(.accessibility-menu-container) *:not(.accessibility-menu-container),
      body > *:not(.accessibility-menu-container) *:not(.accessibility-menu-container)::before,
      body > *:not(.accessibility-menu-container) *:not(.accessibility-menu-container)::after {
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
      /* Excluir el menú de accesibilidad */
      button:not(.accessibility-menu-container button):not(.radial-menu-item):not(.radial-submenu button):not(.submenu-btn),
      a:not(.accessibility-menu-container a),
      input:not(.accessibility-menu-container input):not(.submenu-select),
      select:not(.accessibility-menu-container select):not(.submenu-select),
      textarea:not(.accessibility-menu-container textarea) {
        border-width: 2px !important;
        box-shadow: none !important;
      }
      
      /* Aumentar área de hover */
      /* Excluir el menú de accesibilidad */
      button:not(.accessibility-menu-container button):not(.radial-menu-item):not(.radial-submenu button):not(.submenu-btn):hover,
      a:not(.accessibility-menu-container a):hover,
      input:not(.accessibility-menu-container input):not(.submenu-select):hover,
      select:not(.accessibility-menu-container select):not(.submenu-select):hover {
        transform: scale(1.05) !important;
        transition: transform 0.2s ease !important;
      }
      
      /* Deshabilitar efectos de parallax o movimiento problemáticos */
      /* NO aplicar a elementos dentro del menú de accesibilidad */
      /* Esta regla se comenta porque afecta el menú radial - usar reglas más específicas si es necesario */
      
      /* Asegurar que el menú de accesibilidad mantenga sus transforms y estilos */
      /* NO aplicar ninguna regla restrictiva al menú de accesibilidad */
      .accessibility-menu-container,
      .accessibility-menu-container * {
        /* Permitir todos los transforms - los estilos inline tienen prioridad */
      }
      
      /* Restaurar estilos específicos de los botones radiales con alta especificidad */
      .accessibility-menu-container .radial-menu-item {
        min-height: 56px !important;
        min-width: 56px !important;
        padding: 0 !important;
        margin: -28px 0 0 -28px !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        border-width: 2px !important;
        width: 56px !important;
        height: 56px !important;
        /* Permitir que los estilos inline de transform funcionen */
      }
      
      .accessibility-menu-container .radial-menu-item:hover {
        /* NO aplicar transform aquí para que el inline funcione */
        /* Solo aplicar estilos visuales */
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4) !important;
        border-color: #3b82f6 !important;
        background: #f0f9ff !important;
      }
      
      /* Excluir el menú de accesibilidad de las reglas de animación reducida */
      /* Usar valores normales para animaciones y transiciones */
      .accessibility-menu-container,
      .accessibility-menu-container *,
      .accessibility-menu-container *::before,
      .accessibility-menu-container *::after {
        animation-duration: revert !important;
        animation-iteration-count: revert !important;
        transition-duration: 0.3s !important;
        scroll-behavior: revert !important;
      }
      
      /* Asegurar que el contenedor no tenga transiciones durante el arrastre */
      /* El movimiento del botón debe ser instantáneo, sin retraso */
      .accessibility-menu-container {
        transition: none !important;
      }
      
      /* El botón debe mantener su transición normal cuando no está arrastrando */
      .accessibility-button:not(.dragging) {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      /* Durante el arrastre, sin transiciones para movimiento suave */
      .accessibility-button.dragging {
        transition: none !important;
      }
      
      /* Asegurar que los elementos con estilos inline mantengan sus transforms */
      .accessibility-menu-container [style*="transform"] {
        /* Los estilos inline tienen la mayor especificidad, así que no necesitamos hacer nada */
      }
      
      /* Aumentar contraste en elementos interactivos */
      /* Excluir el menú de accesibilidad */
      button:not(.accessibility-menu-container button):not(.radial-menu-item):not(.radial-submenu button):not(.submenu-btn),
      a:not(.accessibility-menu-container a),
      input:not(.accessibility-menu-container input):not(.submenu-select),
      select:not(.accessibility-menu-container select):not(.submenu-select) {
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
  const { updatePreference } = useAccessibilityPreferences()
  
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
    watch(isParkinsonModeEnabled, async (newValue) => {
      if (document.head) {
        applyParkinsonAccessibility(newValue)
        
        // Guardar en backend si está autenticado
        try {
          await updatePreference('parkinsonMode', newValue)
        } catch (error) {
          console.warn('Error al guardar modo Parkinson en backend:', error)
        }
        
        // También guardar en localStorage como backup
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

