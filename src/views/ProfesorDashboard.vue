<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <ProfesorSidebar 
      :active-item="activeItem" 
      @update:active-item="setActiveItem"
      @sidebar-toggle="handleSidebarToggle"
    />
    
    <!-- Menú de Accesibilidad -->
    <AccessibilityMenu />
    
    <div class="main-content" :class="{ 'sidebar-expanded': isSidebarExpanded }">
      <div class="dashboard-header">
        <h1 class="dashboard-title">Bienvenido, {{ userInfo?.name || 'Profesor' }}</h1>
        <p class="dashboard-subtitle">Panel de control del profesor</p>
      </div>

      <!-- Contenido del dashboard -->
      <div class="dashboard-content">
        <div class="info-card">
          <h2>Información del Profesor</h2>
          <p><strong>Carrera:</strong> {{ userInfo?.nombre_carrera || 'No asignada' }}</p>
          <p><strong>Rol:</strong> {{ userInfo?.nombre_rol || 'Profesor' }}</p>
          <p><strong>Email:</strong> {{ userInfo?.email || 'No disponible' }}</p>
        </div>
        
        <div class="info-card">
          <h2>Funcionalidades</h2>
          <p>Las funcionalidades del dashboard de profesor se implementarán próximamente.</p>
          <p>Aquí podrás ver tus materias y los estudiantes de tu carrera.</p>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <ProfesorMoreInfoModal 
      :is-open="showMoreInfoModal" 
      @close="closeMoreInfoModal"
    />
    
    <ProfesorMateriasModal 
      :is-open="showMateriasModal" 
      @close="closeMateriasModal"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProfesorSidebar from '@/components/layout/ProfesorSidebar.vue'
import ProfesorMoreInfoModal from '@/components/modals/ProfesorMoreInfoModal.vue'
import ProfesorMateriasModal from '@/components/modals/ProfesorMateriasModal.vue'
import AccessibilityMenu from '@/components/ui/AccessibilityMenu.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Sidebar state
const activeItem = ref('dashboard')
const isSidebarExpanded = ref(false)

// Modal states
const showMoreInfoModal = ref(false)
const showMateriasModal = ref(false)

// Obtener información del usuario
const userInfo = authStore.userInfo

// Methods
const setActiveItem = (itemId) => {
  activeItem.value = itemId
  
  // Abrir modal correspondiente
  if (itemId === 'more-info') {
    showMoreInfoModal.value = true
  } else if (itemId === 'materias') {
    showMateriasModal.value = true
  }
  // Aquí se pueden agregar más modales cuando se implementen las funcionalidades
}

const handleSidebarToggle = (expanded) => {
  isSidebarExpanded.value = expanded
}

const closeMoreInfoModal = () => {
  showMoreInfoModal.value = false
  activeItem.value = 'dashboard'
}

const closeMateriasModal = () => {
  showMateriasModal.value = false
  activeItem.value = 'dashboard'
}
</script>

<style scoped>
@import '@/styles/dashboard.css';
@import '@/styles/components.css';


.main-content {
  margin-left: calc(60px * var(--zoom-scale, 1));
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  padding: 2rem;
}

.main-content.sidebar-expanded {
  margin-left: calc(250px * var(--zoom-scale, 1));
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.dashboard-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-card h2 {
  color: #1e293b;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.info-card p {
  color: #64748b;
  line-height: 1.8;
  margin-bottom: 0.5rem;
}

.dark .dashboard-title {
  color: #f1f5f9;
}

.dark .dashboard-subtitle {
  color: #94a3b8;
}

.dark .info-card {
  background: #1e293b;
  border: 1px solid #334155;
}

.dark .info-card h2 {
  color: #f1f5f9;
}

.dark .info-card p {
  color: #cbd5e1;
}
</style>

