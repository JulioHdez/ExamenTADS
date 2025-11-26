<template>
  <BaseModal 
    :is-open="isOpen" 
    :title="subcategory ? `Comentarios - ${categoryName} > ${subcategory}` : `Comentarios - ${categoryName}`" 
    :custom-z-index="10001"
    :auto-width="true"
    @close="$emit('close')"
  >
    <div class="comments-view-content">
      <div v-if="comments.length === 0" class="empty-comments">
        <div class="empty-icon">💬</div>
        <p>No hay comentarios para esta categoría</p>
      </div>
      
      <div v-else class="comments-list">
        <div 
          v-for="comment in comments" 
          :key="comment.id"
          class="comment-card"
        >
          <div class="comment-header">
            <div class="comment-subcategory" v-if="comment.subcategory && !subcategory">
              <span class="subcategory-badge">{{ comment.subcategory }}</span>
            </div>
            <button 
              class="comment-delete-btn"
              @click="handleDelete(comment.id)"
              title="Eliminar comentario"
            >
              🗑️
            </button>
          </div>
          <div class="comment-text">{{ comment.text }}</div>
          <div class="comment-date">{{ formatDate(comment.date) }}</div>
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-primary" @click="$emit('close')">
        Cerrar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { useNotifications } from '@/composables/useNotifications'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  categoryId: {
    type: String,
    default: ''
  },
  categoryName: {
    type: String,
    default: ''
  },
  subcategory: {
    type: String,
    default: ''
  },
  comments: {
    type: Array,
    default: () => []
  },
  semester: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'deleted'])

const { showSuccess } = useNotifications()

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleDelete = (commentId) => {
  if (!props.semester) return
  
  try {
    const storageKey = `ishikawa_comments_${props.semester}`
    const storedComments = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const updatedComments = storedComments.filter(c => c.id !== commentId)
    localStorage.setItem(storageKey, JSON.stringify(updatedComments))
    showSuccess('Éxito', 'Comentario eliminado')
    emit('deleted', commentId)
  } catch (error) {
    console.error('Error al eliminar comentario:', error)
  }
}
</script>

<style scoped>
.comments-view-content {
  padding: 1rem 0;
  max-height: 60vh;
  overflow-y: auto;
}

.empty-comments {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-comments p {
  margin: 0;
  font-size: 1rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.comment-card:hover {
  background: #f3f4f6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.subcategory-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #2C4068 0%, #1a2a4a 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.comment-delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.6;
  transition: all 0.2s ease;
  padding: 0.25rem;
  border-radius: 4px;
}

.comment-delete-btn:hover {
  opacity: 1;
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.1);
}

.comment-text {
  color: #374151;
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
  word-wrap: break-word;
}

.comment-date {
  color: #6b7280;
  font-size: 0.75rem;
  font-style: italic;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #2C4068 0%, #1a2a4a 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1a2a4a 0%, #2C4068 100%);
}

/* Dark mode */
.dark .comment-card {
  background: #374151;
  border-color: #4b5563;
}

.dark .comment-card:hover {
  background: #4b5563;
}

.dark .comment-text {
  color: #e5e7eb;
}

.dark .comment-date {
  color: #9ca3af;
}

.dark .empty-comments {
  color: #9ca3af;
}

/* Scrollbar personalizado */
.comments-view-content::-webkit-scrollbar {
  width: 8px;
}

.comments-view-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.comments-view-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.comments-view-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark .comments-view-content::-webkit-scrollbar-track {
  background: #374151;
}

.dark .comments-view-content::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark .comments-view-content::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>

