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
    
    // Filtrar por período académico
    if (selectedPeriod.value !== 'all') {
      students = students.filter(student => student.academicPeriod === selectedPeriod.value)
    }
    
    // Filtrar por mes
    if (selectedMonth.value) {
      students = students.filter(student => {
        const studentMonth = new Date(student.enrollmentDate || new Date()).getMonth() + 1
        return studentMonth === parseInt(selectedMonth.value)
      })
    }
    
    // Filtrar por día
    if (selectedDay.value) {
      students = students.filter(student => {
        const studentDay = new Date(student.enrollmentDate || new Date()).getDate()
        return studentDay === parseInt(selectedDay.value)
      })
    }
    
    return students
  })

  // Bar chart data - distribución por período académico
  const chartData = computed(() => {
    const periodData = {}
    filteredStudents.value.forEach(student => {
      periodData[student.academicPeriod] = (periodData[student.academicPeriod] || 0) + 1
    })
    
    // Mapear los períodos a índices para el gráfico
    const periods = ['2025-1', '2026-1', '2026-2', '2027-1', '2027-2']
    return periods.map(period => periodData[period] || 0)
  })

  // Etiquetas para el gráfico de barras
  const periodLabels = computed(() => {
    return ['Ago-Dic 2025', 'Ene-May 2026', 'Ago-Dic 2026', 'Ene-May 2027', 'Ago-Dic 2027']
  })

  // Scatter chart data - correlación entre notas y asistencia
  const scatterData = computed(() => {
    return filteredStudents.value.map(student => ({
      x: student.averageGrade * 10, // Convertir a escala 0-100
      y: Math.random() * 100, // Simular asistencia
      period: student.academicPeriod,
      name: student.name
    }))
  })

  // Pie chart data - distribución por estado académico
  const pieChartData = computed(() => {
    const total = filteredStudents.value.length
    
    if (total === 0) {
      return []
    }
    
    const approved = filteredStudents.value.filter(student => student.averageGrade >= 6).length
    const failed = filteredStudents.value.filter(student => student.averageGrade < 6).length
    const atRisk = filteredStudents.value.filter(student => student.riskFactors && student.riskFactors.length > 0).length
    
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
      if (student.averageGrade >= 6) {
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
