<template>
  <BaseModal :is-open="isOpen" title="Mis Estudiantes" @close="$emit('close')">
    <div class="estudiantes-modal-content">
      <!-- Información de la carrera -->
      <div class="career-info" v-if="userInfo?.nombre_carrera">
        <p><strong>Carrera:</strong> Ingenieria en Sistemas</p>
        <p><strong>Total de estudiantes:</strong> {{ filteredEstudiantes.length }}</p>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="filters-section">
        <div class="filter-group">
          <label for="search-filter">Buscar:</label>
          <input 
            id="search-filter"
            type="text" 
            v-model="searchQuery" 
            @input="filterEstudiantes"
            placeholder="Buscar por nombre o número de control..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Tabla de estudiantes -->
      <div class="table-container">
        <div class="table-header">
          <h3>Estudiantes de Ingenieria en Sistemas ({{ filteredEstudiantes.length }})</h3>
        </div>
        
        <div class="table-wrapper">
          <table class="estudiantes-table">
            <thead>
              <tr>
                <th>No. Control</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Semestre</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="loading-row">
                <td colspan="5" class="loading-cell">
                  <div class="loading-spinner"></div>
                  Cargando estudiantes...
                </td>
              </tr>
              <tr v-else-if="filteredEstudiantes.length === 0" class="no-data-row">
                <td colspan="5" class="no-data-cell">
                  No se encontraron estudiantes de Ingenieria en Sistemas
                </td>
              </tr>
              <tr v-else v-for="estudiante in filteredEstudiantes" :key="estudiante.id_estudiante" class="estudiante-row">
                <td class="control-number">{{ estudiante.num_control }}</td>
                <td class="student-name">
                  {{ estudiante.nombre }} {{ estudiante.apellido_paterno }} {{ estudiante.apellido_materno }}
                </td>
                <td class="email">{{ estudiante.email }}</td>
                <td class="semester">{{ estudiante.semestre_actual }}</td>
                <td class="status">
                  <span :class="['status-badge', getStatusClass(estudiante.estatus)]">
                    {{ estudiante.estatus }}
                  </span>
                </td>
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
const estudiantes = ref([])
const loading = ref(false)
const searchQuery = ref('')

const userInfo = computed(() => authStore.userInfo)

const filteredEstudiantes = computed(() => {
  let filtered = [...estudiantes.value]
  
  // Aplicar búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(estudiante => 
      estudiante.num_control?.toLowerCase().includes(query) ||
      estudiante.nombre?.toLowerCase().includes(query) ||
      estudiante.apellido_paterno?.toLowerCase().includes(query) ||
      estudiante.apellido_materno?.toLowerCase().includes(query) ||
      estudiante.email?.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

const getStatusClass = (estatus) => {
  const statusMap = {
    'Activo': 'status-active',
    'Inactivo': 'status-inactive',
    'Egresado': 'status-graduated',
    'Baja': 'status-dropout'
  }
  return statusMap[estatus] || 'status-default'
}

const filterEstudiantes = () => {
  // El filtrado se hace automáticamente en el computed filteredEstudiantes
}

const fetchEstudiantes = async () => {
  if (!userInfo.value?.id) {
    console.error('No hay información del profesor')
    return
  }

  loading.value = true
  try {
    const response = await api.get(`/profesores/${userInfo.value.id}/estudiantes`)
    
    if (response.data && response.data.success) {
      estudiantes.value = response.data.data || []
      console.log('Estudiantes cargados:', estudiantes.value)
    } else {
      console.error('Error en la respuesta del servidor:', response.data)
      estudiantes.value = []
    }
  } catch (error) {
    console.error('Error al cargar estudiantes:', error)
    estudiantes.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.isOpen) {
    fetchEstudiantes()
  }
})

// Recargar estudiantes cuando se abre el modal
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    fetchEstudiantes()
  }
})
</script>

<style scoped>
.estudiantes-modal-content {
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

.estudiantes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  background: white;
}

.dark .estudiantes-table {
  background: #1e293b;
}

.estudiantes-table th {
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

.dark .estudiantes-table th {
  background: #0f172a;
  color: #f1f5f9;
  border-bottom-color: #334155;
}

.estudiantes-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
}

.dark .estudiantes-table td {
  border-bottom-color: #334155;
  color: #cbd5e1;
}

.estudiante-row:hover {
  background: #f8fafc;
}

.dark .estudiante-row:hover {
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

.email {
  color: #64748b;
  font-size: 0.875rem;
}

.dark .email {
  color: #94a3b8;
}

.semester {
  text-align: center;
  color: #64748b;
}

.dark .semester {
  color: #94a3b8;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.dark .status-active {
  background: #064e3b;
  color: #6ee7b7;
}

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.dark .status-inactive {
  background: #7f1d1d;
  color: #fca5a5;
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
  background: #fef3c7;
  color: #92400e;
}

.dark .status-dropout {
  background: #78350f;
  color: #fde68a;
}

.status-default {
  background: #f3f4f6;
  color: #374151;
}

.dark .status-default {
  background: #374151;
  color: #d1d5db;
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

