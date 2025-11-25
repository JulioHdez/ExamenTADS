<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <DashboardSidebar 
      :active-item="activeItem" 
      @update:active-item="setActiveItem"
      @sidebar-toggle="handleSidebarToggle"
    />
    
    <!-- Menú de Accesibilidad -->
    <AccessibilityMenu />
    
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
    
    <ImportDataModal 
      :is-open="showImportModal" 
      @close="closeImportModal"
      @imported="handleImportedData"
    />
    
    <ParetoModal 
      :is-open="showParetoModal" 
      @close="closeParetoModal"
    />
    
    <IshikawaModal 
      :is-open="showIshikawaModal" 
      @close="closeIshikawaModal"
      @open-fullscreen="openIshikawaFullscreen"
    />
    
    <IshikawaFullscreen
      :is-open="showIshikawaFullscreen"
      :data="ishikawaData"
      @close="closeIshikawaFullscreen"
    />
    
    <HistogramModal 
      :is-open="showHistogramModal" 
      @close="closeHistogramModal"
    />
    
    <DispersionModal 
      :is-open="showDispersionModal" 
      @close="closeDispersionModal"
    />
    
    <MoreInfoModal 
      :is-open="showMoreInfoModal" 
      @close="closeMoreInfoModal"
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
import ImportDataModal from '@/components/modals/ImportDataModal.vue'
import ParetoModal from '@/components/modals/ParetoModal.vue'
import IshikawaModal from '@/components/modals/IshikawaModal.vue'
import IshikawaFullscreen from '@/components/modals/IshikawaFullscreen.vue'
import HistogramModal from '@/components/modals/HistogramModal.vue'
import DispersionModal from '@/components/modals/DispersionModal.vue'
import MoreInfoModal from '@/components/modals/MoreInfoModal.vue'
import AccessibilityMenu from '@/components/ui/AccessibilityMenu.vue'
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
const showImportModal = ref(false)
const showParetoModal = ref(false)
const showIshikawaModal = ref(false)
const showIshikawaFullscreen = ref(false)
const showHistogramModal = ref(false)
const showDispersionModal = ref(false)
const showMoreInfoModal = ref(false)
const ishikawaData = ref(null)

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
  } else if (itemId === 'import') {
    showImportModal.value = true
  } else if (itemId === 'pareto') {
    showParetoModal.value = true
  } else if (itemId === 'ishikawa') {
    showIshikawaModal.value = true
  } else if (itemId === 'histograms') {
    showHistogramModal.value = true
  } else if (itemId === 'scatter') {
    showDispersionModal.value = true
  } else if (itemId === 'more-info') {
    showMoreInfoModal.value = true
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

const closeImportModal = () => {
  showImportModal.value = false
  activeItem.value = 'dashboard'
}

const closeParetoModal = () => {
  showParetoModal.value = false
  activeItem.value = 'dashboard'
}

const closeIshikawaModal = () => {
  showIshikawaModal.value = false
  activeItem.value = 'dashboard'
}

const openIshikawaFullscreen = (data) => {
  ishikawaData.value = data
  showIshikawaFullscreen.value = true
}

const closeIshikawaFullscreen = () => {
  showIshikawaFullscreen.value = false
  ishikawaData.value = null
}

const closeHistogramModal = () => {
  showHistogramModal.value = false
  activeItem.value = 'dashboard'
}

const closeDispersionModal = () => {
  showDispersionModal.value = false
  activeItem.value = 'dashboard'
}

const closeMoreInfoModal = () => {
  showMoreInfoModal.value = false
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

const handleImportedData = (result) => {
  console.log('Resultado de importación:', result)
}

onMounted(() => {
  initializeData()
})
</script>

<style scoped>
@import '@/styles/dashboard.css';
@import '@/styles/components.css';


.main-content {
  margin-left: calc(60px * var(--zoom-scale, 1));
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.main-content.sidebar-expanded {
  margin-left: calc(250px * var(--zoom-scale, 1));
}
</style>
