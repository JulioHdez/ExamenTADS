<template>
  <BaseModal :is-open="isOpen" title="Importar Datos" @close="$emit('close')">
    <form @submit.prevent="handleImport" class="export-form">
      <!-- Sección informativa -->
      <div class="form-section">
        <div class="section-header">
          <label class="section-title">Inserta el archivo con los estudiantes</label>
        </div>
        <div class="path-info">
          <small class="path-hint">Descarga de Plantilla (Excel con 5 hojas: Estudiantes, Grupos, Calificaciones, Factores, Observaciones): 
            <a class="btn-link" :href="templateExcelHref" download target="_blank">Excel</a> · 
            <a class="btn-link" :href="templateCsvHref" download target="_blank">CSV</a>
          </small>
        </div>
      </div>

      <!-- Sección: Archivo a importar -->
      <div class="form-section">
        <div class="section-header">
          <label class="section-title">Archivo</label>
        </div>
        <div class="input-group">
          <input
            type="text"
            class="path-input"
            :value="formData.fileName || 'Seleccione un archivo CSV o Excel... (mismo orden que la plantilla)'"
            readonly
          />
          <button type="button" class="btn-browse" @click="openFilePicker">
            <span class="browse-icon">📁</span>
            Examinar
          </button>
          <input ref="fileInput" type="file" accept=".csv,.xlsx,.xls" @change="onFileChange" style="display:none" />
        </div>
        <div class="path-info">
          <small class="path-hint">Formatos soportados: CSV, Excel (.xlsx, .xls)</small>
        </div>
      </div>

      <!-- Resumen -->
      <div class="export-summary">
        <div class="summary-header">
          <span class="summary-title">Resumen</span>
        </div>
        <div class="summary-content">
          <div class="summary-item">
            <span class="summary-label">Tipo:</span>
            <span class="summary-value">{{ formData.dataType === 'students' ? 'Estudiantes' : formData.dataType }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Archivo:</span>
            <span class="summary-value">{{ formData.fileName || 'Sin seleccionar' }}</span>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
      <button 
        type="submit" 
        class="btn btn-primary" 
        @click="handleImport" 
        :disabled="isImporting || !selectedFile">
        <span v-if="isImporting" class="spinner"></span>
        {{ isImporting ? 'Importando...' : 'Importar' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'
import { useImportData } from '@/composables/modals/useImportData'
import { ref, computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'imported'])

const fileInput = ref(null)
const { isImporting, formData, selectedFile, onFileChange, handleImport: handleImportLogic } = useImportData()
const templateExcelHref = computed(() => 'http://localhost:3001/static/plantilla_import_estudiantes.xlsx')
const templateCsvHref = computed(() => 'http://localhost:3001/static/plantilla_import_estudiantes.csv')

const handleImport = () => {
  handleImportLogic(emit)
}

const openFilePicker = () => {
  fileInput.value?.click()
}
</script>

<style scoped>
@import '@/styles/modals/ExportDataModal.css';
</style>


