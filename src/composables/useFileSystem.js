import { ref } from 'vue'

export function useFileSystem() {
  const selectedDirectory = ref(null)
  const isSupported = ref(typeof window.showDirectoryPicker !== 'undefined')

  // Solicitar permiso para acceder a una carpeta
  const requestDirectoryAccess = async () => {
    if (!isSupported.value) {
      throw new Error('La selección de carpeta no está disponible en este navegador. Use Chrome o Edge.')
    }

    try {
      const directoryHandle = await window.showDirectoryPicker()
      selectedDirectory.value = directoryHandle
      return directoryHandle
    } catch (error) {
      if (error.name === 'AbortError') {
        return null // Usuario canceló
      }
      throw error
    }
  }

  // Guardar archivo en la carpeta seleccionada
  const saveFileToDirectory = async (filename, content, mimeType = 'text/plain') => {
    if (!selectedDirectory.value && isSupported.value) {
      await requestDirectoryAccess()
    }

    if (!isSupported.value) {
      // Fallback: descarga normal del navegador
      downloadFile(filename, content, mimeType)
      return
    }

    try {
      const fileHandle = await selectedDirectory.value.getFileHandle(filename, { create: true })
      const writable = await fileHandle.createWritable()
      
      if (typeof content === 'string') {
        await writable.write(content)
      } else if (content instanceof Blob) {
        await writable.write(content)
      } else {
        await writable.write(JSON.stringify(content, null, 2))
      }
      
      await writable.close()
      return fileHandle
    } catch (error) {
      console.error('Error al guardar archivo:', error)
      throw error
    }
  }

  // Guardar múltiples archivos en la carpeta
  const saveMultipleFilesToDirectory = async (files) => {
    if (!selectedDirectory.value && isSupported.value) {
      await requestDirectoryAccess()
    }

    if (!isSupported.value) {
      // Fallback: descargar todos los archivos
      files.forEach(({ filename, content, mimeType }) => {
        downloadFile(filename, content, mimeType)
      })
      return
    }

    const results = []
    for (const file of files) {
      try {
        const result = await saveFileToDirectory(file.filename, file.content, file.mimeType)
        results.push({ success: true, filename: file.filename, result })
      } catch (error) {
        results.push({ success: false, filename: file.filename, error })
      }
    }
    return results
  }

  // Descarga normal de archivo (para navegadores sin soporte)
  const downloadFile = (filename, content, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Verificar si tenemos acceso persistente
  const hasPersistentAccess = async () => {
    if (!isSupported.value) return false
    return selectedDirectory.value !== null
  }

  // Liberar acceso a la carpeta
  const releaseAccess = () => {
    selectedDirectory.value = null
  }

  return {
    isSupported,
    selectedDirectory,
    requestDirectoryAccess,
    saveFileToDirectory,
    saveMultipleFilesToDirectory,
    hasPersistentAccess,
    releaseAccess
  }
}

