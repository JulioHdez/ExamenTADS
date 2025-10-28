<template>
  <div class="export-section">
    <div class="export-card">
      <h3>Exportar Datos y Gráficos</h3>
      
      <div class="export-form">
        <div class="form-group">
          <label>Formato</label>
          <div class="radio-group">
            <label class="radio-label">
              <input v-model="exportFormat" type="radio" value="excel" />
              <span>Excel</span>
            </label>
            <label class="radio-label">
              <input v-model="exportFormat" type="radio" value="csv" />
              <span>CSV</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Incluir</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input v-model="includeData" type="checkbox" />
              <span>Datos Estudiantes</span>
            </label>
            <label class="checkbox-label">
              <input v-model="includeCharts" type="checkbox" />
              <span>Gráficos</span>
            </label>
            <label class="checkbox-label">
              <input v-model="includeMetrics" type="checkbox" />
              <span>Métricas</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Ruta destino</label>
          <input 
            v-model="destinationPath" 
            type="text" 
            class="form-control" 
            placeholder="C:\Users\Usuario\Desktop\export"
          />
        </div>

        <div class="form-actions">
          <button @click="exportData" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">Exportando...</span>
            <span v-else>Exportar</span>
          </button>
          <button @click="cancelExport" class="btn btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const exportFormat = ref('excel')
const includeData = ref(true)
const includeCharts = ref(false)
const includeMetrics = ref(true)
const destinationPath = ref('')
const loading = ref(false)

const exportData = async () => {
  loading.value = true
  
  try {
    // Simular exportación
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const exportOptions = {
      format: exportFormat.value,
      includeData: includeData.value,
      includeCharts: includeCharts.value,
      includeMetrics: includeMetrics.value,
      destination: destinationPath.value
    }
    
    console.log('Exportando con opciones:', exportOptions)
    alert('Datos exportados exitosamente')
    
    // Resetear formulario
    cancelExport()
  } catch (error) {
    console.error('Error al exportar:', error)
    alert('Error al exportar los datos')
  } finally {
    loading.value = false
  }
}

const cancelExport = () => {
  exportFormat.value = 'excel'
  includeData.value = true
  includeCharts.value = false
  includeMetrics.value = true
  destinationPath.value = ''
}
</script>

<style scoped>
.export-section {
  margin-bottom: 2rem;
}

.export-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.dark .export-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.export-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
  transition: color 0.3s ease;
}

.dark .export-card h3 {
  color: #f1f5f9;
}

.export-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.dark .form-group label {
  color: #e2e8f0;
}

.radio-group,
.checkbox-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.radio-label,
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition: color 0.3s ease;
}

.dark .radio-label,
.dark .checkbox-label {
  color: #f1f5f9;
}

.radio-label input[type="radio"],
.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.form-control {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease, background-color 0.3s ease, color 0.3s ease;
}

.dark .form-control {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #1f2937;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #374151;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.dark .btn-secondary {
  background-color: #334155;
  color: #f1f5f9;
  border-color: #475569;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

.dark .btn-secondary:hover {
  background-color: #475569;
}

/* Responsive */
@media (max-width: 768px) {
  .radio-group,
  .checkbox-group {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
