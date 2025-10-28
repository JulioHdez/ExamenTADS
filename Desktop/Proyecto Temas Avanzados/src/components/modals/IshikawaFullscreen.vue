<template>
  <div v-if="isOpen" class="fullscreen-overlay" @click.self="handleClose">
    <div class="fullscreen-content">
      <!-- Barra de herramientas -->
      <div class="toolbar">
        <h2 class="toolbar-title">Diagrama de Ishikawa - Análisis de Causa-Efecto</h2>
        <div class="toolbar-actions">
          <button class="btn-toolbar" @click="handleClose">
            ← Regresar
          </button>
          <button class="btn-toolbar btn-export" @click="handleExport" :disabled="loading">
            📄 Exportar PDF
          </button>
        </div>
      </div>

      <!-- Contenido del diagrama -->
      <div class="diagram-content" ref="diagramContainer">
        <IshikawaDiagram :data="data" :expanded="true" />
        
        <!-- Información adicional -->
        <div class="info-panel">
          <div class="info-card">
            <span class="info-icon">👥</span>
            <div class="info-text">
              <span class="info-label">Estudiantes Analizados</span>
              <span class="info-value">{{ data?.totalStudents || 0 }}</span>
            </div>
          </div>
          <div class="info-card">
            <span class="info-icon">⚠️</span>
            <div class="info-text">
              <span class="info-label">Total de Factores</span>
              <span class="info-value">{{ data?.totalFactors || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import IshikawaDiagram from '@/components/charts/IshikawaDiagram.vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useNotifications } from '@/composables/useNotifications'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])
const diagramContainer = ref(null)
const loading = ref(false)
const { showSuccess, showError, showWarning } = useNotifications()

const handleClose = () => {
  emit('close')
}

const handleExport = async () => {
  if (!props.data) {
    showWarning('Advertencia', 'No hay datos para exportar')
    return
  }

  try {
    loading.value = true
    
    const pdf = new jsPDF('landscape', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    
    // === PÁGINA 1: PORTADA MEJORADA ===
    // Fondo degradado simulado
    pdf.setFillColor(26, 42, 74)
    pdf.rect(0, 0, pdfWidth, 50, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(28)
    pdf.text('DIAGRAMA DE ISHIKAWA', pdfWidth / 2, 25, { align: 'center' })
    
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Análisis de Causa-Efecto', pdfWidth / 2, 35, { align: 'center' })
    
    // Información del semestre
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Semestre ${props.data.semester}`, pdfWidth / 2, 45, { align: 'center' })
    
    // Capturar el diagrama
    if (diagramContainer.value) {
      const canvas = await html2canvas(diagramContainer.value, {
        backgroundColor: '#1f2937',
        scale: 2.5,
        logging: false,
        useCORS: true
      })
      
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = pdfWidth - 60
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const maxHeight = pdfHeight - 80
      
      let finalHeight = imgHeight
      let finalWidth = imgWidth
      
      if (finalHeight > maxHeight) {
        finalHeight = maxHeight
        finalWidth = (canvas.width * maxHeight) / canvas.height
      }
      
      const imgX = (pdfWidth - finalWidth) / 2
      const imgY = 60
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight)
    }
    
    // Footer de la página 1
    pdf.setDrawColor(26, 42, 74)
    pdf.setLineWidth(0.5)
    pdf.line(20, pdfHeight - 20, pdfWidth - 20, pdfHeight - 20)
    
    pdf.setFontSize(9)
    pdf.setTextColor(107, 114, 128)
    pdf.setFont('helvetica', 'italic')
    pdf.text('Continuar en la siguiente página...', pdfWidth / 2, pdfHeight - 10, { align: 'center' })
    
    // === PÁGINA 2: ANÁLISIS DETALLADO ===
    pdf.addPage('landscape', 'a4')
    
    // Encabezado de página 2
    pdf.setFillColor(26, 42, 74)
    pdf.rect(0, 0, pdfWidth, 40, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(24)
    pdf.text('ANÁLISIS DETALLADO DE FACTORES', pdfWidth / 2, 25, { align: 'center' })
    
    // Tarjetas de estadísticas profesionales
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    
    // Tarjeta Estudiantes
    pdf.setFillColor(139, 92, 246)
    pdf.rect(20, 50, 60, 30, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text('ESTUDIANTES ANALIZADOS', 50, 59, { align: 'center' })
    pdf.setFontSize(22)
    pdf.text(`${props.data.totalStudents}`, 50, 72, { align: 'center' })
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(230, 230, 255)
    pdf.text('estudiantes', 50, 76, { align: 'center' })
    
    // Tarjeta Factores
    pdf.setFillColor(245, 158, 11)
    pdf.rect(90, 50, 60, 30, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text('FACTORES DE RIESGO', 120, 59, { align: 'center' })
    pdf.setFontSize(22)
    pdf.text(`${props.data.totalFactors}`, 120, 72, { align: 'center' })
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(255, 240, 230)
    pdf.text('factores identificados', 120, 76, { align: 'center' })
    
    // Tarjeta Categorías
    pdf.setFillColor(16, 185, 129)
    pdf.rect(160, 50, 60, 30, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text('CATEGORÍAS', 190, 59, { align: 'center' })
    pdf.setFontSize(22)
    pdf.text(`${props.data.categories.length}`, 190, 72, { align: 'center' })
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(230, 255, 245)
    pdf.text('áreas analizadas', 190, 76, { align: 'center' })
    
    // Tabla mejorada
    let yPos = 85
    const drawCell = (x, y, w, h, text, isHeader = false, color = null) => {
      if (isHeader) {
        pdf.setFillColor(26, 42, 74)
      } else if (color) {
        pdf.setFillColor(color.r, color.g, color.b)
      } else {
        pdf.setFillColor(249, 250, 251)
      }
      pdf.setDrawColor(209, 213, 219)
      pdf.setLineWidth(0.5)
      pdf.rect(x, y, w, h, 'FD')
      
      if (isHeader) {
        pdf.setTextColor(255, 255, 255)
        pdf.setFont('helvetica', 'bold')
      } else {
        pdf.setTextColor(55, 65, 81)
        pdf.setFont('helvetica', 'normal')
      }
      pdf.setFontSize(isHeader ? 11 : 9)
      pdf.text(text, x + w / 2, y + h / 2 + 3, { align: 'center', maxWidth: w - 6 })
    }
    
    // Headers de la tabla
    drawCell(20, yPos, 60, 12, 'Categoría', true)
    drawCell(80, yPos, 110, 12, 'Factores', true)
    drawCell(190, yPos, 40, 12, 'Cantidad', true)
    
    yPos += 12
    
    // Colores por categoría
    const categoryColors = {
      'Académico': { r: 59, g: 130, b: 246 },
      'Psicosocial': { r: 139, g: 92, b: 246 },
      'Económico': { r: 245, g: 158, b: 11 },
      'Salud': { r: 236, g: 72, b: 153 }
    }
    
    props.data.categories.forEach((category, index) => {
      if (yPos > pdfHeight - 30) {
        pdf.addPage()
        yPos = 20
        
        // Re-dibujar headers
        drawCell(20, yPos, 60, 12, 'Categoría', true)
        drawCell(80, yPos, 110, 12, 'Factores', true)
        drawCell(190, yPos, 40, 12, 'Cantidad', true)
        yPos += 12
      }
      
      const factors = category.factors.length > 0 ? category.factors.join(', ') : 'Sin factores'
      const color = categoryColors[category.name] || { r: 249, g: 250, b: 251 }
      
      // Categoría con color
      drawCell(20, yPos, 60, 10, category.name, false, color)
      drawCell(80, yPos, 110, 10, factors, false)
      drawCell(190, yPos, 40, 10, category.count.toString(), false)
      
      yPos += 10
    })
    
    // Footer profesional
    yPos = pdfHeight - 20
    pdf.setDrawColor(239, 68, 68)
    pdf.setLineWidth(1)
    pdf.line(20, yPos, pdfWidth - 20, yPos)
    
    pdf.setFontSize(8)
    pdf.setTextColor(107, 114, 128)
    pdf.setFont('helvetica', 'normal')
    const fecha = new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    pdf.text('Reporte generado el ' + fecha, 22, yPos + 8)
    pdf.text(`Semestre ${props.data.semester} - Sistema de Análisis de Rendimiento Académico`, pdfWidth - 22, yPos + 8, { align: 'right' })
    
    // Guardar
    const fechaArchivo = new Date().toISOString().split('T')[0]
    pdf.save(`Diagrama_Ishikawa_Semestre_${props.data.semester}_${fechaArchivo}.pdf`)
    
    showSuccess('Éxito', 'Diagrama de Ishikawa exportado a PDF exitosamente')
    loading.value = false
  } catch (error) {
    console.error('Error al exportar a PDF:', error)
    showError('Error', 'Error al exportar: ' + error.message)
    loading.value = false
  }
}
</script>

<style scoped>
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: auto;
}

.fullscreen-content {
  width: 100%;
  max-width: 95vw;
  max-height: 95vh;
  background: #1a1a1a;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #2C4068 0%, #1a2a4a 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.toolbar-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.toolbar-actions {
  display: flex;
  gap: 1rem;
}

.btn-toolbar {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toolbar:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn-export {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
}

.btn-export:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

.btn-toolbar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.diagram-content {
  flex: 1;
  overflow: auto;
  padding: 2rem;
  background: #1a1a1a;
}

.info-panel {
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
  justify-content: center;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-icon {
  font-size: 2rem;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  font-weight: 600;
}

.info-value {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
}
</style>

