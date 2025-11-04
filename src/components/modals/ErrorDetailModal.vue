<template>
  <BaseModal :is-open="isOpen" title="Detalles del Error" @close="closeModal">
    <div class="error-detail-content">
      <div class="error-header">
        <div class="error-icon">⚠️</div>
        <div class="error-title-section">
          <h3 class="error-type">{{ errorType }}</h3>
          <p class="error-message">{{ errorMessage }}</p>
        </div>
      </div>
      
      <div v-if="errorDetails && errorDetails.length > 0" class="error-details-section">
        <h4 class="details-title">Errores de validación:</h4>
        <ul class="error-list">
          <li v-for="(detail, index) in errorDetails" :key="index" class="error-item">
            <strong>{{ detail.field || 'Campo' }}:</strong> {{ detail.message }}
            <span v-if="detail.value" class="error-value">(Valor: {{ detail.value }})</span>
          </li>
        </ul>
      </div>
      
      <div v-if="fullError" class="full-error-section">
        <h4 class="details-title">Error técnico:</h4>
        <pre class="error-code">{{ fullError }}</pre>
      </div>
    </div>
    
    <template #footer>
      <button type="button" class="btn btn-primary" @click="closeModal">
        Cerrar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  errorType: {
    type: String,
    default: 'Error'
  },
  errorMessage: {
    type: String,
    default: ''
  },
  errorDetails: {
    type: Array,
    default: () => []
  },
  fullError: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.error-detail-content {
  padding: 1.5rem 0;
}

.error-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.dark .error-header {
  border-bottom-color: #475569;
}

.error-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.error-title-section {
  flex: 1;
}

.error-type {
  font-size: 1.5rem;
  font-weight: 700;
  color: #dc2626;
  margin: 0 0 0.5rem 0;
}

.dark .error-type {
  color: #fca5a5;
}

.error-message {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

.dark .error-message {
  color: #94a3b8;
}

.error-details-section {
  margin-bottom: 2rem;
}

.details-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.dark .details-title {
  color: #e2e8f0;
}

.error-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-item {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  border-radius: 6px;
  color: #991b1b;
  line-height: 1.6;
}

.dark .error-item {
  background: #7f1d1d;
  border-left-color: #fca5a5;
  color: #fecaca;
}

.error-item strong {
  font-weight: 600;
  margin-right: 0.5rem;
}

.error-value {
  font-size: 0.875rem;
  opacity: 0.8;
  font-style: italic;
}

.full-error-section {
  margin-top: 2rem;
}

.error-code {
  background: #1f2937;
  color: #f3f4f6;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.dark .error-code {
  background: #0f172a;
  color: #e2e8f0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}
</style>

