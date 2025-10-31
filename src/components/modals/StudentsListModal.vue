<template>
  <BaseModal :is-open="isOpen" title="Lista de Estudiantes" @close="$emit('close')">
    <div class="students-modal-content">
      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-group">
          <label for="career-filter">Filtrar por carrera:</label>
          <select 
            id="career-filter" 
            v-model="selectedCareer" 
            @change="filterStudents"
            class="career-select"
          >
            <option value="">Todas las carreras</option>
            <option 
              v-for="career in careers" 
              :key="career.id_carrera" 
              :value="career.id_carrera"
            >
              {{ careerMapping[career.id_carrera] }} ({{ career.id_carrera }})
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="status-filter">Filtrar por estatus:</label>
          <select 
            id="status-filter" 
            v-model="selectedStatus" 
            @change="filterStudents"
            class="status-select"
          >
            <option value="">Todos los estatus</option>
            <option value="Activo">Activo</option>
            <option value="Egresado">Egresado</option>
            <option value="Baja temporal">Baja temporal</option>
            <option value="Baja definitiva">Baja definitiva</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="page-size">Registros por página:</label>
          <select 
            id="page-size" 
            v-model.number="pageSize" 
            class="status-select"
            @change="goToPage(1)"
          >
            <option :value="10">10</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
      </div>

      <!-- Tabla de estudiantes -->
      <div class="table-container">
        <div class="table-header">
          <h3>Estudiantes ({{ filteredStudents.length }})</h3>
        </div>
        
        <div class="table-wrapper">
          <table class="students-table">
            <thead>
              <tr>
                <th>No. Control</th>
                <th>Nombre Completo</th>
                <th>Carrera</th>
                <th>Semestre</th>
                <th>Estatus</th>
                <th>Promedio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="loading-row">
                <td colspan="7" class="loading-cell">
                  <div class="loading-spinner"></div>
                  Cargando estudiantes...
                </td>
              </tr>
              <tr v-else-if="filteredStudents.length === 0" class="no-data-row">
                <td colspan="7" class="no-data-cell">
                  No se encontraron estudiantes
                </td>
              </tr>
              <tr v-else v-for="student in pagedStudents" :key="student.id_estudiante" class="student-row">
                <td class="control-number">{{ student.num_control }}</td>
                <td class="student-name">
                  {{ student.nombre }} {{ student.apellido_paterno }} {{ student.apellido_materno }}
                </td>
                <td class="career">{{ student.id_carrera }}</td>
                <td class="semester">{{ student.semestre_actual }}</td>
                <td class="status">
                  <span :class="['status-badge', getStatusClass(student.estatus)]">
                    {{ student.estatus }}
                  </span>
                </td>
                <td class="average">{{ student.promedio_general || 'N/A' }}</td>
                <td class="actions">
                  <button 
                    @click="deleteStudent(student)" 
                    class="action-btn delete-btn"
                    title="Eliminar estudiante"
                  >
                    🗑️
                  </button>
                  <button 
                    @click="editStudent(student)" 
                    class="action-btn edit-btn"
                    title="Editar"
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Anterior</button>
          <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Siguiente</button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import api from '@/services/api'
import BaseModal from '@/components/modals/BaseModal.vue'

