<template>
  <BaseModal :is-open="isOpen" title="Más Información - Guía de Uso para Profesores" @close="$emit('close')">
    <div class="more-info-content">
      <!-- Sección de Bienvenida -->
      <div class="info-section welcome-section">
        <h2>Bienvenido al Sistema de Dashboard del Profesor</h2>
        <p class="section-description">
          Este sistema te permite gestionar y consultar información académica relacionada con tus materias y estudiantes de manera eficiente.
        </p>
      </div>

      <!-- Navegación -->
      <div class="info-section">
        <div class="section-header">
          <h3>Navegación del Sistema</h3>
        </div>
        <div class="info-card">
          <h4>Sidebar (Menú Lateral)</h4>
          <ul class="info-list">
            <li><strong>Página Principal:</strong> Vista general con información del profesor y resumen de actividades</li>
            <li><strong>Mis Materias:</strong> Consulta todas las materias asignadas a tu carrera con detalles completos</li>
            <li><strong>Mis Estudiantes:</strong> Visualiza los estudiantes inscritos en las materias de tu carrera</li>
            <li><strong>Calificaciones:</strong> Gestiona y registra las calificaciones de tus estudiantes</li>
            <li><strong>Más Información:</strong> Consulta esta guía de uso del sistema</li>
          </ul>
        </div>
      </div>

      <!-- Mis Materias -->
      <div class="info-section">
        <div class="section-header">
          <h3>Mis Materias</h3>
        </div>
        <div class="info-card">
          <h4>¿Cómo consultar mis materias?</h4>
          <ol class="info-list ordered">
            <li>Haz clic en <strong>"Mis Materias"</strong> en el menú lateral</li>
            <li>Se mostrará una tabla con todas las materias asignadas a tu carrera</li>
            <li>Puedes ordenar las materias por cualquier columna (Clave, Nombre, Créditos, Horas)</li>
            <li>Usa el campo de búsqueda para filtrar materias por clave o nombre</li>
            <li>Selecciona el orden (Ascendente o Descendente) según tus necesidades</li>
          </ol>
          <div class="info-tip">
            <strong>Tip:</strong> Puedes hacer clic directamente en los encabezados de las columnas para ordenar rápidamente. El sistema detecta automáticamente si es ordenamiento alfabético o numérico.
          </div>
        </div>
      </div>

      <!-- Mis Estudiantes -->
      <div class="info-section">
        <div class="section-header">
          <h3>Mis Estudiantes</h3>
        </div>
        <div class="info-card">
          <p class="coming-soon">Esta funcionalidad estará disponible próximamente.</p>
        </div>
      </div>

      <!-- Calificaciones -->
      <div class="info-section">
        <div class="section-header">
          <h3>Calificaciones</h3>
        </div>
        <div class="info-card">
          <p class="coming-soon">Esta funcionalidad estará disponible próximamente.</p>
        </div>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="info-section">
        <div class="section-header">
          <h3>Filtros y Búsqueda</h3>
        </div>
        <div class="info-card">
          <h4>Funcionalidades de Filtrado</h4>
          <ul class="info-list">
            <li><strong>Búsqueda por texto:</strong> Busca materias o estudiantes escribiendo en el campo de búsqueda</li>
            <li><strong>Ordenamiento:</strong> Ordena los datos por cualquier columna en orden ascendente o descendente</li>
            <li><strong>Ordenamiento inteligente:</strong> El sistema detecta automáticamente si debe ordenar alfabéticamente o numéricamente</li>
            <li><strong>Ordenamiento rápido:</strong> Haz clic en los encabezados de las columnas para ordenar rápidamente</li>
          </ul>
        </div>
      </div>

      <!-- Accesibilidad -->
      <div class="info-section">
        <div class="section-header">
          <h3>Funciones de Accesibilidad</h3>
        </div>
        <div class="info-card">
          <ul class="info-list">
            <li><strong>Zoom:</strong> Usa los controles de zoom (lupa + / -) en la esquina superior derecha para ajustar el tamaño de la interfaz según tu comodidad</li>
            <li><strong>Modo Oscuro:</strong> Activa o desactiva el modo oscuro según tu preferencia para reducir la fatiga visual</li>
            <li><strong>Responsive:</strong> El sistema se adapta automáticamente a diferentes tamaños de pantalla, permitiendo su uso en tablets y dispositivos móviles</li>
          </ul>
        </div>
      </div>

      <!-- Consejos Generales -->
      <div class="info-section">
        <div class="section-header">
          <h3>Consejos Generales</h3>
        </div>
        <div class="info-card">
          <ul class="info-list">
            <li>Usa los filtros y búsqueda para encontrar información específica rápidamente</li>
            <li>Ordena las materias por créditos o horas para planificar mejor tu carga académica</li>
            <li>Consulta regularmente tus materias asignadas para mantenerte actualizado</li>
            <li>Aprovecha las funciones de accesibilidad para una mejor experiencia de uso</li>
            <li>Si tienes dudas, consulta esta guía o contacta al administrador del sistema</li>
          </ul>
        </div>
      </div>

      <!-- Soporte -->
      <div class="info-section">
        <div class="section-header">
          <h3>¿Necesitas Ayuda?</h3>
        </div>
        <div class="info-card">
          <p>Si tienes dudas o problemas:</p>
          <ul class="info-list">
            <li>Revisa esta guía de uso completa</li>
            <li>Verifica que estés usando la versión más reciente del navegador</li>
            <li>Comprueba tu conexión a internet si hay problemas de carga</li>
            <li>Contacta al administrador del sistema si persisten los problemas</li>
          </ul>
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-primary" @click="$emit('close')">
        Entendido
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
</script>

<style scoped>
@import '@/styles/modals/MoreInfoModal.css';

.coming-soon {
  text-align: center;
  color: #64748b;
  font-style: italic;
  padding: 2rem;
  margin: 0;
  font-size: 1rem;
}

.dark .coming-soon {
  color: #94a3b8;
}
</style>

