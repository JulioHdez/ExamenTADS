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
          <h4>¿Cómo consultar mis estudiantes?</h4>
          <ol class="info-list ordered">
            <li>Haz clic en <strong>"Mis Estudiantes"</strong> en el menú lateral</li>
            <li>Se mostrará una tabla con todos los estudiantes de <strong>Ingenieria en Sistemas</strong></li>
            <li>La tabla incluye: Número de Control, Nombre Completo, Email, Semestre y Estatus</li>
            <li>Usa el campo de búsqueda para filtrar estudiantes por nombre o número de control</li>
            <li>Los estudiantes se muestran ordenados alfabéticamente por apellidos</li>
          </ol>
          <div class="info-tip">
            <strong>Nota:</strong> Solo se muestran los estudiantes que cursan la carrera de Ingenieria en Sistemas. El sistema filtra automaticamente segun tu carrera asignada.
          </div>
        </div>
      </div>

      <!-- Calificaciones -->
      <div class="info-section">
        <div class="section-header">
          <h3>Calificaciones</h3>
        </div>
        <div class="info-card">
          <h4>¿Cómo consultar las calificaciones?</h4>
          <ol class="info-list ordered">
            <li>Haz clic en <strong>"Calificaciones"</strong> en el menú lateral</li>
            <li>Se mostrará una tabla con todas las calificaciones de estudiantes de tu carrera</li>
            <li>La tabla incluye: Número de Control, Nombre del Estudiante, Materia, Unidad, Calificación y Fecha</li>
            <li>Las calificaciones se muestran con colores según su valor:
              <ul class="info-list nested">
                <li><span class="calificacion-excelente">Verde (90-100):</span> Excelente</li>
                <li><span class="calificacion-buena">Azul (80-89):</span> Buena</li>
                <li><span class="calificacion-regular">Naranja (70-79):</span> Regular</li>
                <li><span class="calificacion-baja">Rojo (0-69):</span> Baja</li>
              </ul>
            </li>
            <li>Usa el campo de búsqueda para filtrar por número de control, nombre del estudiante o materia</li>
            <li>Las calificaciones están ordenadas por número de control, materia y unidad</li>
          </ol>
          <div class="info-tip">
            <strong>Tip:</strong> Puedes buscar calificaciones específicas escribiendo el número de control o el nombre de la materia en el campo de búsqueda.
          </div>
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
          <p>El sistema incluye un menú de accesibilidad completo ubicado en la esquina inferior derecha (botón flotante con icono de persona). Puedes arrastrarlo a cualquier posición de la pantalla.</p>
          <h4>Funciones disponibles:</h4>
          <ul class="info-list">
            <li><strong>🔍 Zoom:</strong> Ajusta el tamaño de la interfaz desde 50% hasta 200% usando los controles + y -</li>
            <li><strong>☀️/🌙 Modo Claro/Oscuro:</strong> Alterna entre modo claro y oscuro para reducir la fatiga visual</li>
            <li><strong>🌓 Escala de Grises:</strong> Activa el modo de escala de grises para usuarios con daltonismo</li>
            <li><strong>🎨 Daltonismo:</strong> Selecciona diferentes tipos de ajustes para daltonismo (Protanopia, Deuteranopia, Tritanopia)</li>
            <li><strong>🖱️ Tamaño del Puntero:</strong> Aumenta o disminuye el tamaño del cursor para facilitar su visualización</li>
            <li><strong>📖 Resaltar Texto:</strong> Activa el resaltado automático del texto al pasar el cursor sobre él</li>
            <li><strong>🤲 Modo Parkinson:</strong> Reduce las animaciones y efectos visuales para usuarios con temblores</li>
            <li><strong>🔊 Lectura en Voz Alta:</strong> Activa la lectura automática del texto al pasar el cursor sobre los elementos</li>
          </ul>
          <div class="info-tip">
            <strong>Tip:</strong> El menú de accesibilidad es arrastrable. Puedes moverlo a cualquier posición de la pantalla según tu comodidad. Todas las preferencias se guardan automáticamente.
          </div>
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

.calificacion-excelente {
  color: #059669;
  font-weight: 600;
}

.dark .calificacion-excelente {
  color: #34d399;
}

.calificacion-buena {
  color: #2563eb;
  font-weight: 600;
}

.dark .calificacion-buena {
  color: #60a5fa;
}

.calificacion-regular {
  color: #d97706;
  font-weight: 600;
}

.dark .calificacion-regular {
  color: #fbbf24;
}

.calificacion-baja {
  color: #dc2626;
  font-weight: 600;
}

.dark .calificacion-baja {
  color: #f87171;
}

.info-list.nested {
  margin-top: 0.5rem;
  margin-left: 1.5rem;
  list-style-type: disc;
}
</style>

