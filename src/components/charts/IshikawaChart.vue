<template>
  <div class="fishbone-diagram">
    <!-- Línea principal horizontal (espina de pescado) -->
    <div class="main-spine">
      <!-- Cabeza del pez (problema) -->
      <div class="problem-head">
        <div class="problem-title">{{ problem }}</div>
        <div class="problem-subtitle">Semestre {{ semester }}</div>
      </div>
    </div>

    <!-- Categorías principales (ramas diagonales) -->
    <div class="branches-container">
      <div 
        v-for="(category, index) in categories" 
        :key="category.id"
        :class="['branch', `branch-${index}`]"
        :style="{ '--branch-color': category.color }"
      >
        <!-- Rama diagonal -->
        <div class="branch-line"></div>
        
        <!-- Etiqueta de la categoría -->
        <div class="branch-label">
          <span class="branch-icon">{{ category.icon }}</span>
          <div class="branch-info">
            <span class="branch-name">{{ category.name }}</span>
            <span class="branch-count">{{ category.count }}</span>
          </div>
        </div>

        <!-- Factores específicos (sub-ramas) -->
        <div class="sub-branches" v-if="category.factors.length > 0">
          <div 
            v-for="(factor, fIndex) in category.factors.slice(0, 3)" 
            :key="fIndex"
            class="sub-branch"
            :title="factor"
          >
            <div class="sub-branch-line"></div>
            <span class="sub-branch-text">{{ factor }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const problem = computed(() => 'Bajo Rendimiento Académico')
const semester = computed(() => props.data?.semester || '')
const categories = computed(() => props.data?.categories || [])
</script>

<style scoped>
.fishbone-diagram {
  position: relative;
  width: 100%;
  min-height: 500px;
  padding: 60px 0;
  margin: 20px 0;
}

/* Línea principal horizontal */
.main-spine {
  position: relative;
  height: 4px;
  background: linear-gradient(to right, transparent, #2C4068 20%, #2C4068 80%, transparent);
  margin: 0 60px;
}

.main-spine::after {
  content: '';
  position: absolute;
  right: -15px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid #2C4068;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
}

/* Cabeza del pez (problema) */
.problem-head {
  position: absolute;
  right: -60px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
  text-align: center;
  min-width: 150px;
  z-index: 10;
}

.problem-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
  line-height: 1.2;
}

.problem-subtitle {
  font-size: 11px;
  opacity: 0.9;
  font-weight: 600;
}

/* Contenedor de ramas */
.branches-container {
  position: absolute;
  left: 60px;
  right: 210px;
  top: 0;
  bottom: 0;
}

/* Rama individual */
.branch {
  position: absolute;
  width: 140px;
  z-index: 5;
}

/* Posicionamiento de ramas alternadas */
.branch-0 {
  top: 10%;
  left: 5%;
}

.branch-1 {
  top: 25%;
  left: 0%;
}

.branch-2 {
  top: 40%;
  left: 3%;
}

.branch-3 {
  top: 55%;
  left: 5%;
}

.branch-4 {
  top: 70%;
  left: 2%;
}

.branch-5 {
  top: 85%;
  left: 6%;
}

/* Línea diagonal de la rama */
.branch-line {
  position: absolute;
  width: 80px;
  height: 3px;
  background: var(--branch-color);
  transform: rotate(-30deg);
  transform-origin: left center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.branch-2 .branch-line,
.branch-4 .branch-line {
  transform: rotate(30deg);
}

/* Etiqueta de la categoría */
.branch-label {
  position: absolute;
  left: 70px;
  top: -12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px solid var(--branch-color);
  border-radius: 8px;
  padding: 6px 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

.branch-icon {
  font-size: 18px;
}

.branch-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.branch-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--branch-color);
}

.branch-count {
  font-size: 10px;
  font-weight: 700;
  color: #6b7280;
}

/* Sub-ramas (factores específicos) */
.sub-branches {
  position: absolute;
  left: 85px;
  top: -8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sub-branch {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sub-branch-line {
  width: 20px;
  height: 2px;
  background: var(--branch-color);
  opacity: 0.6;
}

.sub-branch-text {
  font-size: 9px;
  color: #374151;
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

/* Dark mode */
.dark .problem-head {
  background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
}

.dark .branch-label {
  background: #1f2937;
  border-color: var(--branch-color);
}

.dark .branch-name {
  color: var(--branch-color);
}

.dark .branch-count {
  color: #9ca3af;
}

.dark .sub-branch-text {
  color: #d1d5db;
}

/* Responsive */
@media (max-width: 768px) {
  .branches-container {
    left: 20px;
    right: 180px;
  }

  .branch {
    width: 100px;
  }

  .branch-label {
    left: 50px;
    padding: 4px 6px;
  }

  .branch-name {
    font-size: 10px;
  }

  .branch-count {
    font-size: 9px;
  }

  .sub-branch-text {
    max-width: 80px;
    font-size: 8px;
  }

  .problem-head {
    right: -50px;
    padding: 16px 20px;
    min-width: 120px;
  }

  .problem-title {
    font-size: 12px;
  }

  .problem-subtitle {
    font-size: 10px;
  }
}
</style>

