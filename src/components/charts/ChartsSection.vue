<template>
  <div class="charts-section">
    <h2 class="charts-title">Análisis de Datos</h2>
    
    <div class="charts-grid">
      <!-- Gráfico de Barras -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Distribución por Semestre</h3>
          <select v-model="barChartSemester" class="period-select">
            <option value="">Todos los Semestres</option>
            <option v-for="sem in availableSemesters" :key="sem" :value="sem">
              Semestre {{ sem }}
            </option>
          </select>
        </div>
        <div class="chart-container">
          <BarChartApex 
            :data="barChartData"
            :labels="periodLabels"
            title="Distribución por Semestre"
          />
        </div>
      </div>

      <!-- Gráfico de Pastel -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Distribución por Estado Académico</h3>
          <select v-model="pieChartSemester" class="period-select">
            <option value="">Todos los Semestres</option>
            <option v-for="sem in availableSemesters" :key="sem" :value="sem">
              Semestre {{ sem }}
            </option>
          </select>
        </div>
        <div class="chart-container">
          <PieChartApex 
            :data="pieChartDataFiltered"
            title="Distribución por Estado Académico"
          />
        </div>
      </div>

      <!-- Gráfico de Líneas -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Tendencia de Rendimiento</h3>
          <select v-model="lineChartSemester" class="period-select">
            <option value="">Todos los Semestres</option>
            <option v-for="sem in availableSemesters" :key="sem" :value="sem">
              Semestre {{ sem }}
            </option>
          </select>
        </div>
        <div class="chart-container">
          <LineChartApex 
            :data="lineChartDataFiltered"
            :labels="lineChartLabelsFiltered"
            title="Tendencia de Rendimiento"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDashboardData } from '@/composables/useDashboardData'
import BarChartApex from './BarChartApex.vue'
import PieChartApex from './PieChartApex.vue'
import LineChartApex from './LineChartApex.vue'

const {
  filteredStudents
} = useDashboardData()

// Variables reactivas para los selectores
const barChartSemester = ref('')
const pieChartSemester = ref('')
const lineChartSemester = ref('')

// Etiquetas para los gráficos
const periodLabels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8', 'Sem 9', 'Sem 10', 'Sem 11', 'Sem 12']
const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// Obtener semestres disponibles
const availableSemesters = computed(() => {
  const semesters = new Set()
  filteredStudents.value.forEach(student => {
    if (student.semestre_actual) {
      semesters.add(student.semestre_actual)
    }
  })
  return Array.from(semesters).sort((a, b) => parseInt(a) - parseInt(b))
})

// Filtrar estudiantes según el semestre seleccionado en cada gráfico
const filteredForBarChart = computed(() => {
  if (!barChartSemester.value) return filteredStudents.value
  return filteredStudents.value.filter(s => s.semestre_actual == barChartSemester.value)
})

const filteredForPieChart = computed(() => {
  if (!pieChartSemester.value) return filteredStudents.value
  return filteredStudents.value.filter(s => s.semestre_actual == pieChartSemester.value)
})

const filteredForLineChart = computed(() => {
  if (!lineChartSemester.value) return filteredStudents.value
  return filteredStudents.value.filter(s => s.semestre_actual == lineChartSemester.value)
})

// Datos para el gráfico de barras (por semestre)
const barChartData = computed(() => {
  const semestreData = {}
  filteredForBarChart.value.forEach(student => {
    const semestre = student.semestre_actual || 'Sin semestre'
    semestreData[semestre] = (semestreData[semestre] || 0) + 1
  })
  
  const semestres = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  return semestres.map(semestre => semestreData[semestre] || 0)
})

// Datos para el gráfico de pastel
const pieChartDataFiltered = computed(() => {
  const total = filteredForPieChart.value.length
  
  if (total === 0) {
    return []
  }
  
  const approved = filteredForPieChart.value.filter(student => {
    const promedio = parseFloat(student.promedio_general || 0)
    return promedio >= 70
  }).length
  
  const failed = filteredForPieChart.value.filter(student => {
    const promedio = parseFloat(student.promedio_general || 0)
    return promedio < 70 && promedio > 0
  }).length
  
  const atRisk = filteredForPieChart.value.filter(student => 
    student.estatus === 'Baja temporal' || student.estatus === 'Baja definitiva'
  ).length
  
  return [
    {
      status: 'Aprobados',
      count: approved,
      percentage: Math.round((approved / total) * 100),
      color: '#10b981'
    },
    {
      status: 'Reprobados',
      count: failed,
      percentage: Math.round((failed / total) * 100),
      color: '#ef4444'
    },
    {
      status: 'Deserción',
      count: atRisk,
      percentage: Math.round((atRisk / total) * 100),
      color: '#f59e0b'
    }
  ].filter(item => item.count > 0)
})

