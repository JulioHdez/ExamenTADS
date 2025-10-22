<template>
  <div class="charts-section">
    <h2 class="charts-title">Análisis de Datos</h2>
    
    <!-- Controles de Filtro Global -->
    <div class="filter-controls">
      <div class="filter-group">
        <label class="filter-label">Período Académico:</label>
        <select v-model="selectedPeriod" class="filter-select">
          <option value="all">Todos los períodos</option>
          <option value="2025-1">Agosto-Diciembre 2025</option>
          <option value="2026-1">Enero-Mayo 2026</option>
          <option value="2026-2">Agosto-Diciembre 2026</option>
          <option value="2027-1">Enero-Mayo 2027</option>
          <option value="2027-2">Agosto-Diciembre 2027</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Mes:</label>
        <select v-model="selectedMonth" class="filter-select">
          <option value="">Seleccionar mes</option>
          <option v-for="month in monthOptions" :key="month.value" :value="month.value">
            {{ month.label }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label" :class="{ 'disabled-label': !selectedMonth }">
          Día:
          <span v-if="!selectedMonth" class="disabled-hint">(Selecciona un mes primero)</span>
        </label>
        <select v-model="selectedDay" class="filter-select" :disabled="!selectedMonth">
          <option value="">Seleccionar día</option>
          <option v-for="day in dayOptions" :key="day" :value="day">
            {{ day }}
          </option>
        </select>
      </div>
    </div>
    
    <div class="charts-grid">
      <!-- Gráfico de Barras -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Distribución por Período Académico</h3>
          <select v-model="selectedPeriod" class="period-select">
            <option value="all">Todos los períodos</option>
            <option value="2025-1">Agosto-Diciembre 2025</option>
            <option value="2026-1">Enero-Mayo 2026</option>
            <option value="2026-2">Agosto-Diciembre 2026</option>
            <option value="2027-1">Enero-Mayo 2027</option>
            <option value="2027-2">Agosto-Diciembre 2027</option>
          </select>
        </div>
        <div class="chart-container">
          <div class="simple-chart">
            <div v-for="(value, index) in chartData" :key="index" class="chart-bar">
              <div class="bar" :style="{ height: (value / Math.max(...chartData)) * 150 + 'px' }"></div>
              <div class="bar-label">{{ periodLabels[index] }}</div>
              <div class="bar-value">{{ value }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico de Dispersión -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Análisis de Dispersión</h3>
          <div class="chart-controls">
            <select class="control-select">
              <option value="attendance">Asistencia</option>
              <option value="grades">Promedio Notas</option>
              <option value="period">Período Académico</option>
            </select>
            <select class="control-select">
              <option value="grades">Promedio Notas</option>
              <option value="attendance">Asistencia</option>
              <option value="period">Período Académico</option>
            </select>
          </div>
        </div>
        <div class="chart-container">
          <div class="scatter-chart">
            <div class="scatter-points">
              <div v-for="(point, index) in scatterData" :key="index" 
                   class="scatter-point" 
                   :style="{ 
                     left: (point.x / 100) * 100 + '%', 
                     bottom: (point.y / 100) * 100 + '%' 
                   }">
              </div>
            </div>
            <div class="scatter-labels">
              <div class="x-label">Variable X</div>
              <div class="y-label">Variable Y</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico de Pastel -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Distribución por Estado Académico</h3>
          <div class="chart-controls">
            <select class="control-select">
              <option value="academic-status">Por Estado Académico</option>
              <option value="career">Por Carrera</option>
              <option value="period">Por Período Académico</option>
            </select>
          </div>
        </div>
        <div class="chart-container">
          <div class="pie-chart">
            <div class="pie-chart-container" :style="pieChartStyle">
              <!-- Gráfico de pastel dinámico -->
            </div>
            <div class="pie-legend">
              <div v-for="(item, index) in pieChartData" :key="item.status" class="legend-item">
                <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
                <span class="legend-label">{{ item.status }}</span>
                <span class="legend-value">{{ item.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico de Líneas -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Tendencia de Rendimiento</h3>
          <div class="chart-controls">
            <select class="control-select">
              <option value="monthly">Mensual</option>
              <option value="period">Por Período Académico</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
        </div>
        <div class="chart-container">
          <div class="line-chart">
            <div class="line-chart-container">
              <svg viewBox="0 0 400 200" class="line-svg">
                <polyline
                  :points="lineChartPoints"
                  fill="none"
                  stroke="#3b82f6"
                  stroke-width="3"
                />
                <circle v-for="(point, index) in lineChartData" :key="index"
                  :cx="point.x"
                  :cy="point.y"
                  r="4"
                  fill="#3b82f6"
                  class="line-point"
                />
              </svg>
              <div class="line-labels">
                <div v-for="(label, index) in lineChartLabels" :key="index" class="line-label">
                  {{ label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDashboardData } from '@/composables/useDashboardData'

const {
  selectedPeriod,
  selectedMonth,
  selectedDay,
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
  pieChartStyle
} = useDashboardData()
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
}

.disabled-label {
  color: #9ca3af;
}

.disabled-hint {
  font-size: 0.75rem;
  font-weight: 400;
  color: #6b7280;
  font-style: italic;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  min-width: 150px;
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

.charts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 400px;
  display: flex;
  flex-direction: column;
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
}

.chart-container {
  height: 250px;
  position: relative;
  flex: 1;
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
}

.bar-value {
  font-size: 0.75rem;
  color: #374151;
  font-weight: 600;
}

/* Scatter Chart */
.scatter-chart {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.scatter-points {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 1rem;
}

.scatter-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  transition: all 0.3s ease;
}

.scatter-point:hover {
  background: #1d4ed8;
  transform: translate(-50%, 50%) scale(1.5);
}

.scatter-labels {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
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
  width: 120px;
  height: 120px;
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
