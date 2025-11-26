<template>
  <div 
    class="accessibility-menu-container"
    :style="{ bottom: position.y + 'px', right: position.x + 'px' }"
  >
    <!-- Botón circular flotante -->
    <button
      @click="handleButtonClick"
      @mousedown="startDrag"
      @touchstart="startDrag"
      class="accessibility-button"
      :class="{ 'active': isOpen, 'dragging': isDragging }"
      :title="isOpen ? 'Cerrar menú de accesibilidad' : 'Abrir menú de accesibilidad'"
      aria-label="Menú de accesibilidad"
    >
      <svg class="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Círculo exterior -->
        <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="2" fill="none"/>
        <!-- Cabeza -->
        <circle cx="12" cy="8" r="2.5" fill="currentColor"/>
        <!-- Cuerpo y brazos -->
        <path d="M12 10.5 L12 15 M9 12 L15 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <!-- Piernas -->
        <path d="M12 15 L9 19 M12 15 L15 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Menú circular radial -->
    <Transition name="radial-menu">
      <div 
        v-if="isOpen" 
        class="radial-menu-container"
        @click.stop
      >
        <!-- Opciones distribuidas en círculo -->
        <!-- Zoom -->
        <button
          v-for="(option, index) in radialOptions"
          :key="option.id"
          class="radial-menu-item"
          :class="{ 'active': option.isActive }"
          :style="getRadialPosition(index)"
          @click="handleRadialOptionClick(option)"
          :title="option.title"
          :aria-label="option.title"
        >
          <span class="radial-icon">{{ option.icon }}</span>
          <span class="radial-label" v-if="option.showLabel">{{ option.label }}</span>
        </button>

        <!-- Submenú para opciones con controles -->
        <Transition name="submenu">
          <div v-if="activeSubmenu" class="radial-submenu" :style="getSubmenuPosition()">
            <div class="submenu-header">
              <span class="submenu-title">{{ activeSubmenu.title }}</span>
              <button @click="closeSubmenu" class="submenu-close" aria-label="Cerrar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="submenu-content">
              <!-- Contenido del submenú según el tipo -->
              <template v-if="activeSubmenu.id === 'zoom'">
                <div class="submenu-controls">
                  <button @click="zoomOut" class="submenu-btn" :disabled="!canZoomOut" aria-label="Disminuir zoom">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5H6" />
                    </svg>
                  </button>
                  <span class="submenu-value">{{ zoomPercentage }}</span>
                  <button @click="zoomIn" class="submenu-btn" :disabled="!canZoomIn" aria-label="Aumentar zoom">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </button>
                </div>
              </template>

              <template v-else-if="activeSubmenu.id === 'cursor'">
                <div class="submenu-controls">
                  <button @click="decreaseCursorSize" class="submenu-btn" :disabled="!canDecreaseCursor" aria-label="Disminuir tamaño">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5H6" />
                    </svg>
                  </button>
                  <span class="submenu-value">{{ cursorSizeDisplay }}</span>
                  <button @click="increaseCursorSize" class="submenu-btn" :disabled="!canIncreaseCursor" aria-label="Aumentar tamaño">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </button>
                </div>
              </template>

              <template v-else-if="activeSubmenu.id === 'colorBlindness'">
                <select
                  :value="colorBlindnessType"
                  @change="handleColorBlindnessChange"
                  class="submenu-select"
                  aria-label="Seleccionar tipo de daltonismo"
                >
                  <option
                    v-for="type in colorBlindnessTypes"
                    :key="type.value"
                    :value="type.value"
                  >
                    {{ type.label }}
                  </option>
                </select>
              </template>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Overlay para cerrar al hacer clic fuera (sin desenfoque) -->
    <Transition name="overlay">
      <div v-if="isOpen" class="menu-overlay" @click="handleOverlayClick"></div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, computed, watch, nextTick } from 'vue'
import { useZoom } from '@/composables/useZoom'
import { useDarkMode } from '@/composables/useDarkMode'
import { useGreyMode } from '@/composables/useGreyMode'
import { useColorBlindness } from '@/composables/useColorBlindness'
import { useCursorSize } from '@/composables/useCursorSize'
import { useTextHighlight } from '@/composables/useTextHighlight'
import { useParkinsonAccessibility } from '@/composables/useParkinsonAccessibility'

