import { ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import api from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'
import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export function usePareto() {
  const dashboardStore = useDashboardStore()
  const { showSuccess, showError, showWarning, showInfo } = useNotifications()

  // Estado
  const selectedSemester = ref('')
  const loading = ref(false)
  const paretoData = ref([])
  const chartData = ref([])

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

  // Computed para los datos del gráfico de Pareto
  const chartLabels = computed(() => {
    return paretoData.value.map(item => item.category)
  })

  const chartValues = computed(() => {
    return paretoData.value.map(item => item.value)
  })

  const chartCumulative = computed(() => {
    let cumulative = 0
    const max = paretoData.value.reduce((sum, item) => sum + item.value, 0)
    
    return paretoData.value.map(item => {
      cumulative += item.value
      return Math.round((cumulative / max) * 100)
    })
  })

  // Función para generar el análisis de Pareto
  const generatePareto = async () => {
    if (!selectedSemester.value) {
      showWarning('Advertencia', 'Por favor seleccione un semestre')
      return
    }

    loading.value = true
    try {
      console.log('Iniciando análisis de Pareto para semestre:', selectedSemester.value)
      
      // Obtener estudiantes del semestre seleccionado
      const students = dashboardStore.students.filter(
        student => student.semestre_actual == selectedSemester.value
      )

      console.log('Estudiantes encontrados:', students.length)

      if (students.length === 0) {
        showInfo('Información', 'No hay estudiantes en el semestre seleccionado')
        paretoData.value = []
        chartData.value = []
        return
      }

      // Analizar factores de riesgo por tipo
      const factorAnalysis = {}
      let totalFactores = 0
      
      for (const student of students) {
        try {
          // Obtener factores del estudiante
          const response = await api.get(`/estudiantes/${student.id_estudiante}/factores`)
          console.log('Respuesta de factores para estudiante', student.id_estudiante, ':', response.data)
          const factores = response.data.data || []
          
          console.log('Factores obtenidos:', factores)
          totalFactores += factores.length
          
          factores.forEach(factor => {
            console.log('Factor individual:', factor)
            // El campo correcto es nombre_factor según el modelo de la base de datos
            const factorName = factor.nombre_factor || factor.tipo_factor
            console.log('Nombre del factor extraído:', factorName)
            if (factorName) {
              factorAnalysis[factorName] = (factorAnalysis[factorName] || 0) + 1
            }
          })
        } catch (error) {
          console.error(`Error al obtener factores del estudiante ${student.id_estudiante}:`, error)
        }
      }

      console.log('Total de factores encontrados:', totalFactores)
      console.log('Análisis de factores:', factorAnalysis)

      // Convertir a array y ordenar por frecuencia
      const paretoArray = Object.entries(factorAnalysis)
        .map(([category, value]) => ({
          category,
          value
        }))
        .sort((a, b) => b.value - a.value)

      // Calcular el porcentaje acumulado
      const total = paretoArray.reduce((sum, item) => sum + item.value, 0)
      paretoArray.forEach(item => {
        item.percentage = Math.round((item.value / total) * 100)
      })

      // Calcular porcentaje acumulado para el gráfico
      let cumulative = 0
      paretoArray.forEach(item => {
        cumulative += item.value
        item.cumulativePercentage = Math.round((cumulative / total) * 100)
      })

      paretoData.value = paretoArray
      chartData.value = paretoArray
      
      console.log('Datos de Pareto calculados:', paretoArray)
      
      if (paretoArray.length > 0) {
        showSuccess('Éxito', 'Análisis de Pareto generado exitosamente')
      } else {
        showInfo('Información', 'No se encontraron factores de riesgo en el semestre seleccionado')
      }
    } catch (error) {
      console.error('Error al generar análisis de Pareto:', error)
      showError('Error', 'Error al generar el análisis de Pareto: ' + error.message)
    } finally {
      loading.value = false
    }
  }

  // Función para obtener el color de cada barra
  const getBarColor = (index) => {
    const colors = [
      'rgba(59, 130, 246, 0.8)',   // Azul
      'rgba(16, 185, 129, 0.8)',   // Verde
      'rgba(245, 158, 11, 0.8)',   // Amarillo
      'rgba(239, 68, 68, 0.8)',    // Rojo
      'rgba(139, 92, 246, 0.8)',   // Púrpura
      'rgba(236, 72, 153, 0.8)',   // Rosa
      'rgba(20, 184, 166, 0.8)',   // Cian
      'rgba(251, 146, 60, 0.8)'    // Naranja
    ]
    return colors[index % colors.length]
  }

  // Calcula los puntos para la línea de Pareto
  const cumulativeLinePoints = computed(() => {
    if (chartData.value.length === 0) return ''
    
    const width = 100
    const height = 100
    const barWidth = width / chartData.value.length
    
    return chartData.value.map((item, index) => {
      const x = (index + 0.5) * barWidth
      const y = 100 - item.cumulativePercentage
      return `${x},${y}`
    }).join(' ')
  })

  // Obtiene la posición X de un punto
  const getPointX = (index) => {
    const width = 100
    const barWidth = width / chartData.value.length
    return (index + 0.5) * barWidth
  }

  // Obtiene la posición Y de un punto (invertida para SVG)
  const getPointY = (cumulativePercentage) => {
    const height = 100
    return height - cumulativePercentage
  }

  // Función para exportar a Excel
  const exportToExcel = async (chartElement) => {
    if (!chartData.value || chartData.value.length === 0) {
      showWarning('Advertencia', 'No hay datos para exportar')
      return
    }

    try {
      loading.value = true
      
      const response = await api.get('/pareto/excel-report', {
        params: { semestre: selectedSemester.value },
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      
      const fecha = new Date().toISOString().split('T')[0]
      const nombreArchivo = `Analisis_Pareto_Semestre_${selectedSemester.value}_${fecha}.xlsx`
      
      saveAs(blob, nombreArchivo)
      
      showSuccess('Éxito', 'Análisis de Pareto exportado a Excel con gráfico nativo')
      loading.value = false
    } catch (error) {
      console.error('Error al exportar desde backend:', error)
      showError('Error', 'Error al exportar el archivo Excel')
      loading.value = false
    }
  }

  // Función para exportar a PDF
  const exportToPDF = async (chartElement) => {
    if (!chartData.value || chartData.value.length === 0) {
      showWarning('Advertencia', 'No hay datos para exportar')
      return
    }

    try {
      loading.value = true
      
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // === PÁGINA 1: GRÁFICO ===
      pdf.setFontSize(20)
      pdf.setTextColor(26, 42, 74)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Análisis de Pareto - Principio 80/20', pdfWidth / 2, 20, { align: 'center' })
      
      pdf.setFontSize(14)
      pdf.setTextColor(107, 114, 128)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Semestre ${selectedSemester.value}`, pdfWidth / 2, 30, { align: 'center' })
      
      // Capturar el gráfico
      if (chartElement) {
        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#ffffff',
          scale: 2.5,
          logging: false
        })
        
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = pdfWidth - 40
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        const maxHeight = pdfHeight - 50
        
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
      pdf.text(`Semestre ${selectedSemester.value}`, pdfWidth / 2, 30, { align: 'center' })
      
      // Tabla
      let yPos = 45
      const drawCell = (x, y, w, h, text, isHeader = false) => {
        pdf.setFillColor(isHeader ? 26 : (y % 12 === 45 ? 249 : 255), isHeader ? 42 : (y % 12 === 45 ? 250 : 255), isHeader ? 74 : (y % 12 === 45 ? 251 : 255))
        pdf.rect(x, y, w, h, 'FD')
        
        pdf.setTextColor(isHeader ? 255 : 55, isHeader ? 255 : 65, isHeader ? 255 : 81)
        pdf.setFont('helvetica', isHeader ? 'bold' : 'normal')
        pdf.setFontSize(isHeader ? 10 : 9)
        pdf.text(text, x + 3, y + h / 2 + 3, { maxWidth: w - 6 })
      }
      
      drawCell(20, yPos, 60, 10, 'Categoría', true)
      drawCell(80, yPos, 40, 10, 'Frecuencia', true)
      drawCell(120, yPos, 40, 10, 'Porcentaje', true)
      drawCell(160, yPos, 40, 10, 'Acumulado', true)
      
      yPos += 10
      
      chartData.value.forEach(item => {
        if (yPos > pdfHeight - 20) {
          pdf.addPage()
          yPos = 20
        }
        
        drawCell(20, yPos, 60, 8, item.category, false)
        drawCell(80, yPos, 40, 8, item.value.toString(), false)
        drawCell(120, yPos, 40, 8, `${item.percentage}%`, false)
        drawCell(160, yPos, 40, 8, `${item.cumulativePercentage}%`, false)
        
        yPos += 8
      })
      
      // Footer
      yPos += 10
      pdf.setDrawColor(239, 68, 68)
      pdf.setLineWidth(0.5)
      pdf.line(20, yPos, pdfWidth - 20, yPos)
      
      pdf.setFontSize(9)
      pdf.setTextColor(239, 68, 68)
      pdf.setFont('helvetica', 'italic')
      pdf.text('Principio de Pareto: 80% de los problemas proviene del 20% de las causas', 22, yPos + 5)
      
      // Guardar
      const fecha = new Date().toISOString().split('T')[0]
      pdf.save(`Analisis_Pareto_Semestre_${selectedSemester.value}_${fecha}.pdf`)
      
      showSuccess('Éxito', 'Análisis exportado a PDF exitosamente')
      loading.value = false
    } catch (error) {
      console.error('Error al exportar a PDF:', error)
      showError('Error', 'Error al exportar: ' + error.message)
      loading.value = false
    }
  }

  const resetForm = () => {
    selectedSemester.value = ''
    paretoData.value = []
    chartData.value = []
  }

  return {
    selectedSemester,
    loading,
    paretoData,
    chartData,
    availableSemesters,
    chartLabels,
    chartValues,
    chartCumulative,
    generatePareto,
    getBarColor,
    cumulativeLinePoints,
    getPointX,
    getPointY,
    exportToExcel,
    exportToPDF,
    resetForm
  }
}
