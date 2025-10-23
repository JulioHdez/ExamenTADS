<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <DashboardSidebar 
      :active-item="activeItem" 
      @update:active-item="setActiveItem"
      @sidebar-toggle="handleSidebarToggle"
    />
    
    <!-- Dark Mode Toggle - Fuera del sidebar -->
    <div class="dark-mode-toggle">
      <DarkModeToggle />
    </div>
    
    <div class="main-content" :class="{ 'sidebar-expanded': isSidebarExpanded }">
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
    
    <RiskFactorsModal 
      :is-open="showRiskFactorsModal" 
      @close="closeRiskFactorsModal"
    />
    
    <ExportDataModal 
      :is-open="showExportModal" 
      @close="closeExportModal"
      @export="handleExportData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashboardSidebar from '@/components/layout/DashboardSidebar.vue'
import MetricsGrid from '@/components/ui/MetricsGrid.vue'
import ChartsSection from '@/components/charts/ChartsSection.vue'
import StudentRegisterModal from '@/components/modals/StudentRegisterModal.vue'
import RiskFactorsModal from '@/components/modals/RiskFactorsModal.vue'
import ExportDataModal from '@/components/modals/ExportDataModal.vue'
import DarkModeToggle from '@/components/ui/DarkModeToggle.vue'
import { useDashboardData } from '@/composables/useDashboardData'

// Sidebar state
const activeItem = ref('dashboard')
const isSidebarExpanded = ref(false)

// Modal states
const showStudentModal = ref(false)
const showRiskFactorsModal = ref(false)
const showExportModal = ref(false)

// Initialize dashboard data
const { initializeData } = useDashboardData()

// Methods
const setActiveItem = (itemId) => {
  activeItem.value = itemId
  
  // Abrir modal correspondiente
  if (itemId === 'register') {
    showStudentModal.value = true
  } else if (itemId === 'risk-factors') {
    showRiskFactorsModal.value = true
  } else if (itemId === 'export') {
    showExportModal.value = true
  }
}

const handleSidebarToggle = (expanded) => {
  isSidebarExpanded.value = expanded
}

const closeStudentModal = () => {
  showStudentModal.value = false
  activeItem.value = 'dashboard'
}

const closeRiskFactorsModal = () => {
  showRiskFactorsModal.value = false
  activeItem.value = 'dashboard'
}

const closeExportModal = () => {
  showExportModal.value = false
  activeItem.value = 'dashboard'
}

const handleStudentSubmit = (studentData) => {
  console.log('Datos del estudiante:', studentData)
  // Aquí puedes agregar la lógica para guardar el estudiante
  // Por ejemplo, llamar a una API o actualizar el store
}

const handleExportData = (exportData) => {
  console.log('Datos a exportar:', exportData)
  // Aquí puedes agregar la lógica para exportar los datos
  // Por ejemplo, llamar a una API o generar archivos
}

onMounted(() => {
  initializeData()
})
</script>

<style scoped>
@import '@/styles/dashboard.css';
@import '@/styles/components.css';

.dark-mode-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1001;
}

.main-content {
  margin-left: 60px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.main-content.sidebar-expanded {
  margin-left: 250px;
}
</style>
