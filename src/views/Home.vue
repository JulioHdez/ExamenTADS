<template>
  <div class="home">
    <div class="container">
      <div class="hero-section">
        <h1 class="hero-title">Bienvenido al Proyecto Temas Avanzados</h1>
        <p class="hero-subtitle">
          Una aplicación frontend moderna construida con Vue.js 3, Vite y Pinia
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="showWelcomeMessage">
            ¡Comenzar!
          </button>
          <router-link to="/about" class="btn btn-secondary">
            Más información
          </router-link>
        </div>
      </div>

      <div class="features-section">
        <h2 class="section-title">Características del Proyecto</h2>
        <div class="row">
          <div class="col-4">
            <div class="feature-card">
              <h3>Vue.js 3</h3>
              <p>Framework progresivo con Composition API y mejor rendimiento</p>
            </div>
          </div>
          <div class="col-4">
            <div class="feature-card">
              <h3>Vite</h3>
              <p>Herramienta de construcción rápida y moderna para desarrollo</p>
            </div>
          </div>
          <div class="col-4">
            <div class="feature-card">
              <h3>Pinia</h3>
              <p>Store de estado simple y potente para Vue.js</p>
            </div>
          </div>
        </div>
      </div>

      <div class="api-section">
        <h2 class="section-title">Preparado para Backend</h2>
        <div class="card">
          <p>El proyecto está configurado para integrarse fácilmente con un backend:</p>
          <ul>
            <li>Proxy configurado para API en puerto 8000</li>
            <li>Axios para peticiones HTTP</li>
            <li>Estructura preparada para servicios</li>
            <li>Manejo de estado global con Pinia</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showWelcomeMessage = () => {
  alert('¡Bienvenido al proyecto! El frontend está listo para desarrollo.')
}
</script>

<style scoped>
.home {
  padding: 2rem 0;
}

.hero-section {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 15px;
  margin-bottom: 4rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.features-section {
  margin-bottom: 4rem;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 3rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  height: 100%;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  color: #3498db;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.6;
}

.api-section {
  margin-bottom: 2rem;
}

.api-section ul {
  list-style-type: none;
  padding-left: 0;
}

.api-section li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.api-section li:before {
  content: "✓";
  color: #27ae60;
  font-weight: bold;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .section-title {
    font-size: 2rem;
  }
}
</style>
