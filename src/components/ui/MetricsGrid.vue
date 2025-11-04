<template>
  <div class="metrics-grid">
    <div class="metric-card clickable" @click="handleStudentsClick">
      <div class="metric-header">
        <div class="metric-icon">👥</div>
        <div class="metric-title">Total Estudiantes</div>
      </div>
      <div class="metric-value">{{ totalStudents }}</div>
      <div class="metric-subtitle">Estudiantes registrados</div>
      <div class="click-hint">Click para ver lista</div>
    </div>
    
    <div class="metric-card">
      <div class="metric-header">
        <div class="metric-icon">⚠️</div>
        <div class="metric-title">Reprobación Promedio</div>
      </div>
      <div class="metric-value">{{ failureRate }}%</div>
      <div class="metric-subtitle">Porcentaje de reprobación</div>
    </div>
    
    <div class="metric-card">
      <div class="metric-header">
        <div class="metric-icon">📉</div>
        <div class="metric-title">Deserción Estimada</div>
      </div>
      <div class="metric-value">{{ dropoutRate }}%</div>
      <div class="metric-subtitle">Estudiantes en riesgo</div>
    </div>
    
    <div class="metric-card">
      <div class="metric-header">
        <div class="metric-icon">✅</div>
        <div class="metric-title">Aprobación Promedio</div>
      </div>
      <div class="metric-value">{{ approvalRate }}%</div>
      <div class="metric-subtitle">Estudiantes aprobados</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

// Definir emits
const emit = defineEmits(['open-students-list'])

const dashboardStore = useDashboardStore()

const totalStudents = computed(() => dashboardStore.metrics.totalStudents)
const failureRate = computed(() => dashboardStore.metrics.failureRate)
const dropoutRate = computed(() => dashboardStore.metrics.dropoutRate)
const approvalRate = computed(() => dashboardStore.metrics.approvalRate)

const handleStudentsClick = () => {
  console.log('Clic en Total Estudiantes detectado')
  emit('open-students-list')
}
</script>

<style scoped>
/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease, border-color 0.3s ease;
}

/* Dark mode styles */
.dark .metric-card {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.metric-card.clickable {
  cursor: pointer;
  position: relative;
}

.metric-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
}

.dark .metric-card.clickable:hover {
  background: linear-gradient(135deg, #1e293b, #334155);
}

.click-hint {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.metric-card.clickable:hover .click-hint {
  opacity: 1;
}

.dark .click-hint {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.metric-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color 0.3s ease;
}

.dark .metric-title {
  color: #94a3b8;
}

.metric-value {
  font-size: 2.25rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1;
  transition: color 0.3s ease;
}

.dark .metric-value {
  color: #f1f5f9;
}

.metric-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
  transition: color 0.3s ease;
}

.dark .metric-subtitle {
  color: #94a3b8;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.trend-up {
  color: #059669;
}

.trend-down {
  color: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
