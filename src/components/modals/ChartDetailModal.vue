<template>
  <BaseModal :is-open="isOpen" :title="modalTitle" @close="closeModal">
    <div class="chart-detail-modal-content">
      <!-- Información del gráfico seleccionado -->
      <div class="chart-info-section" v-if="selectedChartInfo">
        <div class="info-badge">
          <span class="info-label">Gráfico:</span>
          <span class="info-value">{{ selectedChartInfo.chartType }}</span>
        </div>
        <div class="info-badge" v-if="selectedChartInfo.category">
          <span class="info-label">Categoría:</span>
          <span class="info-value">{{ selectedChartInfo.category }}</span>
        </div>
        <div class="info-badge" v-if="selectedChartInfo.value !== undefined">
          <span class="info-label">Valor:</span>
          <span class="info-value">{{ selectedChartInfo.value }}</span>
        </div>
      </div>

      <!-- Buscador por número de control -->
      <div class="search-section">
        <div class="search-input-wrapper">
          <input
            type="text"
            v-model="searchControlNumber"
            @input="handleSearch"
            class="search-input"
            placeholder="Buscar por número de control..."
            maxlength="12"
          />
          <button 
            v-if="searchControlNumber"
            @click="clearSearch"
            class="clear-search-btn"
            title="Limpiar búsqueda"
          >
            ×
          </button>
        </div>
      </div>

      <!-- Lista de estudiantes filtrados -->
      <div class="students-section">
        <div class="students-header">
          <h3>Estudiantes ({{ filteredStudentsList.length }})</h3>
        </div>
        
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando estudiantes...</p>
        </div>
        
        <div v-else-if="filteredStudentsList.length === 0" class="empty-state">
          <p>No se encontraron estudiantes</p>
        </div>
        
        <div v-else class="students-list">
          <div 
            v-for="student in filteredStudentsList" 
            :key="student.id_estudiante || student.num_control"
            class="student-card"
          >
            <div class="student-header">
              <div class="student-name">
                <strong>{{ student.nombre }} {{ student.apellido_paterno }} {{ student.apellido_materno }}</strong>
              </div>
              <div class="student-control">
                <span class="control-label">No. Control:</span>
                <span class="control-value">{{ student.num_control }}</span>
              </div>
            </div>
            
            <div class="student-details">
              <div class="detail-row">
                <span class="detail-label">Semestre:</span>
                <span class="detail-value">{{ student.semestre_actual || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Promedio:</span>
                <span 
                  class="detail-value" 
                  :class="getAverageClass(student.promedio_general)"
                >
                  {{ formatAverage(student.promedio_general) }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Estado:</span>
                <span 
                  class="detail-value status-badge"
                  :class="getStatusClass(student.estatus)"
                >
                  {{ student.estatus || 'N/A' }}
                </span>
              </div>
              <div class="detail-row" v-if="student.nombre_carrera">
                <span class="detail-label">Carrera:</span>
                <span class="detail-value">{{ student.nombre_carrera }}</span>
              </div>
              <div class="detail-row" v-if="student.email">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ student.email }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="closeModal">
        Cerrar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import { useDashboardData } from '@/composables/useDashboardData'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  selectedChartInfo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const { filteredStudents } = useDashboardData()
const searchControlNumber = ref('')
const loading = ref(false)

// Título del modal según el tipo de gráfico
const modalTitle = computed(() => {
  if (!props.selectedChartInfo) return 'Información de Estudiantes'
  
  const chartType = props.selectedChartInfo.chartType
  if (chartType === 'bar') return 'Estudiantes por Semestre'
  if (chartType === 'pie') return 'Estudiantes por Estado Académico'
  if (chartType === 'line') return 'Estudiantes - Tendencia de Rendimiento'
  
  return 'Información de Estudiantes'
})

// Filtrar estudiantes según el gráfico seleccionado
const filteredStudentsList = computed(() => {
  let students = filteredStudents.value || []
  
  // Si hay información de gráfico seleccionado, filtrar según el tipo
  if (props.selectedChartInfo) {
    const info = props.selectedChartInfo
    
    if (info.chartType === 'bar' && info.category) {
      // Filtrar por semestre seleccionado en la barra
      const semestre = info.category.replace('Sem ', '').trim()
      students = students.filter(s => s.semestre_actual == semestre)
    } else if (info.chartType === 'pie' && info.category) {
      // Filtrar por estado académico seleccionado en el pastel
      const status = info.category
      if (status === 'Aprobados') {
        students = students.filter(s => {
          const promedio = parseFloat(s.promedio_general || 0)
          return promedio >= 70
        })
      } else if (status === 'Reprobados') {
        students = students.filter(s => {
          const promedio = parseFloat(s.promedio_general || 0)
          return promedio < 70 && promedio > 0
        })
      } else if (status === 'Deserción') {
        students = students.filter(s => 
          s.estatus === 'Baja temporal' || s.estatus === 'Baja definitiva'
        )
      }
    } else if (info.chartType === 'line' && info.category) {
      // Para línea, puede filtrar por mes o por tasa de aprobación
      // Por ahora mostramos todos los estudiantes del gráfico
    }
  }
  
  // Filtrar por número de control si hay búsqueda
  if (searchControlNumber.value.trim()) {
    const searchTerm = searchControlNumber.value.trim().toLowerCase()
    students = students.filter(s => 
      s.num_control && s.num_control.toLowerCase().includes(searchTerm)
    )
  }
  
  return students
})

// Manejar búsqueda
const handleSearch = () => {
  // La búsqueda se hace automáticamente a través del computed
}

// Limpiar búsqueda
const clearSearch = () => {
  searchControlNumber.value = ''
}

// Formatear promedio
const formatAverage = (average) => {
  if (!average && average !== 0) return 'N/A'
  return parseFloat(average).toFixed(2)
}

// Obtener clase CSS según promedio
const getAverageClass = (average) => {
  if (!average && average !== 0) return ''
  const avg = parseFloat(average)
  if (avg >= 70) return 'average-high'
  if (avg >= 60) return 'average-medium'
  return 'average-low'
}

// Obtener clase CSS según estado
const getStatusClass = (status) => {
  if (!status) return ''
  if (status === 'Activo') return 'status-active'
  if (status === 'Egresado') return 'status-graduated'
  if (status === 'Baja temporal' || status === 'Baja definitiva') return 'status-dropout'
  return ''
}

// Cerrar modal
const closeModal = () => {
  searchControlNumber.value = ''
  emit('close')
}

// Limpiar búsqueda cuando se cierra el modal
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    searchControlNumber.value = ''
  }
})
</script>

