<template>
  <div class="test-page">
    <h1>🧪 Página de Prueba</h1>
    <p>Si puedes ver esta página, Vue está funcionando correctamente.</p>
    
    <div class="test-sections">
      <div class="test-card">
        <h2>✅ Vue.js Funcionando</h2>
        <p>El framework Vue.js está cargado y funcionando correctamente.</p>
      </div>
      
      <div class="test-card">
        <h2>🎨 Estilos CSS</h2>
        <p>Los estilos CSS se están aplicando correctamente.</p>
      </div>
      
      <div class="test-card">
        <h2>📊 Datos Reactivos</h2>
        <p>Contador: {{ counter }}</p>
        <button @click="incrementCounter" class="btn">Incrementar</button>
      </div>
      
      <div class="test-card">
        <h2>🔗 Navegación</h2>
        <p>El sistema de rutas está funcionando.</p>
        <router-link to="/" class="btn">Ir al Dashboard</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const counter = ref(0)

const incrementCounter = () => {
  counter.value++
}
</script>

<style scoped>
.test-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.test-page h1 {
  color: #1f2937;
  margin-bottom: 1rem;
  text-align: center;
}

.test-page p {
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
}

.test-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.test-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  text-align: center;
}

.test-card h2 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.test-card p {
  color: #6b7280;
  margin-bottom: 1rem;
}

.btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.2s ease;
}

.btn:hover {
  background-color: #2563eb;
}
</style>
