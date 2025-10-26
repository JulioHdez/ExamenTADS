import { ref, computed, onMounted, watch } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

export function useDashboardData() {
  const dashboardStore = useDashboardStore()

  // Form data
  const selectedPeriod = ref('all')
  const selectedMonth = ref('')
  const selectedDay = ref('')

  // Computed properties
  const totalStudents = computed(() => dashboardStore.metrics.totalStudents)
  const failureRate = computed(() => dashboardStore.metrics.failureRate)
  const dropoutRate = computed(() => dashboardStore.metrics.dropoutRate)
  const approvalRate = computed(() => dashboardStore.metrics.approvalRate)

  // Filtered students based on current filters
  const filteredStudents = computed(() => {
    let students = dashboardStore.students
    
    // Filtrar por período académico (semestre)
    if (selectedPeriod.value !== 'all') {
      students = students.filter(student => student.semestre_actual == selectedPeriod.value)
    }
    
    // Filtrar por mes
    if (selectedMonth.value) {
      students = students.filter(student => {
        const studentMonth = new Date(student.fecha_ingreso || new Date()).getMonth() + 1
        return studentMonth === parseInt(selectedMonth.value)
      })
    }
    
    // Filtrar por día
    if (selectedDay.value) {
      students = students.filter(student => {
        const studentDay = new Date(student.fecha_ingreso || new Date()).getDate()
        return studentDay === parseInt(selectedDay.value)
      })
    }
    
    return students
  })

  // Bar chart data - distribución por semestre
  const chartData = computed(() => {
    const periodData = {}
    filteredStudents.value.forEach(student => {
      const semestre = student.semestre_actual || 'Sin semestre'
      periodData[semestre] = (periodData[semestre] || 0) + 1
    })
    
    // Mapear los semestres a índices para el gráfico
    const semestres = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    return semestres.map(semestre => periodData[semestre] || 0)
  })

  // Etiquetas para el gráfico de barras
  const periodLabels = computed(() => {
    return ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8', 'Sem 9', 'Sem 10', 'Sem 11', 'Sem 12']
  })

  // Scatter chart data - correlación entre notas y asistencia
  const scatterData = computed(() => {
    return filteredStudents.value.map(student => ({
      x: (student.promedio_general || 0) * 10, // Convertir a escala 0-100
      y: Math.random() * 100, // Simular asistencia
      period: student.semestre_actual,
      name: `${student.nombre} ${student.apellido_paterno}`
    }))
  })

  // Pie chart data - distribución por estado académico
  const pieChartData = computed(() => {
    const total = filteredStudents.value.length
    
    if (total === 0) {
      return []
    }
    
    const approved = filteredStudents.value.filter(student => (student.promedio_general || 0) >= 6).length
    const failed = filteredStudents.value.filter(student => (student.promedio_general || 0) < 6 && (student.promedio_general || 0) > 0).length
    const atRisk = filteredStudents.value.filter(student => student.estatus === 'Baja temporal' || student.estatus === 'Baja definitiva').length
    
    return [
      {
        status: 'Aprobados',
        count: approved,
        percentage: Math.round((approved / total) * 100),
        color: '#10b981' // Verde
      },
      {
        status: 'Reprobados',
        count: failed,
        percentage: Math.round((failed / total) * 100),
        color: '#ef4444' // Rojo
      },
      {
        status: 'Deserción',
        count: atRisk,
        percentage: Math.round((atRisk / total) * 100),
        color: '#f59e0b' // Amarillo/Naranja
      }
    ].filter(item => item.count > 0) // Solo mostrar categorías con estudiantes
  })

  // Line chart data - tendencia de rendimiento por mes
  const lineChartData = computed(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const monthlyData = {}
    
    // Simular datos mensuales basados en los estudiantes filtrados
    filteredStudents.value.forEach((student, index) => {
      const month = (index % 12) + 1
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, approved: 0 }
      }
      monthlyData[month].total += 1
      if ((student.promedio_general || 0) >= 6) {
        monthlyData[month].approved += 1
      }
    })
    
    return months.map((month, index) => {
      const monthData = monthlyData[index + 1] || { total: 0, approved: 0 }
      const approvalRate = monthData.total > 0 ? (monthData.approved / monthData.total) * 100 : 0
      return {
        x: 50 + (index * 30),
        y: 200 - (approvalRate * 1.5),
        month,
        rate: Math.round(approvalRate)
      }
    })
  })

  const lineChartLabels = computed(() => {
    return lineChartData.value.map(item => item.month)
  })

  const lineChartPoints = computed(() => {
    return lineChartData.value.map(point => `${point.x},${point.y}`).join(' ')
  })

  // Month options for dropdown
  const monthOptions = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ]

  // Day options for dropdown (1-31)
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1)

  // Watch for month changes to reset day selection
  watch(selectedMonth, (newMonth) => {
    if (!newMonth) {
      selectedDay.value = ''
    }
  })

  // Pie chart style computed
  const pieChartStyle = computed(() => {
    if (pieChartData.value.length === 0) {
      return { background: '#f3f4f6' }
    }
    
    let conicGradient = ''
    let currentAngle = 0
    
    pieChartData.value.forEach((item, index) => {
      const percentage = item.percentage
      const angle = (percentage / 100) * 360
      const color = item.color // Usar el color específico del estado
      
      if (index === 0) {
        conicGradient = `${color} 0deg ${angle}deg`
      } else {
        conicGradient += `, ${color} ${currentAngle}deg ${currentAngle + angle}deg`
      }
      
      currentAngle += angle
    })
    
    return {
      background: `conic-gradient(${conicGradient})`
    }
  })

  // Initialize data
  const initializeData = () => {
    console.log('Dashboard montado, cargando datos...')
    dashboardStore.fetchStudents()
  }

  return {
    // State
    selectedPeriod,
    selectedMonth,
    selectedDay,
    
    // Computed
    totalStudents,
    failureRate,
    dropoutRate,
    approvalRate,
    filteredStudents,
    chartData,
    periodLabels,
    scatterData,
    pieChartData,
    lineChartData,
    lineChartLabels,
    lineChartPoints,
    monthOptions,
    dayOptions,
    pieChartStyle,
    
    // Methods
    initializeData
  }
}
