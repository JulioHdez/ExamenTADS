<template>
  <div class="mermaid-container">
    <div ref="diagramRef" class="mermaid-diagram"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import mermaid from 'mermaid'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const diagramRef = ref(null)

// Configurar Mermaid
mermaid.initialize({ 
  startOnLoad: false,
  theme: 'default',
  themeVariables: {
    primaryColor: '#3b82f6',
    primaryTextColor: '#fff',
    primaryBorderColor: '#1e40af',
    lineColor: '#374151',
    secondaryColor: '#60a5fa',
    tertiaryColor: '#d1d5db'
  },
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
    padding: 20
  }
})

// Generar el diagrama Mermaid
const generateDiagram = async () => {
  if (!props.data || !props.data.categories) return

  const categories = props.data.categories.filter(cat => cat.count > 0)
  const problem = 'Bajo Rendimiento Académico'
  const semester = props.data.semester || ''

  if (!diagramRef.value) return

  // Crear la definición del diagrama Mermaid en formato flowchart
  let diagramDefinition = `flowchart LR
    Start([ ])
    Problem["⚡ ${problem}<br/>📅 Semestre ${semester}"]
    
    Start --> Problem
  `

  // Agregar categorías principales como ramas
  categories.forEach((category, index) => {
    const catId = `Cat${index}`
    const catName = `${category.icon} ${category.name}`
    
    // Conectar categoría al problema
    diagramDefinition += `\n    Problem --> ${catId}["${catName}<br/><b>(${category.count})</b>"]`
    
    // Agregar sub-ramas (factores específicos) limitados a 3 para claridad
    const maxFactors = Math.min(category.factors.length, 3)
    for (let i = 0; i < maxFactors; i++) {
      const factorId = `${catId}_${i}`
      const factorName = category.factors[i]
      diagramDefinition += `\n    ${catId} --> ${factorId}["▫ ${factorName}"]`
    }
  })

  diagramDefinition += `\n    style Problem fill:#dc2626,stroke:#991b1b,stroke-width:3px,color:#fff\n`

  // Estilos por color de categoría
  categories.forEach((category, index) => {
    const catId = `Cat${index}`
    const colorMap = {
      '#3b82f6': 'fill:#3b82f6,stroke:#1e40af',
      '#8b5cf6': 'fill:#8b5cf6,stroke:#6d28d9',
      '#10b981': 'fill:#10b981,stroke:#047857',
      '#f59e0b': 'fill:#f59e0b,stroke:#d97706',
      '#ef4444': 'fill:#ef4444,stroke:#991b1b',
      '#ec4899': 'fill:#ec4899,stroke:#be185d'
    }
    const fillColor = colorMap[category.color] || 'fill:#6b7280,stroke:#374151'
    diagramDefinition += `\n    style ${catId} ${fillColor},stroke-width:2px,color:#fff\n`
  })

  try {
    // Limpiar el contenedor
    diagramRef.value.innerHTML = ''
    
    // Renderizar el diagrama
    const result = await mermaid.render('ishikawa-diagram', diagramDefinition)
    diagramRef.value.innerHTML = result.svg
    
    // Aplicar clases para tema oscuro
    const svg = diagramRef.value.querySelector('svg')
    if (svg) {
      svg.classList.add('mermaid-svg')
    }
  } catch (err) {
    console.error('Error rendering diagram:', err)
    diagramRef.value.innerHTML = '<p class="error">Error al generar el diagrama</p>'
  }
}

onMounted(() => {
  generateDiagram()
})

watch(() => props.data, () => {
  generateDiagram()
}, { deep: true })
</script>

<style scoped>
.mermaid-container {
  width: 100%;
  overflow: auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.mermaid-diagram {
  width: 100%;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mermaid-diagram :deep(svg) {
  max-width: 100%;
  height: auto;
}

.mermaid-diagram :deep(.node) {
  transition: all 0.2s ease;
}

.mermaid-diagram :deep(.node:hover) {
  transform: scale(1.05);
  cursor: pointer;
}

.error {
  color: #ef4444;
  text-align: center;
  padding: 2rem;
  font-weight: 600;
}

/* Dark mode */
.dark .mermaid-container {
  background: #1f2937;
  border-color: #374151;
}

.dark .mermaid-diagram :deep(path) {
  stroke: #60a5fa;
}

.dark .mermaid-diagram :deep(.node-label) {
  fill: #f9fafb;
}

/* Responsive */
@media (max-width: 768px) {
  .mermaid-container {
    padding: 1rem;
  }
}
</style>

