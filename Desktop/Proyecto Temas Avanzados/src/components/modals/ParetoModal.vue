<template>
  <BaseModal :is-open="isOpen" title="Análisis de Pareto" @close="$emit('close')">
    <div class="pareto-content">
      <!-- Selector de Semestre -->
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

      <!-- Botón para generar gráfico -->
      <div class="generate-section">
        <button 
          type="button" 
          class="btn-generate" 
          @click="generatePareto"
          :disabled="loading || !selectedSemester"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>📊</span>
          {{ loading ? 'Generando...' : 'Generar Gráfico' }}
        </button>
      </div>

      <!-- Gráfico de Pareto -->
      <div v-if="chartData.length > 0" class="pareto-chart-section">
        <div ref="chartContainer">
          <ParetoChart :data="chartData" />
        </div>

        <!-- Tabla de datos -->
        <div class="data-table-section">
          <h4 class="table-title">Datos del Análisis de Pareto</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Frecuencia</th>
                <th>Porcentaje</th>
                <th>Porcentaje Acumulado</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(item, index) in chartData" 
                :key="index"
                :class="{ 'highlight-row': item.cumulativePercentage <= 80 }"
              >
                <td>{{ item.category }}</td>
                <td>{{ item.value }}</td>
                <td>{{ item.percentage }}%</td>
                <td>{{ item.cumulativePercentage }}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Leyenda -->
        <div class="legend-section">
          <div class="legend-item">
            <div class="legend-color" style="background-color: #3b82f6;"></div>
            <span class="legend-text">Principales factores (80% acumulado)</span>
          </div>
          <div class="legend-info">
            <p>El 80% de los problemas proviene del 20% de las causas</p>
          </div>
        </div>
      </div>

      <!-- Estado vacío después de generar -->
      <div v-else-if="!loading && chartData.length === 0 && selectedSemester" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>Sin datos para mostrar</h3>
        <p>No se encontraron factores de riesgo para el semestre seleccionado. 
           Asegúrese de que los estudiantes tengan factores de riesgo asignados.</p>
      </div>

      <!-- Estado vacío antes de generar -->
      <div v-else-if="!loading && !selectedSemester" class="initial-state">
        <div class="initial-icon">🎯</div>
        <h3>Análisis de Pareto</h3>
        <p>Seleccione un semestre y genere el gráfico para identificar los principales factores de riesgo.</p>
      </div>

      <!-- Estado de carga -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <h3>Generando análisis...</h3>
        <p>Por favor espere mientras se analizan los datos.</p>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="handleClose">
        Cerrar
      </button>
      <div v-if="chartData.length > 0" class="export-dropdown-wrapper">
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
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'
import { usePareto } from '@/composables/modals/usePareto'
import ParetoChart from '@/components/charts/ParetoChart.vue'

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
  loading,
  paretoData,
  chartData,
  availableSemesters,
  chartLabels,
  chartValues,
  chartCumulative,
  generatePareto: generateParetoLogic,
  getBarColor,
  cumulativeLinePoints,
  getPointX,
  getPointY,
  exportToExcel: exportToExcelFunction,
  exportToPDF: exportToPDFFunction
} = usePareto()

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

const generatePareto = async () => {
  await generateParetoLogic()
}
</script>

<style scoped>
@import '@/styles/modals/ParetoModal.css';
</style>

