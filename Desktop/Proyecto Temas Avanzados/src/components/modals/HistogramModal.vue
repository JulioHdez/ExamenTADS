<template>
  <BaseModal :is-open="isOpen" title="Análisis de Histograma" @close="$emit('close')">
    <div class="histogram-content">
      <!-- Selectores -->
      <div class="selectors-section">
        <div class="semester-selector">
          <label for="semester" class="selector-label">Seleccionar semestre</label>
          <select 
            id="semester" 
            v-model="selectedSemester" 
            class="semester-dropdown"
          >
            <option value="">-- Seleccione un semestre --</option>
            <option 
              v-for="semester in availableSemesters" 
              :key="semester" 
              :value="semester"
            >
              Semestre {{ semester }}
            </option>
          </select>
        </div>

        <div class="metric-selector">
          <label for="metric" class="selector-label">Métrica a analizar</label>
          <select 
            id="metric" 
            v-model="selectedMetric" 
            class="metric-dropdown"
          >
            <option 
              v-for="metric in availableMetrics" 
              :key="metric.value" 
              :value="metric.value"
            >
              {{ metric.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Botón para generar gráfico -->
      <div class="generate-section">
        <button 
          type="button" 
          class="btn-generate" 
          @click="generateHistogram"
          :disabled="loading || !selectedSemester"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>📊</span>
          {{ loading ? 'Generando...' : 'Generar Histograma' }}
        </button>
      </div>

      <!-- Histograma y estadísticas -->
      <div v-if="histogramData.length > 0" class="histogram-section">
        <div class="chart-container">
          <HistogramChart :data="chartFormattedData" />
        </div>

        <!-- Estadísticas descriptivas -->
        <div class="stats-section">
          <h4 class="stats-title">Estadísticas Descriptivas</h4>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Media</div>
              <div class="stat-value">{{ stats.mean }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Mediana</div>
              <div class="stat-value">{{ stats.median }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Moda</div>
              <div class="stat-value">{{ stats.mode }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Desviación Estándar</div>
              <div class="stat-value">{{ stats.stdDev }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Mínimo</div>
              <div class="stat-value">{{ stats.min }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Máximo</div>
              <div class="stat-value">{{ stats.max }}</div>
            </div>
          </div>
        </div>

        <!-- Tabla de datos -->
        <div class="data-table-section">
          <h4 class="table-title">Datos del Histograma</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>Rango</th>
                <th>Frecuencia</th>
                <th>Porcentaje</th>
                <th>Porcentaje Acumulado</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(item, index) in histogramData" 
                :key="index"
              >
                <td>{{ item.range }}</td>
                <td>{{ item.frequency }}</td>
                <td>{{ percentage(item.frequency) }}%</td>
                <td>{{ cumulativePercentage(index) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Estado vacío después de generar -->
      <div v-else-if="!loading && histogramData.length === 0 && selectedSemester" class="empty-state">
        <div class="empty-icon">📈</div>
        <h3>Sin datos para mostrar</h3>
        <p>No se encontraron datos para generar el histograma con los criterios seleccionados.</p>
      </div>

      <!-- Estado vacío antes de generar -->
      <div v-else-if="!loading && !selectedSemester" class="initial-state">
        <div class="initial-icon">📊</div>
        <h3>Análisis de Histograma</h3>
        <p>Seleccione un semestre y una métrica para generar un histograma con distribución de datos y estadísticas descriptivas.</p>
      </div>

      <!-- Estado de carga -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <h3>Generando histograma...</h3>
        <p>Por favor espere mientras se analizan los datos.</p>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="handleClose">
        Cerrar
      </button>
      <div v-if="histogramData.length > 0" class="export-dropdown-wrapper">
        <button 
          type="button" 
          class="btn btn-primary" 
          @click="toggleExportOptions"
        >
          📊 Exportar
        </button>
        
        <!-- Dropdown de opciones de exportación -->
        <div v-if="showExportOptions" class="export-options">
          <button 
            type="button" 
            class="export-option-btn" 
            @click="exportToExcel"
            :disabled="loading"
          >
            <span class="option-icon">📊</span>
            <span class="option-text">Exportar a Excel</span>
          </button>
          <button 
            type="button" 
            class="export-option-btn" 
            @click="exportToPDF"
            :disabled="loading"
          >
            <span class="option-icon">📄</span>
            <span class="option-text">Exportar a PDF</span>
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { useHistogram } from '@/composables/modals/useHistogram'
import HistogramChart from '@/components/charts/HistogramChart.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const chartContainer = ref(null)
const showExportOptions = ref(false)

const {
  selectedSemester,
  selectedMetric,
  loading,
  histogramData,
  stats,
  availableSemesters,
  availableMetrics,
  generateHistogram: generateHistogramLogic,
  exportToExcel: exportToExcelFunction,
  exportToPDF: exportToPDFFunction
} = useHistogram()

// Formatear datos para el gráfico
const chartFormattedData = computed(() => {
  return histogramData.value.map(item => ({
    bin: item.range,
    frequency: item.frequency
  }))
})

const totalFrequency = computed(() => {
  return histogramData.value.reduce((sum, item) => sum + item.frequency, 0)
})

const percentage = (frequency) => {
  if (totalFrequency.value === 0) return 0
  return ((frequency / totalFrequency.value) * 100).toFixed(2)
}

const cumulativePercentage = (index) => {
  if (totalFrequency.value === 0) return 0
  let cumulative = 0
  for (let i = 0; i <= index; i++) {
    cumulative += histogramData.value[i].frequency
  }
  return ((cumulative / totalFrequency.value) * 100).toFixed(2)
}

const handleClose = () => {
  emit('close')
}

const toggleExportOptions = () => {
  showExportOptions.value = !showExportOptions.value
}

const exportToExcel = () => {
  showExportOptions.value = false
  exportToExcelFunction(chartContainer.value)
}

const exportToPDF = () => {
  showExportOptions.value = false
  exportToPDFFunction(chartContainer.value)
}

const generateHistogram = async () => {
  await generateHistogramLogic()
}
</script>

<style scoped>
@import '@/styles/modals/HistogramModal.css';
</style>

