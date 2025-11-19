<template>
  <BaseModal :is-open="isOpen" title="Mis Materias" @close="$emit('close')">
    <div class="materias-modal-content">
      <!-- Información de la carrera -->
      <div class="career-info" v-if="userInfo?.nombre_carrera">
        <p><strong>Carrera:</strong> {{ userInfo.nombre_carrera }}</p>
      </div>

      <!-- Filtros y ordenamiento -->
      <div class="filters-section">
        <div class="filter-group">
          <label for="sort-by">Ordenar por:</label>
          <select 
            id="sort-by" 
            v-model="sortBy" 
            @change="sortMaterias"
            class="filter-select"
          >
            <option value="clave_materia">Clave</option>
            <option value="nombre_materia">Nombre</option>
            <option value="creditos">Créditos</option>
            <option value="horas_teoria">Horas Teoría</option>
            <option value="horas_practica">Horas Práctica</option>
            <option value="total_horas">Total Horas</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="sort-order">Orden:</label>
          <select 
            id="sort-order" 
            v-model="sortOrder" 
            @change="sortMaterias"
            class="filter-select"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="search-filter">Buscar:</label>
          <input 
            id="search-filter"
            type="text" 
            v-model="searchQuery" 
            @input="filterMaterias"
            placeholder="Buscar por clave o nombre..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Tabla de materias -->
      <div class="table-container">
        <div class="table-header">
          <h3>Materias Asignadas ({{ filteredMaterias.length }})</h3>
        </div>
        
        <div class="table-wrapper">
          <table class="materias-table">
            <thead>
              <tr>
                <th>
                  <button @click="setSort('clave_materia')" class="sortable-header">
                    Clave
                    <span v-if="sortBy === 'clave_materia'" class="sort-indicator">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </button>
                </th>
                <th>
                  <button @click="setSort('nombre_materia')" class="sortable-header">
                    Nombre de la Materia
                    <span v-if="sortBy === 'nombre_materia'" class="sort-indicator">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </button>
                </th>
                <th>
                  <button @click="setSort('creditos')" class="sortable-header">
                    Créditos
                    <span v-if="sortBy === 'creditos'" class="sort-indicator">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </button>
                </th>
                <th>
                  <button @click="setSort('horas_teoria')" class="sortable-header">
                    Horas Teoría
                    <span v-if="sortBy === 'horas_teoria'" class="sort-indicator">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </button>
                </th>
                <th>
                  <button @click="setSort('horas_practica')" class="sortable-header">
                    Horas Práctica
                    <span v-if="sortBy === 'horas_practica'" class="sort-indicator">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </button>
                </th>
                <th>
                  <button @click="setSort('total_horas')" class="sortable-header">
                    Total Horas
                    <span v-if="sortBy === 'total_horas'" class="sort-indicator">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="loading-row">
                <td colspan="6" class="loading-cell">
                  <div class="loading-spinner"></div>
                  Cargando materias...
                </td>
              </tr>
              <tr v-else-if="filteredMaterias.length === 0" class="no-data-row">
                <td colspan="6" class="no-data-cell">
                  No se encontraron materias asignadas
                </td>
              </tr>
              <tr v-else v-for="materia in filteredMaterias" :key="materia.id_materia" class="materia-row">
                <td class="clave-materia">{{ materia.clave_materia }}</td>
                <td class="nombre-materia">{{ materia.nombre_materia }}</td>
                <td class="creditos">{{ materia.creditos }}</td>
                <td class="horas-teoria">{{ materia.horas_teoria }}</td>
                <td class="horas-practica">{{ materia.horas_practica }}</td>
                <td class="total-horas">
                  {{ (materia.horas_teoria || 0) + (materia.horas_practica || 0) }}
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
const materias = ref([])
const loading = ref(false)
const sortBy = ref('clave_materia')
const sortOrder = ref('asc')
const searchQuery = ref('')

const userInfo = computed(() => authStore.userInfo)

