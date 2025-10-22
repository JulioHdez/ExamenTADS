<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <DashboardSidebar 
      :active-item="activeItem" 
      @update:active-item="setActiveItem" 
    />
    
    <div class="main-content">
      <div class="dashboard-header">
        <h1 class="dashboard-title">Bienvenido</h1>
        <p class="dashboard-subtitle">Panel de control del sistema estudiantil</p>
      </div>

      <!-- Métricas principales -->
      <MetricsGrid />

      <!-- Sección de Gráficos -->
      <ChartsSection />
    </div>

    <!-- Modales -->
    <StudentRegisterModal 
      :is-open="showStudentModal" 
      @close="closeStudentModal"
      @submit="handleStudentSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashboardSidebar from '@/components/DashboardSidebar.vue'
import MetricsGrid from '@/components/MetricsGrid.vue'
import ChartsSection from '@/components/ChartsSection.vue'
import StudentRegisterModal from '@/components/StudentRegisterModal.vue'
import { useDashboardData } from '@/composables/useDashboardData'

// Sidebar state
const activeItem = ref('dashboard')

// Modal states
const showStudentModal = ref(false)

// Initialize dashboard data
const { initializeData } = useDashboardData()

// Methods
const setActiveItem = (itemId) => {
  activeItem.value = itemId
  
  // Abrir modal correspondiente
  if (itemId === 'register') {
    showStudentModal.value = true
  }
}

const closeStudentModal = () => {
  showStudentModal.value = false
  activeItem.value = 'dashboard'
}

const handleStudentSubmit = (studentData) => {
  console.log('Datos del estudiante:', studentData)
  // Aquí puedes agregar la lógica para guardar el estudiante
  // Por ejemplo, llamar a una API o actualizar el store
}

onMounted(() => {
  initializeData()
})
</script>

<style scoped>
@import '@/styles/dashboard.css';
@import '@/styles/components.css';
</style>
