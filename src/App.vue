<template>
  <div id="app">
    <router-view />
    <NotificationContainer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import NotificationContainer from '@/components/ui/NotificationContainer.vue'

console.log('App.vue está cargando correctamente')

const authStore = useAuthStore()

// Inicializar la autenticación al montar la app
onMounted(() => {
  console.log('App montada, inicializando autenticación...')
  authStore.initializeAuth()
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
