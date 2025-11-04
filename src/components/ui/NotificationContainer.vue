<template>
  <div class="notification-container">
    <TransitionGroup name="toast-list" tag="div" class="notification-list">
        <NotificationToast
          v-for="(notification, index) in notifications"
          :key="notification.id"
          :type="notification.type"
          :title="notification.title"
          :message="notification.message"
          :duration="notification.duration"
          :auto-close="notification.autoClose"
          :has-details="notification.hasDetails || false"
          :error-type="notification.errorType"
          :error-details="notification.errorDetails"
          :full-error="notification.fullError"
          :style="{ top: `${2 + index * 6}rem` }"
          @close="removeNotification(notification.id)"
          @show-details="showErrorDetails"
        />
      </TransitionGroup>
      
      <ErrorDetailModal
        :is-open="showErrorModal"
        :error-type="currentError.errorType"
        :error-message="currentError.errorMessage"
        :error-details="currentError.errorDetails"
        :full-error="currentError.fullError"
      @close="closeErrorModal"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import NotificationToast from './NotificationToast.vue'
import ErrorDetailModal from '@/components/modals/ErrorDetailModal.vue'

const { notifications, removeNotification } = useNotifications()

const showErrorModal = ref(false)
const currentError = ref({
  errorType: '',
  errorMessage: '',
  errorDetails: [],
  fullError: ''
})


const showErrorDetails = (errorData) => {
  currentError.value = {
    errorType: errorData.errorType || 'Error',
    errorMessage: errorData.errorMessage || '',
    errorDetails: errorData.errorDetails || [],
    fullError: errorData.fullError || ''
  }
  showErrorModal.value = true
}

const closeErrorModal = () => {
  showErrorModal.value = false
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
  pointer-events: none;
  padding: 2rem;
}

.notification-list {
  position: relative;
  width: 400px;
  min-height: 100px;
}

.notification-container > * {
  pointer-events: auto;
}

/* Animaciones para la lista de notificaciones */
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-list-move {
  transition: transform 0.3s ease;
}
</style>
