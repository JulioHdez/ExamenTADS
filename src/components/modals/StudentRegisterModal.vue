<template>
  <BaseModal :is-open="isOpen" :title="title" @close="$emit('close')">
    <div class="modal-content-wrapper">
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
            <label for="nombre" class="form-label">Nombre</label>
            <input
              type="text"
              id="nombre"
              v-model="formData.nombre"
              @blur="validateField('nombre', formData.nombre)"
              @input="handleNameInput"
              @keypress="preventNonLetters"
              class="form-input"
              :class="{ 'error': errors.nombre }"
              placeholder="Ingrese el nombre"
              maxlength="50"
              required
            />
            <span v-if="errors.nombre" class="error-message">{{ errors.nombre }}</span>
          </div>
        </div>

      <!-- Segunda fila de campos - Apellidos -->
      <div class="form-row">
        <div class="form-group">
          <label for="apellidoPaterno" class="form-label">Apellido Paterno</label>
          <input
            type="text"
            id="apellidoPaterno"
            v-model="formData.apellidoPaterno"
            @blur="validateField('apellidoPaterno', formData.apellidoPaterno)"
            @input="handleNameInput"
            @keypress="preventNonLetters"
            class="form-input"
            :class="{ 'error': errors.apellidoPaterno }"
            placeholder="Ingrese el apellido paterno"
            maxlength="50"
            required
          />
          <span v-if="errors.apellidoPaterno" class="error-message">{{ errors.apellidoPaterno }}</span>
        </div>
        
        <div class="form-group">
          <label for="apellidoMaterno" class="form-label">Apellido Materno</label>
          <input
            type="text"
            id="apellidoMaterno"
            v-model="formData.apellidoMaterno"
            @blur="validateField('apellidoMaterno', formData.apellidoMaterno)"
            @input="handleNameInput"
            @keypress="preventNonLetters"
            class="form-input"
            :class="{ 'error': errors.apellidoMaterno }"
            placeholder="Ingrese el apellido materno"
            maxlength="50"
            required
          />
          <span v-if="errors.apellidoMaterno" class="error-message">{{ errors.apellidoMaterno }}</span>
        </div>
      </div>

      <!-- Tercera fila de campos - Género y Fecha de Nacimiento -->
      <div class="form-row">
        <div class="form-group">
          <label for="genero" class="form-label">Género</label>
          <select 
            id="genero" 
            v-model="formData.genero" 
            @change="validateField('genero', formData.genero)"
            class="form-select"
            :class="{ 'error': errors.genero }"
            required
          >
            <option value="">Seleccione un género</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
          <span v-if="errors.genero" class="error-message">{{ errors.genero }}</span>
        </div>
        
        <div class="form-group">
          <label for="fechaNacimiento" class="form-label">Fecha de Nacimiento</label>
          <input
            type="date"
            id="fechaNacimiento"
            v-model="formData.fechaNacimiento"
            @blur="validateField('fechaNacimiento', formData.fechaNacimiento)"
            class="form-input"
            :class="{ 'error': errors.fechaNacimiento }"
            required
          />
          <span v-if="errors.fechaNacimiento" class="error-message">{{ errors.fechaNacimiento }}</span>
        </div>
      </div>

      <!-- Cuarta fila de campos - Email y Teléfono -->
      <div class="form-row">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            @blur="validateField('email', formData.email)"
            class="form-input"
            :class="{ 'error': errors.email }"
            placeholder="ejemplo@correo.com"
            maxlength="100"
            required
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>
        
        <div class="form-group">
          <label for="telefono" class="form-label">Teléfono</label>
          <input
            type="tel"
            id="telefono"
            v-model="formData.telefono"
            @blur="validateField('telefono', formData.telefono)"
            class="form-input"
            :class="{ 'error': errors.telefono }"
            placeholder="(123) 456-7890"
            maxlength="15"
          />
          <span v-if="errors.telefono" class="error-message">{{ errors.telefono }}</span>
        </div>
      </div>

      <!-- Quinta fila de campos - Dirección -->
      <div class="form-row">
        <div class="form-group full-width">
          <label for="direccion" class="form-label">Dirección</label>
          <textarea
            id="direccion"
            v-model="formData.direccion"
            @blur="validateField('direccion', formData.direccion)"
            class="form-textarea"
            :class="{ 'error': errors.direccion }"
            placeholder="Ingrese la dirección completa"
            maxlength="200"
            rows="3"
          ></textarea>
          <span v-if="errors.direccion" class="error-message">{{ errors.direccion }}</span>
        </div>
      </div>

      <!-- Sexta fila de campos - Carrera y Semestre -->
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
          <label for="semester" class="form-label">Semestre Actual</label>
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

      <!-- Séptima fila de campos - Fecha de Ingreso y Estatus -->
      <div class="form-row">
        <div class="form-group">
          <label for="fechaIngreso" class="form-label">Fecha de Ingreso</label>
          <input
            type="date"
            id="fechaIngreso"
            v-model="formData.fechaIngreso"
            @blur="validateField('fechaIngreso', formData.fechaIngreso)"
            class="form-input"
            :class="{ 'error': errors.fechaIngreso }"
            required
          />
          <span v-if="errors.fechaIngreso" class="error-message">{{ errors.fechaIngreso }}</span>
        </div>
        
        <div class="form-group">
          <label for="estatus" class="form-label">Estatus</label>
          <select 
            id="estatus" 
            v-model="formData.estatus" 
            @change="validateField('estatus', formData.estatus)"
            class="form-select"
            :class="{ 'error': errors.estatus }"
            required
          >
            <option value="">Seleccione un estatus</option>
            <option value="Activo">Activo</option>
            <option value="Baja temporal">Baja temporal</option>
            <option value="Baja definitiva">Baja definitiva</option>
            <option value="Egresado">Egresado</option>
          </select>
          <span v-if="errors.estatus" class="error-message">{{ errors.estatus }}</span>
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
          <label class="form-label section-label">Factores de Riesgo</label>
          <div class="factors-grid">
            <div class="factor-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.factors.academic" class="checkbox-input">
                <span class="checkbox-custom"></span>
                Académico
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.factors.economic" class="checkbox-input">
                <span class="checkbox-custom"></span>
                Económico
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.factors.family" class="checkbox-input">
                <span class="checkbox-custom"></span>
                Familiar
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.factors.health" class="checkbox-input">
                <span class="checkbox-custom"></span>
                Salud
              </label>
            </div>
            
            <div class="factor-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.factors.motivational" class="checkbox-input">
                <span class="checkbox-custom"></span>
                Motivacional
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.factors.social" class="checkbox-input">
                <span class="checkbox-custom"></span>
                Social
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.factors.transport" class="checkbox-input">
                <span class="checkbox-custom"></span>
                Transporte
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.factors.work" class="checkbox-input">
                <span class="checkbox-custom"></span>
                Trabajo
              </label>
            </div>
          </div>
          
        <!-- Sección de Grupos -->
        <div class="form-group full-width">
          <div class="section-header">
            <h3>Grupos del Estudiante</h3>
            <button type="button" @click="addGrupo" class="add-btn">+ Agregar Grupo</button>
          </div>
          
          <div v-for="(grupo, index) in formData.grupos" :key="index" class="grupo-item">
            <div class="grupo-header">
              <h4>Grupo {{ index + 1 }}</h4>
              <button 
                v-if="formData.grupos.length > 1" 
                type="button" 
                @click="removeGrupo(index)" 
                class="remove-btn"
              >
                ✕
              </button>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label :for="`nombre_materia_${index}`" class="form-label">Nombre de la Materia</label>
                <input
                  :id="`nombre_materia_${index}`"
                  v-model="grupo.nombre_materia"
                  type="text"
                  class="form-input"
                  placeholder="Ej: Programación I"
                />
              </div>
              
              <div class="form-group">
                <label :for="`clave_materia_${index}`" class="form-label">Clave de la Materia</label>
                <input
                  :id="`clave_materia_${index}`"
                  v-model="grupo.clave_materia"
                  type="text"
                  class="form-input"
                  placeholder="Ej: PROG001"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label :for="`creditos_${index}`" class="form-label">Créditos</label>
                <input
                  :id="`creditos_${index}`"
                  v-model.number="grupo.creditos"
                  type="number"
                  class="form-input"
                  :min="1"
                  :max="10"
                />
              </div>
              
              <div class="form-group">
                <label :for="`horas_teoria_${index}`" class="form-label">Horas Teoría</label>
                <input
                  :id="`horas_teoria_${index}`"
                  v-model.number="grupo.horas_teoria"
                  type="number"
                  class="form-input"
                  :min="0"
                  :max="10"
                />
              </div>
              
              <div class="form-group">
                <label :for="`horas_practica_${index}`" class="form-label">Horas Práctica</label>
                <input
                  :id="`horas_practica_${index}`"
                  v-model.number="grupo.horas_practica"
                  type="number"
                  class="form-input"
                  :min="0"
                  :max="10"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label :for="`clave_grupo_${index}`" class="form-label">Clave del Grupo</label>
                <input
                  :id="`clave_grupo_${index}`"
                  v-model="grupo.clave_grupo"
                  type="text"
                  class="form-input"
                  placeholder="Ej: GRP001"
                />
              </div>
              
              <div class="form-group">
                <label :for="`semestre_${index}`" class="form-label">Semestre</label>
                <select :id="`semestre_${index}`" v-model="grupo.semestre" class="form-select">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
              </div>
              
              <div class="form-group">
                <label :for="`anio_${index}`" class="form-label">Año</label>
                <input
                  :id="`anio_${index}`"
                  v-model.number="grupo.anio"
                  type="number"
                  class="form-input"
                  :min="2020"
                  :max="2030"
                />
              </div>
              
              <div class="form-group">
                <label :for="`periodo_${index}`" class="form-label">Período</label>
                <select :id="`periodo_${index}`" v-model="grupo.periodo" class="form-select">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="Verano">Verano</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label :for="`horario_${index}`" class="form-label">Horario</label>
                <input
                  :id="`horario_${index}`"
                  v-model="grupo.horario"
                  type="text"
                  class="form-input"
                  placeholder="Ej: Lunes 8:00-10:00"
                />
              </div>
              
              <div class="form-group">
                <label :for="`aula_${index}`" class="form-label">Aula</label>
                <input
                  :id="`aula_${index}`"
                  v-model="grupo.aula"
                  type="text"
                  class="form-input"
                  placeholder="Ej: A-101"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Campo de Observaciones -->
        <div class="form-group full-width">
          <label for="observaciones" class="form-label">Observaciones (Opcional)</label>
          <textarea
            id="observaciones"
            v-model="formData.observaciones"
            @blur="validateField('observaciones', formData.observaciones)"
            class="form-textarea"
            :class="{ 'error': errors.observaciones }"
            placeholder="Ingrese observaciones adicionales sobre los factores de riesgo del estudiante..."
            rows="3"
          ></textarea>
          <span v-if="errors.observaciones" class="error-message">{{ errors.observaciones }}</span>
        </div>
        </div>
      </div>
    </form>
    
    <!-- Indicador de scroll -->
    <div class="scroll-indicator" v-if="showScrollIndicator">
      <div class="scroll-hint">
        <span>↓ Más contenido abajo</span>
      </div>
    </div>
    </div>

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
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  studentToEdit: {
    type: Object,
    default: null
  },
  title: {
    type: String,
    default: 'Registro de Estudiante'
  }
})

