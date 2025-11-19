<template>
  <div class="zoom-controls">
    <button 
      @click="zoomOut" 
      class="zoom-button"
      :class="{ 'disabled': !canZoomOut }"
      :disabled="!canZoomOut"
      :title="`Disminuir zoom (${zoomPercentage})`"
      aria-label="Disminuir zoom"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke-width="2" 
        stroke="currentColor" 
        class="zoom-icon"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5H6" 
        />
      </svg>
      <span class="zoom-label">-</span>
    </button>
    
    <div class="zoom-level" :title="`Zoom actual: ${zoomPercentage}`">
      {{ zoomPercentage }}
    </div>
    
    <button 
      @click="zoomIn" 
      class="zoom-button"
      :class="{ 'disabled': !canZoomIn }"
      :disabled="!canZoomIn"
      :title="`Aumentar zoom (${zoomPercentage})`"
      aria-label="Aumentar zoom"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke-width="2" 
        stroke="currentColor" 
        class="zoom-icon"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" 
        />
      </svg>
      <span class="zoom-label">+</span>
    </button>
  </div>
</template>

<script setup>
import { useZoom } from '@/composables/useZoom'

const { zoomLevel, zoomPercentage, canZoomIn, canZoomOut, zoomIn, zoomOut } = useZoom()
</script>

<style scoped>
/* Asegurar que los controles no se vean afectados por el zoom */
.zoom-controls {
  zoom: 1 !important;
  transform: none !important;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 0.35rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  z-index: 10000;
  pointer-events: auto;
  user-select: none;
}

.dark .zoom-controls {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.zoom-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #475569;
  position: relative;
  padding: 0;
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.zoom-button:hover:not(.disabled) {
  background: #e2e8f0;
  border-color: #cbd5e1;
  color: #334155;
  transform: scale(1.08);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.zoom-button:active:not(.disabled) {
  transform: scale(0.95);
}

.zoom-button.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f8fafc;
}

.dark .zoom-button {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.dark .zoom-button:hover:not(.disabled) {
  background: #334155;
  border-color: #475569;
  color: #cbd5e1;
}

.dark .zoom-button.disabled {
  background: #0f172a;
  border-color: #1e293b;
}

.zoom-icon {
  width: 16px;
  height: 16px;
  position: absolute;
  pointer-events: none;
}

.zoom-label {
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1;
  opacity: 0;
  position: absolute;
  pointer-events: none;
}

.zoom-level {
  min-width: 42px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  user-select: none;
  padding: 0 0.35rem;
  pointer-events: none;
}

.dark .zoom-level {
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
  .zoom-controls {
    gap: 0.2rem;
    padding: 0.2rem;
  }
  
  .zoom-button {
    width: 24px;
    height: 24px;
  }
  
  .zoom-icon {
    width: 12px;
    height: 12px;
  }
  
  .zoom-level {
    min-width: 35px;
    font-size: 0.65rem;
    padding: 0 0.2rem;
  }
}
</style>

