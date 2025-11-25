import { ref, computed, watch } from 'vue'
import { useAccessibilityPreferences } from './useAccessibilityPreferences'

// Estado global del zoom (porcentaje, 100 = 100%)
const zoomLevel = ref(100)
let initialized = false
let watcher = null

// Límites del zoom
const MIN_ZOOM = 50  // 50%
const MAX_ZOOM = 200 // 200%
const ZOOM_STEP = 10 // Incremento/decremento en 10%

export function useZoom() {
  const { updatePreference } = useAccessibilityPreferences()
  
  // Inicializar solo una vez
  if (!initialized && typeof window !== 'undefined' && typeof document !== 'undefined') {
    initialized = true

    // Aplicar zoom al documento
    const applyZoom = () => {
      if (typeof window === 'undefined' || !document.documentElement) return
      
      try {
        const scale = zoomLevel.value / 100
        document.documentElement.style.setProperty('--zoom-scale', scale)
        document.documentElement.style.setProperty('--zoom-percentage', `${zoomLevel.value}%`)
        
        // Aplicar zoom usando CSS zoom al html (mejor rendimiento y compatibilidad)
        // Los controles de accesibilidad están excluidos mediante CSS
        const rootElement = document.documentElement
        rootElement.style.zoom = scale
        
        // Agregar clase para estilos personalizados si es necesario
        rootElement.classList.add('zoom-applied')
      } catch (error) {
        console.warn('Error al aplicar zoom:', error)
      }
    }

    // Guardar preferencia en localStorage
    const saveZoomPreference = () => {
      if (typeof window === 'undefined' || !localStorage) return
      
      try {
        localStorage.setItem('zoomLevel', zoomLevel.value.toString())
      } catch (error) {
        console.warn('Error al guardar preferencia de zoom:', error)
      }
    }

    // Inicializar desde localStorage
    const initializeZoom = () => {
      if (typeof window === 'undefined' || !localStorage || !document.documentElement) return
      
      try {
        const savedZoom = localStorage.getItem('zoomLevel')
        if (savedZoom !== null) {
          const parsedZoom = parseInt(savedZoom, 10)
          if (parsedZoom >= MIN_ZOOM && parsedZoom <= MAX_ZOOM) {
            zoomLevel.value = parsedZoom
          }
        }
        applyZoom()
      } catch (error) {
        console.warn('Error al inicializar zoom:', error)
      }
    }

    // Watch para cambios en el zoom (solo una vez)
    watcher = watch(zoomLevel, () => {
      applyZoom()
      saveZoomPreference()
    })

    // Inicializar al cargar (con delay para asegurar que el DOM esté listo)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeZoom, { once: true })
    } else {
      // DOM ya está listo
      setTimeout(initializeZoom, 0)
    }
  }

  // Aumentar zoom
  const zoomIn = () => {
    if (zoomLevel.value < MAX_ZOOM) {
      zoomLevel.value = Math.min(zoomLevel.value + ZOOM_STEP, MAX_ZOOM)
    }
  }

  // Disminuir zoom
  const zoomOut = () => {
    if (zoomLevel.value > MIN_ZOOM) {
      zoomLevel.value = Math.max(zoomLevel.value - ZOOM_STEP, MIN_ZOOM)
    }
  }

  // Resetear zoom a 100%
  const resetZoom = () => {
    zoomLevel.value = 100
  }

  return {
    zoomLevel: computed(() => zoomLevel.value),
    zoomPercentage: computed(() => `${zoomLevel.value}%`),
    canZoomIn: computed(() => zoomLevel.value < MAX_ZOOM),
    canZoomOut: computed(() => zoomLevel.value > MIN_ZOOM),
    zoomIn,
    zoomOut,
    resetZoom
  }
}

