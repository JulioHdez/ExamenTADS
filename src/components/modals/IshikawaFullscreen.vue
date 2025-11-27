<template>
  <div v-if="isOpen" class="fullscreen-overlay" @click.self="handleClose">
    <div class="fullscreen-content" @click.stop>
      <!-- Barra de herramientas -->
      <div class="toolbar">
        <h2 class="toolbar-title">Diagrama de Ishikawa - Análisis de Causa-Efecto</h2>
        <div class="toolbar-actions">
          <button class="btn-toolbar" @click="handleClose">
            ← Regresar
          </button>
          <button class="btn-toolbar btn-comment" @click="handleOpenCommentModal">
            💬 Agregar Comentario
          </button>
          <button class="btn-toolbar btn-export" @click="handleExport" :disabled="loading">
            📄 Exportar PDF
          </button>
        </div>
      </div>

      <!-- Contenido del diagrama -->
      <div class="diagram-content" ref="diagramContainer">
        <IshikawaDiagram 
          :data="data" 
          :expanded="true" 
          :comments="comments"
          @category-click="handleCategoryClick"
          @subcategory-click="handleSubcategoryClick"
        />
        
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

    <!-- Modal de Comentarios - Usando Teleport para renderizar fuera del overlay -->
    <Teleport to="body">
      <IshikawaCommentModal
        :is-open="showCommentModal"
        :categories="mainCategories"
        :semester="data?.semester || ''"
        :ishikawa-data="data"
        @close="showCommentModal = false"
        @saved="handleCommentSaved"
      />
      
      <!-- Modal para ver comentarios de una categoría o subcategoría -->
      <IshikawaCommentsViewModal
        :is-open="showCommentsViewModal"
        :category-id="selectedCategoryForComments?.categoryId || ''"
        :category-name="selectedCategoryForComments?.categoryName || ''"
        :subcategory="selectedCategoryForComments?.subcategory || ''"
        :comments="selectedCategoryForComments?.comments || []"
        :semester="data?.semester || ''"
        @close="showCommentsViewModal = false"
        @deleted="handleCommentDeleted"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import IshikawaDiagram from '@/components/charts/IshikawaDiagram.vue'
import IshikawaCommentModal from './IshikawaCommentModal.vue'
import IshikawaCommentsViewModal from './IshikawaCommentsViewModal.vue'
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
const showCommentModal = ref(false)
const showCommentsViewModal = ref(false)
const selectedCategoryForComments = ref(null)
const comments = ref([])

// Categorías principales
const mainCategories = computed(() => [
  { id: 'academico', name: 'Académico', icon: '📚', color: '#3b82f6' },
  { id: 'psicosocial', name: 'Psicosocial', icon: '🧠', color: '#8b5cf6' },
  { id: 'economico', name: 'Económico', icon: '💰', color: '#f59e0b' },
  { id: 'salud', name: 'Salud', icon: '🏥', color: '#ec4899' }
])

// Funciones para manejar comentarios
const loadComments = () => {
  if (!props.data?.semester) {
    comments.value = []
    return
  }
  
  try {
    const storageKey = `ishikawa_comments_${props.data.semester}`
    const storedComments = localStorage.getItem(storageKey)
    comments.value = storedComments ? JSON.parse(storedComments) : []
  } catch (error) {
    console.error('Error al cargar comentarios:', error)
    comments.value = []
  }
}

const getCommentsByCategory = (categoryId) => {
  return comments.value.filter(comment => comment.categoryId === categoryId)
}

const handleOpenCommentModal = () => {
  showCommentModal.value = true
  console.log('Abriendo modal de comentarios, showCommentModal:', showCommentModal.value)
}

const handleCategoryClick = (categoryData) => {
  selectedCategoryForComments.value = categoryData
  showCommentsViewModal.value = true
}

const handleSubcategoryClick = (subcategoryData) => {
  selectedCategoryForComments.value = subcategoryData
  showCommentsViewModal.value = true
}

const handleCommentSaved = () => {
  loadComments()
}

