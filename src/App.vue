<template>
  <div id="app">
    <router-view />
    <NotificationContainer />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { loadPreferencesFromBackend, applyPreferencesToComposables } from '@/composables/useAccessibilityPreferences'
import NotificationContainer from '@/components/ui/NotificationContainer.vue'

console.log('App.vue está cargando correctamente')

const authStore = useAuthStore()

// Cargar y aplicar preferencias cuando el usuario inicia sesión
const loadUserPreferences = async () => {
  if (!authStore.isLoggedIn) return
  
  try {
    // Esperar para asegurar que los composables estén completamente inicializados
    // y que la navegación haya terminado
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const prefs = await loadPreferencesFromBackend()
    
    // Solo aplicar preferencias si existen Y tienen valores válidos
    // Si prefs es null, significa que no hay preferencias guardadas
    // y debemos mantener los valores actuales sin hacer nada
    if (prefs && Object.keys(prefs).length > 0) {
      console.log('Aplicando preferencias guardadas del usuario:', prefs)
      await applyPreferencesToComposables(prefs)
    } else {
      console.log('No hay preferencias guardadas, manteniendo valores actuales de localStorage')
      // No hacer nada - mantener valores actuales de localStorage
      // Los composables ya están funcionando con sus valores de localStorage
      // No llamar a ningún composable para evitar reinicializaciones
    }
  } catch (error) {
    console.warn('Error al cargar preferencias del usuario:', error)
    // Si hay error, mantener valores actuales - no hacer nada
    // No intentar aplicar nada para evitar romper los composables
  }
}

// Observar cambios en el estado de autenticación
watch(() => authStore.isLoggedIn, async (isLoggedIn, wasLoggedIn) => {
  // Solo cargar preferencias cuando el usuario ACABA de iniciar sesión
  // (no cuando ya estaba autenticado)
  if (isLoggedIn && !wasLoggedIn) {
    // Usuario acaba de iniciar sesión - cargar preferencias después de un delay
    // para asegurar que la navegación y los composables estén completamente listos
    // Usar un delay más largo para asegurar que todo esté estable
    setTimeout(() => {
      loadUserPreferences()
    }, 1500)
  }
}, { immediate: false })

// Inicializar la autenticación al montar la app
onMounted(async () => {
  try {
    console.log('App montada, inicializando autenticación...')
    authStore.initializeAuth()
    
    // Si ya está autenticado al cargar, cargar preferencias después de un delay
    if (authStore.isLoggedIn) {
      setTimeout(() => {
        loadUserPreferences()
      }, 1000)
    }
  } catch (error) {
    console.error('Error al inicializar autenticación:', error)
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
}

#app {
  min-height: 100vh;
}
</style>
