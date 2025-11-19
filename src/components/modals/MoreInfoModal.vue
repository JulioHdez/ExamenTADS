<template>
  <BaseModal :is-open="isOpen" title="Más Información - Guía de Uso" @close="$emit('close')">
    <div class="more-info-content">
      <!-- Sección de Bienvenida -->
      <div class="info-section welcome-section">
        <div class="section-icon">👋</div>
        <h2>Bienvenido al Sistema de Dashboard Estudiantil</h2>
        <p class="section-description">
          Este sistema te permite gestionar y analizar información académica de estudiantes de manera eficiente y visual.
        </p>
      </div>

      <!-- Navegación -->
      <div class="info-section">
        <div class="section-header">
          <span class="section-icon">🧭</span>
          <h3>Navegación del Sistema</h3>
        </div>
        <div class="info-card">
          <h4>Sidebar (Menú Lateral)</h4>
          <ul class="info-list">
            <li><strong>Página Principal:</strong> Vista general con métricas y gráficos principales</li>
            <li><strong>Registrar Estudiante:</strong> Formulario completo para agregar nuevos estudiantes</li>
            <li><strong>Factores de Riesgo:</strong> Consulta información sobre factores que afectan el rendimiento</li>
            <li><strong>Análisis:</strong> Herramientas de análisis (Pareto, Ishikawa, Histogramas, Dispersión)</li>
            <li><strong>Importar/Exportar:</strong> Gestión masiva de datos en Excel, CSV o PDF</li>
          </ul>
        </div>
      </div>

      <!-- Registro de Estudiantes -->
      <div class="info-section">
        <div class="section-header">
          <span class="section-icon">👤</span>
          <h3>Registro de Estudiantes</h3>
        </div>
        <div class="info-card">
          <h4>¿Cómo registrar un estudiante?</h4>
          <ol class="info-list ordered">
            <li>Haz clic en <strong>"Registrar Estudiante"</strong> en el menú lateral</li>
            <li>Completa los campos obligatorios (marcados con <span class="required-asterisk">*</span>)</li>
            <li>Agrega grupos y materias del estudiante</li>
            <li>Registra las calificaciones por unidad</li>
            <li>Selecciona los factores de riesgo si aplican</li>
            <li>Haz clic en <strong>"Guardar"</strong> para finalizar</li>
          </ol>
          <div class="info-tip">
            <strong>Tip:</strong> Los campos con asterisco (*) son obligatorios. El sistema validará automáticamente los datos antes de guardar.
          </div>
        </div>
      </div>

      <!-- Análisis y Gráficos -->
      <div class="info-section">
        <div class="section-header">
          <span class="section-icon">📊</span>
          <h3>Análisis y Visualizaciones</h3>
        </div>
        <div class="info-card">
          <h4>Herramientas Disponibles:</h4>
          <ul class="info-list">
            <li><strong>Pareto:</strong> Identifica los problemas más importantes (80/20)</li>
            <li><strong>Ishikawa:</strong> Diagrama de causa y efecto para análisis de problemas</li>
            <li><strong>Histogramas:</strong> Distribución de calificaciones y datos</li>
            <li><strong>Dispersión:</strong> Relación entre variables académicas</li>
          </ul>
          <div class="info-tip">
            <strong>Tip:</strong> Usa los filtros en la parte superior para analizar datos por período, mes o rango de fechas específico.
          </div>
        </div>
      </div>

      <!-- Importar y Exportar -->
      <div class="info-section">
        <div class="section-header">
          <span class="section-icon">📥📤</span>
          <h3>Importar y Exportar Datos</h3>
        </div>
        <div class="info-card">
          <h4>Importar Datos:</h4>
          <ol class="info-list ordered">
            <li>Haz clic en <strong>"Importar Datos"</strong></li>
            <li>Descarga la plantilla Excel o CSV</li>
            <li>Completa la plantilla con los datos de estudiantes</li>
            <li>Sube el archivo completado</li>
            <li>Revisa y confirma la importación</li>
          </ol>
          
          <h4>Exportar Datos:</h4>
          <ul class="info-list">
            <li>Selecciona el formato deseado (Excel, CSV o PDF)</li>
            <li>Elige los datos a exportar</li>
            <li>Incluye gráficos si lo deseas</li>
            <li>Descarga el archivo generado</li>
          </ul>
        </div>
      </div>

      <!-- Factores de Riesgo -->
      <div class="info-section">
        <div class="section-header">
          <span class="section-icon">⚠️</span>
          <h3>Factores de Riesgo</h3>
        </div>
        <div class="info-card">
          <p>El sistema identifica automáticamente estudiantes en riesgo basándose en:</p>
          <ul class="info-list">
            <li>Calificaciones bajas (menores a 70)</li>
            <li>Asistencia irregular</li>
            <li>Factores personales, familiares o económicos</li>
          </ul>
          <p>Consulta el módulo <strong>"Factores de Riesgo"</strong> para más información detallada sobre cada tipo de factor.</p>
        </div>
      </div>

      <!-- Accesibilidad -->
      <div class="info-section">
        <div class="section-header">
          <span class="section-icon">♿</span>
          <h3>Funciones de Accesibilidad</h3>
        </div>
        <div class="info-card">
          <ul class="info-list">
            <li><strong>Zoom:</strong> Usa los controles de zoom (lupa + / -) en la esquina superior derecha para ajustar el tamaño de la interfaz</li>
            <li><strong>Modo Oscuro:</strong> Activa/desactiva el modo oscuro según tu preferencia</li>
            <li><strong>Responsive:</strong> El sistema se adapta automáticamente a diferentes tamaños de pantalla</li>
          </ul>
        </div>
      </div>

      <!-- Consejos Generales -->
      <div class="info-section">
        <div class="section-header">
          <span class="section-icon">💡</span>
          <h3>Consejos Generales</h3>
        </div>
        <div class="info-card">
          <ul class="info-list">
            <li>Guarda tu trabajo frecuentemente al registrar estudiantes</li>
            <li>Usa los filtros para encontrar información específica rápidamente</li>
            <li>Exporta datos regularmente como respaldo</li>
            <li>Revisa los factores de riesgo para identificar estudiantes que necesitan apoyo</li>
            <li>Utiliza los gráficos para visualizar tendencias y patrones</li>
          </ul>
        </div>
      </div>

      <!-- Soporte -->
      <div class="info-section">
        <div class="section-header">
          <span class="section-icon">🆘</span>
          <h3>¿Necesitas Ayuda?</h3>
        </div>
        <div class="info-card">
          <p>Si tienes dudas o problemas:</p>
          <ul class="info-list">
            <li>Revisa esta guía de uso</li>
            <li>Consulta los mensajes de error que aparecen en los formularios</li>
            <li>Verifica que todos los campos obligatorios estén completos</li>
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
</style>

