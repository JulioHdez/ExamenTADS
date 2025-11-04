import { ref } from 'vue'

// Estado global de notificaciones
const notifications = ref([])

export function useNotifications() {
  const addNotification = (notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      autoClose: true,
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    // Auto-remove si tiene autoClose habilitado
    if (newNotification.autoClose && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  // Métodos de conveniencia
  const showError = (title, message, options = {}) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 10000, // 10 segundos para errores
      ...options
    })
  }
  
  // Método para mostrar errores con detalles del backend
  const showErrorWithDetails = (title, message, errorDetails = {}) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 10000, // 10 segundos
      autoClose: true,
      hasDetails: true,
      errorType: errorDetails.errorType || title,
      errorDetails: errorDetails.errors || [],
      fullError: errorDetails.fullError || errorDetails.error || '',
      ...errorDetails
    })
  }

  const showSuccess = (title, message, options = {}) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  const showWarning = (title, message, options = {}) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options
    })
  }

  const showInfo = (title, message, options = {}) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showError,
    showErrorWithDetails,
    showSuccess,
    showWarning,
    showInfo
  }
}
