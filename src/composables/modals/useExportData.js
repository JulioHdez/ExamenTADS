import { ref, reactive } from 'vue'
import api from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'
import { useFileSystem } from '@/composables/useFileSystem'
import { useDashboardStore } from '@/stores/dashboard'
import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export function useExportData() {
  const isExporting = ref(false)
  const { showSuccess, showError } = useNotifications()
  const { isSupported, requestDirectoryAccess, saveFileToDirectory, selectedDirectory } = useFileSystem()
  const dashboardStore = useDashboardStore()

  const formData = reactive({
    format: {
      excel: false,
      csv: false
    },
    include: {
      studentData: false,
      charts: false,
      statistics: false,
      riskFactors: false
    },
    destinationPath: ''
  })

  const handleExport = async (emit) => {
    isExporting.value = true
    
    try {
      // Validar que se haya seleccionado al menos un formato
      const selectedFormats = Object.values(formData.format).filter(Boolean)
      if (selectedFormats.length === 0) {
        throw new Error('Debe seleccionar al menos un formato de exportación')
      }

      // Validar que se haya seleccionado al menos un tipo de datos
      const selectedData = Object.values(formData.include).filter(Boolean)
      if (selectedData.length === 0) {
        throw new Error('Debe seleccionar al menos un tipo de datos para exportar')
      }

      // Si se selecciona "charts", capturar el dashboard completo
      if (formData.include.charts) {
        // Pasar los nombres de los formatos seleccionados, no los valores booleanos
        const selectedFormatNames = Object.entries(formData.format)
          .filter(([key, value]) => value)
          .map(([key]) => key)
        await exportDashboardCharts(selectedFormatNames)
      }

      // Preparar datos para exportar (excluyendo charts si ya se exportó)
      const exportData = {
        format: {
          excel: formData.format.excel,
          csv: formData.format.csv
        },
        include: {
          studentData: formData.include.studentData,
          charts: false, // Ya se exportó como imagen
          statistics: formData.include.statistics,
          riskFactors: formData.include.riskFactors
        }
      }

      // Solo hacer petición al backend si hay otros datos para exportar
      const hasOtherData = exportData.include.studentData || 
                          exportData.include.statistics || 
                          exportData.include.riskFactors

      if (hasOtherData) {
        const response = await api.post('/export', exportData)
        
        if (response.data.success) {
          // Descargar archivos según el formato
          if (response.data.results && response.data.results.length > 0) {
            for (const result of response.data.results) {
              if (result.error) {
                console.error(`Error exportando ${result.dataType}:`, result.error)
                continue
              }

              // Mapear nombres de tipos de datos a nombres de archivos
              const fileNames = {
                studentData: 'estudiantes',
                statistics: 'estadisticas',
                riskFactors: 'factores_riesgo',
                charts: 'graficos'
              }
              const fileName = fileNames[result.dataType] || result.dataType

              if (result.format === 'csv') {
                await downloadCSV(fileName, result.data)
              } else if (result.format === 'excel') {
                await downloadExcel(fileName, result.data)
              }
            }
          }
        }
      }
      
      if (formData.include.charts || hasOtherData) {
        showSuccess('Exportación exitosa', 'Los datos se han exportado correctamente')
      }
      
      // Resetear formulario
      resetForm()
      
      // Cerrar modal
      emit('close')
      
    } catch (error) {
      console.error('Error al exportar datos:', error)
      showError('Error al exportar', error.response?.data?.message || error.message || 'Hubo un error al exportar los datos')
      throw error
    } finally {
      isExporting.value = false
    }
  }

  const browseFolder = async () => {
    try {
      if (!isSupported.value) {
        showError('Navegador no compatible', 'Esta funcionalidad requiere Chrome o Edge. Los archivos se descargarán en la carpeta de Descargas por defecto.')
        formData.destinationPath = 'Descargas (fallback)'
        return
      }

      await requestDirectoryAccess()
      formData.destinationPath = 'Carpeta seleccionada (acceso concedido)'
      showSuccess('Carpeta seleccionada', 'Se guardarán los archivos en la carpeta elegida')
    } catch (error) {
      console.error('Error al seleccionar carpeta:', error)
      if (error.message?.includes('navegador')) {
        showError('No compatible', 'Esta funcionalidad no está disponible en este navegador')
      } else if (!error.message?.includes('cancel')) {
        showError('Error al seleccionar carpeta', 'Por favor intente nuevamente')
      }
    }
  }

  const downloadCSV = async (dataType, csvData) => {
    try {
      const timestamp = Date.now()
      const fileName = `${dataType}_${timestamp}.csv`
      
      // Si el navegador soporta File System Access y tenemos acceso a una carpeta, guardar allí
      if (isSupported.value && formData.destinationPath.includes('Carpeta seleccionada')) {
        try {
          await saveFileToDirectory(fileName, csvData, 'text/csv')
          return
        } catch (error) {
          console.warn('No se pudo guardar en carpeta seleccionada, usando descarga normal:', error)
        }
      }
      
      // Fallback: descarga normal del navegador
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al descargar CSV:', error)
    }
  }

  const exportDashboardCharts = async (formats) => {
    try {
      // Cerrar el modal primero para que no aparezca en la captura
      const modal = document.querySelector('.base-modal')
      const modalWasVisible = modal && window.getComputedStyle(modal).display !== 'none'
      if (modalWasVisible) {
        modal.style.display = 'none'
      }
      
      // Esperar un momento para asegurar que el DOM esté listo
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Buscar el elemento del dashboard - intentar diferentes selectores
      let dashboardElement = document.querySelector('.dashboard .main-content')
      if (!dashboardElement) {
        dashboardElement = document.querySelector('.main-content')
      }
      if (!dashboardElement) {
        dashboardElement = document.querySelector('.dashboard')
      }
      if (!dashboardElement) {
        throw new Error('No se pudo encontrar el elemento del dashboard')
      }

      // Detectar si está en modo oscuro
      const isDarkMode = document.documentElement.classList.contains('dark')
      const backgroundColor = isDarkMode ? '#0f172a' : '#f1f5f9'

      // Capturar el dashboard como imagen con mejor calidad
      const canvas = await html2canvas(dashboardElement, {
        backgroundColor: backgroundColor,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: dashboardElement.scrollWidth || dashboardElement.offsetWidth,
        windowHeight: dashboardElement.scrollHeight || dashboardElement.offsetHeight,
        width: dashboardElement.scrollWidth || dashboardElement.offsetWidth,
        height: dashboardElement.scrollHeight || dashboardElement.offsetHeight
      })
      
      // Restaurar el modal si estaba visible
      if (modalWasVisible && modal) {
        modal.style.display = ''
      }

      // Exportar según los formatos seleccionados
      // SOLO exportar Excel cuando se seleccione Excel
      if (formats.includes('excel')) {
        await exportDashboardToExcel(canvas)
      } else {
        // Si no se selecciona Excel, mostrar error
        throw new Error('Para exportar gráficos debe seleccionar el formato Excel')
      }
    } catch (error) {
      console.error('Error al exportar dashboard:', error)
      throw new Error(`Error al capturar el dashboard: ${error.message}`)
    }
  }

  const exportDashboardToPNG = async (canvas) => {
    try {
      const timestamp = Date.now()
      const fileName = `dashboard_graficos_${timestamp}.png`
      
      canvas.toBlob(async (blob) => {
        // Si el navegador soporta File System Access y tenemos acceso a una carpeta
        if (isSupported.value && formData.destinationPath.includes('Carpeta seleccionada')) {
          try {
            await saveFileToDirectory(fileName, blob, 'image/png')
            return
          } catch (error) {
            console.warn('No se pudo guardar en carpeta seleccionada, usando descarga normal:', error)
          }
        }
        
        // Fallback: descarga normal
        saveAs(blob, fileName)
      }, 'image/png')
    } catch (error) {
      console.error('Error al exportar dashboard a PNG:', error)
      throw error
    }
  }

  const exportDashboardToExcel = async (canvas) => {
    try {
      const timestamp = Date.now()
      const fileName = `dashboard_graficos_${timestamp}.xlsx`
      
      // Crear workbook
      const workbook = new ExcelJS.Workbook()
      
      // ===== HOJA 1: DASHBOARD (IMAGEN) =====
      const dashboardSheet = workbook.addWorksheet('Dashboard')
      
      // Agregar título
      dashboardSheet.mergeCells('A1:F1')
      const titleCell = dashboardSheet.getCell('A1')
      titleCell.value = 'Análisis de Datos - Dashboard Completo'
      titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C4068' }
      }
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
      
      // Agregar fecha
      dashboardSheet.mergeCells('A2:F2')
      const dateCell = dashboardSheet.getCell('A2')
      dateCell.value = `Fecha de exportación: ${new Date().toLocaleString('es-ES')}`
      dateCell.font = { size: 12, bold: true }
      dateCell.alignment = { horizontal: 'center' }
      
      // Ajustar altura de filas
      dashboardSheet.getRow(1).height = 30
      dashboardSheet.getRow(2).height = 25
      
      // Convertir canvas a buffer para Excel
      const imgBuffer = await new Promise(resolve => {
        canvas.toBlob(blob => {
          blob.arrayBuffer().then(buffer => resolve(buffer))
        }, 'image/png')
      })
      
      // Agregar imagen a Excel
      const imgId = workbook.addImage({
        buffer: imgBuffer,
        extension: 'png'
      })
      
      // Insertar imagen en la hoja (después de las 2 primeras filas)
      dashboardSheet.addImage(imgId, {
        tl: { col: 0, row: 2 },
        ext: { width: 1200, height: Math.min(canvas.height * (1200 / canvas.width), 8000) }
      })
      
      // Ajustar ancho de columnas
      dashboardSheet.columns = [
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 }
      ]
      
      // ===== HOJA 2: DATOS DEL DASHBOARD =====
      const dataSheet = workbook.addWorksheet('Datos')
      
      // Título de la hoja
      dataSheet.mergeCells('A1:H1')
      const dataTitleCell = dataSheet.getCell('A1')
      dataTitleCell.value = 'Datos del Dashboard'
      dataTitleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
      dataTitleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C4068' }
      }
      dataTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
      dataSheet.getRow(1).height = 30
      
      // Sección de Métricas
      dataSheet.mergeCells('A3:H3')
      const metricsTitleCell = dataSheet.getCell('A3')
      metricsTitleCell.value = 'Métricas Generales'
      metricsTitleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
      metricsTitleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1a2a4a' }
      }
      metricsTitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
      dataSheet.getRow(3).height = 25
      
      // Encabezados de métricas
      const metricsHeaders = ['Métrica', 'Valor']
      const metricsHeaderRow = dataSheet.addRow(metricsHeaders)
      metricsHeaderRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF374151' }
        }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
      
      // Datos de métricas
      const metrics = [
        ['Total Estudiantes', dashboardStore.metrics.totalStudents],
        ['Tasa de Aprobación', `${dashboardStore.metrics.approvalRate}%`],
        ['Tasa de Reprobación', `${dashboardStore.metrics.failureRate}%`],
        ['Tasa de Deserción', `${dashboardStore.metrics.dropoutRate}%`]
      ]
      
      metrics.forEach(metric => {
        const row = dataSheet.addRow(metric)
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
          if (colNumber === 2) {
            cell.alignment = { horizontal: 'center' }
          }
        })
      })
      
      // Espacio
      dataSheet.addRow([])
      
      // Sección de Estudiantes
      const studentsTitleRow = dataSheet.addRow(['Datos de Estudiantes'])
      studentsTitleRow.getCell(1).font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
      studentsTitleRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1a2a4a' }
      }
      studentsTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
      dataSheet.mergeCells(`A${studentsTitleRow.number}:H${studentsTitleRow.number}`)
      dataSheet.getRow(studentsTitleRow.number).height = 25
      
      // Encabezados de estudiantes
      const studentHeaders = [
        'ID',
        'Nombre',
        'Apellido Paterno',
        'Apellido Materno',
        'Carrera',
        'Semestre',
        'Promedio General',
        'Estatus'
      ]
      const studentHeaderRow = dataSheet.addRow(studentHeaders)
      studentHeaderRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF374151' }
        }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
      
      // Datos de estudiantes
      const students = dashboardStore.students || []
      students.forEach(student => {
        const studentRow = dataSheet.addRow([
          student.id_estudiante || student.id || '',
          student.nombre || '',
          student.apellido_paterno || '',
          student.apellido_materno || '',
          student.nombre_carrera || student.carrera || '',
          student.semestre_actual || '',
          student.promedio_general || 0,
          student.estatus || 'Activo'
        ])
        
        studentRow.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
          if (colNumber === 1 || colNumber === 6 || colNumber === 7) {
            cell.alignment = { horizontal: 'center' }
          }
        })
        
        // Formatear promedio como número con 2 decimales
        if (studentRow.getCell(7).value) {
          studentRow.getCell(7).numFmt = '0.00'
        }
      })
      
      // Ajustar ancho de columnas en la hoja de datos
      dataSheet.columns = [
        { width: 12 }, // ID
        { width: 20 }, // Nombre
        { width: 20 }, // Apellido Paterno
        { width: 20 }, // Apellido Materno
        { width: 25 }, // Carrera
        { width: 12 }, // Semestre
        { width: 18 }, // Promedio
        { width: 15 }  // Estatus
      ]
      
      // Generar buffer
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      
      // Si el navegador soporta File System Access y tenemos acceso a una carpeta
      if (isSupported.value && selectedDirectory.value && formData.destinationPath.includes('Carpeta seleccionada')) {
        try {
          await saveFileToDirectory(fileName, blob, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          return
        } catch (error) {
          console.warn('No se pudo guardar en carpeta seleccionada, usando descarga normal:', error)
        }
      }
      
      // Fallback: descarga normal
      saveAs(blob, fileName)
    } catch (error) {
      console.error('Error al exportar dashboard a Excel:', error)
      throw error
    }
  }

  const downloadExcel = async (dataType, data) => {
    try {
      const timestamp = Date.now()
      const fileName = `${dataType}_${timestamp}.xlsx`
      
      // Crear workbook
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Datos')
      
      // Agregar encabezados
      if (data && data.length > 0) {
        const headers = Object.keys(data[0])
        worksheet.addRow(headers)
        
        // Formatear encabezados
        const headerRow = worksheet.getRow(1)
        headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1a2a4a' }
        }
        headerRow.alignment = { horizontal: 'center' }
        
        // Agregar datos
        data.forEach(row => {
          const values = headers.map(header => row[header])
          worksheet.addRow(values)
        })
        
        // Ajustar ancho de columnas
        worksheet.columns.forEach((column, index) => {
          column.width = 20
        })
      }
      
      // Generar buffer
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      
      // Si el navegador soporta File System Access y tenemos acceso a una carpeta
      if (isSupported.value && selectedDirectory.value && formData.destinationPath.includes('Carpeta seleccionada')) {
        try {
          await saveFileToDirectory(fileName, blob, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          return
        } catch (error) {
          console.warn('No se pudo guardar en carpeta seleccionada, usando descarga normal:', error)
        }
      }
      
      // Fallback: descarga normal
      saveAs(blob, fileName)
    } catch (error) {
      console.error('Error al descargar Excel:', error)
      throw error
    }
  }

  const resetForm = () => {
    formData.format = {
      excel: false,
      csv: false
    }
    formData.include = {
      studentData: false,
      charts: false,
      statistics: false,
      riskFactors: false
    }
    formData.destinationPath = ''
  }

  const selectAllFormats = () => {
    formData.format.excel = true
    formData.format.csv = true
  }

  const selectAllData = () => {
    formData.include.studentData = true
    formData.include.charts = true
    formData.include.statistics = true
    formData.include.riskFactors = true
  }

  const clearAllFormats = () => {
    formData.format.excel = false
    formData.format.csv = false
  }

  const clearAllData = () => {
    formData.include.studentData = false
    formData.include.charts = false
    formData.include.statistics = false
    formData.include.riskFactors = false
  }

  return {
    isExporting,
    formData,
    handleExport,
    browseFolder,
    resetForm,
    selectAllFormats,
    selectAllData,
    clearAllFormats,
    clearAllData
  }
}
