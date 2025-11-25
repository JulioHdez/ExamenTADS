import { ref, watch, onMounted } from 'vue'

const colorBlindnessType = ref(
  typeof window !== 'undefined' 
    ? localStorage.getItem('color-blindness-type') || 'none'
    : 'none'
)

// Aplicar o remover el filtro de daltonismo
const applyColorBlindnessFilter = (type) => {
  if (typeof window === 'undefined' || !document.body) return
  
  const body = document.body
  
  if (type === 'none') {
    body.style.filter = ''
    body.style.webkitFilter = ''
    return
  }
  
  if (type === 'achromatopsia') {
    body.style.filter = 'grayscale(100%)'
    body.style.webkitFilter = 'grayscale(100%)'
    return
  }
  
  // Para protanopia, deuteranopia y tritanopia, usar SVG filters
  const filterId = type
  body.style.filter = `url(#${filterId})`
  body.style.webkitFilter = `url(#${filterId})`
}

// Crear los filtros SVG necesarios
const createSVGFilters = () => {
  if (typeof window === 'undefined' || !document.body) return
  
  // Verificar si ya existen los filtros
  if (document.getElementById('color-blindness-filters')) {
    return
  }
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('id', 'color-blindness-filters')
  svg.setAttribute('style', 'position: absolute; width: 0; height: 0;')
  
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
  
  // Protanopia (ceguera al rojo)
  const protanopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
  protanopia.setAttribute('id', 'protanopia')
  protanopia.setAttribute('color-interpolation-filters', 'sRGB')
  
  const protanopiaMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix')
  protanopiaMatrix.setAttribute('type', 'matrix')
  protanopiaMatrix.setAttribute('values', '0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0')
  protanopia.appendChild(protanopiaMatrix)
  
  // Deuteranopia (ceguera al verde)
  const deuteranopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
  deuteranopia.setAttribute('id', 'deuteranopia')
  deuteranopia.setAttribute('color-interpolation-filters', 'sRGB')
  
  const deuteranopiaMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix')
  deuteranopiaMatrix.setAttribute('type', 'matrix')
  deuteranopiaMatrix.setAttribute('values', '0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0')
  deuteranopia.appendChild(deuteranopiaMatrix)
  
  // Tritanopia (ceguera al azul)
  const tritanopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
  tritanopia.setAttribute('id', 'tritanopia')
  tritanopia.setAttribute('color-interpolation-filters', 'sRGB')
  
  const tritanopiaMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix')
  tritanopiaMatrix.setAttribute('type', 'matrix')
  tritanopiaMatrix.setAttribute('values', '0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0')
  tritanopia.appendChild(tritanopiaMatrix)
  
  defs.appendChild(protanopia)
  defs.appendChild(deuteranopia)
  defs.appendChild(tritanopia)
  svg.appendChild(defs)
  document.body.appendChild(svg)
}

export const useColorBlindness = () => {
  // Inicializar filtros SVG al usar el composable
  if (typeof window !== 'undefined' && document.body) {
    createSVGFilters()
    
    // Aplicar el filtro guardado al cargar
    if (colorBlindnessType.value !== 'none') {
      // Usar setTimeout para asegurar que el DOM esté completamente listo
      setTimeout(() => {
        if (document.body) {
          applyColorBlindnessFilter(colorBlindnessType.value)
        }
      }, 100)
    }
    
    // Observar cambios en el tipo de daltonismo
    watch(colorBlindnessType, (newType) => {
      if (document.body) {
        applyColorBlindnessFilter(newType)
        if (typeof window !== 'undefined') {
          localStorage.setItem('color-blindness-type', newType)
        }
      }
    })
  }
  
  const setColorBlindnessType = (type) => {
    colorBlindnessType.value = type
  }
  
  return {
    colorBlindnessType,
    setColorBlindnessType,
    colorBlindnessTypes: [
      { value: 'none', label: 'Normal', description: 'Sin filtro de daltonismo' },
      { value: 'protanopia', label: 'Protanopia', description: 'Ceguera al rojo' },
      { value: 'deuteranopia', label: 'Deuteranopia', description: 'Ceguera al verde' },
      { value: 'tritanopia', label: 'Tritanopia', description: 'Ceguera al azul' },
      { value: 'achromatopsia', label: 'Acromatopsia', description: 'Ceguera total al color' }
    ]
  }
}