<style scoped>
.chart-detail-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-info-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.dark .chart-info-section {
  background: #1e293b;
  border-color: #334155;
}

.info-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.dark .info-badge {
  background: #334155;
  border-color: #475569;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.dark .info-label {
  color: #94a3b8;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.dark .info-value {
  color: #f1f5f9;
}

.search-section {
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  color: #1f2937;
}

.dark .search-input {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  transition: background-color 0.2s ease;
}

.clear-search-btn:hover {
  background: #dc2626;
}

.students-section {
  width: 100%;
}

.students-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.dark .students-header h3 {
  color: #f1f5f9;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
}

.dark .loading-state,
.dark .empty-state {
  color: #94a3b8;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.students-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.5rem;
}

.student-card {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.dark .student-card {
  background: #1e293b;
  border-color: #334155;
}

.student-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.dark .student-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.student-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.student-name {
  font-size: 1rem;
  color: #1f2937;
}

.dark .student-name {
  color: #f1f5f9;
}

.student-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.control-label {
  color: #6b7280;
  font-weight: 500;
}

.dark .control-label {
  color: #94a3b8;
}

.control-value {
  color: #1f2937;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 4px;
}

.dark .control-value {
  color: #f1f5f9;
  background: #334155;
}

.student-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.dark .detail-label {
  color: #94a3b8;
}

.detail-value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 600;
}

.dark .detail-value {
  color: #f1f5f9;
}

.average-high {
  color: #10b981;
}

.average-medium {
  color: #f59e0b;
}

.average-low {
  color: #ef4444;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.dark .status-active {
  background: #064e3b;
  color: #6ee7b7;
}

.status-graduated {
  background: #dbeafe;
  color: #1e40af;
}

.dark .status-graduated {
  background: #1e3a8a;
  color: #93c5fd;
}

.status-dropout {
  background: #fee2e2;
  color: #991b1b;
}

.dark .status-dropout {
  background: #7f1d1d;
  color: #fca5a5;
}

/* Scrollbar personalizado */
.students-list::-webkit-scrollbar {
  width: 8px;
}

.students-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.dark .students-list::-webkit-scrollbar-track {
  background: #334155;
}

.students-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.dark .students-list::-webkit-scrollbar-thumb {
  background: #475569;
}

.students-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark .students-list::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>


