<template>
  <Transition name="toast">
    <div v-if="isVisible" class="notification-toast" :class="typeClass">
      <div class="toast-content">
        <div class="toast-icon">
          <span v-if="type === 'error'">⚠️</span>
          <span v-else-if="type === 'success'">✅</span>
          <span v-else-if="type === 'warning'">⚠️</span>
          <span v-else>ℹ️</span>
        </div>
        <div class="toast-message">
          <h4 class="toast-title">{{ title }}</h4>
          <p class="toast-description">{{ message }}</p>
        </div>
        <button @click="close" class="toast-close">
          <span>×</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 5000
  },
  autoClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const isVisible = ref(false)

const typeClass = computed(() => ({
  [`toast-${props.type}`]: true
}))

const close = () => {
  isVisible.value = false
  setTimeout(() => {
    emit('close')
  }, 300)
}

onMounted(() => {
  isVisible.value = true
  
  if (props.autoClose && props.duration > 0) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<style scoped>
.notification-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 9999;
  max-width: 400px;
  min-width: 300px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
}

.toast-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.toast-message {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.toast-description {
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
  opacity: 0.7;
}

.toast-close:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

/* Toast Types */
.toast-error {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border-left: 4px solid #ef4444;
}

.toast-error .toast-title {
  color: #dc2626;
}

.toast-error .toast-description {
  color: #991b1b;
}

.toast-error .toast-close {
  color: #dc2626;
}

.toast-success {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-left: 4px solid #22c55e;
}

.toast-success .toast-title {
  color: #16a34a;
}

.toast-success .toast-description {
  color: #15803d;
}

.toast-success .toast-close {
  color: #16a34a;
}

.toast-warning {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-left: 4px solid #f59e0b;
}

.toast-warning .toast-title {
  color: #d97706;
}

.toast-warning .toast-description {
  color: #b45309;
}

.toast-warning .toast-close {
  color: #d97706;
}

.toast-info {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-left: 4px solid #3b82f6;
}

.toast-info .toast-title {
  color: #2563eb;
}

.toast-info .toast-description {
  color: #1d4ed8;
}

.toast-info .toast-close {
  color: #2563eb;
}

/* Dark mode styles */
.dark .toast-error {
  background: linear-gradient(135deg, #7f1d1d, #991b1b);
  border-left-color: #fca5a5;
}

.dark .toast-error .toast-title {
  color: #fca5a5;
}

.dark .toast-error .toast-description {
  color: #fecaca;
}

.dark .toast-error .toast-close {
  color: #fca5a5;
}

.dark .toast-success {
  background: linear-gradient(135deg, #14532d, #166534);
  border-left-color: #86efac;
}

.dark .toast-success .toast-title {
  color: #86efac;
}

.dark .toast-success .toast-description {
  color: #bbf7d0;
}

.dark .toast-success .toast-close {
  color: #86efac;
}

.dark .toast-warning {
  background: linear-gradient(135deg, #78350f, #92400e);
  border-left-color: #fbbf24;
}

.dark .toast-warning .toast-title {
  color: #fbbf24;
}

.dark .toast-warning .toast-description {
  color: #fcd34d;
}

.dark .toast-warning .toast-close {
  color: #fbbf24;
}

.dark .toast-info {
  background: linear-gradient(135deg, #1e3a8a, #1e40af);
  border-left-color: #93c5fd;
}

.dark .toast-info .toast-title {
  color: #93c5fd;
}

.dark .toast-info .toast-description {
  color: #bfdbfe;
}

.dark .toast-info .toast-close {
  color: #93c5fd;
}

.dark .toast-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Animations */
.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 480px) {
  .notification-toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
    min-width: auto;
  }
}
</style>