export default {
  name: 'StudentsListModal',
  components: {
    BaseModal
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'edit-student'],
  setup(props, { emit }) {
    const dashboardStore = useDashboardStore()
    
    // Estados reactivos
    const students = ref([])
    const careers = ref([])
    const loading = ref(false)
    const selectedCareer = ref('')
    const selectedStatus = ref('')
    const pageSize = ref(50)
    const currentPage = ref(1)

    // Mapeo de carreras para mostrar nombres completos
    const careerMapping = {
      2: 'Ingeniería en Sistemas Computacionales',
      3: 'Ingeniería Industrial', 
      4: 'Administración',
      5: 'Contabilidad',
      6: 'Psicología',
      7: 'Medicina',
      8: 'Derecho'
    }

    // Computed para estudiantes filtrados
    const filteredStudents = computed(() => {
      let filtered = students.value

      if (selectedCareer.value) {
        filtered = filtered.filter(student => student.id_carrera == selectedCareer.value)
      }

      if (selectedStatus.value) {
        filtered = filtered.filter(student => student.estatus === selectedStatus.value)
      }

      return filtered
    })

    const totalPages = computed(() => Math.max(1, Math.ceil(filteredStudents.value.length / pageSize.value)))
    const pagedStudents = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      return filteredStudents.value.slice(start, start + pageSize.value)
    })

    // Métodos
    const loadStudents = async () => {
      loading.value = true
      try {
        console.log('Cargando estudiantes desde el modal...')
        await dashboardStore.fetchStudents()
        students.value = dashboardStore.students
        console.log('Estudiantes cargados en el modal:', students.value)
        console.log('Primer estudiante:', students.value[0])
      } catch (error) {
        console.error('Error al cargar estudiantes:', error)
      } finally {
        loading.value = false
      }
    }

    const loadCareers = async () => {
      try {
        console.log('Cargando carreras...')
        // Obtener carreras directamente desde la API
        const response = await api.get('/carreras')
        console.log('Respuesta de carreras:', response.data)
        
        if (response.data && response.data.success && response.data.data) {
          careers.value = response.data.data
        } else {
          careers.value = response.data || []
        }
        
        console.log('Carreras cargadas:', careers.value)
      } catch (error) {
        console.error('Error al cargar carreras:', error)
        // Si falla, usar carreras por defecto
        careers.value = [
          { id_carrera: 2, nombre_carrera: 'Ingeniería en Sistemas' },
          { id_carrera: 3, nombre_carrera: 'Ingeniería Industrial' },
          { id_carrera: 4, nombre_carrera: 'Administración' },
          { id_carrera: 5, nombre_carrera: 'Contabilidad' },
          { id_carrera: 6, nombre_carrera: 'Psicología' },
          { id_carrera: 7, nombre_carrera: 'Medicina' },
          { id_carrera: 8, nombre_carrera: 'Derecho' }
        ]
        console.log('Usando carreras por defecto:', careers.value)
      }
    }

    const filterStudents = () => {
      // El filtrado se hace automáticamente con el computed
      currentPage.value = 1
    }

    const getStatusClass = (status) => {
      const statusClasses = {
        'Activo': 'status-active',
        'Egresado': 'status-graduated',
        'Baja temporal': 'status-temp-drop',
        'Baja definitiva': 'status-perm-drop'
      }
      return statusClasses[status] || 'status-default'
    }

    const deleteStudent = async (student) => {
      const studentName = `${student.nombre} ${student.apellido_paterno} ${student.apellido_materno}`
      const careerName = careerMapping[student.id_carrera] || `Carrera ${student.id_carrera}`
      
      if (confirm(`¿Estás seguro de que quieres eliminar al estudiante?\n\nNombre: ${studentName}\nCarrera: ${careerName}\nNo. Control: ${student.num_control}`)) {
        try {
          console.log('Eliminando estudiante:', student)
          
          // Llamar al endpoint de eliminación
          const response = await api.delete(`/estudiantes/${student.id_estudiante}`)
          
          if (response.data.success) {
            alert(`Estudiante ${studentName} eliminado exitosamente`)
            // Recargar la lista de estudiantes
            await loadStudents()
          } else {
            alert(`Error al eliminar estudiante: ${response.data.message}`)
          }
        } catch (error) {
          console.error('Error al eliminar estudiante:', error)
          alert(`Error al eliminar estudiante: ${error.response?.data?.message || error.message}`)
        }
      }
    }

    const editStudent = (student) => {
      console.log('Editar estudiante:', student)
      // Emitir evento para abrir modal de edición
      emit('edit-student', student)
    }

    const goToPage = (page) => {
      currentPage.value = Math.max(1, Math.min(page, totalPages.value))
    }

    // Watchers
    watch(() => props.isOpen, (newValue) => {
      if (newValue) {
        loadStudents()
        loadCareers()
      }
    })

    // Lifecycle
    onMounted(() => {
      if (props.isOpen) {
        loadStudents()
        loadCareers()
      }
    })

    return {
      students,
      careers,
      loading,
      selectedCareer,
      selectedStatus,
      pageSize,
      currentPage,
      careerMapping,
      filteredStudents,
      pagedStudents,
      totalPages,
      filterStudents,
      getStatusClass,
      deleteStudent,
      editStudent,
      goToPage
    }
  }
}
</script>

<style scoped>
.students-modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 80vh;
}

.filters-section {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.filter-group label {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.9rem;
}

.career-select,
.status-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.career-select:hover,
.status-select:hover {
  border-color: #2C4068;
  background: #f9fafb;
  color: #1f2937;
}

.career-select:focus,
.status-select:focus {
  outline: none;
  border-color: #2C4068;
  box-shadow: 0 0 0 3px rgba(44, 64, 104, 0.1);
  background: #ffffff;
  color: #1f2937;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.table-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-color);
}

.page-btn {
  padding: 0.4rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-info {
  color: var(--text-secondary);
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.students-table th {
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  padding: 0.75rem;
  text-align: left;
  border-bottom: 2px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.students-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.student-row:hover {
  background: var(--bg-hover);
}

.loading-row,
.no-data-row {
  text-align: center;
}

.loading-cell,
.no-data-cell {
  padding: 2rem;
  color: var(--text-secondary);
  font-style: italic;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary-color);
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
  color: var(--primary-color);
}

.student-name {
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-active {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.status-graduated {
  background: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.status-temp-drop {
  background: rgba(245, 158, 11, 0.1);
  color: rgb(245, 158, 11);
}

.status-perm-drop {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
}

.status-default {
  background: rgba(107, 114, 128, 0.1);
  color: rgb(107, 114, 128);
}

.average {
  font-weight: 600;
  color: var(--text-primary);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background: var(--bg-hover);
}

.view-btn:hover {
  background: rgba(59, 130, 246, 0.1);
}

.edit-btn:hover {
  background: rgba(245, 158, 11, 0.1);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .students-table {
    font-size: 0.8rem;
  }
  
  .students-table th,
  .students-table td {
    padding: 0.5rem;
  }
  
  .actions {
    flex-direction: column;
    gap: 0.25rem;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .career-select,
  .status-select {
    background: var(--bg-secondary);
  }
}
</style>
