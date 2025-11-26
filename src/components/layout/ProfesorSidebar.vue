<template>
  <div class="sidebar" :class="{ 'sidebar-expanded': isExpanded }" @mouseenter="expandSidebar" @mouseleave="collapseSidebar">
    <div class="sidebar-header">
      <div class="logo">
        <transition name="fade">
          <span v-if="isExpanded" class="logo-text">
            Profesor {{ userInfo?.name || '' }}
          </span>
          <span v-else class="logo-text-collapsed">P</span>
        </transition>
      </div>
    </div>
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="item in menuItems" :key="item.id" class="nav-item" :class="{ 'active': activeItem === item.id }" @click="setActiveItem(item.id)">
          <a href="#" class="nav-link">
            <span class="nav-icon">{{ item.icon }}</span>
            <transition name="fade">
              <span v-if="isExpanded" class="nav-text">{{ item.text }}</span>
            </transition>
          </a>
        </li>
      </ul>
    </nav>
    
    <!-- Usuario y Logout -->
    <div class="sidebar-footer">
      <div class="user-info" v-if="isExpanded">
        <div class="user-avatar">👤</div>
        <div class="user-details">
          <div class="user-name">{{ userInfo?.name || 'Profesor' }}</div>
          <div class="user-email">{{ userInfo?.email || 'profesor@ejemplo.com' }}</div>
        </div>
      </div>
      <button @click="handleLogout" class="logout-btn" :title="isExpanded ? '' : 'Cerrar Sesión'">
        <span class="logout-icon">↪</span>
        <transition name="fade">
          <span v-if="isExpanded" class="logout-text">Cerrar Sesión</span>
        </transition>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  activeItem: {
    type: String,
    default: 'dashboard'
  }
})

const emit = defineEmits(['update:activeItem', 'sidebar-toggle'])

const router = useRouter()
const authStore = useAuthStore()

const isExpanded = ref(false)

// Obtener información del usuario
const userInfo = authStore.userInfo

const menuItems = [
  { id: 'dashboard', text: 'Página Principal', icon: '🏠' },
  { id: 'materias', text: 'Mis Materias', icon: '📚' },
  { id: 'estudiantes', text: 'Mis Estudiantes', icon: '👥' },
  { id: 'calificaciones', text: 'Calificaciones', icon: '📝' },
  { id: 'more-info', text: 'Más Información', icon: 'ℹ️' }
]

const expandSidebar = () => {
  isExpanded.value = true
  emit('sidebar-toggle', true)
}

const collapseSidebar = () => {
  isExpanded.value = false
  emit('sidebar-toggle', false)
}

const setActiveItem = (itemId) => {
  emit('update:activeItem', itemId)
}

const handleLogout = () => {
  console.log('Botón de cerrar sesión clickeado')
  
  // Limpiar todo el estado primero
  authStore.logout()
  
  // Forzar recarga completa de la página para evitar problemas con el router guard
  window.location.href = '/'
}
</script>

<style scoped>
/* Sidebar Styles */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: calc(60px * var(--zoom-scale, 1));
  background: linear-gradient(180deg, #2C4068 0%, #1a2a4a 100%);
  transition: width 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.sidebar-expanded {
  width: calc(250px * var(--zoom-scale, 1));
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
}

.logo-text {
  font-size: 1.1rem;
  font-weight: bold;
  white-space: nowrap;
  text-align: center;
}

.logo-text-collapsed {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}


.sidebar-nav {
  padding: 1rem 0;
  flex: 1;
  overflow-y: auto;
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
  font-size: 1.2rem;
  min-width: 20px;
  text-align: center;
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

/* Sidebar Footer */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}


.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.user-avatar {
  font-size: 1.5rem;
  min-width: 32px;
  text-align: center;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 12px;
  color: #fca5a5;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 0.75rem;
  min-height: 44px;
  position: relative;
  overflow: hidden;
}

.logout-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
  pointer-events: none;
}

.logout-btn:hover::before {
  left: 100%;
}

.sidebar:not(.sidebar-expanded) .logout-btn {
  justify-content: center;
  padding: 0.875rem 0.75rem;
  border-radius: 10px;
}

.logout-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.2) 100%);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.logout-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

.logout-icon {
  font-size: 1.2rem;
  min-width: 20px;
  text-align: center;
  font-weight: bold;
  transition: all 0.3s ease;
}

.sidebar:not(.sidebar-expanded) .logout-icon {
  font-size: 1.4rem;
  transform: rotate(0deg);
}

.logout-btn:hover .logout-icon {
  transform: rotate(15deg);
}

.sidebar:not(.sidebar-expanded) .logout-btn:hover .logout-icon {
  transform: rotate(15deg) scale(1.1);
}

.logout-text {
  white-space: nowrap;
  font-weight: 600;
}

.dark .logout-btn {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.dark .logout-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.25) 100%);
  border-color: rgba(239, 68, 68, 0.5);
  color: #f87171;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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