const isOpen = ref(false)
const isDragging = ref(false)
const hasMoved = ref(false)
const dragStart = reactive({ x: 0, y: 0 })
const position = reactive({ x: 0, y: 0 })
const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 800)

// Calcular si el menú debe estar a la izquierda o derecha
const isMenuOnLeft = computed(() => {
  if (typeof window === 'undefined') return false
  
  const buttonSize = 64
  const menuWidth = 280
  const gap = 16
  const minSpace = 10 // Espacio mínimo desde los bordes
  const buttonRight = window.innerWidth - position.x
  const buttonLeft = position.x + buttonSize
  
  // Calcular espacio disponible a la izquierda y derecha del botón
  const spaceOnRight = buttonRight - buttonSize - gap - minSpace
  const spaceOnLeft = buttonLeft - buttonSize - gap - minSpace
  
  // Si hay más espacio a la izquierda, mostrar menú a la izquierda
  // Pero también considerar si el menú cabe en cada lado
  if (spaceOnRight >= menuWidth) {
    return false // Hay espacio a la derecha, mostrar ahí
  } else if (spaceOnLeft >= menuWidth) {
    return true // Hay espacio a la izquierda, mostrar ahí
  } else {
    // Si no cabe en ningún lado, elegir el lado con más espacio
    // El menú se ajustará para quedar visible
    return spaceOnLeft > spaceOnRight
  }
})

// Calcular si el menú debe estar arriba o abajo
// true = menú arriba del botón (clase menu-top), false = menú abajo del botón
const isMenuOnTop = computed(() => {
  if (typeof window === 'undefined') return false
  
  const buttonSize = 64
  const menuHeight = 550 // Altura aproximada del menú con todas las opciones
  const gap = 16
  const minSpace = 20 // Espacio mínimo desde los bordes
  const spaceBelow = position.y - minSpace // espacio desde el borde inferior hasta el botón
  const spaceAbove = windowHeight.value - position.y - buttonSize - minSpace // espacio desde el botón hasta el borde superior
  
  // Verificar si el menú cabe en cada dirección
  const fitsBelow = spaceBelow >= menuHeight + gap
  const fitsAbove = spaceAbove >= menuHeight + gap
  
  // Si cabe en ambas direcciones, elegir la que tenga más espacio
  if (fitsBelow && fitsAbove) {
    return spaceAbove > spaceBelow
  }
  
  // Si solo cabe en una dirección, usar esa
  if (fitsAbove && !fitsBelow) {
    return true // Mostrar arriba
  }
  if (fitsBelow && !fitsAbove) {
    return false // Mostrar abajo
  }
  
  // Si no cabe en ninguna dirección, elegir la que tenga más espacio
  // El menú tendrá scroll interno si es necesario
  return spaceAbove > spaceBelow
})

// Cargar posición guardada
const loadPosition = () => {
  if (typeof window === 'undefined' || !localStorage) return
  
  try {
    const saved = localStorage.getItem('accessibility-menu-position')
    if (saved) {
      const pos = JSON.parse(saved)
      position.x = pos.x || 0
      position.y = pos.y || 0
    } else {
      // Posición por defecto (esquina inferior derecha)
      position.x = 32 // 2rem
      position.y = 32 // 2rem
    }
  } catch (error) {
    // Si hay error al leer localStorage, usar posición por defecto
    position.x = 32
    position.y = 32
  }
}

// Guardar posición
const savePosition = () => {
  if (typeof window === 'undefined' || !localStorage) return
  
  try {
    localStorage.setItem('accessibility-menu-position', JSON.stringify({
      x: position.x,
      y: position.y
    }))
  } catch (error) {
    // Silenciar errores de localStorage (puede fallar en modo incógnito)
    console.warn('No se pudo guardar la posición del menú:', error)
  }
}

// Iniciar arrastre
const startDrag = (e) => {
  hasMoved.value = false
  isDragging.value = true
  
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  
  dragStart.x = clientX + position.x
  dragStart.y = clientY + position.y
  
  e.preventDefault()
  
  if (e.touches) {
    document.addEventListener('touchmove', onDrag)
    document.addEventListener('touchend', stopDrag)
  } else {
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
  }
}

