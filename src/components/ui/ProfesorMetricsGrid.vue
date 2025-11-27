<template>
  <div class="profesor-metrics-grid">
    <!-- Card de Mis Materias -->
    <div class="metric-card clickable" @click="handleMateriasClick">
      <div class="metric-header">
        <div class="metric-icon">📚</div>
        <div class="metric-title">Mis Materias</div>
      </div>
      <div class="metric-description">
        Consulta todas las materias asignadas a tu carrera con detalles completos
      </div>
      <div class="metric-features">
        <span class="feature-tag">Ordenamiento</span>
        <span class="feature-tag">Búsqueda</span>
        <span class="feature-tag">Filtros</span>
      </div>
      <div class="click-hint">Click para abrir</div>
    </div>
    
    <!-- Card de Mis Estudiantes -->
    <div class="metric-card clickable" @click="handleEstudiantesClick">
      <div class="metric-header">
        <div class="metric-icon">👥</div>
        <div class="metric-title">Mis Estudiantes</div>
      </div>
      <div class="metric-description">
        Visualiza los estudiantes de Ingenieria en Sistemas inscritos en tus materias
      </div>
      <div class="metric-features">
        <span class="feature-tag">Ing. Sistemas</span>
        <span class="feature-tag">Búsqueda</span>
        <span class="feature-tag">Lista completa</span>
      </div>
      <div class="click-hint">Click para abrir</div>
    </div>
    
    <!-- Card de Calificaciones -->
    <div class="metric-card clickable" @click="handleCalificacionesClick">
      <div class="metric-header">
        <div class="metric-icon">📝</div>
        <div class="metric-title">Calificaciones</div>
      </div>
      <div class="metric-description">
        Gestiona y consulta las calificaciones de tus estudiantes por materia y unidad
      </div>
      <div class="metric-features">
        <span class="feature-tag">Por materia</span>
        <span class="feature-tag">Por unidad</span>
        <span class="feature-tag">Código de colores</span>
      </div>
      <div class="click-hint">Click para abrir</div>
    </div>
    
    <!-- Card de Información del Profesor -->
    <div class="metric-card">
      <div class="metric-header">
        <div class="metric-icon">👤</div>
        <div class="metric-title">Información Personal</div>
      </div>
      <div class="metric-info">
        <div class="info-row">
          <span class="info-label">Carrera:</span>
          <span class="info-value">{{ userInfo?.nombre_carrera || 'No asignada' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Rol:</span>
          <span class="info-value">{{ userInfo?.nombre_rol || 'Profesor' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">{{ userInfo?.email || 'No disponible' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['open-materias', 'open-estudiantes', 'open-calificaciones'])

const authStore = useAuthStore()
const userInfo = computed(() => authStore.userInfo)

const handleMateriasClick = () => {
  emit('open-materias')
}

const handleEstudiantesClick = () => {
  emit('open-estudiantes')
}

const handleCalificacionesClick = () => {
  emit('open-calificaciones')
}
</script>

<style scoped>
.profesor-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
  position: relative;
}

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
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.dark .metric-icon {
  background: linear-gradient(135deg, #1e40af, #1e3a8a);
}

.metric-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.dark .metric-title {
  color: #f1f5f9;
}

.metric-description {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.dark .metric-description {
  color: #94a3b8;
}

.metric-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.feature-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.dark .feature-tag {
  background: #312e81;
  color: #c7d2fe;
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.dark .info-row {
  border-bottom-color: #334155;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.dark .info-label {
  color: #94a3b8;
}

.info-value {
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 500;
  text-align: right;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .info-value {
  color: #f1f5f9;
}

/* Responsive */
@media (max-width: 768px) {
  .profesor-metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>

