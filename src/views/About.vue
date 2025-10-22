<template>
  <div class="about">
    <div class="container">
      <div class="about-header">
        <h1>Acerca del Proyecto</h1>
        <p class="lead">Información técnica y arquitectura del proyecto</p>
      </div>

      <div class="row">
        <div class="col-6">
          <div class="card">
            <h2>Tecnologías Frontend</h2>
            <ul class="tech-list">
              <li><strong>Vue.js 3:</strong> Framework principal con Composition API</li>
              <li><strong>Vite:</strong> Herramienta de construcción y desarrollo</li>
              <li><strong>Vue Router:</strong> Enrutamiento del lado del cliente</li>
              <li><strong>Pinia:</strong> Gestión de estado global</li>
              <li><strong>Axios:</strong> Cliente HTTP para peticiones API</li>
              <li><strong>VueUse:</strong> Colección de utilidades para Vue</li>
            </ul>
          </div>
        </div>

        <div class="col-6">
          <div class="card">
            <h2>Configuración del Proyecto</h2>
            <ul class="config-list">
              <li><strong>Auto-imports:</strong> Importaciones automáticas de Vue</li>
              <li><strong>Proxy API:</strong> Configurado para puerto 8000</li>
              <li><strong>ESLint:</strong> Linting de código configurado</li>
              <li><strong>Prettier:</strong> Formateo automático de código</li>
              <li><strong>Sass:</strong> Preprocesador CSS incluido</li>
              <li><strong>TypeScript:</strong> Preparado para migración</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Estructura del Proyecto</h2>
        <div class="project-structure">
          <pre><code>src/
├── components/          # Componentes reutilizables
├── views/              # Vistas/páginas principales
├── router/             # Configuración de rutas
├── stores/             # Stores de Pinia
├── services/           # Servicios para API
├── utils/              # Utilidades y helpers
├── assets/             # Recursos estáticos
├── styles/             # Estilos globales
├── App.vue             # Componente raíz
└── main.js             # Punto de entrada</code></pre>
        </div>
      </div>

      <div class="card">
        <h2>Preparación para Backend</h2>
        <p>El proyecto está configurado para integrarse fácilmente con un backend:</p>
        <div class="backend-features">
          <div class="feature-item">
            <h3>🌐 Proxy de Desarrollo</h3>
            <p>Las peticiones a <code>/api</code> se redirigen automáticamente al backend en puerto 8000</p>
          </div>
          <div class="feature-item">
            <h3>📡 Servicios HTTP</h3>
            <p>Axios configurado para manejar peticiones REST y autenticación</p>
          </div>
          <div class="feature-item">
            <h3>🗄️ Gestión de Estado</h3>
            <p>Pinia stores preparados para manejar datos del backend</p>
          </div>
          <div class="feature-item">
            <h3>🔐 Autenticación</h3>
            <p>Estructura preparada para manejo de tokens y sesiones</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Componente de información sobre el proyecto
</script>

<style scoped>
.about {
  padding: 2rem 0;
}

.about-header {
  text-align: center;
  margin-bottom: 3rem;
}

.about-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.lead {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.tech-list,
.config-list {
  list-style: none;
  padding: 0;
}

.tech-list li,
.config-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: flex-start;
}

.tech-list li:last-child,
.config-list li:last-child {
  border-bottom: none;
}

.project-structure {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 5px;
  overflow-x: auto;
}

.project-structure pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

.backend-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.feature-item {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.feature-item h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.feature-item p {
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.feature-item code {
  background: #e9ecef;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .about-header h1 {
    font-size: 2rem;
  }
  
  .backend-features {
    grid-template-columns: 1fr;
  }
}
</style>
