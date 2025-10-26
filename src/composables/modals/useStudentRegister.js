import { ref, reactive, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

export function useStudentRegister() {
  const isSubmitting = ref(false)
  const dashboardStore = useDashboardStore()

  const formData = reactive({
    controlNumber: '',
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

  // Errores de validación
  const errors = reactive({
    controlNumber: '',
    name: '',
    career: '',
    semester: '',
    grades: []
  })

  // Validaciones
  const validateControlNumber = (value) => {
    if (!value) return 'El número de control es requerido'
    if (!/^\d+$/.test(value)) return 'El número de control solo puede contener números'
    if (value.length < 6) return 'El número de control debe tener al menos 6 dígitos'
    if (value.length > 12) return 'El número de control no puede tener más de 12 dígitos'
    return ''
  }

  const validateName = (value) => {
    if (!value) return 'El nombre es requerido'
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El nombre solo puede contener letras y espacios'
    if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres'
    if (value.trim().length > 50) return 'El nombre no puede tener más de 50 caracteres'
    return ''
  }

  const validateCareer = (value) => {
    if (!value) return 'Debe seleccionar una carrera'
    return ''
  }

  const validateSemester = (value) => {
    if (!value) return 'Debe seleccionar un semestre'
    return ''
  }

  const validateGrade = (value) => {
    if (!value) return 'La calificación es requerida'
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return 'La calificación debe ser un número'
    if (numValue < 0) return 'La calificación no puede ser menor a 0'
    if (numValue > 100) return 'La calificación no puede ser mayor a 100'
    return ''
  }

  // Validar formulario completo
  const isFormValid = computed(() => {
    const controlNumberError = validateControlNumber(formData.controlNumber)
    const nameError = validateName(formData.name)
    const careerError = validateCareer(formData.career)
    const semesterError = validateSemester(formData.semester)
    
    // Validar calificaciones si existen
    const gradesErrors = formData.grades.map(unit => validateGrade(unit.grade))
    const hasGradeErrors = gradesErrors.some(error => error !== '')
    
    return !controlNumberError && !nameError && !careerError && !semesterError && !hasGradeErrors
  })

  // Validación en tiempo real
  const validateField = (fieldName, value) => {
    let error = ''
    switch (fieldName) {
      case 'controlNumber':
        error = validateControlNumber(value)
        break
      case 'name':
        error = validateName(value)
        break
      case 'career':
        error = validateCareer(value)
        break
      case 'semester':
        error = validateSemester(value)
        break
    }
    errors[fieldName] = error
    return error
  }

  const validateGradeField = (index, value) => {
    const error = validateGrade(value)
    errors.grades[index] = error
    return error
  }

  // Limpiar error cuando el usuario empiece a escribir
  const clearError = (fieldName) => {
    errors[fieldName] = ''
  }

  const clearGradeError = (index) => {
    errors.grades[index] = ''
  }

  // Mapear carreras del formulario a IDs de la base de datos
  const getCareerId = (careerKey) => {
    const careerMapping = {
      'ingenieria-sistemas': 1,
      'ingenieria-industrial': 2,
      'administracion': 3,
      'contabilidad': 4,
      'psicologia': 5,
      'medicina': 6,
      'derecho': 7
    }
    return careerMapping[careerKey] || 1 // Por defecto Ingeniería en Sistemas
  }

  const handleSubmit = async (emit) => {
    // Validar todos los campos antes de enviar
    const controlNumberError = validateField('controlNumber', formData.controlNumber)
    const nameError = validateField('name', formData.name)
    const careerError = validateField('career', formData.career)
    const semesterError = validateField('semester', formData.semester)
    
    // Validar calificaciones
    formData.grades.forEach((unit, index) => {
      validateGradeField(index, unit.grade)
    })

    // Si hay errores, no enviar
    if (!isFormValid.value) {
      return
    }

    isSubmitting.value = true
    
    try {
      // Preparar datos para la API
      const studentData = {
        num_control: formData.controlNumber,
        nombre: formData.name.split(' ')[0] || formData.name,
        apellido_paterno: formData.name.split(' ')[1] || '',
        apellido_materno: formData.name.split(' ')[2] || '',
        genero: 'M', // Por defecto, se puede agregar al formulario después
        email: `${formData.controlNumber}@estudiante.tec.com`, // Email generado
        telefono: '', // Se puede agregar al formulario después
        direccion: '', // Se puede agregar al formulario después
        id_carrera: getCareerId(formData.career),
        semestre_actual: parseInt(formData.semester),
        fecha_ingreso: new Date().toISOString().split('T')[0],
        estatus: 'Activo',
        promedio_general: calculateAverage() !== '0.0' ? parseFloat(calculateAverage()) : null
      }
      
      console.log('Enviando datos del estudiante:', studentData)
      
      // Enviar a la API usando el store
      const result = await dashboardStore.createStudent(studentData)
      
      if (result.success) {
        console.log('Estudiante creado exitosamente:', result.data)
        
        // Emitir evento con los datos del formulario
        emit('submit', { ...formData })
        
        // Resetear formulario
        resetForm()
        
        // Cerrar modal
        emit('close')
      } else {
        console.error('Error al crear estudiante:', result.error)
        // Aquí podrías mostrar un mensaje de error al usuario
      }
      
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
    formData.controlNumber = ''
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
    // Limpiar errores
    errors.controlNumber = ''
    errors.name = ''
    errors.career = ''
    errors.semester = ''
    errors.grades = []
  }

  return {
    isSubmitting,
    formData,
    errors,
    isFormValid,
    handleSubmit,
    addGradeUnit,
    removeGradeUnit,
    calculateAverage,
    resetForm,
    validateField,
    validateGradeField,
    clearError,
    clearGradeError
  }
}
