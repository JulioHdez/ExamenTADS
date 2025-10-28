import { defineStore } from 'pinia'
import api from '@/services/api'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    loading: false,
    students: [],
    metrics: {
      totalStudents: 0,
      failureRate: 0,
      dropoutRate: 0,
      approvalRate: 0
    },
    chartData: {
      labels: [],
      datasets: []
    },
    filters: {
      academicPeriod: 'all',
      career: 'all',
      dateRange: 'all'
    }
  }),

  getters: {
    isLoading: (state) => state.loading,
    getStudentsByAcademicPeriod: (state) => (period) => {
      if (period === 'all') return state.students
      return state.students.filter(student => student.semestre_actual == period)
    },
    getStudentsByCareer: (state) => (career) => {
      if (career === 'all') return state.students
      return state.students.filter(student => student.nombre_carrera === career || student.id_carrera == career)
    },
    getChartData: (state) => {
      const periodData = {}
      
      // Agrupar estudiantes por semestre actual
      state.students.forEach(student => {
        const semestre = student.semestre_actual || 'Sin semestre'
        periodData[semestre] = (periodData[semestre] || 0) + 1
      })
      
      const labels = Object.keys(periodData).sort((a, b) => parseInt(a) - parseInt(b))
      const data = labels.map(label => periodData[label])
      
      return {
        labels: labels.map(label => `Semestre ${label}`),
        datasets: [{
          label: 'Estudiantes',
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }]
      }
    }
  },

  actions: {
    async fetchStudents() {
      this.loading = true
      console.log('fetchStudents llamado')
      try {
        const response = await api.get('/estudiantes/with-carreras')
        console.log('Respuesta de la API:', response.data)
        
        // Verificar si la respuesta tiene la estructura esperada
        if (response.data && response.data.success && response.data.data) {
          this.students = response.data.data
        } else {
          this.students = response.data || []
        }
        
        console.log('Estudiantes cargados:', this.students.length)
        console.log('Primeros 3 estudiantes:', this.students.slice(0, 3))
        
        // Obtener estadísticas del backend
        await this.fetchStats()
        
        // Si fetchStats no cargó métricas, calcular localmente
        if (!this.metrics || this.metrics.totalStudents === 0) {
          console.log('Recalculando métricas localmente...')
          this.calculateMetrics()
        }
      } catch (error) {
        console.error('Error fetching students:', error)
        // Datos de ejemplo para desarrollo
        console.log('Cargando datos de ejemplo...')
        this.loadMockData()
      } finally {
        this.loading = false
      }
    },

    async fetchStats() {
      try {
        const response = await api.get('/estudiantes/stats')
        console.log('Estadísticas desde backend:', response.data)
        
        if (response.data && response.data.success && response.data.data) {
          const stats = response.data.data[0] // El resultado viene como array
          console.log('Datos de stats:', stats)
          
          // Convertir valores a números y manejar null/undefined
          // Manejar si viene como decimal
          const total = Math.floor(parseFloat(stats.total_estudiantes || 0))
          const aprobados = Math.floor(parseFloat(stats.aprobados || 0))
          const reprobados = Math.floor(parseFloat(stats.reprobados || 0))
          const desercion = Math.floor(parseFloat(stats.desercion || 0))
          
          console.log('Valores procesados:', { total, aprobados, reprobados, desercion })
          
          if (total > 0) {
            this.metrics = {
              totalStudents: total,
              failureRate: Math.round((reprobados / total) * 100),
              dropoutRate: Math.round((desercion / total) * 100),
              approvalRate: Math.round((aprobados / total) * 100)
            }
            console.log('Métricas calculadas:', this.metrics)
          } else {
            // Si no hay estudiantes, establecer valores a 0
            this.metrics = {
              totalStudents: 0,
              failureRate: 0,
              dropoutRate: 0,
              approvalRate: 0
            }
          }
        } else {
          console.log('Respuesta del backend no válida, calculando localmente')
          this.calculateMetrics()
        }
      } catch (error) {
        console.error('Error fetching stats from backend, calculating locally:', error)
        this.calculateMetrics()
      }
    },

    async createStudent(studentData) {
      try {
        // Usar el endpoint completo que maneja factores y calificaciones
        const response = await api.post('/estudiantes/complete', studentData)
        const newStudent = response.data.data || response.data
        this.students.push(newStudent)
        await this.fetchStats()
        return { success: true, data: newStudent }
      } catch (error) {
        console.error('Error creating student:', error)
        return { 
          success: false, 
          error: error.response?.data?.message || 'Error al crear estudiante' 
        }
      }
    },

    async updateStudent(id, studentData) {
      try {
        const response = await api.put(`/estudiantes/${id}`, studentData)
        const updatedStudent = response.data.data || response.data
        const index = this.students.findIndex(s => s.id_estudiante === id || s.id === id)
        if (index !== -1) {
          this.students[index] = updatedStudent
        }
        await this.fetchStats()
        return { success: true, data: updatedStudent }
      } catch (error) {
        console.error('Error updating student:', error)
        return { 
          success: false, 
          error: error.response?.data?.message || 'Error al actualizar estudiante' 
        }
      }
    },

    async deleteStudent(id) {
      try {
        await api.delete(`/estudiantes/${id}`)
        this.students = this.students.filter(s => s.id_estudiante !== id && s.id !== id)
        await this.fetchStats()
        return { success: true }
      } catch (error) {
        console.error('Error deleting student:', error)
        return { 
          success: false, 
          error: error.response?.data?.message || 'Error al eliminar estudiante' 
        }
      }
    },

    calculateMetrics() {
      const total = this.students.length
      console.log('Calculando métricas para', total, 'estudiantes')
      
      if (total === 0) {
        console.log('No hay estudiantes, estableciendo métricas en 0')
        this.metrics = {
          totalStudents: 0,
          failureRate: 0,
          dropoutRate: 0,
          approvalRate: 0
        }
        return
      }

      // Usar los campos reales de la base de datos
      // Las calificaciones están en escala 0-100, >= 70 es aprobado
      const approved = this.students.filter(s => {
        const promedio = parseFloat(s.promedio_general || 0)
        return promedio >= 70
      }).length
      
      const failed = this.students.filter(s => {
        const promedio = parseFloat(s.promedio_general || 0)
        return promedio < 70 && promedio > 0
      }).length
      
      const atRisk = this.students.filter(s => s.estatus === 'Baja temporal' || s.estatus === 'Baja definitiva').length

      const metrics = {
        totalStudents: total,
        failureRate: Math.round((failed / total) * 100),
        dropoutRate: Math.round((atRisk / total) * 100),
        approvalRate: Math.round((approved / total) * 100)
      }
      
      console.log('Métricas calculadas:', metrics)
      this.metrics = metrics
    },

    setFilter(filterType, value) {
      this.filters[filterType] = value
    },

    loadMockData() {
      console.log('Cargando datos de ejemplo...')
      // Datos de ejemplo para desarrollo con fechas de inscripción
      const currentDate = new Date()
      const getRandomDate = (monthsAgo) => {
        const date = new Date(currentDate)
        date.setMonth(date.getMonth() - monthsAgo)
        return date.toISOString().split('T')[0]
      }
      
      this.students = [
        { id: 1, name: 'Juan Pérez', career: 'Ingeniería', academicPeriod: '2025-1', averageGrade: 8.5, riskFactors: [], enrollmentDate: getRandomDate(2) },
        { id: 2, name: 'María García', career: 'Medicina', academicPeriod: '2025-1', averageGrade: 7.2, riskFactors: ['Académico'], enrollmentDate: getRandomDate(4) },
        { id: 3, name: 'Carlos López', career: 'Derecho', academicPeriod: '2026-1', averageGrade: 6.8, riskFactors: [], enrollmentDate: getRandomDate(6) },
        { id: 4, name: 'Ana Martínez', career: 'Administración', academicPeriod: '2025-1', averageGrade: 9.1, riskFactors: [], enrollmentDate: getRandomDate(1) },
        { id: 5, name: 'Luis Rodríguez', career: 'Ingeniería', academicPeriod: '2026-1', averageGrade: 5.5, riskFactors: ['Económico', 'Psicosocial'], enrollmentDate: getRandomDate(8) },
        { id: 6, name: 'Sofia Herrera', career: 'Medicina', academicPeriod: '2025-1', averageGrade: 8.9, riskFactors: [], enrollmentDate: getRandomDate(3) },
        { id: 7, name: 'Diego Silva', career: 'Derecho', academicPeriod: '2026-2', averageGrade: 7.5, riskFactors: ['Institucional'], enrollmentDate: getRandomDate(10) },
        { id: 8, name: 'Valentina Cruz', career: 'Administración', academicPeriod: '2026-1', averageGrade: 6.2, riskFactors: ['Contextual'], enrollmentDate: getRandomDate(5) },
        { id: 9, name: 'Roberto Vega', career: 'Ingeniería', academicPeriod: '2025-1', averageGrade: 7.8, riskFactors: [], enrollmentDate: getRandomDate(3) },
        { id: 10, name: 'Carmen Ruiz', career: 'Medicina', academicPeriod: '2025-1', averageGrade: 8.2, riskFactors: [], enrollmentDate: getRandomDate(1) }
      ]
      console.log('Datos de ejemplo cargados:', this.students.length, 'estudiantes')
      this.calculateMetrics()
      console.log('Métricas calculadas:', this.metrics)
    }
  }
})
