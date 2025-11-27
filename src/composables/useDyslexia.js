import { ref, watch } from 'vue'
import { useAccessibilityPreferences } from './useAccessibilityPreferences'

const isDyslexiaModeEnabled = ref(
  typeof window !== 'undefined' 
    ? localStorage.getItem('dyslexia-mode-enabled') === 'true'
    : false
)

// Aplicar estilos para dislexia
const applyDyslexiaAccessibility = (enabled) => {
  if (typeof window === 'undefined' || !document.head) return
  
  // Remover estilos anteriores si existen
  const existingStyle = document.getElementById('dyslexia-accessibility-styles')
  if (existingStyle) {
    existingStyle.remove()
  }
  
  if (enabled) {
    // Crear y agregar estilos CSS dinámicos
    const style = document.createElement('style')
    style.id = 'dyslexia-accessibility-styles'
    style.textContent = `
      /* Fuente más legible para dislexia - aplicar solo a texto, no a todos los elementos */
      body.dyslexia-mode-enabled {
        font-family: 'Comic Sans MS', 'Comic Sans', 'Chalkboard SE', 'Comic Neue', sans-serif !important;
        letter-spacing: 0.03em !important;
        word-spacing: 0.08em !important;
        line-height: 1.5 !important;
      }
      
      /* Aplicar fuente solo a elementos de texto, no a contenedores */
      body.dyslexia-mode-enabled p,
      body.dyslexia-mode-enabled span:not(.icon):not(.material-icons):not(.material-symbols-outlined),
      body.dyslexia-mode-enabled li,
      body.dyslexia-mode-enabled td,
      body.dyslexia-mode-enabled th,
      body.dyslexia-mode-enabled label,
      body.dyslexia-mode-enabled h1,
      body.dyslexia-mode-enabled h2,
      body.dyslexia-mode-enabled h3,
      body.dyslexia-mode-enabled h4,
      body.dyslexia-mode-enabled h5,
      body.dyslexia-mode-enabled h6 {
        font-family: 'Comic Sans MS', 'Comic Sans', 'Chalkboard SE', 'Comic Neue', sans-serif !important;
        letter-spacing: 0.03em !important;
        word-spacing: 0.08em !important;
        line-height: 1.5 !important;
      }
      
      /* Aumentar tamaño de fuente para mejor legibilidad */
      body.dyslexia-mode-enabled {
        font-size: 1.25em !important;
      }
      
      /* Aumentar tamaño de textos específicos */
      body.dyslexia-mode-enabled p,
      body.dyslexia-mode-enabled span:not(.icon):not(.material-icons):not(.material-symbols-outlined),
      body.dyslexia-mode-enabled li,
      body.dyslexia-mode-enabled td,
      body.dyslexia-mode-enabled th,
      body.dyslexia-mode-enabled label {
        font-size: 1.2em !important;
      }
      
      body.dyslexia-mode-enabled h1 {
        font-size: 2.5em !important;
      }
      
      body.dyslexia-mode-enabled h2 {
        font-size: 2em !important;
      }
      
      body.dyslexia-mode-enabled h3 {
        font-size: 1.7em !important;
      }
      
      body.dyslexia-mode-enabled h4 {
        font-size: 1.5em !important;
      }
      
      body.dyslexia-mode-enabled h5,
      body.dyslexia-mode-enabled h6 {
        font-size: 1.3em !important;
      }
      
      /* Mejorar legibilidad de inputs y textareas sin romper el layout */
      body.dyslexia-mode-enabled input[type="text"],
      body.dyslexia-mode-enabled input[type="email"],
      body.dyslexia-mode-enabled input[type="password"],
      body.dyslexia-mode-enabled input[type="number"],
      body.dyslexia-mode-enabled textarea,
      body.dyslexia-mode-enabled select {
        font-family: 'Comic Sans MS', 'Comic Sans', 'Chalkboard SE', 'Comic Neue', sans-serif !important;
        letter-spacing: 0.03em !important;
        line-height: 1.5 !important;
        font-size: 1.2em !important;
      }
      
      /* Asegurar que los enlaces sean visibles - excluir sidebar y navegación */
      body.dyslexia-mode-enabled a:not(.sidebar a):not(.nav-link):not(.sidebar-nav a):not(.sidebar-footer a):not(.accessibility-menu-container a) {
        text-decoration: underline !important;
        color: #2563eb !important;
        font-weight: 600 !important;
      }
      
      body.dyslexia-mode-enabled a:not(.sidebar a):not(.nav-link):not(.sidebar-nav a):not(.sidebar-footer a):not(.accessibility-menu-container a):hover {
        color: #1d4ed8 !important;
        text-decoration: underline !important;
      }
      
      /* Mantener estilos originales de la sidebar - texto en blanco */
      body.dyslexia-mode-enabled .sidebar,
      body.dyslexia-mode-enabled .sidebar *,
      body.dyslexia-mode-enabled .sidebar a,
      body.dyslexia-mode-enabled .nav-link,
      body.dyslexia-mode-enabled .sidebar-nav a,
      body.dyslexia-mode-enabled .sidebar-footer a,
      body.dyslexia-mode-enabled .nav-text,
      body.dyslexia-mode-enabled .logo-text,
      body.dyslexia-mode-enabled .user-name,
      body.dyslexia-mode-enabled .user-email,
      body.dyslexia-mode-enabled .sidebar-header,
      body.dyslexia-mode-enabled .sidebar-footer {
        color: rgba(255, 255, 255, 0.8) !important;
        text-decoration: inherit !important;
        font-weight: inherit !important;
      }
      
      /* Texto blanco para elementos activos y hover en sidebar */
      body.dyslexia-mode-enabled .nav-link:hover,
      body.dyslexia-mode-enabled .nav-item.active .nav-link {
        color: white !important;
      }
      
      /* Logo y texto del header en blanco */
      body.dyslexia-mode-enabled .logo,
      body.dyslexia-mode-enabled .logo-text {
        color: white !important;
      }
      
      /* Excluir elementos críticos de la UI que no deben cambiar */
      body.dyslexia-mode-enabled .accessibility-menu-container,
      body.dyslexia-mode-enabled .accessibility-menu-container *,
      body.dyslexia-mode-enabled button,
      body.dyslexia-mode-enabled .btn,
      body.dyslexia-mode-enabled .card,
      body.dyslexia-mode-enabled .sidebar,
      body.dyslexia-mode-enabled nav,
      body.dyslexia-mode-enabled header,
      body.dyslexia-mode-enabled footer,
      body.dyslexia-mode-enabled .modal,
      body.dyslexia-mode-enabled .dropdown,
      body.dyslexia-mode-enabled .chart,
      body.dyslexia-mode-enabled svg,
      body.dyslexia-mode-enabled .icon,
      body.dyslexia-mode-enabled [class*="icon"],
      body.dyslexia-mode-enabled .material-icons,
      body.dyslexia-mode-enabled .material-symbols-outlined {
        font-family: inherit !important;
        letter-spacing: normal !important;
        word-spacing: normal !important;
        line-height: normal !important;
        font-size: inherit !important;
      }
      
      /* Asegurar que los contenedores mantengan su tamaño */
      body.dyslexia-mode-enabled .card,
      body.dyslexia-mode-enabled .container,
      body.dyslexia-mode-enabled .row,
      body.dyslexia-mode-enabled .col,
      body.dyslexia-mode-enabled [class*="grid"],
      body.dyslexia-mode-enabled [class*="flex"] {
        overflow: visible !important;
        min-height: auto !important;
      }
      
      /* Asegurar que los textos dentro de cards se vean completos */
      body.dyslexia-mode-enabled .card *:not(button):not(.btn):not(svg):not(.icon):not([class*="icon"]) {
        overflow-wrap: break-word !important;
        word-wrap: break-word !important;
        hyphens: auto !important;
      }
      
      /* Modo oscuro para dislexia */
      .dark body.dyslexia-mode-enabled {
        background-color: #1a1a1a !important;
        color: #e5e7eb !important;
      }
      
      .dark body.dyslexia-mode-enabled a:not(.sidebar a):not(.nav-link):not(.sidebar-nav a):not(.sidebar-footer a):not(.accessibility-menu-container a) {
        color: #60a5fa !important;
      }
      
      .dark body.dyslexia-mode-enabled a:not(.sidebar a):not(.nav-link):not(.sidebar-nav a):not(.sidebar-footer a):not(.accessibility-menu-container a):hover {
        color: #93c5fd !important;
      }
      
      /* Mantener estilos originales de la sidebar en modo oscuro - texto en blanco */
      .dark body.dyslexia-mode-enabled .sidebar,
      .dark body.dyslexia-mode-enabled .sidebar *,
      .dark body.dyslexia-mode-enabled .sidebar a,
      .dark body.dyslexia-mode-enabled .nav-link,
      .dark body.dyslexia-mode-enabled .sidebar-nav a,
      .dark body.dyslexia-mode-enabled .sidebar-footer a,
      .dark body.dyslexia-mode-enabled .nav-text,
      .dark body.dyslexia-mode-enabled .logo-text,
      .dark body.dyslexia-mode-enabled .user-name,
      .dark body.dyslexia-mode-enabled .user-email,
      .dark body.dyslexia-mode-enabled .sidebar-header,
      .dark body.dyslexia-mode-enabled .sidebar-footer {
        color: rgba(255, 255, 255, 0.8) !important;
        background-color: inherit !important;
      }
      
      /* Texto blanco para elementos activos y hover en sidebar (modo oscuro) */
      .dark body.dyslexia-mode-enabled .nav-link:hover,
      .dark body.dyslexia-mode-enabled .nav-item.active .nav-link {
        color: white !important;
      }
      
      /* Logo y texto del header en blanco (modo oscuro) */
      .dark body.dyslexia-mode-enabled .logo,
      .dark body.dyslexia-mode-enabled .logo-text {
        color: white !important;
      }
    `
    document.head.appendChild(style)
    
    // Agregar clase al body
    if (document.body) {
      document.body.classList.add('dyslexia-mode-enabled')
    }
  } else {
    // Remover clase del body
    if (document.body) {
      document.body.classList.remove('dyslexia-mode-enabled')
    }
  }
}

export const useDyslexia = () => {
  const { updatePreference } = useAccessibilityPreferences()
  
  // Inicializar dislexia solo cuando se use el composable
  if (typeof window !== 'undefined') {
    // Aplicar el estado guardado al cargar
    if (isDyslexiaModeEnabled.value) {
      // Usar setTimeout para asegurar que el DOM esté listo
      setTimeout(() => {
        if (document.body) {
          applyDyslexiaAccessibility(isDyslexiaModeEnabled.value)
        }
      }, 100)
    }
    
    // Observar cambios en el estado
    watch(isDyslexiaModeEnabled, async (newValue) => {
      if (document.body || document.head) {
        applyDyslexiaAccessibility(newValue)
        
        // Guardar en backend si está autenticado
        try {
          await updatePreference('dyslexiaMode', newValue)
        } catch (error) {
          console.warn('Error al guardar modo dislexia en backend:', error)
        }
        
        // También guardar en localStorage como backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('dyslexia-mode-enabled', newValue.toString())
        }
      }
    })
  }
  
  const toggleDyslexiaMode = () => {
    isDyslexiaModeEnabled.value = !isDyslexiaModeEnabled.value
  }
  
  return {
    isDyslexiaModeEnabled,
    toggleDyslexiaMode
  }
}

