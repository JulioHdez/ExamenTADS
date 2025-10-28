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
          <!-- Botón para ver en pantalla completa -->
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
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'
import { useIshikawa } from '@/composables/modals/useIshikawa'

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
  exportToPDF: exportToPDFFunction
} = useIshikawa()

const showFullscreen = ref(false)

const handleClose = () => {
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
</script>

<style scoped>
@import '@/styles/modals/IshikawaModal.css';
</style>