// Estilo del gráfico de pastel
const pieChartStyleFiltered = computed(() => {
  if (pieChartDataFiltered.value.length === 0) {
    return { background: '#f3f4f6' }
  }
  
  let conicGradient = ''
  let currentAngle = 0
  
  pieChartDataFiltered.value.forEach((item, index) => {
    const percentage = item.percentage
    const angle = (percentage / 100) * 360
    const color = item.color
    
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

// Datos para el gráfico de líneas
const lineChartDataFiltered = computed(() => {
  const monthlyData = {}
  filteredForLineChart.value.forEach((student, index) => {
    const month = (index % 12) + 1
    if (!monthlyData[month]) {
      monthlyData[month] = { total: 0, approved: 0 }
    }
    monthlyData[month].total += 1
    const promedio = parseFloat(student.promedio_general || 0)
    if (promedio >= 70) {
      monthlyData[month].approved += 1
    }
  })
  
  return months.map((month, index) => {
    const monthData = monthlyData[index + 1] || { total: 0, approved: 0 }
    const approvalRate = monthData.total > 0 ? (monthData.approved / monthData.total) * 100 : 0
    return {
      x: 50 + (index * 30),
      y: 300 - (approvalRate * 2),
      month,
      rate: Math.round(approvalRate)
    }
  })
})

const lineChartLabelsFiltered = computed(() => {
  return lineChartDataFiltered.value.map(item => item.month)
})

const lineChartPointsFiltered = computed(() => {
  return lineChartDataFiltered.value.map(point => `${point.x},${point.y}`).join(' ')
})

</script>

<style scoped>
/* Charts Section */
.charts-section {
  margin-bottom: 2rem;
}

.charts-title {
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
  transition: color 0.3s ease;
}

.dark .charts-title {
  color: #f1f5f9;
}

/* Filter Controls */
.filter-controls {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.dark .filter-controls {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.dark .filter-label {
  color: #e2e8f0;
}

.disabled-label {
  color: #9ca3af;
}

.dark .disabled-label {
  color: #64748b;
}

.disabled-hint {
  font-size: 0.75rem;
  font-weight: 400;
  color: #6b7280;
  font-style: italic;
}

.dark .disabled-hint {
  color: #94a3b8;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  min-width: 150px;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.dark .filter-select {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

.dark .filter-select:disabled {
  background-color: #475569;
  color: #64748b;
  border-color: #6b7280;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease, border-color 0.3s ease;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.dark .chart-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  transition: color 0.3s ease;
}

.dark .chart-header h3 {
  color: #f1f5f9;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.period-select,
.control-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  min-width: 120px;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.dark .period-select,
.dark .control-select {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

.chart-container {
  min-height: 350px;
  position: relative;
  flex: 1;
  overflow: hidden;
}

/* Bar Chart */
.simple-chart {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 100%;
  padding: 1rem 0;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: 60px;
}

.bar {
  width: 30px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 4px 4px 0 0;
  min-height: 10px;
  transition: all 0.3s ease;
}

.bar:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
}

.bar-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  transition: color 0.3s ease;
}

.dark .bar-label {
  color: #94a3b8;
}

.bar-value {
  font-size: 0.75rem;
  color: #374151;
  font-weight: 600;
  transition: color 0.3s ease;
}

.dark .bar-value {
  color: #f1f5f9;
}

/* Pie Chart */
.pie-chart {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 1rem;
}

.pie-chart-container {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(
    #3b82f6 0deg 144deg,
    #10b981 144deg 252deg,
    #f59e0b 252deg 324deg,
    #ef4444 324deg 360deg
  );
  flex-shrink: 0;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 200px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #374151;
  transition: color 0.3s ease;
}

.dark .legend-item {
  color: #f1f5f9;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  font-weight: 500;
}

.legend-value {
  font-weight: 600;
  color: #1f2937;
  transition: color 0.3s ease;
}

.dark .legend-value {
  color: #f1f5f9;
}

/* Line Chart */
.line-chart {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.line-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.line-svg {
  width: 100%;
  height: 100%;
}

.line-point {
  transition: all 0.3s ease;
}

.line-point:hover {
  r: 6;
  fill: #1d4ed8;
}

.line-labels {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
}

.line-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  transition: color 0.3s ease;
}

.dark .line-label {
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .filter-select {
    width: 100%;
    min-width: auto;
  }
  
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .chart-header h3 {
    font-size: 1rem;
  }
  
  .chart-controls {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }
  
  .control-select {
    width: 100%;
    font-size: 0.75rem;
  }
  
  .chart-container {
    height: 200px;
  }
  
  .pie-chart-container {
    width: 100px;
    height: 100px;
  }
  
  .pie-legend {
    max-width: 150px;
  }
  
  .legend-item {
    font-size: 0.7rem;
  }
  
  .chart-card {
    min-height: 300px;
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-card {
    min-height: 250px;
  }
  
  .chart-container {
    height: 180px;
  }
}
</style>
