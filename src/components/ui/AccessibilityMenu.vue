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

    <!-- Menú desplegable -->
    <Transition name="menu">
      <div 
        v-if="isOpen" 
        class="accessibility-menu" 
        :class="{ 'menu-left': isMenuOnLeft, 'menu-top': isMenuOnTop }"
        @click.stop
      >
        <div class="menu-header">
          <h3 class="menu-title">Accesibilidad</h3>
          <button @click="toggleMenu" class="close-button" aria-label="Cerrar menú">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="menu-content">
          <!-- Control de Zoom -->
          <div class="menu-item">
            <div class="menu-item-header">
              <span class="menu-item-icon">🔍</span>
              <span class="menu-item-label">Zoom</span>
            </div>
            <div class="zoom-controls-inline">
              <button
                @click="zoomOut"
                class="zoom-btn"
                :disabled="!canZoomOut"
                :title="`Disminuir zoom (${zoomPercentage})`"
                aria-label="Disminuir zoom"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5H6" />
                </svg>
              </button>
              <span class="zoom-level-display">{{ zoomPercentage }}</span>
              <button
                @click="zoomIn"
                class="zoom-btn"
                :disabled="!canZoomIn"
                :title="`Aumentar zoom (${zoomPercentage})`"
                aria-label="Aumentar zoom"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Modo Oscuro/Claro -->
          <div class="menu-item">
            <div class="menu-item-header">
              <span class="menu-item-icon">{{ isDarkMode ? '🌙' : '☀️' }}</span>
              <span class="menu-item-label">Modo {{ isDarkMode ? 'Oscuro' : 'Claro' }}</span>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="isDarkMode"
                @change="toggleDarkMode"
                aria-label="Cambiar modo oscuro/claro"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Escala de Grises -->
          <div class="menu-item">
            <div class="menu-item-header">
              <span class="menu-item-icon">🌓</span>
              <span class="menu-item-label">Escala de grises</span>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="isGreyMode"
                @change="toggleGreyMode"
                aria-label="Activar escala de grises"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Daltonismo -->
          <div class="menu-item">
            <div class="menu-item-header">
              <span class="menu-item-icon">🎨</span>
              <span class="menu-item-label">Daltonismo</span>
            </div>
            <select
              :value="colorBlindnessType"
              @change="handleColorBlindnessChange"
              class="color-blindness-select"
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
          </div>

          <!-- Tamaño del Puntero -->
          <div class="menu-item">
            <div class="menu-item-header">
              <span class="menu-item-icon">🖱️</span>
              <span class="menu-item-label">Tamaño del puntero</span>
            </div>
            <div class="zoom-controls-inline">
              <button
                @click="decreaseCursorSize"
                class="zoom-btn"
                :disabled="!canDecreaseCursor"
                :title="`Disminuir tamaño del puntero (${cursorSizeDisplay})`"
                aria-label="Disminuir tamaño del puntero"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5H6" />
                </svg>
              </button>
              <span class="zoom-level-display">{{ cursorSizeDisplay }}</span>
              <button
                @click="increaseCursorSize"
                class="zoom-btn"
                :disabled="!canIncreaseCursor"
                :title="`Aumentar tamaño del puntero (${cursorSizeDisplay})`"
                aria-label="Aumentar tamaño del puntero"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Resaltado de Texto -->
          <div class="menu-item">
            <div class="menu-item-header">
              <span class="menu-item-icon">📖</span>
              <span class="menu-item-label">Resaltar texto al pasar el cursor</span>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="isTextHighlightEnabled"
                @change="toggleTextHighlight"
                aria-label="Activar resaltado de texto al pasar el cursor"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Lectura en Voz Alta -->
          <div class="menu-item">
            <div class="menu-item-header">
              <span class="menu-item-icon">🔊</span>
              <span class="menu-item-label">Lectura en voz alta</span>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="isVoiceReader"
                @change="toggleVoiceReader"
                aria-label="Activar lectura en voz alta"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Overlay para cerrar al hacer clic fuera (sin desenfoque) -->
    <Transition name="overlay">
      <div v-if="isOpen" class="menu-overlay" @click="toggleMenu"></div>
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

const isOpen = ref(false)
const isDragging = ref(false)
const hasMoved = ref(false)
const dragStart = reactive({ x: 0, y: 0 })
const position = reactive({ x: 0, y: 0 })
const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 800)

// Calcular si el menú debe estar a la izquierda o derecha
const isMenuOnLeft = computed(() => {
  const buttonSize = 64
  const menuWidth = 320
  const buttonCenterX = window.innerWidth - position.x - buttonSize / 2
  // Si el botón está en la mitad izquierda de la pantalla, mostrar menú a la derecha
  return buttonCenterX < window.innerWidth / 2
})

