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
      <MetricsGrid @open-students-list="openStudentsListModal" />

      <!-- Sección de Gráficos -->
      <ChartsSection />
    </div>

    <!-- Modales -->
    <StudentRegisterModal 
      :is-open="showStudentModal" 
      @close="closeStudentModal"
      @submit="handleStudentSubmit"
    />
    
    <StudentsListModal 
      :is-open="showStudentsListModal" 
      @close="closeStudentsListModal"
      @edit-student="openEditStudentModal"
    />
    
    <StudentRegisterModal 
      :is-open="showEditStudentModal" 
      :student-to-edit="studentToEdit"
      title="Actualización de Estudiante"
      @close="closeEditStudentModal"
      @submit="handleStudentUpdate"
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
import StudentsListModal from '@/components/modals/StudentsListModal.vue'
import RiskFactorsModal from '@/components/modals/RiskFactorsModal.vue'
import ExportDataModal from '@/components/modals/ExportDataModal.vue'
import DarkModeToggle from '@/components/ui/DarkModeToggle.vue'
import { useDashboardData } from '@/composables/useDashboardData'

// Sidebar state
const activeItem = ref('dashboard')
const isSidebarExpanded = ref(false)

// Modal states
const showStudentModal = ref(false)
const showStudentsListModal = ref(false)
const showEditStudentModal = ref(false)
const showRiskFactorsModal = ref(false)
const showExportModal = ref(false)

// Estado para el estudiante a editar
const studentToEdit = ref(null)

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

const openStudentsListModal = () => {
  console.log('Abriendo modal de lista de estudiantes...')
  showStudentsListModal.value = true
  console.log('showStudentsListModal:', showStudentsListModal.value)
}

const openEditStudentModal = (student) => {
  console.log('Abriendo modal de edición para:', student)
  studentToEdit.value = student
  showEditStudentModal.value = true
}

const closeStudentModal = () => {
  showStudentModal.value = false
  activeItem.value = 'dashboard'
}

const closeStudentsListModal = () => {
  showStudentsListModal.value = false
  activeItem.value = 'dashboard'
}

const closeEditStudentModal = () => {
  showEditStudentModal.value = false
  studentToEdit.value = null
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
  console.log('Estudiante registrado exitosamente:', studentData)
  // La notificación de éxito ya se muestra desde el composable
}

const handleStudentUpdate = async (studentData) => {
  console.log('Actualizando estudiante:', studentData)
  try {
    // Recargar la lista de estudiantes
    await dashboardStore.fetchStudents()
    console.log('Lista de estudiantes recargada después de la actualización')
  } catch (error) {
    console.error('Error al recargar estudiantes:', error)
  }
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
