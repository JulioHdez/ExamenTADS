import { ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import api from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'
import { useFileSystem } from '@/composables/useFileSystem'
import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export function useHistogram() {
  const dashboardStore = useDashboardStore()
  const { showSuccess, showError, showWarning, showInfo } = useNotifications()
  const { isSupported, selectedDirectory, saveFileToDirectory } = useFileSystem()

  // Estado
  const selectedSemester = ref('')
  const selectedMetric = ref('calificaciones') // calificaciones, factores, aprobados
  const loading = ref(false)
  const histogramData = ref([])
  const folderSelected = ref(false)
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
    
    // Ajustar número de bins según la cantidad de datos
    let optimalBins = numBins
    if (values.length < 10) {
      optimalBins = Math.min(5, values.length)
    } else if (values.length < 30) {
      optimalBins = 7
    }
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    // Caso especial: todos los valores son iguales
    if (min === max) {
      return [{
        range: `${min.toFixed(1)}`,
        frequency: values.length
      }]
    }
    
    const binWidth = (max - min) / optimalBins
    
    const bins = Array(optimalBins).fill(0).map((_, i) => ({
      range: `${(min + i * binWidth).toFixed(1)} - ${(min + (i + 1) * binWidth).toFixed(1)}`,
      min: min + i * binWidth,
      max: min + (i + 1) * binWidth,
      frequency: 0
    }))
    
    values.forEach(value => {
      let binIndex = Math.floor((value - min) / binWidth)
      
      // Si value es exactamente igual a max, asignar al último bin
      if (value >= max) {
        binIndex = optimalBins - 1
      } else {
        binIndex = Math.max(0, Math.min(binIndex, optimalBins - 1))
      }
      
      if (bins[binIndex]) {
        bins[binIndex].frequency++
      }
    })
    
    // Si solo hay un bin con datos, intentar usar bins más pequeños
    const binsWithData = bins.filter(bin => bin.frequency > 0)
    if (binsWithData.length === 1 && values.length > 1 && min !== max) {
      // Crear más bins para mejor distribución
      return createBins(values, 5)
    }
    
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
                const value = parseFloat(cal.calificacion)
                if (!isNaN(value) && isFinite(value)) {
                  values.push(value)
                }
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
      
      // Filtrar valores inválidos
      values = values.filter(v => !isNaN(v) && isFinite(v))

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
      
      // HOJA 1: GRÁFICO DEL HISTOGRAMA
      const chartSheet = workbook.addWorksheet('Gráfico del Histograma')
      
      // Agregar título
      chartSheet.mergeCells('A1:F1')
      const chartTitle = chartSheet.getCell('A1')
      chartTitle.value = `Histograma - ${availableMetrics.value.find(m => m.value === selectedMetric.value)?.label || 'Datos'}`
      chartTitle.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
      chartTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C4068' }
      }
      chartTitle.alignment = { horizontal: 'center', vertical: 'middle' }
      
      // Información del semestre
      chartSheet.mergeCells('A2:F2')
      const semesterInfo = chartSheet.getCell('A2')
      semesterInfo.value = `Semestre ${selectedSemester.value}`
      semesterInfo.font = { size: 12, bold: true }
      semesterInfo.alignment = { horizontal: 'center' }
      
      // Espacio para la imagen
      chartSheet.getRow(1).height = 30
      chartSheet.getRow(2).height = 25
      
      // Capturar el gráfico como imagen
      const modalContent = document.querySelector('.histogram-content')
      if (modalContent) {
        const canvas = await html2canvas(modalContent.querySelector('.chart-container'), {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        })
        
        // Convertir canvas a buffer para Excel
        const imgBuffer = await new Promise(resolve => {
          canvas.toBlob(blob => {
            blob.arrayBuffer().then(buffer => resolve(buffer))
          })
        })
        
        // Agregar imagen a Excel
        const imgId = workbook.addImage({
          buffer: imgBuffer,
          extension: 'png'
        })
        
        // Insertar imagen en la hoja (después de las 2 primeras filas)
        chartSheet.addImage(imgId, {
          tl: { col: 1, row: 2 },
          ext: { width: 550, height: 350 }
        })
      }
      
      // Ajustar ancho de columnas
      chartSheet.columns = [{ width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }]
      
      // HOJA 2: DATOS DEL HISTOGRAMA
      const histogramSheet = workbook.addWorksheet('Datos del Histograma')
      
      // Título
      histogramSheet.mergeCells('A1:E1')
      const titleCell = histogramSheet.getCell('A1')
      titleCell.value = `Histograma - ${availableMetrics.value.find(m => m.value === selectedMetric.value)?.label || 'Datos'}`
      titleCell.font = { size: 16, bold: true }
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C4068' }
      }
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
      titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
      
      const semesterRow = histogramSheet.addRow([`Semestre: ${selectedSemester.value}`, '', '', '', ''])
      semesterRow.getCell(1).font = { size: 12, bold: true }
      
      histogramSheet.addRow([])
      
      // Encabezados
      const headerRow = histogramSheet.addRow(['Rango', 'Frecuencia', 'Porcentaje', 'Porcentaje Acumulado', ''])
      headerRow.eachCell((cell) => {
        if (cell.col <= 4) {
          cell.font = { bold: true }
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1a2a4a' }
          }
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
          cell.alignment = { horizontal: 'center' }
        }
      })
      
      // Datos
      const total = histogramData.value.reduce((sum, bin) => sum + bin.frequency, 0)
      let cumulative = 0
      
      histogramData.value.forEach(bin => {
        cumulative += bin.frequency
        histogramSheet.addRow([
          bin.range,
          bin.frequency,
          `${((bin.frequency / total) * 100).toFixed(2)}%`,
          `${((cumulative / total) * 100).toFixed(2)}%`,
          ''
        ])
      })
      
      // Ajustar ancho de columnas
      histogramSheet.columns.forEach(column => {
        column.width = 25
      })
      
      // HOJA 2: ESTADÍSTICAS DESCRIPTIVAS
      const statsSheet = workbook.addWorksheet('Estadísticas')
      
      statsSheet.mergeCells('A1:B1')
      const statsTitleCell = statsSheet.getCell('A1')
      statsTitleCell.value = 'Estadísticas Descriptivas'
      statsTitleCell.font = { size: 16, bold: true }
      statsTitleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C4068' }
      }
      statsTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
      statsTitleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
      
      statsSheet.addRow([`Semestre: ${selectedSemester.value}`, ''])
      statsSheet.addRow([])
      
      const statHeaders = statsSheet.addRow(['Estadística', 'Valor'])
      statHeaders.eachCell((cell) => {
        cell.font = { bold: true }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1a2a4a' }
        }
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.alignment = { horizontal: 'center' }
      })
      
      statsSheet.addRow(['Media', stats.value.mean])
      statsSheet.addRow(['Mediana', stats.value.median])
      statsSheet.addRow(['Moda', stats.value.mode])
      statsSheet.addRow(['Desviación Estándar', stats.value.stdDev])
      statsSheet.addRow(['Mínimo', stats.value.min])
      statsSheet.addRow(['Máximo', stats.value.max])
      
      statsSheet.columns.forEach(column => {
        column.width = 30
      })
      
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      
      const fecha = new Date().toISOString().split('T')[0]
      const nombreArchivo = `Histograma_${selectedMetric.value}_Semestre_${selectedSemester.value}_${fecha}.xlsx`
      
      // Intentar guardar en carpeta seleccionada si existe
      if (isSupported.value && selectedDirectory.value && folderSelected.value) {
        try {
          await saveFileToDirectory(nombreArchivo, blob, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          showSuccess('Éxito', 'Histograma exportado a Excel en la carpeta seleccionada')
          loading.value = false
          return
        } catch (error) {
          console.warn('No se pudo guardar en carpeta seleccionada, usando descarga normal:', error)
        }
      }
      
      saveAs(blob, nombreArchivo)
      showSuccess('Éxito', 'Histograma exportado a Excel con múltiples hojas')
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
      const metricName = availableMetrics.value.find(m => m.value === selectedMetric.value)?.label || 'Datos'
      
      // === PÁGINA 1: PORTADA CON PLANTILLA ===
      // Fondo degradado azul oscuro
      pdf.setFillColor(26, 42, 74)
      pdf.rect(0, 0, pdfWidth, 50, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(28)
      pdf.text('HISTOGRAMA DE DISTRIBUCIÓN', pdfWidth / 2, 25, { align: 'center' })
      
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Análisis de ${metricName}`, pdfWidth / 2, 35, { align: 'center' })
      
      // Información del semestre
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Semestre ${selectedSemester.value}`, pdfWidth / 2, 45, { align: 'center' })
      
      // Capturar el gráfico
      const modalContent = document.querySelector('.histogram-content')
      if (modalContent) {
        const canvas = await html2canvas(modalContent.querySelector('.chart-container'), {
          backgroundColor: '#ffffff',
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
      
      // Encabezado de página 2 (azul oscuro)
      pdf.setFillColor(26, 42, 74)
      pdf.rect(0, 0, pdfWidth, 40, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(24)
      pdf.text('ANÁLISIS DETALLADO DE DATOS', pdfWidth / 2, 25, { align: 'center' })
      
      // Tarjetas de estadísticas (6 tarjetas más pequeñas)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      
      const tarjetaWidth = 38
      const tarjetaHeight = 25
      const spacing = 2
      const startX = 20
      
      // Fila 1: Media, Mediana, Moda
      pdf.setFillColor(59, 130, 246)
      pdf.rect(startX, 50, tarjetaWidth, tarjetaHeight, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(8)
      pdf.text('MEDIA', startX + tarjetaWidth/2, 59, { align: 'center' })
      pdf.setFontSize(18)
      pdf.text(`${stats.value.mean}`, startX + tarjetaWidth/2, 68, { align: 'center' })
      
      pdf.setFillColor(16, 185, 129)
      pdf.rect(startX + tarjetaWidth + spacing, 50, tarjetaWidth, tarjetaHeight, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(8)
      pdf.text('MEDIANA', startX + tarjetaWidth + spacing + tarjetaWidth/2, 59, { align: 'center' })
      pdf.setFontSize(18)
      pdf.text(`${stats.value.median}`, startX + tarjetaWidth + spacing + tarjetaWidth/2, 68, { align: 'center' })
      
      pdf.setFillColor(139, 92, 246)
      pdf.rect(startX + (tarjetaWidth + spacing) * 2, 50, tarjetaWidth, tarjetaHeight, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(8)
      pdf.text('MODA', startX + (tarjetaWidth + spacing) * 2 + tarjetaWidth/2, 59, { align: 'center' })
      pdf.setFontSize(18)
      pdf.text(`${stats.value.mode}`, startX + (tarjetaWidth + spacing) * 2 + tarjetaWidth/2, 68, { align: 'center' })
      
      // Fila 2: Desviación, Mínimo, Máximo
      pdf.setFillColor(245, 158, 11)
      pdf.rect(startX, 50 + tarjetaHeight + spacing, tarjetaWidth, tarjetaHeight, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(8)
      pdf.text('DESV. STD', startX + tarjetaWidth/2, 59 + tarjetaHeight + spacing, { align: 'center' })
      pdf.setFontSize(18)
      pdf.text(`${stats.value.stdDev}`, startX + tarjetaWidth/2, 68 + tarjetaHeight + spacing, { align: 'center' })
      
      pdf.setFillColor(239, 68, 68)
      pdf.rect(startX + tarjetaWidth + spacing, 50 + tarjetaHeight + spacing, tarjetaWidth, tarjetaHeight, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(8)
      pdf.text('MÍNIMO', startX + tarjetaWidth + spacing + tarjetaWidth/2, 59 + tarjetaHeight + spacing, { align: 'center' })
      pdf.setFontSize(18)
      pdf.text(`${stats.value.min}`, startX + tarjetaWidth + spacing + tarjetaWidth/2, 68 + tarjetaHeight + spacing, { align: 'center' })
      
      pdf.setFillColor(236, 72, 153)
      pdf.rect(startX + (tarjetaWidth + spacing) * 2, 50 + tarjetaHeight + spacing, tarjetaWidth, tarjetaHeight, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(8)
      pdf.text('MÁXIMO', startX + (tarjetaWidth + spacing) * 2 + tarjetaWidth/2, 59 + tarjetaHeight + spacing, { align: 'center' })
      pdf.setFontSize(18)
      pdf.text(`${stats.value.max}`, startX + (tarjetaWidth + spacing) * 2 + tarjetaWidth/2, 68 + tarjetaHeight + spacing, { align: 'center' })
      
      const totalFreq = histogramData.value.reduce((sum, bin) => sum + bin.frequency, 0)
      
      // Tabla de datos
      let yPos = 105
      const drawCell = (x, y, w, h, text, isHeader = false) => {
        if (isHeader) {
          pdf.setFillColor(26, 42, 74)
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
      drawCell(20, yPos, 50, 12, 'Rango', true)
      drawCell(70, yPos, 40, 12, 'Frecuencia', true)
      drawCell(110, yPos, 40, 12, 'Porcentaje', true)
      drawCell(150, yPos, 50, 12, 'Acumulado', true)
      
      yPos += 12
      
      let cumulative = 0
      histogramData.value.forEach(item => {
        if (yPos > pdfHeight - 30) {
          pdf.addPage()
          yPos = 20
          
          // Re-dibujar headers
          drawCell(20, yPos, 50, 12, 'Rango', true)
          drawCell(70, yPos, 40, 12, 'Frecuencia', true)
          drawCell(110, yPos, 40, 12, 'Porcentaje', true)
          drawCell(150, yPos, 50, 12, 'Acumulado', true)
          yPos += 12
        }
        
        cumulative += item.frequency
        
        drawCell(20, yPos, 50, 10, item.range, false)
        drawCell(70, yPos, 40, 10, item.frequency.toString(), false)
        drawCell(110, yPos, 40, 10, `${((item.frequency / totalFreq) * 100).toFixed(2)}%`, false)
        drawCell(150, yPos, 50, 10, `${((cumulative / totalFreq) * 100).toFixed(2)}%`, false)
        
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
      pdf.text(`Semestre ${selectedSemester.value} - Sistema de Análisis de Rendimiento Académico`, pdfWidth - 22, yPos + 8, { align: 'right' })
      
      const fechaArchivo = new Date().toISOString().split('T')[0]
      pdf.save(`Histograma_${selectedMetric.value}_Semestre_${selectedSemester.value}_${fechaArchivo}.pdf`)
      
      showSuccess('Éxito', 'Histograma exportado a PDF con plantilla profesional')
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

