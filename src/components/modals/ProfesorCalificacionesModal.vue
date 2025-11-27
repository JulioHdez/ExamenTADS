<template>
  <BaseModal :is-open="isOpen" title="Calificaciones" @close="$emit('close')">
    <div class="calificaciones-modal-content">
      <!-- Información de la carrera -->
      <div class="career-info" v-if="userInfo?.nombre_carrera">
        <p><strong>Carrera:</strong> {{ userInfo.nombre_carrera }}</p>
        <p><strong>Total de registros:</strong> {{ filteredCalificaciones.length }}</p>
      </div>

      <!-- Leyenda de colores -->
      <div class="legend-section">
        <h4>Leyenda de Calificaciones:</h4>
        <div class="legend-items">
          <div class="legend-item">
            <span class="legend-color excelente"></span>
            <span class="legend-label">Verde (90-100): Excelente</span>
          </div>
          <div class="legend-item">
            <span class="legend-color buena"></span>
            <span class="legend-label">Azul (80-89): Buena</span>
          </div>
          <div class="legend-item">
            <span class="legend-color regular"></span>
            <span class="legend-label">Naranja (70-79): Regular</span>
          </div>
          <div class="legend-item">
            <span class="legend-color baja"></span>
            <span class="legend-label">Rojo (0-69): Baja</span>
          </div>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="filters-section">
        <div class="filter-group">
          <label for="search-filter">Buscar:</label>
          <input 
            id="search-filter"
            type="text" 
            v-model="searchQuery" 
            @input="filterCalificaciones"
            placeholder="Buscar por número de control, materia..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Tabla de calificaciones -->
      <div class="table-container">
        <div class="table-header">
          <h3>Calificaciones de Estudiantes ({{ filteredCalificaciones.length }})</h3>
        </div>
        
        <div class="table-wrapper">
          <table class="calificaciones-table">
            <thead>
              <tr>
                <th>No. Control</th>
                <th>Nombre del Estudiante</th>
                <th>Materia</th>
                <th>Unidad</th>
                <th>Calificación</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="loading-row">
                <td colspan="6" class="loading-cell">
                  <div class="loading-spinner"></div>
                  Cargando calificaciones...
                </td>
              </tr>
              <tr v-else-if="filteredCalificaciones.length === 0" class="no-data-row">
                <td colspan="6" class="no-data-cell">
                  No se encontraron calificaciones
                </td>
              </tr>
              <tr v-else v-for="(calificacion, index) in filteredCalificaciones" :key="`${calificacion.num_control}-${calificacion.nombre_materia}-${calificacion.num_unidad}-${index}`" class="calificacion-row">
                <td class="control-number">{{ calificacion.num_control }}</td>
                <td class="student-name">{{ calificacion.nombre_completo }}</td>
                <td class="materia">{{ calificacion.nombre_materia }}</td>
                <td class="unidad">{{ calificacion.num_unidad }}</td>
                <td class="calificacion" :class="getCalificacionClass(calificacion.calificacion)">
                  {{ formatCalificacion(calificacion.calificacion) }}
                </td>
                <td class="fecha">{{ formatFecha(calificacion.fecha_evaluacion) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-primary" @click="$emit('close')">
        Cerrar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const authStore = useAuthStore()
const calificaciones = ref([])
const loading = ref(false)
const searchQuery = ref('')

const userInfo = computed(() => authStore.userInfo)

const filteredCalificaciones = computed(() => {
  let filtered = [...calificaciones.value]
  
  // Aplicar búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(cal => 
      cal.num_control?.toLowerCase().includes(query) ||
      cal.nombre_completo?.toLowerCase().includes(query) ||
      cal.nombre_materia?.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

const formatCalificacion = (calificacion) => {
  if (calificacion === null || calificacion === undefined) {
    return 'N/A'
  }
  return parseFloat(calificacion).toFixed(2)
}

const getCalificacionClass = (calificacion) => {
  if (calificacion === null || calificacion === undefined) {
    return 'calificacion-na'
  }
  const cal = parseFloat(calificacion)
  if (cal >= 90) return 'calificacion-excelente'
  if (cal >= 80) return 'calificacion-buena'
  if (cal >= 70) return 'calificacion-regular'
  return 'calificacion-baja'
}

const formatFecha = (fecha) => {
  if (!fecha) return 'N/A'
  try {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return 'N/A'
  }
}

const filterCalificaciones = () => {
  // El filtrado se hace automáticamente en el computed filteredCalificaciones
}

const fetchCalificaciones = async () => {
  if (!userInfo.value?.id) {
    console.error('No hay información del profesor')
    return
  }

  loading.value = true
  try {
    const response = await api.get(`/profesores/${userInfo.value.id}/calificaciones`)
    
    if (response.data && response.data.success) {
      calificaciones.value = response.data.data || []
      console.log('Calificaciones cargadas:', calificaciones.value)
    } else {
      console.error('Error en la respuesta del servidor:', response.data)
      calificaciones.value = []
    }
  } catch (error) {
    console.error('Error al cargar calificaciones:', error)
    calificaciones.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.isOpen) {
    fetchCalificaciones()
  }
})

// Recargar calificaciones cuando se abre el modal
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    fetchCalificaciones()
  }
})
</script>

