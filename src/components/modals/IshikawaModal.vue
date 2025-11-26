<template>
  <BaseModal :is-open="isOpen" title="Diagrama de Ishikawa" @close="$emit('close')">
    <div class="ishikawa-content">
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

      <!-- Botón para generar diagrama -->
      <div class="generate-section">
        <button 
          type="button" 
          class="btn-generate" 
          @click="generateIshikawa"
          :disabled="loading || !selectedSemester"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>🐟</span>
          {{ loading ? 'Generando...' : 'Generar Diagrama' }}
        </button>
      </div>

      <!-- Diagrama de Ishikawa -->
      <div v-if="ishikawaData" class="ishikawa-diagram-section">
        <div ref="diagramContainer" class="ishikawa-diagram-container">
          <!-- Botones de acción -->
          <div class="view-fullscreen-section">
            <button 
              class="btn-fullscreen"
              @click="openFullscreen"
            >
              🖥️ Ver Diagrama en Pantalla Completa
            </button>
          </div>

          <!-- Información adicional -->
          <div class="diagram-info">
            <div class="info-item">
              <span class="info-icon">👥</span>
              <div class="info-details">
                <span class="info-label">Estudiantes:</span>
                <span class="info-value">{{ ishikawaData.totalStudents }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-icon">⚠️</span>
              <div class="info-details">
                <span class="info-label">Total Factores:</span>
                <span class="info-value">{{ ishikawaData.totalFactors }}</span>
              </div>
            </div>
          </div>

          <!-- Tabla de datos -->
          <div class="data-table-section">
            <h4 class="table-title">Categorías de Factores de Riesgo</h4>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Factores Encontrados</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="category in ishikawaData.categories" 
                  :key="category.id"
                  :style="{ borderLeft: `4px solid ${category.color}` }"
                >
                  <td>
                    <span class="category-icon-small">{{ category.icon }}</span>
                    {{ category.name }}
                  </td>
                  <td>
                    <div class="factors-cell">
                      <span 
                        v-for="(factor, index) in category.factors" 
                        :key="index"
                        class="factor-tag"
                      >
                        {{ factor }}
                      </span>
                      <span v-if="category.factors.length === 0" class="no-factors">
                        Sin factores
                      </span>
                    </div>
                  </td>
                  <td class="count-cell">{{ category.count }}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <!-- Estado vacío después de generar -->
      <div v-else-if="!loading && ishikawaData === null && selectedSemester" class="empty-state">
        <div class="empty-icon">🐟</div>
        <h3>Sin datos para mostrar</h3>
        <p>No se encontraron factores de riesgo para el semestre seleccionado. 
           Asegúrese de que los estudiantes tengan factores de riesgo asignados.</p>
      </div>

      <!-- Estado vacío antes de generar -->
      <div v-else-if="!loading && !selectedSemester" class="initial-state">
        <div class="initial-icon">🎯</div>
        <h3>Diagrama de Ishikawa (Causa-Efecto)</h3>
        <p>Seleccione un semestre y genere el diagrama para identificar las causas que afectan el rendimiento académico.</p>
      </div>

      <!-- Estado de carga -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <h3>Generando diagrama...</h3>
        <p>Por favor espere mientras se analizan los datos.</p>
      </div>
    </div>

    <!-- Modal de Comentarios (fuera de la cadena condicional) -->
    <IshikawaCommentModal
      :is-open="showCommentModal"
      :categories="mainCategories"
      :semester="selectedSemester"
      :ishikawa-data="ishikawaData"
      @close="showCommentModal = false"
      @saved="handleCommentSaved"
    />

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="handleClose">
        Cerrar
      </button>
      
      <button 
        v-if="ishikawaData" 
        type="button" 
        class="btn btn-primary" 
        @click="handleExport"
        :disabled="loading"
      >
        📄 Exportar PDF
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import BaseModal from './BaseModal.vue'
import IshikawaCommentModal from './IshikawaCommentModal.vue'
import { useIshikawa } from '@/composables/modals/useIshikawa'
import { useNotifications } from '@/composables/useNotifications'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'open-fullscreen', 'export'])
const diagramContainer = ref(null)