// Durante el arrastre
const onDrag = (e) => {
  if (!isDragging.value) return
  
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  
  // Calcular nueva posición
  let newX = dragStart.x - clientX
  let newY = dragStart.y - clientY
  
  // Detectar si hubo movimiento significativo (más de 5px)
  const deltaX = Math.abs(newX - position.x)
  const deltaY = Math.abs(newY - position.y)
  if (deltaX > 5 || deltaY > 5) {
    hasMoved.value = true
  }
  
  // Limitar a los bordes de la pantalla
  const buttonSize = 64
  const maxX = window.innerWidth - buttonSize
  const maxY = window.innerHeight - buttonSize
  
  newX = Math.max(0, Math.min(newX, maxX))
  newY = Math.max(0, Math.min(newY, maxY))
  
  position.x = newX
  position.y = newY
}

// Detener arrastre
const stopDrag = () => {
  if (isDragging.value) {
    isDragging.value = false
    savePosition()
    // Resetear hasMoved después de un pequeño delay
    setTimeout(() => {
      hasMoved.value = false
    }, 100)
  }
  
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

// Manejar click (solo si no se arrastró)
const handleButtonClick = (e) => {
  // Pequeño delay para verificar si fue un arrastre
  setTimeout(() => {
    if (!hasMoved.value && !isDragging.value) {
      toggleMenu()
    }
  }, 10)
}

// Composables
const { zoomPercentage, canZoomIn, canZoomOut, zoomIn, zoomOut } = useZoom()
const { isDarkMode, toggleDarkMode } = useDarkMode()
const { isGreyMode, toggleGreyMode } = useGreyMode()
const { colorBlindnessType, setColorBlindnessType, colorBlindnessTypes } = useColorBlindness()
const { cursorSize, cursorSizeDisplay, canIncreaseCursor, canDecreaseCursor, increaseCursorSize, decreaseCursorSize } = useCursorSize()
const { isTextHighlightEnabled, toggleTextHighlight } = useTextHighlight()
const { isParkinsonModeEnabled, toggleParkinsonMode } = useParkinsonAccessibility()

// Lectura en voz alta
const isVoiceReader = ref(
  typeof window !== 'undefined' && localStorage 
    ? localStorage.getItem("voice-reader") === "true"
    : false
)

// Menú circular radial
const activeSubmenu = ref(null)
const radialRadius = 90 // Radio del círculo donde se distribuyen las opciones

// Opciones del menú radial
const radialOptions = computed(() => [
  {
    id: 'zoom',
    icon: '🔍',
    label: 'Zoom',
    title: `Zoom: ${zoomPercentage}`,
    showLabel: false,
    hasSubmenu: true,
    isActive: false
  },
  {
    id: 'darkMode',
    icon: isDarkMode.value ? '🌙' : '☀️',
    label: isDarkMode.value ? 'Oscuro' : 'Claro',
    title: `Modo ${isDarkMode.value ? 'Oscuro' : 'Claro'}`,
    showLabel: false,
    hasSubmenu: false,
    isActive: isDarkMode.value,
    action: toggleDarkMode
  },
  {
    id: 'greyMode',
    icon: '🌓',
    label: 'Grises',
    title: 'Escala de grises',
    showLabel: false,
    hasSubmenu: false,
    isActive: isGreyMode.value,
    action: toggleGreyMode
  },
  {
    id: 'colorBlindness',
    icon: '🎨',
    label: 'Daltonismo',
    title: `Daltonismo: ${colorBlindnessTypes.find(t => t.value === colorBlindnessType.value)?.label || 'Normal'}`,
    showLabel: false,
    hasSubmenu: true,
    isActive: colorBlindnessType.value !== 'none'
  },
  {
    id: 'cursor',
    icon: '🖱️',
    label: 'Puntero',
    title: `Tamaño del puntero: ${cursorSizeDisplay}`,
    showLabel: false,
    hasSubmenu: true,
    isActive: cursorSize.value !== 100
  },
  {
    id: 'textHighlight',
    icon: '📖',
    label: 'Resaltar',
    title: 'Resaltar texto al pasar el cursor',
    showLabel: false,
    hasSubmenu: false,
    isActive: isTextHighlightEnabled.value,
    action: toggleTextHighlight
  },
  {
    id: 'parkinson',
    icon: '🤲',
    label: 'Parkinson',
    title: 'Modo Parkinson',
    showLabel: false,
    hasSubmenu: false,
    isActive: isParkinsonModeEnabled.value,
    action: toggleParkinsonMode
  },
  {
    id: 'voiceReader',
    icon: '🔊',
    label: 'Voz',
    title: 'Lectura en voz alta',
    showLabel: false,
    hasSubmenu: false,
    isActive: isVoiceReader.value,
    action: toggleVoiceReader
  }
])

// Calcular posición radial de cada opción
const getRadialPosition = (index) => {
  const totalOptions = radialOptions.value.length
  const angle = (index * 2 * Math.PI) / totalOptions - Math.PI / 2 // Empezar desde arriba
  const x = Math.cos(angle) * radialRadius
  const y = Math.sin(angle) * radialRadius
  
  return {
    '--x': `${x}px`,
    '--y': `${y}px`,
    transform: `translate(${x}px, ${y}px)`
  }
}

// Manejar clic en opción radial
const handleRadialOptionClick = (option) => {
  if (option.hasSubmenu) {
    // Abrir submenú
    activeSubmenu.value = {
      id: option.id,
      title: option.label,
      position: getRadialPosition(radialOptions.value.findIndex(o => o.id === option.id))
    }
  } else if (option.action) {
    // Ejecutar acción directamente
    option.action()
  }
}

// Cerrar submenú
const closeSubmenu = () => {
  activeSubmenu.value = null
}

// Calcular posición del submenú
const getSubmenuPosition = () => {
  if (!activeSubmenu.value) return {}
  
  const index = radialOptions.value.findIndex(o => o.id === activeSubmenu.value.id)
  const angle = (index * 2 * Math.PI) / radialOptions.value.length - Math.PI / 2
  const x = Math.cos(angle) * (radialRadius + 60)
  const y = Math.sin(angle) * (radialRadius + 60)
  
  return {
    '--x': `${x}px`,
    '--y': `${y}px`,
    transform: `translate(${x}px, ${y}px)`
  }
}

const speak = (text) => {
  if (!window.speechSynthesis || !isVoiceReader.value) return
  if (!text || text.length > 400) return

  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = "es-MX"
  utter.rate = 1
  utter.pitch = 1

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utter)
}

