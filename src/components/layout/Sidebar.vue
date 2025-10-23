<template>
  <div 
    class="sidebar" 
    :class="{ 'sidebar-expanded': isExpanded }"
    @mouseenter="expandSidebar"
    @mouseleave="collapseSidebar"
  >
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">📊</div>
        <transition name="fade">
          <span v-if="isExpanded" class="logo-text">Dashboard</span>
        </transition>
      </div>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li 
          v-for="item in menuItems" 
          :key="item.id"
          class="nav-item"
          :class="{ 'active': activeItem === item.id }"
          @click="setActiveItem(item.id)"
        >
          <router-link :to="item.route" class="nav-link">
            <component :is="item.icon" class="nav-icon" />
            <transition name="fade">
              <span v-if="isExpanded" class="nav-text">{{ item.text }}</span>
            </transition>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  HomeIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  ScatterIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

const isExpanded = ref(false)
const activeItem = ref('dashboard')

const menuItems = [
  { id: 'dashboard', text: 'Página Principal', icon: HomeIcon, route: '/' },
  { id: 'register', text: 'Registrar Estudiante', icon: UserPlusIcon, route: '/register' },
  { id: 'risk-factors', text: 'Factores de Riesgo', icon: ExclamationTriangleIcon, route: '/risk-factors' },
  { id: 'pareto', text: 'Pareto', icon: ChartBarIcon, route: '/pareto' },
  { id: 'ishikawa', text: 'Ishikawa', icon: ChartPieIcon, route: '/ishikawa' },
  { id: 'histograms', text: 'Histogramas', icon: DocumentChartBarIcon, route: '/histograms' },
  { id: 'scatter', text: 'Dispersión', icon: ScatterIcon, route: '/scatter' },
  { id: 'import', text: 'Importar Datos', icon: ArrowUpTrayIcon, route: '/import' },
  { id: 'export', text: 'Exportar Datos', icon: ArrowDownTrayIcon, route: '/export' }
]

const expandSidebar = () => {
  isExpanded.value = true
}

const collapseSidebar = () => {
  isExpanded.value = false
}

const setActiveItem = (itemId) => {
  activeItem.value = itemId
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 60px;
  background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
  transition: width 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-expanded {
  width: 250px;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
}

.logo-icon {
  font-size: 1.5rem;
  min-width: 24px;
  text-align: center;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: bold;
  white-space: nowrap;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 0 25px 25px 0;
  margin-right: 1rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active .nav-link {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-icon {
  width: 20px;
  height: 20px;
  min-width: 20px;
  flex-shrink: 0;
}

.nav-text {
  font-size: 0.9rem;
  white-space: nowrap;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }
  
  .sidebar-expanded {
    width: 200px;
  }
}
</style>