const {
  selectedSemester,
  loading,
  ishikawaData,
  mainCategories,
  availableSemesters,
  generateIshikawa: generateIshikawaLogic,
  exportToPDF: exportToPDFFunction,
  resetForm: resetFormLogic
} = useIshikawa()

const { showSuccess } = useNotifications()
const showFullscreen = ref(false)
const showCommentModal = ref(false)
const showCommentsViewModal = ref(false)
const selectedCategoryForComments = ref(null)
const comments = ref([])

// Función para limpiar todos los comentarios del localStorage
const clearAllComments = () => {
  try {
    // Obtener todas las claves del localStorage
    const keys = Object.keys(localStorage)
    // Eliminar todas las claves relacionadas con comentarios de Ishikawa
    keys.forEach(key => {
      if (key.startsWith('ishikawa_comments_')) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Error al limpiar comentarios:', error)
  }
}

const handleClose = () => {
  // Limpiar estado al cerrar
  showCommentModal.value = false
  showCommentsViewModal.value = false
  comments.value = []
  selectedCategoryForComments.value = null
  
  // Limpiar comentarios del localStorage para todos los semestres
  clearAllComments()
  
  // Resetear el formulario del composable
  resetFormLogic()
  emit('close')
}

const generateIshikawa = async () => {
  await generateIshikawaLogic()
  // Mostrar en vista de pantalla completa después de generar
  if (ishikawaData.value) {
    showFullscreen.value = true
  }
}

const closeFullscreen = () => {
  showFullscreen.value = false
}

const exportFromFullscreen = (element) => {
  exportToPDFFunction(element)
}

const openFullscreen = () => {
  emit('open-fullscreen', ishikawaData.value)
}

const handleExport = () => {
  exportToPDFFunction(diagramContainer.value)
}

// Funciones para manejar comentarios
const loadComments = () => {
  if (!selectedSemester.value) {
    comments.value = []
    return
  }
  
  try {
    const storageKey = `ishikawa_comments_${selectedSemester.value}`
    const storedComments = localStorage.getItem(storageKey)
    comments.value = storedComments ? JSON.parse(storedComments) : []
  } catch (error) {
    console.error('Error al cargar comentarios:', error)
    comments.value = []
  }
}

const getCommentsByCategory = (categoryId) => {
  return comments.value.filter(comment => comment.categoryId === categoryId)
}

const handleCommentSaved = () => {
  loadComments()
}

const deleteComment = (commentId) => {
  if (!selectedSemester.value) return
  
  try {
    const storageKey = `ishikawa_comments_${selectedSemester.value}`
    comments.value = comments.value.filter(c => c.id !== commentId)
    localStorage.setItem(storageKey, JSON.stringify(comments.value))
    showSuccess('Éxito', 'Comentario eliminado')
  } catch (error) {
    console.error('Error al eliminar comentario:', error)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Limpiar todo cuando se cierra el modal
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && selectedSemester.value) {
    loadComments()
  } else if (!isOpen) {
    // Limpiar estado cuando se cierra el modal
    showCommentModal.value = false
    showCommentsViewModal.value = false
    comments.value = []
    selectedCategoryForComments.value = null
    // Limpiar comentarios del localStorage
    clearAllComments()
  }
})

// Cargar comentarios cuando cambie el semestre o se genere el diagrama
watch([selectedSemester, ishikawaData], () => {
  if (selectedSemester.value && ishikawaData.value) {
    loadComments()
  }
})

// Limpiar al desmontar el componente
onBeforeUnmount(() => {
  showCommentModal.value = false
  showCommentsViewModal.value = false
  comments.value = []
  selectedCategoryForComments.value = null
  clearAllComments()
  resetFormLogic()
})
</script>

<style scoped>
@import '@/styles/modals/IshikawaModal.css';
</style>