let _hoverHandler = null

const enableGlobalHoverReader = () => {
  _hoverHandler = (e) => {
    if (!isVoiceReader.value) return

    const el = e.target
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return

    const text = (el.innerText || el.alt || el.title || '').trim()
    if (!text || text.length < 2) return

    const last = el.dataset.lastRead
    if (last === text) return
    el.dataset.lastRead = text

    speak(text)
  }

  document.body.addEventListener("mouseover", _hoverHandler, { passive: true })
}

const disableGlobalHoverReader = () => {
  if (_hoverHandler) {
    document.body.removeEventListener("mouseover", _hoverHandler)
    _hoverHandler = null
  }
}

const toggleVoiceReader = () => {
  isVoiceReader.value = !isVoiceReader.value
  localStorage.setItem("voice-reader", isVoiceReader.value)

  if (isVoiceReader.value) {
    enableGlobalHoverReader()
  } else {
    disableGlobalHoverReader()
    window.speechSynthesis.cancel()
  }
}

// La escala de grises se aplica automáticamente desde el composable useGreyMode

// Manejar cambio de tipo de daltonismo
const handleColorBlindnessChange = (event) => {
  const selectedType = event.target.value
  setColorBlindnessType(selectedType)
}

// Manejar cambio de tamaño del puntero
const handleCursorSizeChange = (event) => {
  const selectedSize = event.target.value
  setCursorSize(selectedSize)
}

// Toggle del menú
const toggleMenu = () => {
  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    activeSubmenu.value = null
  }
}

// Manejar clic en overlay
const handleOverlayClick = () => {
  if (activeSubmenu.value) {
    activeSubmenu.value = null
  } else {
    toggleMenu()
  }
}

// Cerrar menú al presionar Escape
const handleEscape = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

// Manejar resize de ventana
const handleResize = () => {
  windowHeight.value = window.innerHeight
  const buttonSize = 64
  const maxX = window.innerWidth - buttonSize
  const maxY = windowHeight.value - buttonSize
  
  if (position.x > maxX) position.x = maxX
  if (position.y > maxY) position.y = maxY
  
  savePosition()
}

// Forzar recálculo del menú cuando cambia la posición o se abre
watch([() => position.x, () => position.y, () => isOpen.value, () => windowHeight.value], () => {
  // Forzar recálculo accediendo al computed
  if (isOpen.value) {
    // Acceder al computed para forzar su recálculo
    const _ = isMenuOnTop.value
  }
}, { deep: true, immediate: false })

