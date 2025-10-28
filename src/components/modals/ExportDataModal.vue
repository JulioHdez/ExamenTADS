<template>
  <BaseModal :is-open="isOpen" title="Exportar Datos y Gráficos" @close="$emit('close')">
    <form @submit.prevent="handleExport" class="export-form">
      <!-- Sección de Formato -->
      <div class="form-section">
        <div class="section-header">
          <label class="section-title">Formato</label>
          <div class="section-actions">
            <button type="button" class="btn-link" @click="selectAllFormats">Seleccionar todo</button>
            <span class="separator">|</span>
            <button type="button" class="btn-link" @click="clearAllFormats">Limpiar</button>
          </div>
        </div>
        
        <div class="checkbox-group">
          <label class="checkbox-item">
            <input 
              type="checkbox" 
              v-model="formData.format.excel" 
              class="checkbox-input"
            >
            <span class="checkbox-custom"></span>
            <span class="checkbox-label">Excel</span>
          </label>
          
          <label class="checkbox-item">
            <input 
              type="checkbox" 
              v-model="formData.format.csv" 
              class="checkbox-input"
            >
            <span class="checkbox-custom"></span>
            <span class="checkbox-label">CSV</span>
          </label>
        </div>
      </div>

      <!-- Sección de Incluir -->
      <div class="form-section">
        <div class="section-header">
          <label class="section-title">Incluir</label>
          <div class="section-actions">
            <button type="button" class="btn-link" @click="selectAllData">Seleccionar todo</button>
            <span class="separator">|</span>
            <button type="button" class="btn-link" @click="clearAllData">Limpiar</button>
          </div>
        </div>
        
        <div class="checkbox-group">
          <label class="checkbox-item">
            <input 
              type="checkbox" 
              v-model="formData.include.studentData" 
              class="checkbox-input"
            >
            <span class="checkbox-custom"></span>
            <span class="checkbox-label">Datos Estudiantes</span>
          </label>
          
          <label class="checkbox-item">
            <input 
              type="checkbox" 
              v-model="formData.include.charts" 
              class="checkbox-input"
            >
            <span class="checkbox-custom"></span>
            <span class="checkbox-label">Gráficos</span>
          </label>
          
          <label class="checkbox-item">
            <input 
              type="checkbox" 
              v-model="formData.include.statistics" 
              class="checkbox-input"
            >
            <span class="checkbox-custom"></span>
            <span class="checkbox-label">Estadísticas</span>
          </label>
          
          <label class="checkbox-item">
            <input 
              type="checkbox" 
              v-model="formData.include.riskFactors" 
              class="checkbox-input"
            >
            <span class="checkbox-custom"></span>
            <span class="checkbox-label">Factores de Riesgo</span>
          </label>
        </div>
      </div>

      <!-- Sección de Ruta Destino -->
      <div class="form-section">
        <div class="section-header">
          <label class="section-title">Ruta destino</label>
        </div>
        
        <div class="input-group">
          <input
            type="text"
            v-model="formData.destinationPath"
            class="path-input"
            placeholder="Seleccione o ingrese la ruta de destino..."
            readonly
          />
          <button type="button" class="btn-browse" @click="browseFolder">
            <span class="browse-icon">📁</span>
            Examinar
          </button>
        </div>
        
        <div class="path-info">
          <small class="path-hint">
            Si no se especifica una ruta, los archivos se guardarán en la carpeta de descargas
          </small>
        </div>
      </div>

      <!-- Resumen de Exportación -->
      <div v-if="hasSelectedOptions" class="export-summary">
        <div class="summary-header">
          <span class="summary-title">Resumen de Exportación</span>
        </div>
        
        <div class="summary-content">
          <div class="summary-item">
            <span class="summary-label">Formatos:</span>
            <span class="summary-value">{{ selectedFormatsText }}</span>
          </div>
          
          <div class="summary-item">
            <span class="summary-label">Datos:</span>
            <span class="summary-value">{{ selectedDataText }}</span>
          </div>
          
          <div class="summary-item">
            <span class="summary-label">Archivos a generar:</span>
            <span class="summary-value">{{ totalFiles }} archivo(s)</span>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">
        Cancelar
      </button>
      <button 
        type="submit" 
        class="btn btn-primary" 
        @click="handleExport" 
        :disabled="isExporting || !hasSelectedOptions"
      >
        <span v-if="isExporting" class="spinner"></span>
        {{ isExporting ? 'Exportando...' : 'Exportar' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'
import { useExportData } from '@/composables/modals/useExportData'
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'export'])

const {
  isExporting,
  formData,
  handleExport: handleExportLogic,
  browseFolder: browseFolderLogic,
  resetForm,
  selectAllFormats,
  selectAllData,
  clearAllFormats,
  clearAllData
} = useExportData()

const handleExport = () => {
  handleExportLogic(emit)
}

const browseFolder = async () => {
  await browseFolderLogic()
}

const selectedFormats = computed(() => {
  return Object.entries(formData.format)
    .filter(([key, value]) => value)
    .map(([key]) => key.toUpperCase())
})

const selectedData = computed(() => {
  return Object.entries(formData.include)
    .filter(([key, value]) => value)
    .map(([key]) => {
      const labels = {
        studentData: 'Datos Estudiantes',
        charts: 'Gráficos',
        statistics: 'Estadísticas',
        riskFactors: 'Factores de Riesgo'
      }
      return labels[key] || key
    })
})

const selectedFormatsText = computed(() => {
  return selectedFormats.value.length > 0 
    ? selectedFormats.value.join(', ') 
    : 'Ninguno'
})

const selectedDataText = computed(() => {
  return selectedData.value.length > 0 
    ? selectedData.value.join(', ') 
    : 'Ninguno'
})

const totalFiles = computed(() => {
  return selectedFormats.value.length * selectedData.value.length
})

const hasSelectedOptions = computed(() => {
  return selectedFormats.value.length > 0 && selectedData.value.length > 0
})
</script>

<style scoped>
@import '@/styles/modals/ExportDataModal.css';
</style>