// Calcular si el menú debe estar arriba o abajo
// true = menú arriba del botón (clase menu-top), false = menú abajo del botón
const isMenuOnTop = computed(() => {
  if (typeof window === 'undefined') return false
  
  const buttonSize = 64
  const spaceBelow = position.y // espacio desde el borde inferior hasta el botón
  const spaceAbove = windowHeight.value - position.y - buttonSize // espacio desde el botón hasta el borde superior
  
  // Lógica:
  // position.y = distancia desde el borde INFERIOR hasta el botón
  // - Si position.y es GRANDE (ej: 700px) → botón está ARRIBA → spaceBelow=700, spaceAbove=36
  // - Si position.y es PEQUEÑO (ej: 50px) → botón está ABAJO → spaceBelow=50, spaceAbove=686
  
  // Lógica simplificada y clara:
  // Si el botón está ARRIBA (spaceBelow > spaceAbove): menú debe salir ABAJO → isMenuOnTop = false
  // Si el botón está ABAJO (spaceAbove > spaceBelow): menú debe salir ARRIBA → isMenuOnTop = true
  
  // Por lo tanto: isMenuOnTop = spaceAbove > spaceBelow
  // Esto da:
  // - true cuando spaceAbove > spaceBelow (botón abajo) → menú arriba ✓
  // - false cuando spaceBelow > spaceAbove (botón arriba) → menú abajo ✓
  
  const result = spaceAbove > spaceBelow
  
  // Debug temporal - verificar que la clase se aplique correctamente
  if (isOpen.value) {
    // Usar nextTick para asegurar que el DOM se haya actualizado
    nextTick(() => {
      const menuElement = document.querySelector('.accessibility-menu')
      if (menuElement) {
        const hasMenuTopClass = menuElement.classList.contains('menu-top')
        console.log('🔍 Menu position debug:', {
          positionY: position.y,
          windowHeight: windowHeight.value,
          spaceBelow,
          spaceAbove,
          buttonLocation: spaceBelow > spaceAbove ? 'ARRIBA' : 'ABAJO',
          isMenuOnTop: result,
          hasMenuTopClass,
          menuDirection: result ? 'ARRIBA del botón' : 'ABAJO del botón',
          expected: spaceBelow > spaceAbove ? 'ABAJO del botón' : 'ARRIBA del botón',
          correct: (result && spaceAbove > spaceBelow) || (!result && spaceBelow > spaceAbove) ? '✓' : '✗',
          classMatch: hasMenuTopClass === result ? '✓' : '✗ CLASE INCORRECTA'
        })
      }
    })
  }
  
  return result
})

// Cargar posición guardada
const loadPosition = () => {
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
}

// Guardar posición
const savePosition = () => {
  localStorage.setItem('accessibility-menu-position', JSON.stringify({
    x: position.x,
    y: position.y
  }))
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

// Lectura en voz alta
const isVoiceReader = ref(localStorage.getItem("voice-reader") === "true")

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
  // Forzar recálculo del computed cuando se abre el menú
  if (isOpen.value) {
    // El computed se recalculará automáticamente al acceder a isMenuOnTop
    // pero forzamos un acceso para asegurar que se ejecute
    void isMenuOnTop.value
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

/* Menú desplegable */
.accessibility-menu {
  position: absolute;
  width: 320px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: visible;
  z-index: 10002;
  pointer-events: auto;
  max-height: none;
  overflow-y: visible;
  
  /* Posición por defecto: abajo del botón */
  /* top: 100% coloca el menú justo debajo del botón (que tiene 64px de altura) */
  top: calc(100% + 16px);
  bottom: auto;
  right: 0;
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
}

.dark .accessibility-menu {
  background: #1e293b;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.dark .menu-header {
  border-bottom-color: #334155;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.menu-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.dark .menu-title {
  color: #f1f5f9;
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
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
  width: 20px;
  height: 20px;
}

.menu-content {
  padding: 1rem;
  overflow-y: visible;
  overflow-x: visible;
}

.menu-item {
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 0.75rem;
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
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.menu-item-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.color-blindness-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #1f2937;
  font-size: 0.875rem;
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
  font-size: 0.9375rem;
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
  width: 18px;
  height: 18px;
}

.zoom-level-display {
  min-width: 50px;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  padding: 0 0.5rem;
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
}

.toggle-switch input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 50px;
  height: 26px;
  background-color: #e2e8f0;
  border-radius: 13px;
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
  width: 22px;
  height: 22px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark .toggle-slider::before {
  background-color: #1f2937;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #3b82f6;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(24px);
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
    max-width: 320px;
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

