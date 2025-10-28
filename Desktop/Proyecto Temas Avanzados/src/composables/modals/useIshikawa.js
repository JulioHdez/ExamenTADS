import { ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import api from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export function useIshikawa() {
  const dashboardStore = useDashboardStore()
  const { showSuccess, showError, showWarning, showInfo } = useNotifications()

  // Estado
  const selectedSemester = ref('')
  const loading = ref(false)
  const ishikawaData = ref(null)

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
      
      // Guardar
      const fecha = new Date().toISOString().split('T')[0]
      pdf.save(`Diagrama_Ishikawa_Semestre_${ishikawaData.value.semester}_${fecha}.pdf`)
      
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

  return {
    selectedSemester,
    loading,
    ishikawaData,
    mainCategories,
    availableSemesters,
    generateIshikawa,
    exportToPDF,
    resetForm
  }
}

