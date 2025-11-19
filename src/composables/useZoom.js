import { ref, computed, watch } from 'vue'

// Estado global del zoom (porcentaje, 100 = 100%)
const zoomLevel = ref(100)

// Límites del zoom
const MIN_ZOOM = 50  // 50%
const MAX_ZOOM = 200 // 200%
const ZOOM_STEP = 10 // Incremento/decremento en 10%

// Inicializar desde localStorage
const initializeZoom = () => {
  const savedZoom = localStorage.getItem('zoomLevel')
  if (savedZoom !== null) {
    const parsedZoom = parseInt(savedZoom, 10)
    if (parsedZoom >= MIN_ZOOM && parsedZoom <= MAX_ZOOM) {
      zoomLevel.value = parsedZoom
    }
  }
  applyZoom()
}

// Aplicar zoom al documento
const applyZoom = () => {
  const scale = zoomLevel.value / 100
  document.documentElement.style.setProperty('--zoom-scale', scale)
  document.documentElement.style.setProperty('--zoom-percentage', `${zoomLevel.value}%`)
  
  // Aplicar zoom usando CSS zoom al html (mejor rendimiento y compatibilidad)
  // Los controles de accesibilidad están excluidos mediante CSS
  const rootElement = document.documentElement
  rootElement.style.zoom = scale
  
  // Agregar clase para estilos personalizados si es necesario
  rootElement.classList.add('zoom-applied')
}

// Guardar preferencia en localStorage
const saveZoomPreference = () => {
  localStorage.setItem('zoomLevel', zoomLevel.value.toString())
}

// Aumentar zoom
const zoomIn = () => {
  if (zoomLevel.value < MAX_ZOOM) {
    zoomLevel.value = Math.min(zoomLevel.value + ZOOM_STEP, MAX_ZOOM)
    applyZoom()
    saveZoomPreference()
  }
}

// Disminuir zoom
const zoomOut = () => {
  if (zoomLevel.value > MIN_ZOOM) {
    zoomLevel.value = Math.max(zoomLevel.value - ZOOM_STEP, MIN_ZOOM)
    applyZoom()
    saveZoomPreference()
  }
}

// Resetear zoom a 100%
const resetZoom = () => {
  zoomLevel.value = 100
  applyZoom()
  saveZoomPreference()
}

// Verificar si se puede aumentar zoom
const canZoomIn = computed(() => zoomLevel.value < MAX_ZOOM)

// Verificar si se puede disminuir zoom
const canZoomOut = computed(() => zoomLevel.value > MIN_ZOOM)

// Watch para cambios en el zoom
watch(zoomLevel, () => {
  applyZoom()
  saveZoomPreference()
})

// Inicializar al cargar
if (typeof window !== 'undefined') {
  initializeZoom()
}

export function useZoom() {
  return {
    zoomLevel: computed(() => zoomLevel.value),
    zoomPercentage: computed(() => `${zoomLevel.value}%`),
    canZoomIn,
    canZoomOut,
    zoomIn,
    zoomOut,
    resetZoom
  }
}