onMounted(() => {
  loadPosition()
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('resize', handleResize)
  if (isVoiceReader.value) {
    enableGlobalHoverReader()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('resize', handleResize)
  disableGlobalHoverReader()
  stopDrag()
})
</script>

<style scoped>
.accessibility-menu-container {
  position: fixed;
  z-index: 10000;
  user-select: none;
}

/* Botón circular flotante */
.accessibility-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 10001;
  touch-action: none;
}

.accessibility-button.dragging {
  cursor: grabbing;
  transition: none;
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.6);
  transform: scale(1.05);
}

.accessibility-button:hover:not(.dragging) {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(59, 130, 246, 0.6);
  cursor: grab;
}

.accessibility-button:active {
  transform: scale(0.95);
}

.accessibility-button.active {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.5);
}

.accessibility-button.active:hover {
  box-shadow: 0 6px 30px rgba(37, 99, 235, 0.7);
}

.button-icon {
  width: 32px;
  height: 32px;
  color: white;
}

.dark .accessibility-button {
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  box-shadow: 0 4px 20px rgba(30, 64, 175, 0.5);
}

.dark .accessibility-button:hover {
  box-shadow: 0 6px 30px rgba(30, 64, 175, 0.7);
}

.dark .accessibility-button.active {
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  box-shadow: 0 4px 20px rgba(30, 64, 175, 0.6);
}

.dark .accessibility-button.active:hover {
  box-shadow: 0 6px 30px rgba(30, 64, 175, 0.8);
}

/* Menú circular radial */
.radial-menu-container {
  position: absolute;
  width: 0;
  height: 0;
  /* Centrar perfectamente respecto al botón de 64px */
  top: 32px; /* Mitad de la altura del botón (64px / 2) */
  left: 32px; /* Mitad del ancho del botón (64px / 2) */
  transform: translate(-50%, -50%);
  z-index: 10002;
  pointer-events: none;
}

.radial-menu-item {
  position: absolute;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
  z-index: 10003;
  top: 0;
  left: 0;
  transform-origin: center;
  /* Centrar el botón respecto al punto de origen (centro del botón principal) */
  margin-top: -28px; /* Mitad del ancho del botón (56px / 2) */
  margin-left: -28px; /* Mitad del alto del botón (56px / 2) */
}

.radial-menu-item:hover {
  transform: translate(var(--x, 0), var(--y, 0)) scale(1.15);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  border-color: #3b82f6;
  background: #f0f9ff;
}

.radial-menu-item.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: #2563eb;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5);
}

.radial-menu-item.active .radial-icon {
  filter: brightness(0) invert(1);
}

.radial-icon {
  font-size: 1.5rem;
  line-height: 1;
  display: block;
}

.radial-label {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

.dark .radial-menu-item {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark .radial-menu-item:hover {
  background: #1e3a8a;
  border-color: #3b82f6;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.dark .radial-label {
  background: #1e293b;
  color: #f1f5f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Submenú radial */
.radial-submenu {
  position: absolute;
  width: 200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 10004;
  pointer-events: auto;
  top: 0;
  left: 0;
  transform-origin: center;
}

.dark .radial-submenu {
  background: #1e293b;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.submenu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.dark .submenu-header {
  border-bottom-color: #334155;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.submenu-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.dark .submenu-title {
  color: #f1f5f9;
}

.submenu-close {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s ease;
}

.submenu-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1f2937;
}

.dark .submenu-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

.submenu-close svg {
  width: 16px;
  height: 16px;
}

.submenu-content {
  padding: 1rem;
}

.submenu-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.submenu-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  transition: all 0.2s ease;
}

.submenu-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

.submenu-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dark .submenu-btn {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.dark .submenu-btn:hover:not(:disabled) {
  background: #334155;
  border-color: #475569;
  color: #cbd5e1;
}

.submenu-btn svg {
  width: 18px;
  height: 18px;
}

.submenu-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  min-width: 50px;
  text-align: center;
}

.dark .submenu-value {
  color: #e2e8f0;
}

.submenu-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #1f2937;
  font-size: 0.875rem;
  cursor: pointer;
  outline: none;
}

