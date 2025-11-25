import { ref, watch, computed } from 'vue'

// Tamaño del cursor en porcentaje (100% = tamaño normal)
const cursorSizePercentage = ref(
  typeof window !== 'undefined' 
    ? parseInt(localStorage.getItem('cursor-size-percentage') || '100', 10)
    : 100
)

// Límites del tamaño del cursor
const MIN_CURSOR_SIZE = 100 // 100% = tamaño normal
const MAX_CURSOR_SIZE = 400 // 400% = 4x el tamaño normal
const CURSOR_SIZE_STEP = 25 // Incremento/decremento de 25%

// Calcular el tamaño en píxeles basado en el porcentaje
const getCursorSizeInPixels = (percentage) => {
  // Tamaño base del cursor: 16px (tamaño normal)
  const baseSize = 16
  return Math.round((baseSize * percentage) / 100)
}

// Generar SVG del cursor dinámicamente
const generateCursorSVG = (sizeInPixels, isDark = false) => {
  const center = sizeInPixels / 2
  const outerRadius = sizeInPixels * 0.4375
  const innerRadius = sizeInPixels * 0.125
  const strokeWidth = Math.max(1, sizeInPixels * 0.0625)
  const color = isDark ? '%23fff' : '%23000'
  
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${sizeInPixels}" height="${sizeInPixels}" viewBox="0 0 ${sizeInPixels} ${sizeInPixels}"><circle cx="${center}" cy="${center}" r="${outerRadius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/><circle cx="${center}" cy="${center}" r="${innerRadius}" fill="${color}"/></svg>`
}

// Aplicar el tamaño del cursor
const applyCursorSize = (percentage) => {
  if (typeof window === 'undefined' || !document.body) return
  
  const sizeInPixels = getCursorSizeInPixels(percentage)
  const isDark = document.documentElement.classList.contains('dark')
  
  // Remover todas las clases de cursor
  document.body.classList.remove('cursor-large', 'cursor-extra-large', 'cursor-custom')
  
  if (percentage === 100) {
    // Tamaño normal - no aplicar ninguna clase
    document.body.style.setProperty('--cursor-size', 'auto')
    document.body.style.setProperty('--cursor-url', 'none')
  } else {
    // Aplicar cursor personalizado
    const cursorSVG = generateCursorSVG(sizeInPixels, isDark)
    const cursorUrl = `url('${cursorSVG}') ${sizeInPixels / 2} ${sizeInPixels / 2}, auto`
    
    document.body.classList.add('cursor-custom')
    document.body.style.setProperty('--cursor-size', `${sizeInPixels}px`)
    document.body.style.setProperty('--cursor-url', cursorUrl)
  }
}

export const useCursorSize = () => {
  // Inicializar tamaño del cursor solo cuando se use el composable
  if (typeof window !== 'undefined' && document.body) {
    // Aplicar el tamaño guardado al cargar
    if (cursorSizePercentage.value !== 100) {
      setTimeout(() => {
        if (document.body) {
          applyCursorSize(cursorSizePercentage.value)
        }
      }, 100)
    }
    
    // Observar cambios en el tamaño del cursor
    watch(cursorSizePercentage, (newPercentage) => {
      if (document.body) {
        applyCursorSize(newPercentage)
        if (typeof window !== 'undefined') {
          localStorage.setItem('cursor-size-percentage', newPercentage.toString())
        }
      }
    })
  }
  const cursorSize = computed(() => cursorSizePercentage.value)
  const cursorSizeDisplay = computed(() => `${cursorSizePercentage.value}%`)
  
  const canIncreaseCursor = computed(() => cursorSizePercentage.value < MAX_CURSOR_SIZE)
  const canDecreaseCursor = computed(() => cursorSizePercentage.value > MIN_CURSOR_SIZE)
  
  const increaseCursorSize = () => {
    if (cursorSizePercentage.value < MAX_CURSOR_SIZE) {
      cursorSizePercentage.value = Math.min(
        cursorSizePercentage.value + CURSOR_SIZE_STEP,
        MAX_CURSOR_SIZE
      )
    }
  }
  
  const decreaseCursorSize = () => {
    if (cursorSizePercentage.value > MIN_CURSOR_SIZE) {
      cursorSizePercentage.value = Math.max(
        cursorSizePercentage.value - CURSOR_SIZE_STEP,
        MIN_CURSOR_SIZE
      )
    }
  }
  
  return {
    cursorSize,
    cursorSizeDisplay,
    canIncreaseCursor,
    canDecreaseCursor,
    increaseCursorSize,
    decreaseCursorSize
  }
}

