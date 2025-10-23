<template>
  <BaseModal :is-open="isOpen" title="Registro de Estudiante" @close="$emit('close')">
    <form @submit.prevent="handleSubmit" class="student-form">
      <!-- Primera fila de campos -->
      <div class="form-row">
        <div class="form-group">
          <label for="controlNumber" class="form-label">No. Control</label>
          <input
            type="text"
            id="controlNumber"
            v-model="formData.controlNumber"
            @blur="validateField('controlNumber', formData.controlNumber)"
            @input="handleControlNumberInput"
            @keypress="preventNonNumeric"
            class="form-input"
            :class="{ 'error': errors.controlNumber }"
            placeholder="Ingrese el número de control"
            maxlength="12"
            required
          />
          <span v-if="errors.controlNumber" class="error-message">{{ errors.controlNumber }}</span>
        </div>
        
        <div class="form-group">
          <label for="name" class="form-label">Nombre</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            @blur="validateField('name', formData.name)"
            @input="handleNameInput"
            @keypress="preventNonLetters"
            class="form-input"
            :class="{ 'error': errors.name }"
            placeholder="Ingrese el nombre completo"
            maxlength="50"
            required
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>
      </div>

      <!-- Segunda fila de campos -->
      <div class="form-row">
        <div class="form-group">
          <label for="career" class="form-label">Carrera</label>
          <select 
            id="career" 
            v-model="formData.career" 
            @change="validateField('career', formData.career)"
            class="form-select"
            :class="{ 'error': errors.career }"
            required
          >
            <option value="">Seleccione una carrera</option>
            <option value="ingenieria-sistemas">Ingeniería en Sistemas</option>
            <option value="ingenieria-industrial">Ingeniería Industrial</option>
            <option value="administracion">Administración</option>
            <option value="contabilidad">Contabilidad</option>
            <option value="psicologia">Psicología</option>
            <option value="medicina">Medicina</option>
            <option value="derecho">Derecho</option>
          </select>
          <span v-if="errors.career" class="error-message">{{ errors.career }}</span>
        </div>
        
        <div class="form-group">
          <label for="semester" class="form-label">Semestre</label>
          <select 
            id="semester" 
            v-model="formData.semester" 
            @change="validateField('semester', formData.semester)"
            class="form-select"
            :class="{ 'error': errors.semester }"
            required
          >
            <option value="">Seleccione un semestre</option>
            <option value="1">Primer Semestre</option>
            <option value="2">Segundo Semestre</option>
            <option value="3">Tercer Semestre</option>
            <option value="4">Cuarto Semestre</option>
            <option value="5">Quinto Semestre</option>
            <option value="6">Sexto Semestre</option>
            <option value="7">Séptimo Semestre</option>
            <option value="8">Octavo Semestre</option>
            <option value="9">Noveno Semestre</option>
            <option value="10">Décimo Semestre</option>
          </select>
          <span v-if="errors.semester" class="error-message">{{ errors.semester }}</span>
        </div>
      </div>

      <!-- Sección de Calificaciones y Factores -->
      <div class="form-section-horizontal">
        <!-- Sección de Calificaciones -->
        <div class="grades-section">
          <div class="grades-header">
            <label class="form-label section-label">Calificaciones</label>
            <button type="button" class="btn-add-unit" @click="addGradeUnit">
              <span>+</span>
              Agregar Unidad
            </button>
          </div>
          
          <div class="grades-container">
            <div 
              v-for="(unit, index) in formData.grades" 
              :key="index" 
              class="grade-unit"
            >
              <div class="unit-header">
                <span class="unit-number">Unidad {{ index + 1 }}</span>
                <button 
                  type="button" 
                  class="btn-remove-unit" 
                  @click="removeGradeUnit(index)"
                  v-if="formData.grades.length > 1"
                >
                  <span>&times;</span>
                </button>
              </div>
              
              <div class="unit-fields">
                <div class="field-group">
                  <label :for="`unit-name-${index}`" class="field-label">Nombre de la Unidad</label>
                  <input
                    :id="`unit-name-${index}`"
                    v-model="unit.name"
                    type="text"
                    class="field-input"
                    placeholder="Ej: Unidad 1 - Fundamentos"
                  />
                </div>
                
                <div class="field-group">
                  <label :for="`unit-grade-${index}`" class="field-label">Calificación</label>
                  <input
                    :id="`unit-grade-${index}`"
                    v-model="unit.grade"
                    @blur="validateGradeField(index, unit.grade)"
                    @input="clearGradeError(index)"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    class="field-input grade-input"
                    :class="{ 'error': errors.grades[index] }"
                    placeholder="0.0"
                  />
                  <span class="grade-suffix">/ 100</span>
                  <span v-if="errors.grades[index]" class="error-message grade-error">{{ errors.grades[index] }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="formData.grades.length === 0" class="empty-grades">
              <div class="empty-icon">📚</div>
              <p>No hay calificaciones registradas</p>
              <small>Haz clic en "Agregar Unidad" para comenzar</small>
            </div>
          </div>
          
          <div v-if="formData.grades.length > 0" class="grades-summary">
            <div class="summary-item">
              <span class="summary-label">Promedio:</span>
              <span class="summary-value">{{ calculateAverage() }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total Unidades:</span>
              <span class="summary-value">{{ formData.grades.length }}</span>
            </div>
          </div>
        </div>

        <!-- Sección de Factores -->
        <div class="factors-section">
          <label class="form-label section-label">Factores</label>
          <div class="factors-grid">
            <div class="factor-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.factors.academic" class="checkbox-input">
                <span class="checkbox-custom"></span>
                Académico
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.factors.psychosocial" class="checkbox-input">
                <span class="checkbox-custom"></span>
                Psicosocial
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.factors.institutional" class="checkbox-input">
                <span class="checkbox-custom"></span>
                Institucional
              </label>
            </div>
            
            <div class="factor-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.factors.economic" class="checkbox-input">
                <span class="checkbox-custom"></span>
                Económico
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.factors.contextual" class="checkbox-input">
                <span class="checkbox-custom"></span>
                Contextual
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.factors.other" class="checkbox-input">
                <span class="checkbox-custom"></span>
                Otros
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">
        Cancelar
      </button>
      <button type="submit" class="btn btn-primary" @click="handleSubmit" :disabled="isSubmitting || !isFormValid">
        <span v-if="isSubmitting" class="spinner"></span>
        {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'
import { useStudentRegister } from '@/composables/modals/useStudentRegister'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const {
  isSubmitting,
  formData,
  errors,
  isFormValid,
  handleSubmit: handleSubmitLogic,
  addGradeUnit,
  removeGradeUnit,
  calculateAverage,
  resetForm,
  validateField,
  validateGradeField,
  clearError,
  clearGradeError
} = useStudentRegister()

const handleSubmit = () => {
  handleSubmitLogic(emit)
}

// Funciones para bloquear caracteres no válidos
const preventNonNumeric = (event) => {
  const char = String.fromCharCode(event.which)
  if (!/[0-9]/.test(char)) {
    event.preventDefault()
  }
}

const preventNonLetters = (event) => {
  const char = String.fromCharCode(event.which)
  if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(char)) {
    event.preventDefault()
  }
}

const handleControlNumberInput = (event) => {
  // Filtrar solo números
  const value = event.target.value.replace(/[^0-9]/g, '')
  formData.controlNumber = value
  clearError('controlNumber')
}

const handleNameInput = (event) => {
  // Filtrar solo letras y espacios
  const value = event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
  formData.name = value
  clearError('name')
}
</script>

<style scoped>
@import '@/styles/modals/StudentRegisterModal.css';
</style>
