<template>
  <div v-if="isOpen" class="modal-overlay" :style="{ '--modal-z-index': customZIndex, zIndex: customZIndex }" @click="closeModal">
    <div class="modal-container" :class="{ 'auto-width': autoWidth }" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">{{ title }}</h2>
        <button class="modal-close" @click="closeModal">
          <span>&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div class="modal-footer" v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  customZIndex: {
    type: Number,
    default: 2000
  },
  autoWidth: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
@import '@/styles/modals/BaseModal.css';
</style>
