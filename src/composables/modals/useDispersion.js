import { ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import api from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'
import { useFileSystem } from '@/composables/useFileSystem'
import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export function useDispersion() {
  const dashboardStore = useDashboardStore()
  const { showSuccess, showError, showWarning, showInfo } = useNotifications()
  const { isSupported, selectedDirectory, saveFileToDirectory } = useFileSystem()

  // Estado
  const selectedSemester = ref('')
  const variableX = ref('promedio') // promedio, factores
  const variableY = ref('factores') // factores, promedio
  const loading = ref(false)
  const scatterData = ref([])
  const correlation = ref(0)
  const folderSelected = ref(false)

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

  // Opciones de variables disponibles
  const availableVariables = computed(() => [
    { value: 'promedio', label: 'Promedio de Calificaciones', icon: '📊' },
    { value: 'factores', label: 'Número de Factores de Riesgo', icon: '⚠️' }
  ])

  // Formatear datos para el gráfico de dispersión
  const chartData = computed(() => {
    return scatterData.value.map(point => ({
      x: point.x,
      y: point.y,
      name: point.name,
      studentId: point.studentId
    }))
  })

  // Función para calcular correlación de Pearson
  const calculateCorrelation = (data) => {
    if (data.length === 0) return 0
    
    const meanX = data.reduce((sum, p) => sum + p.x, 0) / data.length
    const meanY = data.reduce((sum, p) => sum + p.y, 0) / data.length
    
    const numerator = data.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0)
    const denominatorX = Math.sqrt(data.reduce((sum, p) => sum + Math.pow(p.x - meanX, 2), 0))
    const denominatorY = Math.sqrt(data.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0))
    
    if (denominatorX === 0 || denominatorY === 0) return 0
    
    const r = numerator / (denominatorX * denominatorY)
    return Number(r.toFixed(4))
  }

  // Obtener nombre de la variable
  const getVariableName = (variable) => {
    const found = availableVariables.value.find(v => v.value === variable)
    return found ? found.label : variable
  }

  // Función para generar el diagrama de dispersión
  const generateScatter = async () => {
    if (!selectedSemester.value) {
      showWarning('Advertencia', 'Por favor seleccione un semestre')
      return
    }

    // Validar que las variables sean diferentes
    if (variableX.value === variableY.value) {
      showWarning('Advertencia', 'Seleccione variables diferentes para X e Y')
      return
    }

    loading.value = true
    try {
      console.log('Generando diagrama de dispersión para semestre:', selectedSemester.value)
      console.log('Variable X:', variableX.value, 'Variable Y:', variableY.value)
      
      // Obtener estudiantes del semestre seleccionado
      const students = dashboardStore.students.filter(
        student => student.semestre_actual == selectedSemester.value
      )

      console.log('Estudiantes encontrados:', students.length)

      if (students.length === 0) {
        showInfo('Información', 'No hay estudiantes en el semestre seleccionado')
        scatterData.value = []
        return
      }

      const points = []

      // Procesar cada estudiante
      for (const student of students) {
        let xValue = 0
        let yValue = 0

        try {
          // Calcular valor de X
          if (variableX.value === 'promedio') {
            const response = await api.get(`/estudiantes/${student.id_estudiante}/calificaciones`)
            const calificaciones = response.data.data || []
            if (calificaciones.length > 0) {
              const sum = calificaciones.reduce((acc, cal) => acc + parseFloat(cal.calificacion || 0), 0)
              xValue = sum / calificaciones.length
            }
          } else if (variableX.value === 'factores') {
            const response = await api.get(`/estudiantes/${student.id_estudiante}/factores`)
            const factores = response.data.data || []
            xValue = factores.length
          }

          // Calcular valor de Y
          if (variableY.value === 'promedio') {
            const response = await api.get(`/estudiantes/${student.id_estudiante}/calificaciones`)
            const calificaciones = response.data.data || []
            if (calificaciones.length > 0) {
              const sum = calificaciones.reduce((acc, cal) => acc + parseFloat(cal.calificacion || 0), 0)
              yValue = sum / calificaciones.length
            }
          } else if (variableY.value === 'factores') {
            const response = await api.get(`/estudiantes/${student.id_estudiante}/factores`)
            const factores = response.data.data || []
            yValue = factores.length
          }

          // Solo agregar si ambos valores son válidos
          if (!isNaN(xValue) && !isNaN(yValue) && isFinite(xValue) && isFinite(yValue) && xValue >= 0 && yValue >= 0) {
            points.push({
              x: Number(xValue.toFixed(2)),
              y: Number(yValue.toFixed(2)),
              name: `${student.nombre} ${student.apellido_paterno}`,
              studentId: student.id_estudiante
            })
          }
        } catch (error) {
          console.error(`Error al obtener datos del estudiante ${student.id_estudiante}:`, error)
        }
      }

      console.log('Puntos generados:', points)

      if (points.length === 0) {
        showInfo('Información', 'No se encontraron datos válidos para generar el diagrama de dispersión')
        scatterData.value = []
        correlation.value = 0
        return
      }

      scatterData.value = points
      correlation.value = calculateCorrelation(points)

      console.log('Datos de dispersión calculados:', points)
      console.log('Correlación:', correlation.value)
      
      showSuccess('Éxito', 'Diagrama de dispersión generado exitosamente')
    } catch (error) {
      console.error('Error al generar diagrama de dispersión:', error)
      showError('Error', 'Error al generar el diagrama de dispersión: ' + error.message)
    } finally {
      loading.value = false
    }
  }

  // Función para exportar a Excel
  const exportToExcel = async (chartElement) => {
    if (!scatterData.value || scatterData.value.length === 0) {
      showWarning('Advertencia', 'No hay datos para exportar')
      return
    }

    try {
      loading.value = true
      
      const workbook = new ExcelJS.Workbook()
      
      // HOJA 1: GRÁFICO DEL DIAGRAMA
      const chartSheet = workbook.addWorksheet('Diagrama de Dispersión')
      
      // Agregar título
      chartSheet.mergeCells('A1:F1')
      const chartTitle = chartSheet.getCell('A1')
      chartTitle.value = `Diagrama de Dispersión: ${getVariableName(variableX.value)} vs ${getVariableName(variableY.value)}`
      chartTitle.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
      chartTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C4068' }
      }
      chartTitle.alignment = { horizontal: 'center', vertical: 'middle' }
      
      // Información del semestre y correlación
      chartSheet.mergeCells('A2:F2')
      const semesterInfo = chartSheet.getCell('A2')
      semesterInfo.value = `Semestre ${selectedSemester.value} | Correlación: ${correlation.value}`
      semesterInfo.font = { size: 12, bold: true }
      semesterInfo.alignment = { horizontal: 'center' }
      
      // Espacio para la imagen
      chartSheet.getRow(1).height = 30
      chartSheet.getRow(2).height = 25
      
      // Capturar el gráfico como imagen
      const modalContent = document.querySelector('.dispersion-content')
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
        
        // Insertar imagen en la hoja
        chartSheet.addImage(imgId, {
          tl: { col: 1, row: 2 },
          ext: { width: 550, height: 350 }
        })
      }
      
      // Ajustar ancho de columnas
      chartSheet.columns = [{ width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }]
      
      // HOJA 2: DATOS
      const dataSheet = workbook.addWorksheet('Datos')
      
      // Título
      dataSheet.mergeCells('A1:D1')
      const titleCell = dataSheet.getCell('A1')
      titleCell.value = `Datos del Diagrama de Dispersión`
      titleCell.font = { size: 16, bold: true }
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C4068' }
      }
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
      titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
      
      const semesterRow = dataSheet.addRow([`Semestre: ${selectedSemester.value}`, '', '', ''])
      semesterRow.getCell(1).font = { size: 12, bold: true }
      
      dataSheet.addRow([`Correlación: ${correlation.value}`, '', '', ''])
      dataSheet.addRow([])
      
      // Encabezados
      const headerRow = dataSheet.addRow(['Estudiante', `X: ${getVariableName(variableX.value)}`, `Y: ${getVariableName(variableY.value)}`, 'Estudiante ID'])
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
      scatterData.value.forEach(point => {
        dataSheet.addRow([
          point.name,
          point.x,
          point.y,
          point.studentId
        ])
      })
      
      // Ajustar ancho de columnas
      dataSheet.columns.forEach(column => {
        column.width = 30
      })
      
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      
      const fecha = new Date().toISOString().split('T')[0]
      const nombreArchivo = `Diagrama_Dispersion_Semestre_${selectedSemester.value}_${fecha}.xlsx`
      
      // Intentar guardar en carpeta seleccionada si existe
      if (isSupported.value && selectedDirectory.value && folderSelected.value) {
        try {
          await saveFileToDirectory(nombreArchivo, blob, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          showSuccess('Éxito', 'Diagrama exportado a Excel en la carpeta seleccionada')
          loading.value = false
          return
        } catch (error) {
          console.warn('No se pudo guardar en carpeta seleccionada, usando descarga normal:', error)
        }
      }
      
      saveAs(blob, nombreArchivo)
      showSuccess('Éxito', 'Diagrama de dispersión exportado a Excel')
      loading.value = false
    } catch (error) {
      console.error('Error al exportar a Excel:', error)
      showError('Error', 'Error al exportar el archivo Excel')
      loading.value = false
    }
  }

  // Función para exportar a PDF
  const exportToPDF = async (chartElement) => {
    if (!scatterData.value || scatterData.value.length === 0) {
      showWarning('Advertencia', 'No hay datos para exportar')
      return
    }

    try {
      loading.value = true
      
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // === PÁGINA 1: PORTADA CON GRÁFICO ===
      // Fondo degradado azul oscuro
      pdf.setFillColor(26, 42, 74)
      pdf.rect(0, 0, pdfWidth, 50, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(28)
      pdf.text('DIAGRAMA DE DISPERSIÓN', pdfWidth / 2, 25, { align: 'center' })
      
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${getVariableName(variableX.value)} vs ${getVariableName(variableY.value)}`, pdfWidth / 2, 35, { align: 'center' })
      
      // Información del semestre y correlación
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Semestre ${selectedSemester.value}`, pdfWidth / 2, 45, { align: 'center' })
      
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Correlación: ${correlation.value}`, pdfWidth / 2, 50, { align: 'center' })
      
      // Capturar el gráfico
      const modalContent = document.querySelector('.dispersion-content')
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
      
      // Encabezado de página 2
      pdf.setFillColor(26, 42, 74)
      pdf.rect(0, 0, pdfWidth, 40, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(24)
      pdf.text('ANÁLISIS DE CORRELACIÓN', pdfWidth / 2, 25, { align: 'center' })
      
      // Información de correlación
      pdf.setFontSize(12)
      pdf.text(`Correlacion: ${correlation.value}`, 20, 50)
      pdf.text(`Semestre: ${selectedSemester.value}`, 20, 60)
      pdf.text(`Numero de puntos: ${scatterData.value.length}`, 20, 70)
      
      // Interpretación de la correlación
      pdf.setFontSize(10)
      pdf.setTextColor(55, 65, 81)
      const interpretationY = 85
      pdf.text('Interpretacion:', 20, interpretationY)
      
      let interpretation = ''
      if (Math.abs(correlation.value) < 0.2) {
        interpretation = 'No hay correlacion (|r| < 0.2)'
      } else if (Math.abs(correlation.value) < 0.4) {
        interpretation = 'Correlacion debil (0.2 <= |r| < 0.4)'
      } else if (Math.abs(correlation.value) < 0.7) {
        interpretation = 'Correlacion moderada (0.4 <= |r| < 0.7)'
      } else if (Math.abs(correlation.value) < 0.9) {
        interpretation = 'Correlacion fuerte (0.7 <= |r| < 0.9)'
      } else {
        interpretation = 'Correlacion muy fuerte (|r| >= 0.9)'
      }
      
      pdf.text(interpretation, 20, interpretationY + 8)
      
      // Tabla de datos
      let yPos = 100
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
        pdf.setFontSize(isHeader ? 9 : 8)
        pdf.text(text, x + w / 2, y + h / 2 + 3, { align: 'center', maxWidth: w - 6 })
      }
      
      // Headers de la tabla
      drawCell(20, yPos, 60, 10, 'Estudiante', true)
      drawCell(80, yPos, 40, 10, 'Variable X', true)
      drawCell(120, yPos, 40, 10, 'Variable Y', true)
      
      yPos += 10
      
      scatterData.value.forEach((item, index) => {
        if (yPos > pdfHeight - 30) {
          pdf.addPage()
          yPos = 20
          
          // Re-dibujar headers
          drawCell(20, yPos, 60, 10, 'Estudiante', true)
          drawCell(80, yPos, 40, 10, 'Variable X', true)
          drawCell(120, yPos, 40, 10, 'Variable Y', true)
          yPos += 10
        }
        
        drawCell(20, yPos, 60, 8, item.name, false)
        drawCell(80, yPos, 40, 8, item.x.toString(), false)
        drawCell(120, yPos, 40, 8, item.y.toString(), false)
        
        yPos += 8
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
      pdf.save(`Diagrama_Dispersion_Semestre_${selectedSemester.value}_${fechaArchivo}.pdf`)
      
      showSuccess('Éxito', 'Diagrama de dispersión exportado a PDF')
      loading.value = false
    } catch (error) {
      console.error('Error al exportar a PDF:', error)
      showError('Error', 'Error al exportar: ' + error.message)
      loading.value = false
    }
  }

  const resetForm = () => {
    selectedSemester.value = ''
    variableX.value = 'promedio'
    variableY.value = 'factores'
    scatterData.value = []
    correlation.value = 0
  }

  return {
    selectedSemester,
    variableX,
    variableY,
    loading,
    scatterData,
    correlation,
    availableSemesters,
    availableVariables,
    chartData,
    generateScatter,
    exportToExcel,
    exportToPDF,
    getVariableName,
    resetForm
  }
}

