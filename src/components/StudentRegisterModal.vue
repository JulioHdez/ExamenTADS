<template>
  <BaseModal :is-open="isOpen" title="Registro de Estudiante" @close="$emit('close')">
    <form @submit.prevent="handleSubmit" class="student-form">
      <!-- Primera fila de campos -->
      <div class="form-row">
        <div class="form-group">
          <label for="studentId" class="form-label">ID Estudiante</label>
          <input
            type="text"
            id="studentId"
            v-model="formData.studentId"
            class="form-input"
            placeholder="Ingrese el ID del estudiante"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="name" class="form-label">Nombre</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            class="form-input"
            placeholder="Ingrese el nombre completo"
            required
          />
        </div>
      </div>

      <!-- Segunda fila de campos -->
      <div class="form-row">
        <div class="form-group">
          <label for="career" class="form-label">Carrera</label>
          <select id="career" v-model="formData.career" class="form-select" required>
            <option value="">Seleccione una carrera</option>
            <option value="ingenieria-sistemas">Ingeniería en Sistemas</option>
            <option value="ingenieria-industrial">Ingeniería Industrial</option>
            <option value="administracion">Administración</option>
            <option value="contabilidad">Contabilidad</option>
            <option value="psicologia">Psicología</option>
            <option value="medicina">Medicina</option>
            <option value="derecho">Derecho</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="semester" class="form-label">Semestre</label>
          <select id="semester" v-model="formData.semester" class="form-select" required>
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
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    class="field-input grade-input"
                    placeholder="0.0"
                  />
                  <span class="grade-suffix">/ 100</span>
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
      <button type="submit" class="btn btn-primary" @click="handleSubmit" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="spinner"></span>
        {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const isSubmitting = ref(false)

const formData = reactive({
  studentId: '',
  name: '',
  career: '',
  semester: '',
  grades: [],
  factors: {
    academic: false,
    psychosocial: false,
    institutional: false,
    economic: false,
    contextual: false,
    other: false
  }
})

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // Simular delay de guardado
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Emitir evento con los datos del formulario
    emit('submit', { ...formData })
    
    // Resetear formulario
    resetForm()
    
    // Cerrar modal
    emit('close')
    
  } catch (error) {
    console.error('Error al guardar estudiante:', error)
  } finally {
    isSubmitting.value = false
  }
}

const addGradeUnit = () => {
  formData.grades.push({
    name: '',
    grade: ''
  })
}

const removeGradeUnit = (index) => {
  formData.grades.splice(index, 1)
}

const calculateAverage = () => {
  const validGrades = formData.grades.filter(unit => unit.grade && !isNaN(parseFloat(unit.grade)))
  if (validGrades.length === 0) return '0.0'
  
  const sum = validGrades.reduce((total, unit) => total + parseFloat(unit.grade), 0)
  const average = sum / validGrades.length
  return average.toFixed(1)
}

const resetForm = () => {
  formData.studentId = ''
  formData.name = ''
  formData.career = ''
  formData.semester = ''
  formData.grades = []
  formData.factors = {
    academic: false,
    psychosocial: false,
    institutional: false,
    economic: false,
    contextual: false,
    other: false
  }
}
</script>

<style scoped>
.student-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: none;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-section-horizontal {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
}

.grades-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.factors-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.section-label {
  font-size: 1rem;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background-color: #ffffff;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2C4068;
  box-shadow: 0 0 0 3px rgba(44, 64, 104, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.form-help {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Estilos para la sección de calificaciones */
.grades-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-add-unit {
  background: linear-gradient(135deg, #2C4068 0%, #1a2a4a 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-add-unit:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(44, 64, 104, 0.4);
}

.grades-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.grade-unit {
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.grade-unit:hover {
  border-color: #2C4068;
  background: #f0f4f8;
  box-shadow: 0 2px 8px rgba(44, 64, 104, 0.1);
}

.unit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.unit-number {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.btn-remove-unit {
  background: #ef4444;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-remove-unit:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.unit-fields {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-input {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background-color: white;
}

.field-input:focus {
  outline: none;
  border-color: #2C4068;
  box-shadow: 0 0 0 3px rgba(44, 64, 104, 0.1);
}

.grade-input {
  text-align: center;
  font-weight: 600;
  color: #374151;
}

.grade-suffix {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.875rem;
  pointer-events: none;
}

.field-group:has(.grade-input) {
  position: relative;
}

.empty-grades {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.empty-grades p {
  margin: 0.5rem 0;
  font-weight: 500;
}

.empty-grades small {
  font-size: 0.75rem;
}

.grades-summary {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  margin-top: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.summary-label {
  font-size: 0.75rem;
  color: #2C4068;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1a2a4a;
}

.factors-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.factor-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition: color 0.2s ease;
}

.checkbox-label:hover {
  color: #1f2937;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
  background-color: white;
}

.checkbox-input:checked + .checkbox-custom {
  background-color: #667eea;
  border-color: #667eea;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #2C4068 0%, #1a2a4a 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(44, 64, 104, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-section-horizontal {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .unit-fields {
    grid-template-columns: 1fr;
  }
  
  .grades-summary {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .grades-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .btn-add-unit {
    justify-content: center;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
