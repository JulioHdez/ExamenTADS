<template>
  <div v-if="data && data.categories" class="ishikawa-wrapper" :class="{ expanded: expanded }">
    <svg :viewBox="expanded ? '0 0 1300 700' : '0 0 1200 600'" class="diagram-svg">
      
      <!-- Línea principal (espina) - EXTREMADAMENTE LARGA -->
      <line 
        x1="30" 
        :y1="expanded ? 350 : 300" 
        :x2="expanded ? 1150 : 1080" 
        :y2="expanded ? 350 : 300" 
        stroke="#60a5fa" 
        stroke-width="4" 
      />
      
      <!-- Flecha al problema -->
      <polygon 
        :points="expanded ? '1145,347 1150,350 1145,353' : '1075,297 1080,300 1075,303'" 
        fill="#60a5fa" 
      />
      
      <!-- Problema (cabeza del pez) -->
      <rect 
        :x="expanded ? 1150 : 1080" 
        :y="expanded ? 300 : 250" 
        width="200" 
        height="90" 
        rx="10" 
        fill="#dc2626" 
        class="problem-rect"
      />
      <text 
        :x="expanded ? 1250 : 1180" 
        :y="expanded ? 340 : 290" 
        fill="white" 
        font-size="13" 
        font-weight="700" 
        text-anchor="middle"
      >
        Bajo Rendimiento Académico
      </text>
      <text 
        :x="expanded ? 1250 : 1180" 
        :y="expanded ? 365 : 315" 
        fill="white" 
        font-size="11" 
        text-anchor="middle"
      >
        Semestre {{ data.semester || '' }}
      </text>
      
      <!-- Ramas con categorías -->
      <g v-for="(category, index) in sortedCategories" :key="category.id">
        
        <!-- Rama diagonal -->
        <line
          :x1="getSpineX(index)"
          :y1="expanded ? 350 : 300"
          :x2="getBranchX(index)"
          :y2="getBranchY(index)"
          :stroke="getCategoryColor(category.id)"
          stroke-width="3"
        />
        
        <!-- Grupo para hover - agrupa la caja y los textos -->
        <g class="category-group" @click="handleCategoryClick(category)" style="cursor: pointer;">
          <!-- Caja categoría -->
          <rect
            :x="getBranchX(index) - 70"
            :y="getBranchY(index) - (index < 3 ? 25 : 0)"
            width="140"
            height="50"
            rx="8"
            :fill="getCategoryColor(category.id)"
          />
        
          <!-- Nombre de la categoría -->
          <text
            :x="getBranchX(index)"
            :y="getBranchY(index) + (index < 3 ? -12 : 18)"
            fill="white"
            :font-size="expanded ? 14 : 13"
            font-weight="700"
            text-anchor="middle"
          >
            {{ getCategoryIcon(category.id) }} {{ category.name }}
          </text>
          <!-- Conteo -->
          <text
            :x="getBranchX(index)"
            :y="getBranchY(index) + (index < 3 ? -2 : 32)"
            fill="white"
            :font-size="expanded ? 12 : 11"
            text-anchor="middle"
          >
            ({{ category.count }})
          </text>
        </g>
        
        <!-- Factores (sub-ramas horizontales) -->
        <g v-for="(factor, fIndex) in getFactors(category).slice(0, 3)" :key="fIndex">
          <!-- Sub-rama horizontal directa -->
          <line
            :x1="getFactorX(index, fIndex)"
            :y1="getFactorY(index, fIndex)"
            :x2="getFactorEndX(index, fIndex)"
            :y2="getFactorY(index, fIndex)"
            :stroke="getCategoryColor(category.id)"
            :stroke-width="expanded ? 3 : 2.5"
            stroke-dasharray="5,3"
          />
          
          <!-- Texto del factor - ANTES de la línea -->
          <text
            :x="getFactorTextX(index, fIndex)"
            :y="getFactorTextY(index, fIndex)"
            :font-size="expanded ? 13 : 12"
            :fill="getCategoryColor(category.id)"
            font-weight="600"
            text-anchor="start"
          >
            {{ truncateText(factor, 20) }}
          </text>
          
          <!-- Contador de comentarios en la línea punteada - muestra comentarios de la subcategoría específica -->
          <g 
            v-if="getCommentCountForFactor(category.id, factor) > 0"
            @click="handleSubcategoryClick(category, factor)"
            style="cursor: pointer;"
            class="comment-counter-group"
          >
            <!-- Círculo de fondo para el contador - posicionado más arriba de la línea -->
            <circle
              :cx="getFactorX(index, fIndex) - 55"
              :cy="getFactorY(index, fIndex) - 20"
              r="16"
              :fill="getCategoryColor(category.id)"
              opacity="1"
              filter="drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))"
              class="comment-counter-circle"
            />
            <!-- Número de comentarios -->
            <text
              :x="getFactorX(index, fIndex) - 55"
              :y="getFactorY(index, fIndex) - 15"
              fill="white"
              font-size="12"
              font-weight="700"
              text-anchor="middle"
              class="comment-counter-text"
            >
              {{ getCommentCountForFactor(category.id, factor) }}
            </text>
          </g>
        </g>
      </g>
    </svg>
  </div>
  <div v-else class="loading-state">
    <p>Cargando diagrama...</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => null
  },
  expanded: {
    type: Boolean,
    default: false
  },
  comments: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['category-click', 'subcategory-click'])

