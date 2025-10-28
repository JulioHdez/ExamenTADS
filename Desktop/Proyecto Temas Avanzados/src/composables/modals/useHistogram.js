import { ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import api from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'
import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export function useHistogram() {
  const dashboardStore = useDashboardStore()
  const { showSuccess, showError, showWarning, showInfo } = useNotifications()

  // Estado
  const selectedSemester = ref('')
  const selectedMetric = ref('calificaciones') // calificaciones, factores, aprobados
  const loading = ref(false)
  const histogramData = ref([])
  const stats = ref({
    mean: 0,
    median: 0,
    mode: 0,
    stdDev: 0,
    min: 0,
    max: 0
  })

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

  // Computed para las métricas disponibles
  const availableMetrics = computed(() => [
    { value: 'calificaciones', label: 'Calificaciones', description: 'Distribución de calificaciones' },
    { value: 'factores', label: 'Factores de Riesgo', description: 'Número de factores por estudiante' },
    { value: 'aprobados', label: 'Aprobados/Reprobados', description: 'Porcentaje de aprobación' }
  ])

  // Función para calcular estadísticas
  const calculateStats = (values) => {
    if (values.length === 0) return { mean: 0, median: 0, mode: 0, stdDev: 0, min: 0, max: 0 }
    
    const sorted = [...values].sort((a, b) => a - b)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]
    
    // Calcular moda
    const frequency = {}
    values.forEach(val => frequency[val] = (frequency[val] || 0) + 1)
    let maxFreq = 0
    let mode = values[0]
    Object.keys(frequency).forEach(key => {
      if (frequency[key] > maxFreq) {
        maxFreq = frequency[key]
        mode = parseFloat(key)
      }
    })
    
    // Calcular desviación estándar
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    
    return {
      mean: Number(mean.toFixed(2)),
      median: Number(median.toFixed(2)),
      mode: Number(mode.toFixed(2)),
      stdDev: Number(stdDev.toFixed(2)),
      min: sorted[0],
      max: sorted[sorted.length - 1]
    }
  }

  // Función para crear bins del histograma
  const createBins = (values, numBins = 10) => {
    if (values.length === 0) return []
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    const binWidth = (max - min) / numBins
    
    const bins = Array(numBins).fill(0).map((_, i) => ({
      range: `${(min + i * binWidth).toFixed(1)} - ${(min + (i + 1) * binWidth).toFixed(1)}`,
      min: min + i * binWidth,
      max: min + (i + 1) * binWidth,
      frequency: 0
    }))
    
    values.forEach(value => {
      const binIndex = Math.min(
        Math.floor((value - min) / binWidth),
        numBins - 1
      )
      bins[binIndex].frequency++
    })
    
    return bins
  }

  // Función para generar el histograma
  const generateHistogram = async () => {
    if (!selectedSemester.value) {
      showWarning('Advertencia', 'Por favor seleccione un semestre')
      return
    }

    loading.value = true
    try {
      console.log('Generando histograma para semestre:', selectedSemester.value, 'métrica:', selectedMetric.value)
      
      // Obtener estudiantes del semestre seleccionado
      const students = dashboardStore.students.filter(
        student => student.semestre_actual == selectedSemester.value
      )

      console.log('Estudiantes encontrados:', students.length)

      if (students.length === 0) {
        showInfo('Información', 'No hay estudiantes en el semestre seleccionado')
        histogramData.value = []
        return
      }

      let values = []

      // Obtener datos según la métrica seleccionada
      if (selectedMetric.value === 'calificaciones') {
        // Obtener calificaciones de todos los estudiantes
        for (const student of students) {
          try {
            const response = await api.get(`/estudiantes/${student.id_estudiante}/calificaciones`)
            const calificaciones = response.data.data || []
            calificaciones.forEach(cal => {
              if (cal.calificacion) {
                values.push(parseFloat(cal.calificacion))
              }
            })
          } catch (error) {
            console.error(`Error al obtener calificaciones del estudiante ${student.id_estudiante}:`, error)
          }
        }
      } else if (selectedMetric.value === 'factores') {
        // Contar factores de riesgo por estudiante
        for (const student of students) {
          try {
            const response = await api.get(`/estudiantes/${student.id_estudiante}/factores`)
            const factores = response.data.data || []
            values.push(factores.length)
          } catch (error) {
            console.error(`Error al obtener factores del estudiante ${student.id_estudiante}:`, error)
          }
        }
      } else if (selectedMetric.value === 'aprobados') {
        // Calcular porcentaje de aprobación por estudiante
        for (const student of students) {
          try {
            const response = await api.get(`/estudiantes/${student.id_estudiante}/calificaciones`)
            const calificaciones = response.data.data || []
            const total = calificaciones.length
            const aprobados = calificaciones.filter(cal => cal.calificacion >= 70).length
            const porcentaje = total > 0 ? (aprobados / total) * 100 : 0
            values.push(porcentaje)
          } catch (error) {
            console.error(`Error al calcular aprobación del estudiante ${student.id_estudiante}:`, error)
          }
        }
      }

      console.log('Valores obtenidos:', values)

      if (values.length === 0) {
        showInfo('Información', 'No se encontraron datos para generar el histograma')
        histogramData.value = []
        return
      }

      // Crear bins del histograma
      const bins = createBins(values, 10)
      histogramData.value = bins

      // Calcular estadísticas
      stats.value = calculateStats(values)
      
      console.log('Histograma generado:', bins)
      console.log('Estadísticas:', stats.value)
      
      showSuccess('Éxito', 'Histograma generado exitosamente')
    } catch (error) {
      console.error('Error al generar histograma:', error)
      showError('Error', 'Error al generar el histograma: ' + error.message)
    } finally {
      loading.value = false
    }
  }

  // Función para exportar a Excel
  const exportToExcel = async (chartElement) => {
    if (!histogramData.value || histogramData.value.length === 0) {
      showWarning('Advertencia', 'No hay datos para exportar')
      return
    }

    try {
      loading.value = true
      
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Histograma')
      
      // Título
      worksheet.mergeCells('A1:D1')
      const titleCell = worksheet.getCell('A1')
      titleCell.value = `Histograma - ${availableMetrics.value.find(m => m.value === selectedMetric.value)?.label || 'Datos'}`
      titleCell.font = { size: 16, bold: true }
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C4068' }
      }
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
      titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
      
      const semesterRow = worksheet.addRow([`Semestre: ${selectedSemester.value}`, '', '', ''])
      semesterRow.getCell(1).font = { size: 12, bold: true }
      
      worksheet.addRow([])
      
      // Encabezados
      const headerRow = worksheet.addRow(['Rango', 'Frecuencia', 'Porcentaje', 'Porcentaje Acumulado'])
      headerRow.eachCell((cell) => {
        cell.font = { bold: true }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1a2a4a' }
        }
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.alignment = { horizontal: 'center' }
      })
      
      // Datos
      const total = histogramData.value.reduce((sum, bin) => sum + bin.frequency, 0)
      let cumulative = 0
      
      histogramData.value.forEach(bin => {
        cumulative += bin.frequency
        worksheet.addRow([
          bin.range,
          bin.frequency,
          `${((bin.frequency / total) * 100).toFixed(2)}%`,
          `${((cumulative / total) * 100).toFixed(2)}%`
        ])
      })
      
      // Estadísticas
      worksheet.addRow([])
      const statsRow = worksheet.addRow(['Estadísticas', '', '', ''])
      statsRow.getCell(1).font = { size: 14, bold: true }
      
      worksheet.addRow(['Media', stats.value.mean, '', ''])
      worksheet.addRow(['Mediana', stats.value.median, '', ''])
      worksheet.addRow(['Moda', stats.value.mode, '', ''])
      worksheet.addRow(['Desviación Estándar', stats.value.stdDev, '', ''])
      worksheet.addRow(['Mínimo', stats.value.min, '', ''])
      worksheet.addRow(['Máximo', stats.value.max, '', ''])
      
      // Ajustar ancho de columnas
      worksheet.columns.forEach(column => {
        column.width = 25
      })
      
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      
      const fecha = new Date().toISOString().split('T')[0]
      const nombreArchivo = `Histograma_${selectedMetric.value}_Semestre_${selectedSemester.value}_${fecha}.xlsx`
      saveAs(blob, nombreArchivo)
      
      showSuccess('Éxito', 'Histograma exportado a Excel')
      loading.value = false
    } catch (error) {
      console.error('Error al exportar a Excel:', error)
      showError('Error', 'Error al exportar el archivo Excel')
      loading.value = false
    }
  }

  // Función para exportar a PDF
  const exportToPDF = async (chartElement) => {
    if (!histogramData.value || histogramData.value.length === 0) {
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
      pdf.text(`Histograma - ${availableMetrics.value.find(m => m.value === selectedMetric.value)?.label || 'Datos'}`, pdfWidth / 2, 20, { align: 'center' })
      
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
      
      // === PÁGINA 2: DATOS Y ESTADÍSTICAS ===
      pdf.addPage('landscape', 'a4')
      
      pdf.setFontSize(20)
      pdf.setTextColor(26, 42, 74)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Datos del Histograma', pdfWidth / 2, 20, { align: 'center' })
      
      pdf.setFontSize(12)
      pdf.setTextColor(107, 114, 128)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Semestre ${selectedSemester.value}`, pdfWidth / 2, 30, { align: 'center' })
      
      // Tabla de datos
      let yPos = 45
      const drawCell = (x, y, w, h, text, isHeader = false) => {
        pdf.setFillColor(isHeader ? 26 : (y % 8 === 45 ? 249 : 255), isHeader ? 42 : (y % 8 === 45 ? 250 : 255), isHeader ? 74 : (y % 8 === 45 ? 251 : 255))
        pdf.rect(x, y, w, h, 'FD')
        
        pdf.setTextColor(isHeader ? 255 : 55, isHeader ? 255 : 65, isHeader ? 255 : 81)
        pdf.setFont('helvetica', isHeader ? 'bold' : 'normal')
        pdf.setFontSize(isHeader ? 10 : 9)
        pdf.text(text, x + 3, y + h / 2 + 3, { maxWidth: w - 6 })
      }
      
      const total = histogramData.value.reduce((sum, bin) => sum + bin.frequency, 0)
      let cumulative = 0
      
      drawCell(20, yPos, 80, 10, 'Rango', true)
      drawCell(100, yPos, 30, 10, 'Frecuencia', true)
      drawCell(130, yPos, 30, 10, 'Porcentaje', true)
      drawCell(160, yPos, 30, 10, 'Acumulado', true)
      
      yPos += 10
      
      histogramData.value.forEach(item => {
        if (yPos > pdfHeight - 20) {
          pdf.addPage()
          yPos = 20
        }
        
        cumulative += item.frequency
        
        drawCell(20, yPos, 80, 8, item.range, false)
        drawCell(100, yPos, 30, 8, item.frequency.toString(), false)
        drawCell(130, yPos, 30, 8, `${((item.frequency / total) * 100).toFixed(2)}%`, false)
        drawCell(160, yPos, 30, 8, `${((cumulative / total) * 100).toFixed(2)}%`, false)
        
        yPos += 8
      })
      
      // Estadísticas
      yPos += 15
      pdf.setFontSize(14)
      pdf.setTextColor(26, 42, 74)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Estadísticas Descriptivas', 20, yPos)
      
      yPos += 10
      
      const statLabels = [
        ['Media', stats.value.mean],
        ['Mediana', stats.value.median],
        ['Moda', stats.value.mode],
        ['Desviación Estándar', stats.value.stdDev],
        ['Mínimo', stats.value.min],
        ['Máximo', stats.value.max]
      ]
      
      statLabels.forEach(([label, value]) => {
        drawCell(20, yPos, 80, 8, label, false)
        drawCell(100, yPos, 30, 8, value.toString(), false)
        yPos += 8
      })
      
      const fecha = new Date().toISOString().split('T')[0]
      pdf.save(`Histograma_${selectedMetric.value}_Semestre_${selectedSemester.value}_${fecha}.pdf`)
      
      showSuccess('Éxito', 'Histograma exportado a PDF exitosamente')
      loading.value = false
    } catch (error) {
      console.error('Error al exportar a PDF:', error)
      showError('Error', 'Error al exportar: ' + error.message)
      loading.value = false
    }
  }

  const resetForm = () => {
    selectedSemester.value = ''
    selectedMetric.value = 'calificaciones'
    histogramData.value = []
    stats.value = { mean: 0, median: 0, mode: 0, stdDev: 0, min: 0, max: 0 }
  }

  return {
    selectedSemester,
    selectedMetric,
    loading,
    histogramData,
    stats,
    availableSemesters,
    availableMetrics,
    generateHistogram,
    exportToExcel,
    exportToPDF,
    resetForm
  }
}