.dark .submenu-select {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

/* Transiciones del menú radial */
.radial-menu-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.radial-menu-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.radial-menu-enter-from .radial-menu-item {
  opacity: 0;
  transform: translate(0, 0) scale(0);
}

.radial-menu-enter-to .radial-menu-item {
  opacity: 1;
}

.radial-menu-leave-from .radial-menu-item {
  opacity: 1;
}

.radial-menu-leave-to .radial-menu-item {
  opacity: 0;
  transform: translate(0, 0) scale(0);
}

/* Animación escalonada para los items */
.radial-menu-enter-active .radial-menu-item {
  transition-delay: calc(var(--index, 0) * 0.05s);
}

.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  transform: translate(var(--x, 0), var(--y, 0)) scale(0.8);
}

/* Menú desplegable (oculto) */
.accessibility-menu {
  display: none;
}

/* Si el botón está a la izquierda, mostrar menú a la derecha */
.accessibility-menu.menu-left {
  right: auto;
  left: 0;
}

/* Si el botón está abajo, mostrar menú arriba del botón */
.accessibility-menu.menu-top {
  /* bottom: 100% coloca el menú justo arriba del botón */
  bottom: calc(100% + 16px);
  top: auto;
  /* Asegurar que no se salga por arriba */
  max-height: calc(100vh - 100px);
}

/* Ajustar posición si el menú se sale de la pantalla */
.accessibility-menu.menu-top {
  /* Si el menú no cabe arriba, ajustar para que quepa */
  max-height: calc(100vh - 20px);
}

/* Scrollbar personalizado para el menú */
.accessibility-menu::-webkit-scrollbar {
  width: 6px;
}

.accessibility-menu::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.accessibility-menu::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.accessibility-menu::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark .accessibility-menu::-webkit-scrollbar-track {
  background: #1e293b;
}

.dark .accessibility-menu::-webkit-scrollbar-thumb {
  background: #475569;
}

.dark .accessibility-menu::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

.dark .accessibility-menu {
  background: #1e293b;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.dark .menu-header {
  border-bottom-color: #334155;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.menu-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.dark .menu-title {
  color: #f1f5f9;
}

.close-button {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1f2937;
}

.dark .close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

.close-button svg {
  width: 18px;
  height: 18px;
}

.menu-content {
  padding: 0.75rem;
  overflow-x: hidden;
  /* El overflow-y se maneja en el contenedor .accessibility-menu */
}

.menu-item {
  padding: 0.75rem;
  border-radius: 10px;
  margin-bottom: 0.5rem;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.dark .menu-item {
  background: #0f172a;
}

.menu-item:hover {
  background: #f3f4f6;
}

.dark .menu-item:hover {
  background: #1e293b;
}

.menu-item:last-child {
  margin-bottom: 0;
}

.menu-item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.menu-item-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.color-blindness-select {
  width: 100%;
  padding: 0.4375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #1f2937;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.color-blindness-select:hover {
  border-color: #3b82f6;
}

.color-blindness-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dark .color-blindness-select {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

.dark .color-blindness-select:hover {
  border-color: #3b82f6;
}

.dark .color-blindness-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.menu-item-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  flex: 1;
}

.dark .menu-item-label {
  color: #e2e8f0;
}

/* Controles de zoom inline */
.zoom-controls-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.zoom-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  transition: all 0.2s ease;
}

.zoom-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
  transform: scale(1.05);
}

.zoom-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.zoom-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dark .zoom-btn {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.dark .zoom-btn:hover:not(:disabled) {
  background: #334155;
  border-color: #475569;
  color: #cbd5e1;
}

.zoom-btn svg {
  width: 16px;
  height: 16px;
}

.zoom-level-display {
  min-width: 45px;
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  padding: 0 0.375rem;
}

.dark .zoom-level-display {
  color: #94a3b8;
}

/* Toggle switch */
.toggle-switch {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
  flex-shrink: 0;
}

.toggle-switch input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: #e2e8f0;
  border-radius: 12px;
  transition: background-color 0.3s ease;
}

.dark .toggle-slider {
  background-color: #374151;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.dark .toggle-slider::before {
  background-color: #1f2937;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #3b82f6;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

/* Overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 9999;
}

/* Transiciones */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.menu-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .accessibility-button {
    width: 56px;
    height: 56px;
  }

  .button-icon {
    width: 28px;
    height: 28px;
  }

  .accessibility-menu {
    width: calc(100vw - 2rem);
    max-width: 280px;
  }
  
  .accessibility-menu:not(.menu-top) {
    bottom: 72px;
    top: auto;
  }
  
  .accessibility-menu.menu-top {
    bottom: auto !important;
    top: 72px !important;
  }
}
</style>