const sortedCategories = computed(() => {
  if (!props.data?.categories) return []
  
  const order = ['academico', 'psicosocial', 'economico', 'salud']
  return order.map(id => props.data.categories.find(cat => cat.id === id)).filter(Boolean)
})

const getCategoryColor = (id) => {
  const colors = {
    'academico': '#3b82f6',
    'psicosocial': '#8b5cf6',
    'institucional': '#10b981',
    'contextual': '#ef4444',
    'economico': '#f59e0b',
    'salud': '#ec4899'
  }
  return colors[id] || '#6b7280'
}

const getCategoryIcon = (id) => {
  const icons = {
    'academico': '📚',
    'psicosocial': '🧠',
    'institucional': '🏫',
    'contextual': '🌍',
    'economico': '💰',
    'salud': '🏥'
  }
  return icons[id] || '📋'
}

const getFactors = (category) => {
  return category.factors || []
}

// Posiciones en la espina donde salen las ramas - SEPARACIÓN MANTENIDA, MOVIDAS HACIA DERECHA
const getSpineX = (index) => {
  if (props.expanded) {
    // Vista expandida: 2 arriba, 2 abajo - MOVIDAS A LA DERECHA
    // Índices: 0=Académico, 1=Psicosocial (arriba), 2=Económico, 3=Salud (abajo)
    const positions = [550, 850, 550, 850]
    return positions[index]
  }
  // Vista normal: 2 arriba, 2 abajo - MOVIDAS A LA DERECHA
  const positions = [530, 830, 530, 830]
  return positions[index]
}

// Extremo de la rama (donde está la caja de categoría) - MÁS SEPARADA
const getBranchX = (index) => {
  const spineX = getSpineX(index)
  return spineX - (props.expanded ? 140 : 120)
}

const getBranchY = (index) => {
  if (index < 2) {
    return props.expanded ? 120 : 100  // Arriba - más arriba (2 ramas)
  }
  return props.expanded ? 580 : 500  // Abajo - más abajo (2 ramas)
}

// SOLUCIÓN SIMPLE: calcular Y fijo para cada sub-rama
const getFactorY = (index, fIndex) => {
  const branchY = getBranchY(index)
  
  // Para cada factor, calculamos su posición Y fija
  if (index < 2) {
    // Arriba (Académico, Psicosocial): las sub-ramas van más abajo
    const baseOffset = 60
    const spacing = (fIndex * 80)
    return branchY + baseOffset + spacing
  } else {
    // Abajo (Económico, Salud): las sub-ramas van más arriba
    const baseOffset = 60
    const spacing = (fIndex * 80)
    return branchY - baseOffset - spacing
  }
}