const filteredMaterias = computed(() => {
  let filtered = [...materias.value]
  
  // Aplicar búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(materia => 
      materia.clave_materia?.toLowerCase().includes(query) ||
      materia.nombre_materia?.toLowerCase().includes(query)
    )
  }
  
  // Aplicar ordenamiento
  filtered.sort((a, b) => {
    let aValue, bValue
    
    if (sortBy.value === 'total_horas') {
      aValue = (a.horas_teoria || 0) + (a.horas_practica || 0)
      bValue = (b.horas_teoria || 0) + (b.horas_practica || 0)
    } else {
      aValue = a[sortBy.value]
      bValue = b[sortBy.value]
    }
    
    // Determinar si es numérico o texto
    const isNumeric = sortBy.value === 'creditos' || 
                     sortBy.value === 'horas_teoria' || 
                     sortBy.value === 'horas_practica' || 
                     sortBy.value === 'total_horas'
    
    if (isNumeric) {
      aValue = Number(aValue) || 0
      bValue = Number(bValue) || 0
    } else {
      aValue = String(aValue || '').toLowerCase()
      bValue = String(bValue || '').toLowerCase()
    }
    
    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    }
  })
  
  return filtered
})

const setSort = (column) => {
  if (sortBy.value === column) {
    // Si ya está ordenando por esta columna, cambiar el orden
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Si es una nueva columna, establecer orden ascendente por defecto
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

const sortMaterias = () => {
  // El ordenamiento se hace automáticamente en el computed filteredMaterias
}

const filterMaterias = () => {
  // El filtrado se hace automáticamente en el computed filteredMaterias
}

const fetchMaterias = async () => {
  if (!userInfo.value?.id) {
    console.error('No hay información del profesor')
    return
  }

  loading.value = true
  try {
    const response = await api.get(`/profesores/${userInfo.value.id}/materias`)
    
    if (response.data && response.data.success) {
      materias.value = response.data.data || []
      console.log('Materias cargadas:', materias.value)
    } else {
      console.error('Error en la respuesta del servidor:', response.data)
      materias.value = []
    }
  } catch (error) {
    console.error('Error al cargar materias:', error)
    materias.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.isOpen) {
    fetchMaterias()
  }
})

// Recargar materias cuando se abre el modal
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    fetchMaterias()
  }
})
</script>

<style scoped>
.materias-modal-content {
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
  margin: 0;
  color: #475569;
  font-size: 1rem;
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
  min-width: 150px;
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

.filter-select,
.search-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  color: #1e293b;
  transition: all 0.2s ease;
}

.dark .filter-select,
.dark .search-input {
  background: #0f172a;
  border-color: #334155;
  color: #f1f5f9;
}

.filter-select:hover,
.search-input:hover {
  border-color: #cbd5e1;
}

.dark .filter-select:hover,
.dark .search-input:hover {
  border-color: #475569;
}

.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dark .filter-select:focus,
.dark .search-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.search-input {
  flex: 2;
  min-width: 200px;
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

.materias-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  background: white;
}

.dark .materias-table {
  background: #1e293b;
}

.materias-table th {
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

.sortable-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: inherit;
  font-weight: inherit;
  font-size: inherit;
  cursor: pointer;
  padding: 0;
  width: 100%;
  text-align: left;
  transition: color 0.2s ease;
}

.sortable-header:hover {
  color: #3b82f6;
}

.dark .sortable-header:hover {
  color: #60a5fa;
}

.sort-indicator {
  font-size: 0.875rem;
  color: #3b82f6;
  font-weight: bold;
}

.dark .sort-indicator {
  color: #60a5fa;
}

.dark .materias-table th {
  background: #0f172a;
  color: #f1f5f9;
  border-bottom-color: #334155;
}

.materias-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
}

.dark .materias-table td {
  border-bottom-color: #334155;
  color: #cbd5e1;
}

.materia-row:hover {
  background: #f8fafc;
}

.dark .materia-row:hover {
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

.clave-materia {
  font-weight: 600;
  color: #3b82f6;
}

.dark .clave-materia {
  color: #60a5fa;
}

.nombre-materia {
  font-weight: 500;
  color: #1e293b;
}

.dark .nombre-materia {
  color: #f1f5f9;
}

.creditos,
.horas-teoria,
.horas-practica,
.total-horas {
  text-align: center;
  color: #64748b;
}

.dark .creditos,
.dark .horas-teoria,
.dark .horas-practica,
.dark .total-horas {
  color: #94a3b8;
}

.total-horas {
  font-weight: 600;
  color: #1e293b;
}

.dark .total-horas {
  color: #f1f5f9;
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

