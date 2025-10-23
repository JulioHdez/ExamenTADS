<template>
  <button 
    @click="toggleDarkMode" 
    class="dark-mode-toggle"
    :class="{ 'dark': isDarkMode }"
    :title="isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
  >
    <div class="toggle-track">
      <div class="toggle-thumb">
        <span class="toggle-icon">{{ isDarkMode ? '🌙' : '☀️' }}</span>
      </div>
    </div>
    <span class="toggle-label">{{ isDarkMode ? 'Modo Oscuro' : 'Modo Claro' }}</span>
  </button>
</template>

<script setup>
import { useDarkMode } from '@/composables/useDarkMode'

const { isDarkMode, toggleDarkMode } = useDarkMode()
</script>

<style scoped>
.dark-mode-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.dark-mode-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.dark-mode-toggle.dark:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.toggle-track {
  position: relative;
  width: 50px;
  height: 26px;
  background-color: #e2e8f0;
  border-radius: 13px;
  transition: background-color 0.3s ease;
  border: 2px solid transparent;
}

.dark-mode-toggle.dark .toggle-track {
  background-color: #3b82f6;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark-mode-toggle.dark .toggle-thumb {
  transform: translateX(24px);
  background-color: #1e293b;
}

.toggle-icon {
  font-size: 0.7rem;
  line-height: 1;
}

.toggle-label {
  white-space: nowrap;
  user-select: none;
}

/* Modo oscuro */
.dark .dark-mode-toggle {
  color: #94a3b8;
}

.dark .dark-mode-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.dark .toggle-track {
  background-color: #374151;
}

.dark .dark-mode-toggle.dark .toggle-track {
  background-color: #3b82f6;
}

.dark .toggle-thumb {
  background-color: #1f2937;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.dark .dark-mode-toggle.dark .toggle-thumb {
  background-color: #0f172a;
}
</style>