// Posición donde la sub-rama intersecta la rama diagonal - DONDE EMPIEZA LA LÍNEA
const getFactorX = (index, fIndex) => {
  const spineX = getSpineX(index)
  const branchX = getBranchX(index)
  const spineY = props.expanded ? 350 : 300
  const branchY = getBranchY(index)
  const factorY = getFactorY(index, fIndex)
  
  // Calcular en qué punto de la rama diagonal está esta Y
  const deltaY = branchY - spineY
  const deltaX = branchX - spineX
  
  if (deltaY === 0) return spineX
  
  const t = (factorY - spineY) / deltaY
  return spineX + (deltaX * t)
}

// Fin de la sub-rama - VA HACIA LA IZQUIERDA (donde termina la línea)
const getFactorEndX = (index, fIndex) => {
  return getFactorX(index, fIndex) - 100
}

// Posición del texto del factor - AL INICIO de la línea (lado izquierdo)
const getFactorTextX = (index, fIndex) => {
  // El texto va mucho más a la izquierda del extremo de la línea
  return getFactorEndX(index, fIndex) - 130
}

const getFactorTextY = (index, fIndex) => {
  return getFactorY(index, fIndex) + 4 // Ajuste para centrar verticalmente
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Obtener el conteo de comentarios para una categoría (sin subcategoría específica)
const getCommentCount = (categoryId) => {
  if (!props.comments || props.comments.length === 0) return 0
  return props.comments.filter(comment => 
    comment.categoryId === categoryId && !comment.subcategory
  ).length
}

// Obtener el conteo de comentarios para una subcategoría específica (factor)
const getCommentCountForFactor = (categoryId, factorName) => {
  if (!props.comments || props.comments.length === 0) return 0
  return props.comments.filter(comment => 
    comment.categoryId === categoryId && 
    comment.subcategory === factorName
  ).length
}

// Manejar clic en categoría
const handleCategoryClick = (category) => {
  const categoryComments = props.comments?.filter(comment => comment.categoryId === category.id) || []
  emit('category-click', {
    categoryId: category.id,
    categoryName: category.name,
    comments: categoryComments
  })
}

// Manejar clic en subcategoría (contador de comentarios)
const handleSubcategoryClick = (category, subcategoryName) => {
  const subcategoryComments = props.comments?.filter(comment => 
    comment.categoryId === category.id && 
    comment.subcategory === subcategoryName
  ) || []
  emit('subcategory-click', {
    categoryId: category.id,
    categoryName: category.name,
    subcategory: subcategoryName,
    comments: subcategoryComments
  })
}
</script>

<style scoped>
.ishikawa-wrapper {
  width: 100%;
  overflow: auto;
  padding: 1rem;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-radius: 12px;
}

.diagram-svg {
  width: 100%;
  height: 500px;
}

.expanded .diagram-svg {
  height: 700px;
}

.problem-rect {
  filter: drop-shadow(0 4px 8px rgba(220, 38, 38, 0.4));
}

.category-group {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: transform 0.2s ease;
  cursor: pointer;
}

.category-group:hover {
  transform: scale(1.05);
}

.comment-counter-group {
  transition: filter 0.2s ease;
}

.comment-counter-circle {
  transition: all 0.2s ease;
}

.comment-counter-group:hover .comment-counter-circle {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6)) brightness(1.1);
  opacity: 0.95;
}

.comment-counter-text {
  transition: font-weight 0.2s ease;
}

.comment-counter-group:hover .comment-counter-text {
  font-weight: 800;
}

.loading-state {
  padding: 4rem;
  text-align: center;
  color: #6b7280;
}

.dark .ishikawa-wrapper {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}
</style>
