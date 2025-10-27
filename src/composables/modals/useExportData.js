import { ref, reactive } from 'vue'

export function useExportData() {
  const isExporting = ref(false)

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

      // Simular delay de exportación
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Emitir evento con los datos del formulario
      emit('export', { ...formData })
      
      // Resetear formulario
      resetForm()
      
      // Cerrar modal
      emit('close')
      
    } catch (error) {
      console.error('Error al exportar datos:', error)
      // Aquí podrías mostrar una notificación de error
      throw error
    } finally {
      isExporting.value = false
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
    resetForm,
    selectAllFormats,
    selectAllData,
    clearAllFormats,
    clearAllData
  }
}
