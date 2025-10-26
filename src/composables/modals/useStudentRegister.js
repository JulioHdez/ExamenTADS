import { ref, reactive, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useNotifications } from '@/composables/useNotifications'
import api from '@/services/api'

export function useStudentRegister() {
  const isSubmitting = ref(false)
  const dashboardStore = useDashboardStore()
  const { showSuccess, showError } = useNotifications()

  const formData = reactive({
    controlNumber: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    genero: '',
    fechaNacimiento: '',
    email: '',
    telefono: '',
    direccion: '',
    career: '',
    semester: '',
    fechaIngreso: '',
    estatus: 'Activo',
    grades: [],
    factors: {
      academic: false,
      economic: false,
      family: false,
      health: false,
      motivational: false,
      social: false,
      transport: false,
      work: false
    },
    observaciones: '',
    grupos: [
      {
        id_materia: null,
        nombre_materia: '',
        clave_materia: '',
        creditos: 4,
        horas_teoria: 2,
        horas_practica: 2,
        clave_grupo: 'GRP001',
        semestre: '1',
        anio: new Date().getFullYear(),
        periodo: '1',
        horario: '',
        aula: ''
      }
    ]
  })

  // Errores de validación
  const errors = reactive({
    controlNumber: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    genero: '',
    fechaNacimiento: '',
    email: '',
    telefono: '',
    direccion: '',
    career: '',
    semester: '',
    fechaIngreso: '',
    estatus: '',
    grades: [],
    observaciones: ''
  })

  // Validaciones
  const validateControlNumber = (value) => {
    if (!value) return 'El número de control es requerido'
    if (!/^\d+$/.test(value)) return 'El número de control solo puede contener números'
    if (value.length < 6) return 'El número de control debe tener al menos 6 dígitos'
    if (value.length > 12) return 'El número de control no puede tener más de 12 dígitos'
    return ''
  }

  const validateNombre = (value) => {
    if (!value) return 'El nombre es requerido'
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El nombre solo puede contener letras y espacios'
    if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres'
    if (value.trim().length > 50) return 'El nombre no puede tener más de 50 caracteres'
    return ''
  }

  const validateApellidoPaterno = (value) => {
    if (!value) return 'El apellido paterno es requerido'
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El apellido paterno solo puede contener letras y espacios'
    if (value.trim().length < 2) return 'El apellido paterno debe tener al menos 2 caracteres'
    if (value.trim().length > 50) return 'El apellido paterno no puede tener más de 50 caracteres'
    return ''
  }

  const validateApellidoMaterno = (value) => {
    if (!value) return 'El apellido materno es requerido'
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El apellido materno solo puede contener letras y espacios'
    if (value.trim().length < 2) return 'El apellido materno debe tener al menos 2 caracteres'
    if (value.trim().length > 50) return 'El apellido materno no puede tener más de 50 caracteres'
    return ''
  }

  const validateGenero = (value) => {
    if (!value) return 'Debe seleccionar un género'
    return ''
  }

  const validateFechaNacimiento = (value) => {
    if (!value) return 'La fecha de nacimiento es requerida'
    const fecha = new Date(value)
    const hoy = new Date()
    if (fecha > hoy) return 'La fecha de nacimiento no puede ser futura'
    const edad = hoy.getFullYear() - fecha.getFullYear()
    if (edad < 16) return 'La edad mínima es 16 años'
    if (edad > 100) return 'La edad máxima es 100 años'
    return ''
  }

  const validateEmail = (value) => {
    if (!value) return 'El email es requerido'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'El formato del email no es válido'
    return ''
  }

  const validateTelefono = (value) => {
    if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) return 'El teléfono solo puede contener números, espacios, guiones, paréntesis y el signo +'
    return ''
  }

  const validateDireccion = (value) => {
    if (value && value.length > 200) return 'La dirección no puede tener más de 200 caracteres'
    return ''
  }

  const validateFechaIngreso = (value) => {
    if (!value) return 'La fecha de ingreso es requerida'
    const fecha = new Date(value)
    const hoy = new Date()
    if (fecha > hoy) return 'La fecha de ingreso no puede ser futura'
    return ''
  }

  const validateEstatus = (value) => {
    if (!value) return 'Debe seleccionar un estatus'
    return ''
  }

  const validateObservaciones = (value) => {
    // Campo opcional, no requiere validación estricta
    if (value && value.length > 500) return 'Las observaciones no pueden exceder 500 caracteres'
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
    const nombreError = validateNombre(formData.nombre)
    const apellidoPaternoError = validateApellidoPaterno(formData.apellidoPaterno)
    const apellidoMaternoError = validateApellidoMaterno(formData.apellidoMaterno)
    const generoError = validateGenero(formData.genero)
    const fechaNacimientoError = validateFechaNacimiento(formData.fechaNacimiento)
    const emailError = validateEmail(formData.email)
    const telefonoError = validateTelefono(formData.telefono)
    const direccionError = validateDireccion(formData.direccion)
    const careerError = validateCareer(formData.career)
    const semesterError = validateSemester(formData.semester)
    const fechaIngresoError = validateFechaIngreso(formData.fechaIngreso)
    const estatusError = validateEstatus(formData.estatus)
    const observacionesError = validateObservaciones(formData.observaciones)
    
    // Validar calificaciones si existen
    const gradesErrors = formData.grades.map(unit => validateGrade(unit.grade))
    const hasGradeErrors = gradesErrors.some(error => error !== '')
    
    return !controlNumberError && !nombreError && !apellidoPaternoError && 
           !apellidoMaternoError && !generoError && !fechaNacimientoError && 
           !emailError && !telefonoError && !direccionError && 
           !careerError && !semesterError && !fechaIngresoError && 
           !estatusError && !observacionesError && !hasGradeErrors
  })

  // Validación en tiempo real
  const validateField = (fieldName, value) => {
    let error = ''
    switch (fieldName) {
      case 'controlNumber':
        error = validateControlNumber(value)
        break
      case 'nombre':
        error = validateNombre(value)
        break
      case 'apellidoPaterno':
        error = validateApellidoPaterno(value)
        break
      case 'apellidoMaterno':
        error = validateApellidoMaterno(value)
        break
      case 'genero':
        error = validateGenero(value)
        break
      case 'fechaNacimiento':
        error = validateFechaNacimiento(value)
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'telefono':
        error = validateTelefono(value)
        break
      case 'direccion':
        error = validateDireccion(value)
        break
      case 'career':
        error = validateCareer(value)
        break
      case 'semester':
        error = validateSemester(value)
        break
      case 'fechaIngreso':
        error = validateFechaIngreso(value)
        break
      case 'estatus':
        error = validateEstatus(value)
        break
      case 'observaciones':
        error = validateObservaciones(value)
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
  const loadStudentData = async (student) => {
    if (!student) return
    
    console.log('Cargando datos del estudiante para editar:', student)
    
    try {
      // Si el estudiante no tiene datos completos, obtenerlos del servidor
      if (!student.factores || !student.grupos || !student.calificaciones) {
        console.log('Obteniendo datos completos del estudiante...')
        const response = await api.get(`/estudiantes/${student.id_estudiante}/complete`)
        
        if (response.data.success) {
          const completeStudent = response.data.data
          console.log('Datos completos obtenidos:', completeStudent)
          
          // Cargar datos básicos
          formData.controlNumber = completeStudent.num_control || ''
          formData.nombre = completeStudent.nombre || ''
          formData.apellidoPaterno = completeStudent.apellido_paterno || ''
          formData.apellidoMaterno = completeStudent.apellido_materno || ''
          formData.genero = completeStudent.genero || ''
          formData.fechaNacimiento = completeStudent.fecha_nacimiento ? completeStudent.fecha_nacimiento.split('T')[0] : ''
          formData.email = completeStudent.email || ''
          formData.telefono = completeStudent.telefono || ''
          formData.direccion = completeStudent.direccion || ''
          formData.career = getCareerKey(completeStudent.id_carrera)
          formData.semester = completeStudent.semestre_actual ? completeStudent.semestre_actual.toString() : ''
          formData.fechaIngreso = completeStudent.fecha_ingreso ? completeStudent.fecha_ingreso.split('T')[0] : ''
          formData.estatus = completeStudent.estatus || 'Activo'
          formData.observaciones = completeStudent.factores?.[0]?.observaciones || ''
          
          // Cargar factores
          if (completeStudent.factores && completeStudent.factores.length > 0) {
            const factorNames = completeStudent.factores.map(f => f.nombre_factor)
            formData.factors = {
              academic: factorNames.includes('Académico'),
              economic: factorNames.includes('Económico'),
              family: factorNames.includes('Familiar'),
              health: factorNames.includes('Salud'),
              motivational: factorNames.includes('Motivacional'),
              social: factorNames.includes('Social'),
              transport: factorNames.includes('Transporte'),
              work: factorNames.includes('Trabajo')
            }
          }
          
          // Cargar grupos
          if (completeStudent.grupos && completeStudent.grupos.length > 0) {
            formData.grupos = completeStudent.grupos.map(grupo => ({
              id_materia: grupo.id_materia,
              clave_grupo: grupo.clave_grupo,
              semestre: grupo.semestre,
              anio: grupo.anio,
              periodo: grupo.periodo,
              horario: grupo.horario || '',
              aula: grupo.aula || ''
            }))
          } else {
            // Si no hay grupos, mantener uno por defecto
            formData.grupos = [{
              id_materia: 1,
              clave_grupo: 'GRP001',
              semestre: '1',
              anio: new Date().getFullYear(),
              periodo: '1',
              horario: '',
              aula: ''
            }]
          }
          
          // Cargar calificaciones
          if (completeStudent.calificaciones && completeStudent.calificaciones.length > 0) {
            formData.grades = completeStudent.calificaciones.map(cal => ({
              name: cal.nombre_materia || 'Materia',
              grade: cal.calificacion ? cal.calificacion.toString() : ''
            }))
          } else {
            formData.grades = []
          }
          
          return
        }
      }
      
      // Si ya tiene datos completos, cargar normalmente
      formData.controlNumber = student.num_control || ''
      formData.nombre = student.nombre || ''
      formData.apellidoPaterno = student.apellido_paterno || ''
      formData.apellidoMaterno = student.apellido_materno || ''
      formData.genero = student.genero || ''
      formData.fechaNacimiento = student.fecha_nacimiento ? student.fecha_nacimiento.split('T')[0] : ''
      formData.email = student.email || ''
      formData.telefono = student.telefono || ''
      formData.direccion = student.direccion || ''
      formData.career = getCareerKey(student.id_carrera)
      formData.semester = student.semestre_actual ? student.semestre_actual.toString() : ''
      formData.fechaIngreso = student.fecha_ingreso ? student.fecha_ingreso.split('T')[0] : ''
      formData.estatus = student.estatus || 'Activo'
      formData.observaciones = student.observaciones || ''
      
      // Cargar factores si existen
      if (student.factores) {
        formData.factors = {
          academic: student.factores.includes('Académico'),
          economic: student.factores.includes('Económico'),
          family: student.factores.includes('Familiar'),
          health: student.factores.includes('Salud'),
          motivational: student.factores.includes('Motivacional'),
          social: student.factores.includes('Social'),
          transport: student.factores.includes('Transporte'),
          work: student.factores.includes('Trabajo')
        }
      }
      
    } catch (error) {
      console.error('Error cargando datos del estudiante:', error)
      // En caso de error, cargar datos básicos
      formData.controlNumber = student.num_control || ''
      formData.nombre = student.nombre || ''
      formData.apellidoPaterno = student.apellido_paterno || ''
      formData.apellidoMaterno = student.apellido_materno || ''
      formData.genero = student.genero || ''
      formData.fechaNacimiento = student.fecha_nacimiento ? student.fecha_nacimiento.split('T')[0] : ''
      formData.email = student.email || ''
      formData.telefono = student.telefono || ''
      formData.direccion = student.direccion || ''
      formData.career = getCareerKey(student.id_carrera)
      formData.semester = student.semestre_actual ? student.semestre_actual.toString() : ''
      formData.fechaIngreso = student.fecha_ingreso ? student.fecha_ingreso.split('T')[0] : ''
      formData.estatus = student.estatus || 'Activo'
      formData.observaciones = ''
    }
  }

  const getCareerKey = (careerId) => {
    const careerMapping = {
      2: 'ingenieria-sistemas',
      3: 'ingenieria-industrial',
      4: 'administracion',
      5: 'contabilidad',
      6: 'psicologia',
      7: 'medicina',
      8: 'derecho'
    }
    return careerMapping[careerId] || 'ingenieria-sistemas'
  }

  const getCareerId = (careerKey) => {
    const careerMapping = {
      'ingenieria-sistemas': 2,
      'ingenieria-industrial': 3,
      'administracion': 4,
      'contabilidad': 5,
      'psicologia': 6,
      'medicina': 7,
      'derecho': 8
    }
    return careerMapping[careerKey] || 2 // Por defecto Ingeniería en Sistemas
  }

  const handleSubmit = async (emit, isUpdate = false, studentId = null) => {
    // Validar todos los campos antes de enviar
    const controlNumberError = validateField('controlNumber', formData.controlNumber)
    const nombreError = validateField('nombre', formData.nombre)
    const apellidoPaternoError = validateField('apellidoPaterno', formData.apellidoPaterno)
    const apellidoMaternoError = validateField('apellidoMaterno', formData.apellidoMaterno)
    const generoError = validateField('genero', formData.genero)
    const fechaNacimientoError = validateField('fechaNacimiento', formData.fechaNacimiento)
    const emailError = validateField('email', formData.email)
    const telefonoError = validateField('telefono', formData.telefono)
    const direccionError = validateField('direccion', formData.direccion)
    const careerError = validateField('career', formData.career)
    const semesterError = validateField('semester', formData.semester)
    const fechaIngresoError = validateField('fechaIngreso', formData.fechaIngreso)
    const estatusError = validateField('estatus', formData.estatus)
    
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
        nombre: formData.nombre,
        apellido_paterno: formData.apellidoPaterno,
        apellido_materno: formData.apellidoMaterno,
        genero: formData.genero,
        fecha_nacimiento: formData.fechaNacimiento,
        email: formData.email,
        telefono: formData.telefono || null,
        direccion: formData.direccion || null,
        id_carrera: getCareerId(formData.career),
        semestre_actual: parseInt(formData.semester),
        fecha_ingreso: formData.fechaIngreso,
        estatus: formData.estatus,
        promedio_general: calculateAverage() !== '0.0' ? parseFloat(calculateAverage()) : null,
        factores_seleccionados: getSelectedFactors(),
        calificaciones: formData.grades.filter(grade => grade.name && grade.grade),
        observaciones: formData.observaciones.trim() || 'Sin observaciones',
        grupos: formData.grupos
      }
      
      console.log('Enviando datos del estudiante:', studentData)
      console.log('Factores seleccionados:', getSelectedFactors())
      
      let result
      if (isUpdate && studentId) {
        // Actualizar estudiante existente
        console.log('Actualizando estudiante con ID:', studentId)
        result = await api.put(`/estudiantes/${studentId}`, studentData)
      } else {
        // Crear nuevo estudiante
        result = await dashboardStore.createStudent(studentData)
      }
      
      if (result.success || result.data?.success) {
        console.log('Estudiante guardado exitosamente:', result.data || result)
        
        // Mostrar notificación de éxito
        const message = isUpdate ? '¡Estudiante actualizado exitosamente!' : '¡Estudiante registrado exitosamente!'
        const description = isUpdate ? 
          `El estudiante ${formData.nombre} ${formData.apellidoPaterno} ha sido actualizado correctamente.` :
          `El estudiante ${formData.nombre} ${formData.apellidoPaterno} ha sido registrado correctamente.`
        
        showSuccess(message, description)
        
        // Emitir evento con los datos del formulario
        emit('submit', { ...formData })
        
        // Resetear formulario
        resetForm()
        
        // Cerrar modal
        emit('close')
      } else {
        console.error('Error al guardar estudiante:', result.error || result.message)
        
        // Mostrar notificación de error
        const errorMessage = isUpdate ? 'Error al actualizar estudiante' : 'Error al registrar estudiante'
        const errorDescription = result.error || result.message || 'No se pudo guardar el estudiante. Por favor, inténtalo de nuevo.'
        
        showError(errorMessage, errorDescription)
      }
      
    } catch (error) {
      console.error('Error al guardar estudiante:', error)
      
      // Mostrar notificación de error de conexión
      const errorMessage = isUpdate ? 'Error al actualizar estudiante' : 'Error al registrar estudiante'
      const errorDescription = error.response?.data?.message || error.message || 'No se pudo conectar con el servidor. Por favor, verifica que el backend esté ejecutándose e inténtalo de nuevo.'
      
      showError(errorMessage, errorDescription)
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

  const addGrupo = () => {
    formData.grupos.push({
      id_materia: null,
      nombre_materia: '',
      clave_materia: '',
      creditos: 4,
      horas_teoria: 2,
      horas_practica: 2,
      clave_grupo: `GRP${String(formData.grupos.length + 1).padStart(3, '0')}`,
      semestre: '1',
      anio: new Date().getFullYear(),
      periodo: '1',
      horario: '',
      aula: ''
    })
  }

  const removeGrupo = (index) => {
    if (formData.grupos.length > 1) {
      formData.grupos.splice(index, 1)
    }
  }

  const calculateAverage = () => {
    const validGrades = formData.grades.filter(unit => unit.grade && !isNaN(parseFloat(unit.grade)))
    if (validGrades.length === 0) return '0.0'
    
    const sum = validGrades.reduce((total, unit) => total + parseFloat(unit.grade), 0)
    const average = sum / validGrades.length
    return average.toFixed(1)
  }

  const getSelectedFactors = () => {
    const factorMapping = {
      academic: 'Académico',
      economic: 'Económico',
      family: 'Familiar',
      health: 'Salud',
      motivational: 'Motivacional',
      social: 'Social',
      transport: 'Transporte',
      work: 'Trabajo'
    }
    
    return Object.keys(formData.factors)
      .filter(key => formData.factors[key])
      .map(key => factorMapping[key])
  }

  const resetForm = () => {
    formData.controlNumber = ''
    formData.nombre = ''
    formData.apellidoPaterno = ''
    formData.apellidoMaterno = ''
    formData.genero = ''
    formData.fechaNacimiento = ''
    formData.email = ''
    formData.telefono = ''
    formData.direccion = ''
    formData.career = ''
    formData.semester = ''
    formData.fechaIngreso = ''
    formData.estatus = 'Activo'
    formData.grades = []
    formData.factors = {
      academic: false,
      economic: false,
      family: false,
      health: false,
      motivational: false,
      social: false,
      transport: false,
      work: false
    }
    formData.observaciones = ''
    formData.grupos = [
      {
        id_materia: null,
        nombre_materia: '',
        clave_materia: '',
        creditos: 4,
        horas_teoria: 2,
        horas_practica: 2,
        clave_grupo: 'GRP001',
        semestre: '1',
        anio: new Date().getFullYear(),
        periodo: '1',
        horario: '',
        aula: ''
      }
    ]
    // Limpiar errores
    errors.controlNumber = ''
    errors.nombre = ''
    errors.apellidoPaterno = ''
    errors.apellidoMaterno = ''
    errors.genero = ''
    errors.fechaNacimiento = ''
    errors.email = ''
    errors.telefono = ''
    errors.direccion = ''
    errors.career = ''
    errors.semester = ''
    errors.fechaIngreso = ''
    errors.estatus = ''
    errors.grades = []
    errors.observaciones = ''
  }

  return {
    isSubmitting,
    formData,
    errors,
    isFormValid,
    handleSubmit,
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
    loadStudentData,
    getCareerKey,
    getCareerId
  }
}
