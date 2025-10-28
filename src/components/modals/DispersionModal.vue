<template>
  <BaseModal :is-open="isOpen" title="Análisis de Dispersión" @close="$emit('close')">
    <div class="dispersion-content">
      <!-- Selectores -->
      <div class="selectors-section">
        <div class="variable-selector">
          <label for="variableX" class="selector-label">Variable X</label>
          <select 
            id="variableX" 
            v-model="variableX" 
            class="variable-dropdown"
          >
            <option 
              v-for="variable in availableVariables" 
              :key="variable.value" 
              :value="variable.value"
            >
              {{ variable.icon }} {{ variable.label }}
            </option>
          </select>
        </div>

        <div class="variable-selector">
          <label for="variableY" class="selector-label">Variable Y</label>
          <select 
            id="variableY" 
            v-model="variableY" 
            class="variable-dropdown"
          >
            <option 
              v-for="variable in availableVariables" 
              :key="variable.value" 
              :value="variable.value"
            >
              {{ variable.icon }} {{ variable.label }}
            </option>
          </select>
        </div>

        <div class="semester-selector">
          <label for="semester" class="selector-label">Semestre</label>
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
      </div>

      <!-- Botón para generar gráfico -->
      <div class="generate-section">
        <button 
          type="button" 
          class="btn-generate" 
          @click="generateScatter"
          :disabled="loading || !selectedSemester || variableX === variableY"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>📊</span>
          {{ loading ? 'Generando...' : 'Generar Gráfico' }}
        </button>
        <div v-if="variableX === variableY && selectedSemester" class="warning-message">
          ⚠️ Por favor seleccione variables diferentes para X e Y
        </div>
      </div>

      <!-- Gráfico de dispersión -->
      <div v-if="scatterData.length > 0" class="scatter-section">
        <!-- Información contextual sobre el diagrama -->
        <div class="scatter-info">
          <h4 class="info-title">📊 ¿Qué muestra este diagrama de dispersión?</h4>
          <p class="info-description">
            Este diagrama muestra la relación entre dos variables para visualizar patrones, 
            tendencias y posibles correlaciones entre <strong>{{ getVariableName(variableX) }}</strong> 
            y <strong>{{ getVariableName(variableY) }}</strong>. 
            Cada punto representa un estudiante con sus valores correspondientes.
          </p>
        </div>

        <!-- Estadísticas de correlación -->
        <div class="correlation-section">
          <div class="correlation-card">
            <div class="correlation-label">Correlación de Pearson</div>
            <div class="correlation-value" :class="getCorrelationClass()">
              {{ correlation }}
            </div>
            <div class="correlation-interpretation">
              {{ getCorrelationInterpretation() }}
            </div>
          </div>
        </div>

        <div ref="chartContainer" class="chart-container">
          <DispersionChart 
            v-if="chartData.length > 0"
            :data="chartData" 
            :title="`Diagrama de Dispersión: ${getVariableName(variableX)} vs ${getVariableName(variableY)}`"
            :x-label="getVariableName(variableX)"
            :y-label="getVariableName(variableY)"
            :correlation="correlation"
          />
          <div v-else class="no-data-message">
            No hay datos para mostrar en el gráfico
          </div>
        </div>

        <!-- Leyenda del diagrama -->
        <div class="legend-explanation">
          <h4 class="legend-title">📌 Leyenda del Diagrama</h4>
          <div class="legend-content">
            <div class="legend-item">
              <span class="legend-label">Eje X (Horizontal):</span>
              <span class="legend-description">{{ getVariableName(variableX) }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">Eje Y (Vertical):</span>
              <span class="legend-description">{{ getVariableName(variableY) }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">Puntos:</span>
              <span class="legend-description">Cada punto representa un estudiante</span>
            </div>
            <div class="legend-item">
              <span class="legend-label">Correlación:</span>
              <span class="legend-description">Indica la fuerza y dirección de la relación lineal</span>
            </div>
          </div>
        </div>

        <!-- Tabla de datos -->
        <div class="data-table-section">
          <h4 class="table-title">Datos del Diagrama de Dispersión</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>{{ getVariableName(variableX) }} (X)</th>
                <th>{{ getVariableName(variableY) }} (Y)</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(point, index) in scatterData" 
                :key="index"
              >
                <td>{{ point.name }}</td>
                <td>{{ point.x }}</td>
                <td>{{ point.y }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Estado vacío después de generar -->
      <div v-else-if="!loading && scatterData.length === 0 && selectedSemester" class="empty-state">
        <div class="empty-icon">📈</div>
        <h3>Sin datos para mostrar</h3>
        <p>No se encontraron datos para generar el diagrama de dispersión con los criterios seleccionados.</p>
      </div>

      <!-- Estado vacío antes de generar -->
      <div v-else-if="!loading && !selectedSemester" class="initial-state">
        <div class="initial-icon">📊</div>
        <h3>Diagrama de Dispersión</h3>
        <p>Seleccione las variables (X e Y) y un semestre para generar un diagrama de dispersión 
           que muestre la relación entre dos variables y su correlación estadística.</p>
      </div>

      <!-- Estado de carga -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <h3>Generando diagrama...</h3>
        <p>Por favor espere mientras se analizan los datos.</p>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="handleClose">
        Cerrar
      </button>
      <div v-if="scatterData.length > 0" class="export-dropdown-wrapper">
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
import { useDispersion } from '@/composables/modals/useDispersion'
import DispersionChart from '@/components/charts/DispersionChart.vue'

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
  variableX,
  variableY,
  loading,
  scatterData,
  correlation,
  availableSemesters,
  availableVariables,
  chartData,
  generateScatter: generateScatterLogic,
  exportToExcel: exportToExcelFunction,
  exportToPDF: exportToPDFFunction,
  getVariableName
} = useDispersion()

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

const generateScatter = async () => {
  await generateScatterLogic()
}

const getCorrelationClass = () => {
  if (Math.abs(correlation.value) >= 0.7) return 'correlation-strong'
  if (Math.abs(correlation.value) >= 0.4) return 'correlation-moderate'
  if (Math.abs(correlation.value) >= 0.2) return 'correlation-weak'
  return 'correlation-none'
}

const getCorrelationInterpretation = () => {
  const absCorr = Math.abs(correlation.value)
  if (absCorr >= 0.9) {
    return 'Correlación muy fuerte'
  } else if (absCorr >= 0.7) {
    return 'Correlación fuerte'
  } else if (absCorr >= 0.4) {
    return 'Correlación moderada'
  } else if (absCorr >= 0.2) {
    return 'Correlación débil'
  }
  return 'Sin correlación significativa'
}
</script>

<style scoped>
@import '@/styles/modals/DispersionModal.css';
</style>

