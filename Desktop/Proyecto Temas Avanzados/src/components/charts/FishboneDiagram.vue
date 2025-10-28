<template>
  <div class="fishbone-wrapper">
    <svg class="fishbone-svg" :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`" preserveAspectRatio="xMidYMid meet">
      
      <!-- Línea principal (espina) -->
      <line 
        :x1="spineStartX" 
        :y1="centerY" 
        :x2="spineEndX" 
        :y2="centerY" 
        :stroke="spineColor" 
        :stroke-width="spineWidth"
        class="main-spine"
      />
      
      <!-- Flecha al problema -->
      <polygon 
        :points="`${spineEndX - 5},${centerY - 4} ${spineEndX},${centerY} ${spineEndX - 5},${centerY + 4}`"
        :fill="spineColor"
      />

      <!-- Problema -->
      <text 
        :x="spineEndX - 10" 
        :y="centerY - 15" 
        :fill="spineColor"
        font-size="14"
        font-weight="700"
        text-anchor="end"
      >
        Problema
      </text>

      <!-- Categorías con sus ramas -->
      <g v-for="(category, index) in branches" :key="category.id">
        <!-- Rama diagonal principal -->
        <line
          :x1="getBranchBaseX(index)"
          :y1="centerY"
          :x2="getBranchTipX(index)"
          :y2="getBranchTipY(index)"
          :stroke="category.color"
          :stroke-width="3"
        />

        <!-- Caja de categoría en la punta -->
        <rect
          :x="getCategoryBoxX(index)"
          :y="getCategoryBoxY(index)"
          width="100"
          height="28"
          :rx="6"
          :fill="category.color"
          class="category-box"
        />

        <!-- Texto de categoría -->
        <text
          :x="getCategoryBoxX(index) + 50"
          :y="getCategoryBoxY(index) + 19"
          font-size="11"
          font-weight="700"
          fill="white"
          text-anchor="middle"
        >
          {{ category.icon }} {{ category.name }}
        </text>

        <!-- Contador -->
        <text
          :x="getCategoryBoxX(index) + 50"
          :y="getCategoryBoxY(index) + 30"
          font-size="9"
          fill="white"
          text-anchor="middle"
        >
          ({{ category.count }})
        </text>

        <!-- Sub-ramas (factores) -->
        <g v-for="(factor, fIndex) in category.factors.slice(0, 3)" :key="fIndex">
          <line
            :x1="getSubBranchStartX(index, fIndex)"
            :y1="getSubBranchStartY(index, fIndex)"
            :x2="getSubBranchEndX(index, fIndex)"
            :y2="getSubBranchEndY(index, fIndex)"
            :stroke="category.color"
            stroke-width="2"
            :stroke-dasharray="5,3"
            opacity="0.8"
          />
          
          <text
            :x="getFactorTextX(index, fIndex)"
            :y="getFactorTextY(index, fIndex)"
            font-size="9"
            :fill="category.color"
            font-weight="600"
          >
            {{ factor }}
          </text>
        </g>
      </g>
    </svg>
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

const spineColor = '#60a5fa'
const spineWidth = 4

const viewBoxWidth = 850
const viewBoxHeight = 450
const centerY = viewBoxHeight / 2
const spineStartX = 50
const spineEndX = viewBoxWidth - 80
const spineLength = spineEndX - spineStartX

const branches = computed(() => props.data?.categories || [])

// Posiciones de las ramas a lo largo de la espina
const branchBasePositions = [0.12, 0.28, 0.48, 0.16, 0.36, 0.58] // Más compactas

const getBranchBaseX = (index) => {
  return spineStartX + (spineLength * branchBasePositions[index])
}

const getBranchTipX = (index) => {
  return getBranchBaseX(index) - 60
}

const getBranchTipY = (index) => {
  if (index < 3) return centerY - 55  // Arriba
  return centerY + 55  // Abajo
}

const getCategoryBoxX = (index) => {
  return getBranchTipX(index) - 50
}

const getCategoryBoxY = (index) => {
  if (index < 3) return getBranchTipY(index) - 35  // Arriba
  return getBranchTipY(index) + 5  // Abajo
}

const getSubBranchStartX = (categoryIndex, factorIndex) => {
  const baseX = getBranchBaseX(categoryIndex)
  const tipX = getBranchTipX(categoryIndex)
  const t = 0.3 + (factorIndex * 0.25)
  return baseX + (tipX - baseX) * t
}

const getSubBranchStartY = (categoryIndex, factorIndex) => {
  const baseY = centerY
  const tipY = getBranchTipY(categoryIndex)
  const t = 0.3 + (factorIndex * 0.25)
  return baseY + (tipY - baseY) * t
}

const getSubBranchEndX = (categoryIndex, factorIndex) => {
  return getSubBranchStartX(categoryIndex, factorIndex) - 35
}

const getSubBranchEndY = (categoryIndex, factorIndex) => {
  const isTop = categoryIndex < 3
  return getSubBranchStartY(categoryIndex, factorIndex) + (isTop ? 25 : -25)
}

const getFactorTextX = (categoryIndex, factorIndex) => {
  return getSubBranchEndX(categoryIndex, factorIndex) - 3
}

const getFactorTextY = (categoryIndex, factorIndex) => {
  return getSubBranchEndY(categoryIndex, factorIndex)
}
</script>

<style scoped>
.fishbone-wrapper {
  width: 100%;
  overflow: auto;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
}

.fishbone-svg {
  width: 100%;
  height: 450px;
  background: white;
}

.main-spine {
  opacity: 0.8;
}

.category-box {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  transition: transform 0.2s ease;
}

.category-box:hover {
  transform: scale(1.05);
}

/* Dark mode */
.dark .fishbone-wrapper {
  background: #1f2937;
}

.dark .fishbone-svg {
  background: #1f2937;
}

/* Responsive */
@media (max-width: 768px) {
  .fishbone-svg {
    height: 400px;
  }
}
</style>
