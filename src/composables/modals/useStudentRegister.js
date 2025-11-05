import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useNotifications } from '@/composables/useNotifications'
import { useMaterias } from '@/composables/useMaterias'
import api from '@/services/api'

export function useStudentRegister() {
  const isSubmitting = ref(false)
  const dashboardStore = useDashboardStore()
  const { showSuccess, showError, showErrorWithDetails } = useNotifications()
  const { fetchMateriasCompletas, getCarreraName } = useMaterias()
  
  // Estado para materias disponibles
  const materiasDisponibles = ref([])
  const materiasCargando = ref(false)
  
  // Opciones predefinidas para claves de grupo
  const opcionesClaveGrupo = ref([
    'GRP001', 'GRP002', 'GRP003', 'GRP004', 'GRP005',
    'GRP006', 'GRP007', 'GRP008', 'GRP009', 'GRP010'
  ])
  
  // Horarios predefinidos (pool de horarios disponibles)
  const horariosPredefinidos = ref([
    'Lunes y Miércoles 8:00-10:00',
    'Lunes y Miércoles 10:00-12:00',
    'Lunes y Miércoles 14:00-16:00',
    'Lunes y Miércoles 16:00-18:00',
    'Martes y Jueves 8:00-10:00',
    'Martes y Jueves 10:00-12:00',
    'Martes y Jueves 14:00-16:00',
    'Martes y Jueves 16:00-18:00',
    'Miércoles y Viernes 8:00-10:00',
    'Miércoles y Viernes 10:00-12:00',
    'Miércoles y Viernes 14:00-16:00',
    'Miércoles y Viernes 16:00-18:00',
    'Lunes, Miércoles y Viernes 8:00-9:00',
    'Lunes, Miércoles y Viernes 9:00-10:00',
    'Lunes, Miércoles y Viernes 10:00-11:00',
    'Lunes, Miércoles y Viernes 11:00-12:00'
  ])
  
  // Cache de horarios asignados por id_materia para mantener consistencia dentro de la misma sesión
  const horariosPorMateria = ref(new Map())
  
  // Aulas disponibles
  const aulasLaboratorio = ref(['91L1', '91L2', '91L3', '91L4', '91L5', '91L6', '91L7', '91L8', '91L9', '91L10'])
  const aulasNormales = ref(['201', '202', '301', '302', '401', '402', '501', '502', '601', '602'])
  
  // Cache de aulas asignadas por id_materia (similar a horarios)
  const aulasPorMateria = ref(new Map())
  
  // Aulas ya asignadas en uso (para evitar repeticiones entre grupos activos)
  const aulasAsignadas = ref(new Set())

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
        creditos: null,
        horas_teoria: null,
        horas_practica: null,
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
    if (value && !/^\d+$/.test(value)) return 'El teléfono solo puede contener números'
    if (value && value.length < 10) return 'El teléfono debe tener al menos 10 dígitos'
    if (value && value.length > 15) return 'El teléfono no puede tener más de 15 dígitos'
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
          // Limpiar teléfono para que solo contenga números
          formData.telefono = completeStudent.telefono ? completeStudent.telefono.replace(/[^0-9]/g, '') : ''
          formData.direccion = completeStudent.direccion || ''
          formData.career = getCareerKey(completeStudent.id_carrera)
          formData.semester = completeStudent.semestre_actual ? completeStudent.semestre_actual.toString() : ''
          formData.fechaIngreso = completeStudent.fecha_ingreso ? completeStudent.fecha_ingreso.split('T')[0] : ''
          formData.estatus = completeStudent.estatus || 'Activo'
          formData.observaciones = completeStudent.factores?.[0]?.observaciones || ''
          
          // Cargar materias de la carrera para poder completar datos de grupos
          const carreraId = getCareerId(formData.career)
          if (carreraId) {
            await cargarMateriasPorCarrera(carreraId)
          }
          
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
          
          // Limpiar aulas asignadas antes de cargar
          aulasAsignadas.value.clear()
          aulasPorMateria.value.clear()
          
          // Cargar grupos
          if (completeStudent.grupos && completeStudent.grupos.length > 0) {
            formData.grupos = completeStudent.grupos.map((grupo, index) => {
              // Buscar la materia completa en las materias disponibles
              const materiaCompleta = materiasDisponibles.value.find(m => m.id_materia === grupo.id_materia)
              
              // Si hay materia, generar horarios para ella
              let horarioActual = grupo.horario || ''
              if (grupo.id_materia && materiaCompleta) {
                const horarios = obtenerHorariosParaMateria(index, grupo.id_materia)
                // Si no hay horario guardado, usar el primero disponible
                if (!horarioActual) {
                  horarioActual = horarios[0] || ''
                }
              }
              
              // Procesar aula - si existe, usarla; si no, generar una nueva
              let aulaActual = grupo.aula || ''
              if (grupo.id_materia && materiaCompleta) {
                if (!aulaActual) {
                  // Generar nueva aula para esta materia
                  const grupoTemp = {
                    id_materia: grupo.id_materia,
                    nombre_materia: materiaCompleta.nombre_materia,
                    clave_materia: materiaCompleta.clave_materia,
                    horas_practica: materiaCompleta.horas_practica
                  }
                  aulaActual = obtenerAulaParaMateria(grupo.id_materia, grupoTemp)
                } else {
                  // Marcar aula existente como asignada
                  aulasAsignadas.value.add(aulaActual)
                  aulasPorMateria.value.set(grupo.id_materia, aulaActual)
                }
              }
              
              return {
                id_materia: grupo.id_materia || null,
                nombre_materia: materiaCompleta?.nombre_materia || grupo.nombre_materia || '',
                clave_materia: materiaCompleta?.clave_materia || grupo.clave_materia || '',
                creditos: materiaCompleta?.creditos || grupo.creditos || null,
                horas_teoria: materiaCompleta?.horas_teoria || grupo.horas_teoria || null,
                horas_practica: materiaCompleta?.horas_practica || grupo.horas_practica || null,
                clave_grupo: grupo.clave_grupo || `GRP${String(index + 1).padStart(3, '0')}`,
                semestre: grupo.semestre || '1',
                anio: grupo.anio || new Date().getFullYear(),
                periodo: grupo.periodo || '1',
                horario: horarioActual,
                aula: aulaActual
              }
            })
          } else {
            // Si no hay grupos, mantener uno por defecto
            formData.grupos = [{
              id_materia: null,
              nombre_materia: '',
              clave_materia: '',
              creditos: null,
              horas_teoria: null,
              horas_practica: null,
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
            formData.grades = completeStudent.calificaciones.map(cal => {
              // Asegurar que la calificación sea un número válido y limitarla a 100
              const gradeValue = cal.calificacion ? parseFloat(cal.calificacion) : null
              const finalGrade = gradeValue !== null && !isNaN(gradeValue) 
                ? (gradeValue > 100 ? 100 : gradeValue) 
                : ''
              return {
                name: cal.nombre_materia || 'Materia',
                grade: finalGrade !== '' ? finalGrade.toString() : ''
              }
            })
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
      // Limpiar teléfono para que solo contenga números
      formData.telefono = student.telefono ? student.telefono.replace(/[^0-9]/g, '') : ''
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
      // Limpiar teléfono para que solo contenga números
      formData.telefono = student.telefono ? student.telefono.replace(/[^0-9]/g, '') : ''
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
        promedio_general: (() => {
          const avg = calculateAverage()
          if (!avg || avg === '0.0' || avg === 'NaN' || avg === '') {
            return null
          }
          const numValue = parseFloat(avg)
          // Validar que sea un número válido y esté en el rango permitido (0-100)
          if (isNaN(numValue) || !isFinite(numValue)) {
            return null
          }
          // Asegurar que esté en el rango válido para Decimal(4,2): máximo 99.99
          if (numValue < 0) {
            return 0
          }
          if (numValue > 99.99) {
            return 99.99
          }
          // Redondear a 2 decimales para Decimal(4,2)
          return Math.round(numValue * 100) / 100
        })(),
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
        try {
          const response = await api.put(`/estudiantes/${studentId}`, studentData)
          result = { success: true, data: response.data }
        } catch (error) {
          // Capturar error de la API
          result = { 
            success: false, 
            error: error.response?.data?.message || error.message,
            response: error.response,
            errorDetails: error.response?.data
          }
        }
      } else {
        // Crear nuevo estudiante
        result = await dashboardStore.createStudent(studentData)
      }
      
      console.log('Resultado completo del guardado:', result)
      console.log('Result.success:', result.success)
      console.log('Result.data:', result.data)
      
      // Verificar si el resultado es exitoso
      const isSuccess = result.success === true || (result.data && result.data.success === true)
      
      if (isSuccess) {
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
        console.error('Error al guardar estudiante:', result)
        
        // Extraer el mensaje de error
        let errorDescription = result.error || result.message
        if (!errorDescription && result.errorDetails) {
          errorDescription = result.errorDetails.message || result.errorDetails.error || 'No se pudo guardar el estudiante.'
        }
        if (!errorDescription && result.response?.data) {
          errorDescription = result.response.data.message || result.response.data.error || 'Error al procesar la solicitud.'
        }
        if (!errorDescription) {
          errorDescription = 'No se pudo guardar el estudiante. Por favor, inténtalo de nuevo.'
        }
        
        // Verificar si es un error de duplicado
        const errorData = result.errorDetails || result.response?.data || {}
        const errorMessage = errorData.message || errorDescription || ''
        const fullErrorMessage = result.error || errorMessage // Mensaje completo del error
        
        // Crear una cadena completa del error para buscar patrones
        const fullErrorString = JSON.stringify({ 
          error: errorDescription, 
          fullErrorMessage: fullErrorMessage,
          ...errorData, 
          ...result 
        }).toLowerCase()
        
        console.log('Error completo para detección (else):', fullErrorString)
        console.log('Error message (else):', errorMessage)
        console.log('Full error message (else):', fullErrorMessage)
        
        // Verificar EXACTAMENTE qué campo está duplicado basándose en el mensaje del backend
        const lowerErrorMessage = errorMessage.toLowerCase()
        const lowerFullErrorString = fullErrorString.toLowerCase()
        
        // Verificar si es error de CORREO ELECTRÓNICO (mensaje exacto del backend)
        if (lowerErrorMessage.includes('ya existe un estudiante con este correo electrónico') ||
            (lowerErrorMessage.includes('correo electrónico') && lowerErrorMessage.includes('ya existe') && !lowerErrorMessage.includes('número de control'))) {
          // Establecer el error directamente en el campo del email
          errors.email = 'Ya existe un estudiante con este correo electrónico'
          // Limpiar cualquier error previo del número de control
          errors.controlNumber = ''
          // Enfocar el campo del email y hacer scroll hacia él
          setTimeout(() => {
            const emailInput = document.getElementById('email')
            if (emailInput) {
              emailInput.focus()
              emailInput.select()
              emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }, 100)
        } 
        // Verificar si es error de NÚMERO DE CONTROL (mensaje exacto del backend)
        else if (lowerErrorMessage.includes('ya existe un estudiante con este número de control') ||
                 (lowerErrorMessage.includes('número de control') && lowerErrorMessage.includes('ya existe') && !lowerErrorMessage.includes('correo electrónico')) ||
                 (lowerErrorMessage.includes('numero de control') && lowerErrorMessage.includes('ya existe') && !lowerErrorMessage.includes('correo electrónico'))) {
          // Establecer el error directamente en el campo del número de control
          errors.controlNumber = 'Ya existe un estudiante con este número de control'
          // Limpiar cualquier error previo del email
          errors.email = ''
          // Enfocar el campo del número de control
          setTimeout(() => {
            const controlNumberInput = document.getElementById('controlNumber')
            if (controlNumberInput) {
              controlNumberInput.focus()
              controlNumberInput.select()
            }
          }, 100)
        } else {
          // Para otros errores, mostrar notificación
          const errorTitle = isUpdate ? 'Error al actualizar estudiante' : 'Error al registrar estudiante'
          showError(errorTitle, errorDescription)
        }
      }
      
    } catch (error) {
      console.error('Error al guardar estudiante:', error)
      
      // Extraer el mensaje de error - incluir tanto el mensaje de la respuesta como el mensaje completo del error
      const errorDescription = error.response?.data?.message || error.message || 'No se pudo conectar con el servidor. Por favor, verifica que el backend esté ejecutándose e inténtalo de nuevo.'
      const errorData = error.response?.data || {}
      const errorMessage = errorData.message || errorDescription
      const fullErrorMessage = error.message || errorDescription // Mensaje completo del error que puede incluir detalles de SQL Server
      
      // Crear una cadena completa del error para buscar patrones - incluir el mensaje completo del error
      const fullErrorString = JSON.stringify({
        error: errorDescription,
        message: error.message,
        fullErrorMessage: fullErrorMessage,
        ...errorData,
        response: error.response?.data
      }).toLowerCase()
      
      console.log('Error completo para detección:', fullErrorString)
      console.log('Error message:', errorMessage)
      console.log('Full error message:', fullErrorMessage)
      
      // Verificar EXACTAMENTE qué campo está duplicado basándose en el mensaje del backend
      const lowerErrorMessage = errorMessage.toLowerCase()
      const lowerFullErrorString = fullErrorString.toLowerCase()
      
      // Verificar si es error de CORREO ELECTRÓNICO (mensaje exacto del backend)
      if (lowerErrorMessage.includes('ya existe un estudiante con este correo electrónico') ||
          (lowerErrorMessage.includes('correo electrónico') && lowerErrorMessage.includes('ya existe') && !lowerErrorMessage.includes('número de control'))) {
        // Establecer el error directamente en el campo del email
        errors.email = 'Ya existe un estudiante con este correo electrónico'
        // Limpiar cualquier error previo del número de control
        errors.controlNumber = ''
        // Enfocar el campo del email y hacer scroll hacia él
        setTimeout(() => {
          const emailInput = document.getElementById('email')
          if (emailInput) {
            emailInput.focus()
            emailInput.select()
            emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      } 
      // Verificar si es error de NÚMERO DE CONTROL (mensaje exacto del backend)
      else if (lowerErrorMessage.includes('ya existe un estudiante con este número de control') ||
               (lowerErrorMessage.includes('número de control') && lowerErrorMessage.includes('ya existe') && !lowerErrorMessage.includes('correo electrónico')) ||
               (lowerErrorMessage.includes('numero de control') && lowerErrorMessage.includes('ya existe') && !lowerErrorMessage.includes('correo electrónico'))) {
        // Establecer el error directamente en el campo del número de control
        errors.controlNumber = 'Ya existe un estudiante con este número de control'
        // Limpiar cualquier error previo del email
        errors.email = ''
        // Enfocar el campo del número de control
        setTimeout(() => {
          const controlNumberInput = document.getElementById('controlNumber')
          if (controlNumberInput) {
            controlNumberInput.focus()
            controlNumberInput.select()
          }
        }, 100)
      } else {
        // Para otros errores (conexión, etc.), mostrar notificación
        const errorTitle = isUpdate ? 'Error al actualizar estudiante' : 'Error al registrar estudiante'
        showError(errorTitle, errorDescription)
      }
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

  // Cargar materias cuando cambie la carrera
  const cargarMateriasPorCarrera = async (carreraId) => {
    if (!carreraId) {
      return
    }
    
    try {
      materiasCargando.value = true
      const materias = await fetchMateriasCompletas(carreraId)
      materiasDisponibles.value = materias
    } catch (error) {
      console.error('Error al cargar materias:', error)
      showError('Error al cargar materias disponibles')
    } finally {
      materiasCargando.value = false
    }
  }

  // Watcher para cargar materias cuando cambie la carrera
  watch(() => formData.career, (nuevaCarrera) => {
    if (nuevaCarrera) {
      const carreraId = getCareerId(nuevaCarrera)
      cargarMateriasPorCarrera(carreraId)
    }
  })

  const addGrupo = () => {
    // Generar clave de grupo única
    const siguienteNumero = formData.grupos.length + 1
    const claveGrupo = `GRP${String(siguienteNumero).padStart(3, '0')}`
    
    formData.grupos.push({
      id_materia: null,
      nombre_materia: '',
      clave_materia: '',
      creditos: null,
      horas_teoria: null,
      horas_practica: null,
      clave_grupo: claveGrupo,
      semestre: '1',
      anio: new Date().getFullYear(),
      periodo: '1',
      horario: '', // Se asignará cuando se seleccione la materia
      aula: '' // Se asignará cuando se seleccione la materia
    })
  }

  const removeGrupo = (index) => {
    if (formData.grupos.length > 1) {
      const grupo = formData.grupos[index]
      // Liberar el aula asignada
      const aulaAsignada = grupo.aula
      const materiaId = grupo.id_materia
      
      if (aulaAsignada && materiaId) {
        aulasAsignadas.value.delete(aulaAsignada)
        // Limpiar cache de aula de la materia si ya no se usa en otros grupos
        const sigueEnUso = formData.grupos.some((g, i) => i !== index && g.id_materia === materiaId)
        if (!sigueEnUso) {
          aulasPorMateria.value.delete(materiaId)
        }
      }
      
      formData.grupos.splice(index, 1)
    }
  }

  // Obtener horarios disponibles para una materia (2 opciones aleatorias)
  // Si se pasa materiaId, genera horarios específicos para esa materia
  // Si no, genera horarios aleatorios cada vez
  const obtenerHorariosParaMateria = (materiaIndex, materiaId = null) => {
    // Si se proporciona un materiaId y ya existe en cache, retornar los horarios guardados
    if (materiaId && horariosPorMateria.value.has(materiaId)) {
      return horariosPorMateria.value.get(materiaId)
    }
    
    // Obtener una copia del array de horarios disponibles
    const horariosDisponibles = [...horariosPredefinidos.value]
    
    // Seleccionar 2 horarios aleatorios diferentes
    const horariosSeleccionados = []
    
    // Seleccionar primer horario aleatorio
    const indice1 = Math.floor(Math.random() * horariosDisponibles.length)
    horariosSeleccionados.push(horariosDisponibles[indice1])
    
    // Remover el primer horario para evitar duplicados
    horariosDisponibles.splice(indice1, 1)
    
    // Seleccionar segundo horario aleatorio de los restantes
    const indice2 = Math.floor(Math.random() * horariosDisponibles.length)
    horariosSeleccionados.push(horariosDisponibles[indice2])
    
    // Si se proporciona materiaId, guardar en cache para mantener consistencia
    if (materiaId) {
      horariosPorMateria.value.set(materiaId, horariosSeleccionados)
    }
    
    return horariosSeleccionados
  }
  
  // Verificar si una materia es de inglés
  const esMateriaIngles = (grupo) => {
    if (!grupo) return false
    
    // Verificar por clave de materia (empieza con 'ING')
    const clave = grupo.clave_materia?.toUpperCase() || ''
    if (clave.startsWith('ING')) {
      return true
    }
    
    // Verificar por nombre de materia (contiene "inglés" o "ingles")
    const nombre = grupo.nombre_materia?.toLowerCase() || ''
    if (nombre.includes('inglés') || nombre.includes('ingles') || nombre.includes('english')) {
      return true
    }
    
    return false
  }
  
  // Obtener aula aleatoria para una materia (similar a horarios)
  const obtenerAulaParaMateria = (materiaId, grupo) => {
    if (!materiaId || !grupo) return ''
    
    // Si ya se asignó un aula para esta materia, retornarla (consistencia)
    if (aulasPorMateria.value.has(materiaId)) {
      return aulasPorMateria.value.get(materiaId)
    }
    
    // Las materias de inglés SIEMPRE usan salones normales, nunca laboratorios
    const esIngles = esMateriaIngles(grupo)
    
    // Determinar qué tipo de aulas usar
    let aulasDisponibles = []
    if (esIngles) {
      // Inglés siempre usa salones normales
      aulasDisponibles = [...aulasNormales.value]
    } else {
      // Si la materia tiene horas de práctica, asignar laboratorio
      // Si no, asignar salón normal
      const esLaboratorio = grupo.horas_practica && grupo.horas_practica > 0
      aulasDisponibles = esLaboratorio ? [...aulasLaboratorio.value] : [...aulasNormales.value]
    }
    
    // Filtrar aulas que ya están asignadas a otras materias
    const aulasSinAsignar = aulasDisponibles.filter(aula => !aulasAsignadas.value.has(aula))
    
    // Si hay aulas disponibles sin asignar, seleccionar una aleatoria
    let aulaSeleccionada = ''
    if (aulasSinAsignar.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * aulasSinAsignar.length)
      aulaSeleccionada = aulasSinAsignar[indiceAleatorio]
    } else {
      // Si todas están asignadas, seleccionar una aleatoria de todas las disponibles
      const indiceAleatorio = Math.floor(Math.random() * aulasDisponibles.length)
      aulaSeleccionada = aulasDisponibles[indiceAleatorio]
    }
    
    // Guardar en cache para mantener consistencia
    if (aulaSeleccionada) {
      aulasPorMateria.value.set(materiaId, aulaSeleccionada)
      aulasAsignadas.value.add(aulaSeleccionada)
    }
    
    return aulaSeleccionada
  }
  
  // Asignar aula automáticamente según el tipo de materia (aleatoria)
  const asignarAulaAutomatica = (grupoIndex) => {
    const grupo = formData.grupos[grupoIndex]
    if (!grupo || !grupo.id_materia) return ''
    
    return obtenerAulaParaMateria(grupo.id_materia, grupo)
  }
  
  // Seleccionar materia y llenar datos automáticamente
  const seleccionarMateria = async (grupoIndex, materiaId) => {
    try {
      // Convertir a número si es necesario
      const materiaIdNum = parseInt(materiaId)
      
      const materia = materiasDisponibles.value.find(m => m.id_materia === materiaIdNum)
      
      if (materia && formData.grupos[grupoIndex]) {
        // Remover aula anteriormente asignada si existía
        const materiaAnteriorId = formData.grupos[grupoIndex].id_materia
        const aulaAnterior = formData.grupos[grupoIndex].aula
        if (aulaAnterior && materiaAnteriorId) {
          // Solo liberar si cambiamos de materia
          if (materiaAnteriorId !== materiaIdNum) {
            aulasAsignadas.value.delete(aulaAnterior)
            // Limpiar cache de aula de la materia anterior si ya no se usa
            aulasPorMateria.value.delete(materiaAnteriorId)
          }
        }
        
        // Actualizar los datos del grupo
        formData.grupos[grupoIndex].id_materia = materia.id_materia
        formData.grupos[grupoIndex].nombre_materia = materia.nombre_materia
        formData.grupos[grupoIndex].clave_materia = materia.clave_materia
        formData.grupos[grupoIndex].creditos = materia.creditos
        formData.grupos[grupoIndex].horas_teoria = materia.horas_teoria
        formData.grupos[grupoIndex].horas_practica = materia.horas_practica
        
        // Generar nuevos horarios aleatorios para esta materia específica
        const horarios = obtenerHorariosParaMateria(grupoIndex, materia.id_materia)
        // Asignar el primer horario por defecto
        formData.grupos[grupoIndex].horario = horarios[0]
        
        // Asignar aula automáticamente (usando el sistema de cache por materia)
        formData.grupos[grupoIndex].aula = obtenerAulaParaMateria(materia.id_materia, formData.grupos[grupoIndex])
        
        // Forzar la actualización de la vista
        await nextTick()
      }
    } catch (error) {
      console.error('Error en seleccionarMateria:', error)
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
    // Limpiar aulas asignadas
    aulasAsignadas.value.clear()
    // Limpiar cache de horarios
    horariosPorMateria.value.clear()
    // Limpiar cache de aulas por materia
    aulasPorMateria.value.clear()
    
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
        creditos: null,
        horas_teoria: null,
        horas_practica: null,
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
    getCareerId,
    // Nuevas funciones para materias
    materiasDisponibles,
    materiasCargando,
    cargarMateriasPorCarrera,
    seleccionarMateria,
    // Nuevas funciones para grupos
    opcionesClaveGrupo,
    obtenerHorariosParaMateria
  }
}