const emit = defineEmits(['close', 'submit'])

const showScrollIndicator = ref(false)

const {
  isSubmitting,
  formData,
  errors,
  isFormValid,
  handleSubmit: handleSubmitLogic,
  addGradeUnit,
  removeGradeUnit,
  addGrupo,
  removeGrupo,
  calculateAverage,
  getSelectedFactors,
  resetForm,
  validateField,
  validateGradeField,
  clearError,
  clearGradeError,
  loadStudentData
} = useStudentRegister()

// Watcher para cargar datos del estudiante cuando se está editando
watch(() => props.studentToEdit, (newStudent) => {
  if (newStudent) {
    console.log('Cargando datos del estudiante para editar:', newStudent)
    loadStudentData(newStudent)
  }
}, { immediate: true })

const handleSubmit = () => {
  if (props.studentToEdit) {
    // Modo edición
    handleSubmitLogic(emit, true, props.studentToEdit.id_estudiante)
  } else {
    // Modo creación
    handleSubmitLogic(emit, false, null)
  }
}

// Detectar si hay scroll disponible
const checkScrollIndicator = () => {
  const modalBody = document.querySelector('.modal-body')
  if (modalBody) {
    showScrollIndicator.value = modalBody.scrollHeight > modalBody.clientHeight
  }
}

// Observar cambios en el contenido
const observer = new MutationObserver(() => {
  setTimeout(checkScrollIndicator, 100)
})

onMounted(() => {
  if (props.isOpen) {
    setTimeout(checkScrollIndicator, 100)
    const modalBody = document.querySelector('.modal-body')
    if (modalBody) {
      observer.observe(modalBody, { childList: true, subtree: true })
    }
  }
})

onUnmounted(() => {
  observer.disconnect()
})

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
  const fieldName = event.target.id
  formData[fieldName] = value
  clearError(fieldName)
}
</script>

<style scoped>
@import '@/styles/modals/StudentRegisterModal.css';
</style>
