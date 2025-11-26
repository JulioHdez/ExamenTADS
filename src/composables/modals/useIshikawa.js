import { ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import api from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'
import { useFileSystem } from '@/composables/useFileSystem'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export function useIshikawa() {
  const dashboardStore = useDashboardStore()
  const { showSuccess, showError, showWarning, showInfo } = useNotifications()
  const { isSupported, selectedDirectory, saveFileToDirectory } = useFileSystem()

  // Estado
  const selectedSemester = ref('')
  const loading = ref(false)
  const ishikawaData = ref(null)
  const folderSelected = ref(false)

  // Categorías principales del diagrama de Ishikawa
  const mainCategories = ref([
    { id: 'academico', name: 'Académico', icon: '📚', color: '#3b82f6' },
    { id: 'psicosocial', name: 'Psicosocial', icon: '🧠', color: '#8b5cf6' },
    { id: 'economico', name: 'Económico', icon: '💰', color: '#f59e0b' },
    { id: 'salud', name: 'Salud', icon: '🏥', color: '#ec4899' }
  ])

  // Computed para obtener semestres disponibles
  const availableSemesters = computed(() => {
    const semesters = new Set()
    dashboardStore.students.forEach(student => {
      if (student.semestre_actual) {
        semesters.add(student.semestre_actual)
      }
    })
    return Array.from(semesters).sort((a, b) => parseInt(a) - parseInt(b))
  })

  // Función para generar el diagrama de Ishikawa
  const generateIshikawa = async () => {
    if (!selectedSemester.value) {
      showWarning('Advertencia', 'Por favor seleccione un semestre')
      return
    }

    loading.value = true
    try {
      console.log('Iniciando análisis de Ishikawa para semestre:', selectedSemester.value)
      
      // Obtener estudiantes del semestre seleccionado
      const students = dashboardStore.students.filter(
        student => student.semestre_actual == selectedSemester.value
      )

      console.log('Estudiantes encontrados:', students.length)

      if (students.length === 0) {
        showInfo('Información', 'No hay estudiantes en el semestre seleccionado')
        ishikawaData.value = null
        return
      }

      // Analizar factores por categoría
      const categoryAnalysis = {}
      
      for (const student of students) {
        try {
          // Obtener factores del estudiante
          const response = await api.get(`/estudiantes/${student.id_estudiante}/factores`)
          console.log('Respuesta de factores para estudiante', student.id_estudiante, ':', response.data)
          const factores = response.data.data || []
          
          console.log('Factores obtenidos:', factores)
          
          factores.forEach(factor => {
            const factorName = factor.nombre_factor || factor.tipo_factor
            
            if (factorName) {
              // Mapear nombre del factor a categoría
              const category = mapFactorToCategory(factorName)
              
              if (!categoryAnalysis[category]) {
                categoryAnalysis[category] = []
              }
              
              // Evitar duplicados en la misma categoría
              if (!categoryAnalysis[category].includes(factorName)) {
                categoryAnalysis[category].push(factorName)
              }
            }
          })
        } catch (error) {
          console.error(`Error al obtener factores del estudiante ${student.id_estudiante}:`, error)
        }
      }

      console.log('Análisis de categorías:', categoryAnalysis)

      // Calcular el total de factores únicos por categoría (sin duplicados)
      const categories = mainCategories.value.map(category => {
        const factors = categoryAnalysis[category.id] || []
        return {
          ...category,
          factors: factors,
          count: factors.length
        }
      })
      
      const totalFactores = categories.reduce((sum, cat) => sum + cat.count, 0)

      // Estructurar datos para el diagrama
      const diagramData = {
        semester: selectedSemester.value,
        totalStudents: students.length,
        totalFactors: totalFactores,
        categories: categories
      }

      ishikawaData.value = diagramData
      
      console.log('Diagrama de Ishikawa generado:', diagramData)
      
      if (totalFactores > 0) {
        showSuccess('Éxito', 'Diagrama de Ishikawa generado exitosamente')
      } else {
        showInfo('Información', 'No se encontraron factores de riesgo en el semestre seleccionado')
      }
    } catch (error) {
      console.error('Error al generar diagrama de Ishikawa:', error)
      showError('Error', 'Error al generar el diagrama: ' + error.message)
    } finally {
      loading.value = false
    }
  }

  // Mapear nombre de factor a categoría
  const mapFactorToCategory = (factorName) => {
    const name = factorName.toLowerCase()
    
    if (name.includes('académico') || name.includes('academico') || 
        name.includes('estudio') || name.includes('materia') || name.includes('aprendizaje')) {
      return 'academico'
    } else if (name.includes('psicosocial') || name.includes('emocional') || 
               name.includes('familia') || name.includes('social') || 
               name.includes('motivación') || name.includes('motivacion')) {
      return 'psicosocial'
    } else if (name.includes('económico') || name.includes('economico') || 
               name.includes('dinero') || name.includes('laboral') || 
               name.includes('trabajo')) {
      return 'economico'
    } else if (name.includes('salud') || name.includes('médico') || 
               name.includes('medico') || name.includes('discapacidad')) {
      return 'salud'
    }
    
    return 'otro'
  }

  // Función para exportar a PDF
  const exportToPDF = async (chartElement) => {
    if (!ishikawaData.value) {
      showWarning('Advertencia', 'No hay datos para exportar')
      return
    }

    try {
      loading.value = true
      
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // === PÁGINA 1: DIAGRAMA ===
      pdf.setFontSize(20)
      pdf.setTextColor(26, 42, 74)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Diagrama de Ishikawa - Causa-Efecto', pdfWidth / 2, 20, { align: 'center' })
      
      pdf.setFontSize(14)
      pdf.setTextColor(107, 114, 128)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Semestre ${ishikawaData.value.semester}`, pdfWidth / 2, 30, { align: 'center' })
      
      // Capturar el diagrama
      if (chartElement) {
        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#1f2937',
          scale: 2,
          logging: false,
          useCORS: true
        })
        
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = pdfWidth - 40
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        const maxHeight = pdfHeight - 60
        
        let finalHeight = imgHeight
        let finalWidth = imgWidth
        
        if (finalHeight > maxHeight) {
          finalHeight = maxHeight
          finalWidth = (canvas.width * maxHeight) / canvas.height
        }
        
        const imgX = (pdfWidth - finalWidth) / 2
        const imgY = 40
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight)
      }
      
      pdf.setFontSize(10)
      pdf.setTextColor(107, 114, 128)
      pdf.text('Continuar en la siguiente página', pdfWidth / 2, pdfHeight - 10, { align: 'center' })
      
      // === PÁGINA 2: DATOS ===
      pdf.addPage('landscape', 'a4')
      
      pdf.setFontSize(20)
      pdf.setTextColor(26, 42, 74)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Datos del Análisis', pdfWidth / 2, 20, { align: 'center' })
      
      pdf.setFontSize(12)
      pdf.setTextColor(107, 114, 128)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Semestre ${ishikawaData.value.semester}`, pdfWidth / 2, 30, { align: 'center' })
      
      // Información general
      pdf.setFontSize(10)
      pdf.setTextColor(55, 65, 81)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Estudiantes analizados: ${ishikawaData.value.totalStudents}`, 20, 45)
      pdf.text(`Total de factores: ${ishikawaData.value.totalFactors}`, 20, 55)
      
      // Tabla de categorías
      let yPos = 65
      const drawCell = (x, y, w, h, text, isHeader = false) => {
        pdf.setFillColor(isHeader ? 26 : (y % 10 === 65 ? 249 : 255), isHeader ? 42 : (y % 10 === 65 ? 250 : 255), isHeader ? 74 : (y % 10 === 65 ? 251 : 255))
        pdf.rect(x, y, w, h, 'FD')
        
        pdf.setTextColor(isHeader ? 255 : 55, isHeader ? 255 : 65, isHeader ? 255 : 81)
        pdf.setFont('helvetica', isHeader ? 'bold' : 'normal')
        pdf.setFontSize(isHeader ? 10 : 9)
        pdf.text(text, x + 3, y + h / 2 + 3, { maxWidth: w - 6 })
      }
      
      drawCell(20, yPos, 50, 10, 'Categoría', true)
      drawCell(70, yPos, 100, 10, 'Factores', true)
      drawCell(170, yPos, 30, 10, 'Cantidad', true)
      
      yPos += 10
      
      ishikawaData.value.categories.forEach(category => {
        if (yPos > pdfHeight - 20) {
          pdf.addPage()
          yPos = 20
        }
        
        const factors = category.factors.length > 0 ? category.factors.join(', ') : 'Sin factores'
        drawCell(20, yPos, 50, 10, category.name, false)
        drawCell(70, yPos, 100, 10, factors, false)
        drawCell(170, yPos, 30, 10, category.count.toString(), false)
        
        yPos += 10
      })
      
      // === PÁGINA 3: COMENTARIOS (si hay comentarios) ===
      // Cargar comentarios del localStorage
      let allComments = []
      try {
        const storageKey = `ishikawa_comments_${ishikawaData.value.semester}`
        const storedComments = localStorage.getItem(storageKey)
        allComments = storedComments ? JSON.parse(storedComments) : []
      } catch (error) {
        console.error('Error al cargar comentarios para PDF:', error)
      }
      
      if (allComments.length > 0) {
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
        allComments.forEach(comment => {
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
        ishikawaData.value.categories.forEach(category => {
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
          const catColor = categoryColors[category.id] || { r: 107, g: 114, b: 128 }
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
      
      // Guardar
      const fecha = new Date().toISOString().split('T')[0]
      const pdfBuffer = await pdf.output('arraybuffer')
      const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' })
      const nombreArchivo = `Diagrama_Ishikawa_Semestre_${ishikawaData.value.semester}_${fecha}.pdf`
      
      // Intentar guardar en carpeta seleccionada si existe
      if (isSupported.value && selectedDirectory.value && folderSelected.value) {
        try {
          await saveFileToDirectory(nombreArchivo, pdfBlob, 'application/pdf')
          showSuccess('Éxito', 'Diagrama exportado a PDF en la carpeta seleccionada')
          loading.value = false
          return
        } catch (error) {
          console.warn('No se pudo guardar en carpeta seleccionada, usando descarga normal:', error)
        }
      }
      
      // Fallback: descarga normal
      pdf.save(nombreArchivo)
      showSuccess('Éxito', 'Diagrama de Ishikawa exportado a PDF exitosamente')
      loading.value = false
    } catch (error) {
      console.error('Error al exportar a PDF:', error)
      showError('Error', 'Error al exportar: ' + error.message)
      loading.value = false
    }
  }

  const resetForm = () => {
    selectedSemester.value = ''
    ishikawaData.value = null
  }

  // Función para marcar que se seleccionó carpeta
  const markFolderSelected = () => {
    folderSelected.value = true
  }

  return {
    selectedSemester,
    loading,
    ishikawaData,
    mainCategories,
    availableSemesters,
    generateIshikawa,
    exportToPDF,
    resetForm,
    markFolderSelected,
    folderSelected
  }
}

