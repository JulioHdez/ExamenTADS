import { ref, reactive } from 'vue'
import api from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'

export function useImportData() {
  const isImporting = ref(false)
  const selectedFile = ref(null)
  const { showSuccess, showError } = useNotifications()

  const formData = reactive({
    dataType: 'students',
    fileName: ''
  })

  const onFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    selectedFile.value = file
    formData.fileName = file.name
  }

  const resetForm = () => {
    selectedFile.value = null
    formData.dataType = 'students'
    formData.fileName = ''
  }

  const handleImport = async (emit) => {
    if (!selectedFile.value) {
      showError('Archivo requerido', 'Seleccione un archivo CSV o Excel')
      return
    }

    isImporting.value = true
    try {
      const fd = new FormData()
      fd.append('dataType', formData.dataType)
      fd.append('file', selectedFile.value)

      const response = await api.post('/import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data?.success) {
        const msg = response.data.message || 'Importación completada'
        // Soporte para respuesta multi-hoja (results) y simple
        let created = response.data.createdCount || 0
        let updated = response.data.updatedCount || 0
        if (response.data.results) {
          const r = response.data.results
          const sum = (obj, k) => (obj?.[k]?.createdCount || 0) + (obj?.[k]?.updatedCount || 0) // helper interno
          created = (r.students?.createdCount || 0) + (r.groups?.createdCount || 0) + (r.grades?.createdCount || 0) + (r.factors?.createdCount || 0)
          updated = (r.students?.updatedCount || 0) + (r.groups?.updatedCount || 0) + (r.grades?.updatedCount || 0) + (r.factors?.updatedCount || 0) + (r.notes?.updatedCount || 0)
        }
        const details = `Creados: ${created}, Actualizados: ${updated}`
        showSuccess(msg, details)
        emit('imported', response.data)
        emit('close')
        resetForm()
      } else {
        showError('Error al importar', response.data?.message || 'Ocurrió un error')
      }
    } catch (error) {
      console.error('Error al importar:', error)
      showError('Error al importar', error.response?.data?.message || error.message)
      throw error
    } finally {
      isImporting.value = false
    }
  }

  return {
    isImporting,
    formData,
    selectedFile,
    onFileChange,
    handleImport,
    resetForm
  }
}