<style scoped>
.calificaciones-modal-content {
  padding: 1rem 0;
}

.career-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.dark .career-info {
  background: #1e293b;
  border-left-color: #60a5fa;
}

.career-info p {
  margin: 0.5rem 0;
  color: #475569;
  font-size: 1rem;
}

.dark .career-info p {
  color: #cbd5e1;
}

.career-info strong {
  color: #1e293b;
}

.dark .career-info strong {
  color: #f1f5f9;
}

.legend-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.dark .legend-section {
  background: #1e293b;
  border-left-color: #60a5fa;
}

.legend-section h4 {
  margin: 0 0 0.75rem 0;
  color: #1e293b;
  font-size: 0.875rem;
  font-weight: 600;
}

.dark .legend-section h4 {
  color: #f1f5f9;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: inline-block;
}

.legend-color.excelente {
  background-color: #059669;
}

.dark .legend-color.excelente {
  background-color: #34d399;
}

.legend-color.buena {
  background-color: #2563eb;
}

.dark .legend-color.buena {
  background-color: #60a5fa;
}

.legend-color.regular {
  background-color: #d97706;
}

.dark .legend-color.regular {
  background-color: #fbbf24;
}

.legend-color.baja {
  background-color: #dc2626;
}

.dark .legend-color.baja {
  background-color: #f87171;
}

.legend-label {
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
}

.dark .legend-label {
  color: #cbd5e1;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.dark .filters-section {
  background: #1e293b;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
  flex: 1;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.dark .filter-group label {
  color: #cbd5e1;
}

.search-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  color: #1e293b;
  transition: all 0.2s ease;
}

.dark .search-input {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.search-input:hover {
  border-color: #cbd5e1;
}

.dark .search-input:hover {
  border-color: #475569;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dark .search-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.table-container {
  margin-top: 1.5rem;
}

.table-header {
  margin-bottom: 1rem;
}

.table-header h3 {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0;
}

.dark .table-header h3 {
  color: #f1f5f9;
}

.table-wrapper {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.dark .table-wrapper {
  border-color: #334155;
}

.calificaciones-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  background: white;
}

.dark .calificaciones-table {
  background: #1e293b;
}

.calificaciones-table th {
  background: #f1f5f9;
  color: #1e293b;
  font-weight: 600;
  padding: 0.75rem;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.dark .calificaciones-table th {
  background: #0f172a;
  color: #f1f5f9;
  border-bottom-color: #334155;
}

.calificaciones-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
}

.dark .calificaciones-table td {
  border-bottom-color: #334155;
  color: #cbd5e1;
}

.calificacion-row:hover {
  background: #f8fafc;
}

.dark .calificacion-row:hover {
  background: #1e293b;
}

.loading-row,
.no-data-row {
  text-align: center;
}

.loading-cell,
.no-data-cell {
  padding: 2rem;
  color: #64748b;
  font-style: italic;
}

.dark .loading-cell,
.dark .no-data-cell {
  color: #94a3b8;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.control-number {
  font-weight: 600;
  color: #3b82f6;
}

.dark .control-number {
  color: #60a5fa;
}

.student-name {
  font-weight: 500;
  color: #1e293b;
}

.dark .student-name {
  color: #f1f5f9;
}

.materia {
  color: #64748b;
}

.dark .materia {
  color: #94a3b8;
}

.unidad {
  text-align: center;
  color: #64748b;
  font-weight: 600;
}

.dark .unidad {
  color: #94a3b8;
}

.calificacion {
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
}

/* Estilos de calificación con mayor especificidad */
td.calificacion.calificacion-excelente {
  color: #059669 !important;
}

.dark td.calificacion.calificacion-excelente {
  color: #34d399 !important;
}

td.calificacion.calificacion-buena {
  color: #2563eb !important;
}

.dark td.calificacion.calificacion-buena {
  color: #60a5fa !important;
}

td.calificacion.calificacion-regular {
  color: #d97706 !important;
}

.dark td.calificacion.calificacion-regular {
  color: #fbbf24 !important;
}

td.calificacion.calificacion-baja {
  color: #dc2626 !important;
}

.dark td.calificacion.calificacion-baja {
  color: #f87171 !important;
}

td.calificacion.calificacion-na {
  color: #64748b !important;
  font-style: italic;
}

.dark td.calificacion.calificacion-na {
  color: #94a3b8 !important;
}

.fecha {
  color: #64748b;
  font-size: 0.875rem;
}

.dark .fecha {
  color: #94a3b8;
}

/* Scrollbar styling */
.table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.dark .table-wrapper::-webkit-scrollbar-track {
  background: #1e293b;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.dark .table-wrapper::-webkit-scrollbar-thumb {
  background: #475569;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark .table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>

