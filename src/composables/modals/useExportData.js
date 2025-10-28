import { ref, reactive } from 'vue'
import api from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'
import { useFileSystem } from '@/composables/useFileSystem'
import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export function useExportData() {
  const isExporting = ref(false)
  const { showSuccess, showError } = useNotifications()
  const { isSupported, requestDirectoryAccess, saveFileToDirectory, selectedDirectory } = useFileSystem()

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

      // Preparar datos para exportar
      const exportData = {
        format: {
          excel: formData.format.excel,
          csv: formData.format.csv
        },
        include: {
          studentData: formData.include.studentData,
          charts: formData.include.charts,
          statistics: formData.include.statistics,
          riskFactors: formData.include.riskFactors
        }
      }

      // Hacer petición al backend
      const response = await api.post('/export', exportData)
      
      if (response.data.success) {
        showSuccess('Exportación exitosa', 'Los datos se han exportado correctamente')
        
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
      
      // Resetear formulario
      resetForm()
      
      // Cerrar modal
      emit('close')
      
    } catch (error) {
      console.error('Error al exportar datos:', error)
      showError('Error al exportar', error.response?.data?.message || 'Hubo un error al exportar los datos')
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