const handleCommentDeleted = () => {
  loadComments()
  // Si el modal de vista está abierto, actualizar los comentarios mostrados
  if (selectedCategoryForComments.value) {
    selectedCategoryForComments.value.comments = comments.value.filter(
      c => c.categoryId === selectedCategoryForComments.value.categoryId
    )
  }
}

const deleteComment = (commentId) => {
  if (!props.data?.semester) return
  
  try {
    const storageKey = `ishikawa_comments_${props.data.semester}`
    comments.value = comments.value.filter(c => c.id !== commentId)
    localStorage.setItem(storageKey, JSON.stringify(comments.value))
    showSuccess('Éxito', 'Comentario eliminado')
  } catch (error) {
    console.error('Error al eliminar comentario:', error)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Función para limpiar todos los comentarios del localStorage
const clearAllComments = () => {
  try {
    // Obtener todas las claves del localStorage
    const keys = Object.keys(localStorage)
    // Eliminar todas las claves relacionadas con comentarios de Ishikawa
    keys.forEach(key => {
      if (key.startsWith('ishikawa_comments_')) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Error al limpiar comentarios:', error)
  }
}

// Cargar comentarios cuando cambien los datos o se abra el modal
watch([() => props.data, () => props.isOpen], () => {
  if (props.isOpen && props.data?.semester) {
    loadComments()
  } else if (!props.isOpen) {
    // Limpiar estado cuando se cierra el modal
    showCommentModal.value = false
    showCommentsViewModal.value = false
    selectedCategoryForComments.value = null
    comments.value = []
    // Limpiar comentarios del localStorage
    clearAllComments()
  }
}, { immediate: true })

// Limpiar al desmontar el componente
onBeforeUnmount(() => {
  showCommentModal.value = false
  showCommentsViewModal.value = false
  selectedCategoryForComments.value = null
  comments.value = []
  clearAllComments()
})

const handleClose = () => {
  // Limpiar estado al cerrar
  showCommentModal.value = false
  showCommentsViewModal.value = false
  selectedCategoryForComments.value = null
  comments.value = []
  
  // Limpiar comentarios del localStorage para todos los semestres
  clearAllComments()
  
  emit('close')
}

const handleExport = async () => {
  if (!props.data) {
    showWarning('Advertencia', 'No hay datos para exportar')
    return
  }

  try {
    loading.value = true
    
    // Asegurar que los comentarios estén cargados
    if (props.data?.semester) {
      loadComments()
    }
    
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
    
    // Colores por categoría (usando IDs)
    const categoryColorsById = {
      'academico': { r: 59, g: 130, b: 246 },
      'psicosocial': { r: 139, g: 92, b: 246 },
      'economico': { r: 245, g: 158, b: 11 },
      'salud': { r: 236, g: 72, b: 153 }
    }
    
    // Colores por nombre (para compatibilidad)
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
    pdf.text('Continuar en la siguiente página...', pdfWidth / 2, yPos + 8, { align: 'center' })
    
    // === PÁGINA 3: COMENTARIOS (si hay comentarios) ===
    if (comments.value && comments.value.length > 0) {
      pdf.addPage('landscape', 'a4')
      
      // Encabezado de página de comentarios
      pdf.setFillColor(26, 42, 74)
      pdf.rect(0, 0, pdfWidth, 40, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(24)
      pdf.text('COMENTARIOS Y OBSERVACIONES', pdfWidth / 2, 25, { align: 'center' })
      
      // Organizar comentarios por categoría y subcategoría
      const commentsByCategory = {}
      comments.value.forEach(comment => {
        if (!commentsByCategory[comment.categoryId]) {
          commentsByCategory[comment.categoryId] = {}
        }
        const subcategory = comment.subcategory || 'General'
        if (!commentsByCategory[comment.categoryId][subcategory]) {
          commentsByCategory[comment.categoryId][subcategory] = []
        }
        commentsByCategory[comment.categoryId][subcategory].push(comment)
      })
      
      // Colores por categoría
      const categoryColors = {
        'academico': { r: 59, g: 130, b: 246 },
        'psicosocial': { r: 139, g: 92, b: 246 },
        'economico': { r: 245, g: 158, b: 11 },
        'salud': { r: 236, g: 72, b: 153 }
      }
      
      let commentYPos = 50
      
      // Recorrer categorías del diagrama
      props.data.categories.forEach(category => {
        if (!commentsByCategory[category.id] || Object.keys(commentsByCategory[category.id]).length === 0) {
          return
        }
        
        // Verificar si necesitamos nueva página
        if (commentYPos > pdfHeight - 60) {
          pdf.addPage('landscape', 'a4')
          pdf.setFillColor(26, 42, 74)
          pdf.rect(0, 0, pdfWidth, 40, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(24)
          pdf.text('COMENTARIOS Y OBSERVACIONES (continuación)', pdfWidth / 2, 25, { align: 'center' })
          commentYPos = 50
        }
        
        // Título de categoría
        const catColor = categoryColorsById[category.id] || categoryColors[category.name] || { r: 107, g: 114, b: 128 }
        pdf.setFillColor(catColor.r, catColor.g, catColor.b)
        pdf.rect(20, commentYPos, pdfWidth - 40, 8, 'F')
        
        pdf.setTextColor(255, 255, 255)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(12)
        pdf.text(category.name.toUpperCase(), 25, commentYPos + 5.5)
        
        commentYPos += 10
        
        // Recorrer subcategorías
        Object.keys(commentsByCategory[category.id]).forEach(subcategory => {
          const subcategoryComments = commentsByCategory[category.id][subcategory]
          
          // Verificar si necesitamos nueva página
          if (commentYPos > pdfHeight - 40) {
            pdf.addPage('landscape', 'a4')
            pdf.setFillColor(26, 42, 74)
            pdf.rect(0, 0, pdfWidth, 40, 'F')
            pdf.setTextColor(255, 255, 255)
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(24)
            pdf.text('COMENTARIOS Y OBSERVACIONES (continuación)', pdfWidth / 2, 25, { align: 'center' })
            commentYPos = 50
          }
          
          // Subtítulo de subcategoría
          pdf.setFillColor(249, 250, 251)
          pdf.rect(25, commentYPos, pdfWidth - 50, 6, 'F')
          
          pdf.setTextColor(55, 65, 81)
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(10)
          pdf.text(`  ${subcategory} (${subcategoryComments.length})`, 27, commentYPos + 4)
          
          commentYPos += 8
          
          // Comentarios de la subcategoría
          subcategoryComments.forEach(comment => {
            // Verificar si necesitamos nueva página
            if (commentYPos > pdfHeight - 30) {
              pdf.addPage('landscape', 'a4')
              pdf.setFillColor(26, 42, 74)
              pdf.rect(0, 0, pdfWidth, 40, 'F')
              pdf.setTextColor(255, 255, 255)
              pdf.setFont('helvetica', 'bold')
              pdf.setFontSize(24)
              pdf.text('COMENTARIOS Y OBSERVACIONES (continuación)', pdfWidth / 2, 25, { align: 'center' })
              commentYPos = 50
            }
            
            // Caja del comentario
            pdf.setFillColor(255, 255, 255)
            pdf.setDrawColor(209, 213, 219)
            pdf.setLineWidth(0.3)
            pdf.rect(30, commentYPos, pdfWidth - 60, 8, 'FD')
            
            // Texto del comentario
            pdf.setTextColor(55, 65, 81)
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(8)
            const commentLines = pdf.splitTextToSize(comment.text, pdfWidth - 70)
            pdf.text(commentLines, 33, commentYPos + 5, { maxWidth: pdfWidth - 66 })
            
            // Fecha del comentario
            pdf.setFontSize(7)
            pdf.setTextColor(107, 114, 128)
            const commentDate = new Date(comment.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
            pdf.text(commentDate, pdfWidth - 35, commentYPos + 5, { align: 'right' })
            
            commentYPos += 10
          })
          
          commentYPos += 2 // Espacio entre subcategorías
        })
        
        commentYPos += 3 // Espacio entre categorías
      })
    }
    
    // Footer final
    const lastPage = pdf.internal.pages.length - 1
    pdf.setPage(lastPage + 1)
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
  pointer-events: auto;
}

.fullscreen-overlay > * {
  pointer-events: auto;
}

/* Asegurar que ningún elemento del overlay bloquee los botones */
.fullscreen-overlay > *:not(.fullscreen-content) {
  z-index: 9998;
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
  position: relative;
  z-index: 10000;
  isolation: isolate;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #2C4068 0%, #1a2a4a 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10001;
  flex-shrink: 0;
}

.toolbar-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
  min-width: 0;
  pointer-events: none;
}

.toolbar-actions {
  display: flex;
  gap: 1.25rem;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  z-index: 10002;
}

.btn-toolbar {
  padding: 0.875rem 1.75rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 10003;
  min-width: fit-content;
  white-space: nowrap;
  user-select: none;
  -webkit-user-select: none;
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 120px;
  box-sizing: border-box;
  isolation: isolate;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Área clickeable extendida para facilitar el clic */
.btn-toolbar::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  z-index: -1;
  pointer-events: auto;
}

.btn-toolbar:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10004;
}

.btn-toolbar:active:not(:disabled) {
  transform: translateY(0);
  z-index: 10004;
}

.btn-toolbar:focus {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
  z-index: 10004;
}

.btn-comment {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
}

.btn-comment:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-export {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  padding: 1rem 2rem;
  font-size: 0.9375rem;
  font-weight: 700;
  min-width: 150px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  position: relative;
  overflow: hidden;
}

.btn-export::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.btn-export:hover:not(:disabled)::after {
  width: 300px;
  height: 300px;
}

.btn-export:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
  transform: translateY(-2px);
}

.btn-export:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.btn-export:disabled {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  box-shadow: none;
  cursor: not-allowed;
}

.btn-toolbar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.diagram-content {
  flex: 1;
  overflow: auto;
  padding: 2rem;
  background: #1a1a1a;
  position: relative;
  z-index: 1;
}

/* Asegurar que el diagrama no interfiera con los botones */
.diagram-content > * {
  position: relative;
  z-index: 1;
}

/* Asegurar que el SVG del diagrama no bloquee los botones */
.diagram-content svg {
  position: relative;
  z-index: 1;
  pointer-events: auto;
}

/* Asegurar que ningún elemento del diagrama tenga z-index alto */
.diagram-content .ishikawa-wrapper {
  position: relative;
  z-index: 1;
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

/* Sección de Comentarios en Pantalla Completa */
.comments-section-fullscreen {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.comments-title-fullscreen {
  margin: 0 0 1.5rem 0;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comments-container-fullscreen {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.category-comments-group-fullscreen {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.category-comments-header-fullscreen {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  color: white;
}

.category-comments-icon-fullscreen {
  font-size: 1.25rem;
}

.category-comments-name-fullscreen {
  flex: 1;
  font-size: 1rem;
}

.category-comments-count-fullscreen {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.comments-list-fullscreen {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
}

.comment-item-fullscreen {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border-left: 3px solid #60a5fa;
  position: relative;
  transition: all 0.2s ease;
}

.comment-item-fullscreen:hover {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.comment-text-fullscreen {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.comment-date-fullscreen {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  font-style: italic;
}

.comment-delete-fullscreen {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.6;
  transition: all 0.2s ease;
  padding: 0.25rem;
  border-radius: 4px;
}

.comment-delete-fullscreen:hover {
  opacity: 1;
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

/* Responsive para pantallas pequeñas */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .toolbar-title {
    font-size: 1.25rem;
    text-align: center;
    width: 100%;
  }

  .toolbar-actions {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
  }

  .btn-toolbar {
    padding: 0.75rem 1.25rem;
    font-size: 0.8125rem;
    flex: 1;
    min-width: 140px;
  }

  .fullscreen-overlay {
    padding: 1rem;
  }

  .fullscreen-content {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }
}

@media (max-width: 480px) {
  .toolbar-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-toolbar {
    width: 100%;
    min-width: unset;
  }
}
</style>

