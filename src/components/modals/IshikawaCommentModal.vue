<template>
  <div class="comment-modal-wrapper">
    <BaseModal 
      :is-open="isOpen" 
      title="Agregar Comentario" 
      :custom-z-index="10000"
      @close="$emit('close')"
    >
    <div class="comment-form">
      <div class="form-group">
        <label for="category" class="form-label">Categoría</label>
        <select 
          id="category" 
          v-model="selectedCategory" 
          class="form-select"
          required
          @change="selectedSubcategory = ''"
        >
          <option value="">-- Seleccione una categoría --</option>
          <option 
            v-for="category in categories" 
            :key="category.id" 
            :value="category.id"
          >
            {{ category.icon }} {{ category.name }}
          </option>
        </select>
      </div>

      <!-- Selector de Subcategoría (solo si la categoría tiene factores) -->
      <div v-if="selectedCategory && hasSubcategories" class="form-group">
        <label for="subcategory" class="form-label">Subcategoría</label>
        <select 
          id="subcategory" 
          v-model="selectedSubcategory" 
          class="form-select"
          required
        >
          <option value="">-- Seleccione una subcategoría --</option>
          <option 
            v-for="factor in availableSubcategories" 
            :key="factor" 
            :value="factor"
          >
            {{ factor }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="comment" class="form-label">Comentario</label>
        <textarea 
          id="comment"
          v-model="commentText"
          class="form-textarea"
          rows="5"
          placeholder="Escriba su comentario aquí..."
          required
        ></textarea>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">
        Cancelar
      </button>
      <button 
        type="button" 
        class="btn btn-primary" 
        @click="handleSave"
        :disabled="!selectedCategory || !commentText.trim() || (hasSubcategories && !selectedSubcategory)"
      >
        💬 Guardar Comentario
      </button>
    </template>
  </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import { useNotifications } from '@/composables/useNotifications'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  semester: {
    type: String,
    default: ''
  },
  ishikawaData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const selectedCategory = ref('')
const selectedSubcategory = ref('')
const commentText = ref('')
const { showSuccess, showError } = useNotifications()

// Obtener los factores (subcategorías) de la categoría seleccionada
const availableSubcategories = computed(() => {
  if (!selectedCategory.value || !props.ishikawaData?.categories) {
    return []
  }
  
  const category = props.ishikawaData.categories.find(cat => cat.id === selectedCategory.value)
  return category?.factors || []
})

// Verificar si la categoría seleccionada tiene subcategorías que mostrar
// Solo mostrar si hay más de una subcategoría, o si la única subcategoría es diferente al nombre de la categoría
const hasSubcategories = computed(() => {
  if (availableSubcategories.value.length === 0) return false
  
  // Si solo tiene una subcategoría, verificar si es diferente al nombre de la categoría
  if (availableSubcategories.value.length === 1) {
    const category = props.categories.find(cat => cat.id === selectedCategory.value)
    const categoryName = category?.name || ''
    const subcategoryName = availableSubcategories.value[0]
    
    // Normalizar nombres para comparar (sin acentos, minúsculas)
    const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const normalizedCategory = normalize(categoryName)
    const normalizedSubcategory = normalize(subcategoryName)
    
    // Solo mostrar si la subcategoría es diferente al nombre de la categoría
    return normalizedSubcategory !== normalizedCategory
  }
  
  // Si tiene más de una subcategoría, siempre mostrar
  return availableSubcategories.value.length > 1
})

// Limpiar formulario cuando se cierra el modal
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    selectedCategory.value = ''
    selectedSubcategory.value = ''
    commentText.value = ''
  }
})

const handleSave = () => {
  // Validar que se haya seleccionado categoría y comentario
  if (!selectedCategory.value || !commentText.value.trim()) {
    return
  }

  // Si la categoría tiene subcategorías para mostrar, validar que se haya seleccionado una
  if (hasSubcategories.value && !selectedSubcategory.value) {
    showError('Error', 'Por favor seleccione una subcategoría')
    return
  }

  try {
    // Obtener comentarios existentes del localStorage
    const storageKey = `ishikawa_comments_${props.semester}`
    const existingComments = JSON.parse(localStorage.getItem(storageKey) || '[]')
    
    // Determinar la subcategoría a usar
    let subcategoryToSave = selectedSubcategory.value
    
    // Si no se seleccionó subcategoría pero la categoría tiene factores, usar el primero
    if (!subcategoryToSave && availableSubcategories.value.length > 0) {
      subcategoryToSave = availableSubcategories.value[0]
    }
    
    // Crear nuevo comentario
    const newComment = {
      id: Date.now(),
      categoryId: selectedCategory.value,
      categoryName: props.categories.find(c => c.id === selectedCategory.value)?.name || '',
      subcategory: subcategoryToSave || null,
      text: commentText.value.trim(),
      date: new Date().toISOString(),
      semester: props.semester
    }
    
    // Agregar el nuevo comentario
    existingComments.push(newComment)
    
    // Guardar en localStorage
    localStorage.setItem(storageKey, JSON.stringify(existingComments))
    
    showSuccess('Éxito', 'Comentario guardado exitosamente')
    
    // Limpiar formulario
    selectedCategory.value = ''
    selectedSubcategory.value = ''
    commentText.value = ''
    
    // Emitir evento para actualizar la lista
    emit('saved', newComment)
    emit('close')
  } catch (error) {
    console.error('Error al guardar comentario:', error)
    showError('Error', 'No se pudo guardar el comentario')
  }
}
</script>

<style scoped>
.comment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background-color: white;
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2C4068;
  box-shadow: 0 0 0 3px rgba(44, 64, 104, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-textarea::placeholder {
  color: #9ca3af;
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

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-primary {
  background: linear-gradient(135deg, #2C4068 0%, #1a2a4a 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1a2a4a 0%, #2C4068 100%);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Dark mode */
.dark .form-label {
  color: #f9fafb;
}

.dark .form-select,
.dark .form-textarea {
  background-color: #1f2937;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark .form-select:focus,
.dark .form-textarea:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.dark .btn-secondary {
  background-color: #374151;
  color: #f9fafb;
  border-color: #4b5563;
}

.dark .btn-secondary:hover {
  background-color: #4b5563;
}

/* Asegurar que el modal aparezca por encima del overlay de pantalla completa */
.comment-modal-wrapper {
  position: relative;
  z-index: 10000;
}

.comment-modal-wrapper :deep(.modal-overlay) {
  z-index: 10000 !important;
  position: fixed !important;
}
</style>

