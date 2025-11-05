<template>
  <div class="apex-chart-wrapper">
    <apexchart
      ref="chartRef"
      type="line"
      :options="chartOptions"
      :series="series"
      height="350"
    ></apexchart>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  labels: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Gráfico de Líneas'
  }
})

const emit = defineEmits(['dataPointSelection'])

const isDarkMode = ref(false)
const chartRef = ref(null)

// Función para agregar listeners de clic a los marcadores
const setupMarkerListeners = () => {
  if (chartRef.value && chartRef.value.chart) {
    const chart = chartRef.value.chart
    const chartContainer = chart.w.globals.dom.baseEl
    
    if (chartContainer) {
      const svgElement = chartContainer.querySelector('svg')
      if (svgElement) {
        // Agregar listener para clics en marcadores
        const handleMarkerClick = (event) => {
          const target = event.target
          // Verificar si es un círculo que es parte de un marcador
          if (target && target.tagName === 'circle') {
            const markerGroup = target.closest('.apexcharts-series-markers')
            if (markerGroup) {
              const allMarkers = markerGroup.querySelectorAll('g')
              let markerIndex = -1
              
              // Buscar el índice del marcador
              allMarkers.forEach((marker, index) => {
                const circle = marker.querySelector('circle')
                if (circle === target || marker.contains(target)) {
                  markerIndex = index
                }
              })
              
              if (markerIndex !== -1 && props.data[markerIndex]) {
                const selectedData = props.data[markerIndex]
                const selectedLabel = props.labels[markerIndex]
                
                emit('dataPointSelection', {
                  chartType: 'line',
                  category: selectedLabel,
                  value: selectedData.rate,
                  month: selectedData.month,
                  dataPointIndex: markerIndex
                })
              }
            }
          }
        }
        
        // Remover listener anterior si existe
        svgElement.removeEventListener('click', handleMarkerClick)
        svgElement.addEventListener('click', handleMarkerClick)
      }
    }
  }
}

// Detectar el modo oscuro y configurar eventos del gráfico
onMounted(() => {
  isDarkMode.value = document.documentElement.classList.contains('dark')
  
  // Observar cambios en el tema
  const observer = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark')
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

const series = computed(() => [
  {
    name: 'Tasa de Aprobación',
    data: props.data.map(item => item.rate)
  }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    height: 350,
    background: isDarkMode.value ? '#1e293b' : '#ffffff',
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: false,
        reset: true
      }
    },
    zoom: {
      enabled: true
    },
    events: {
      dataPointSelection: (event, chartContext, config) => {
        const dataPointIndex = config.dataPointIndex
        const selectedData = props.data[dataPointIndex]
        const selectedLabel = props.labels[dataPointIndex]
        
        if (selectedData) {
          emit('dataPointSelection', {
            chartType: 'line',
            category: selectedLabel,
            value: selectedData.rate,
            month: selectedData.month,
            dataPointIndex
          })
        }
      },
      click: (event, chartContext, config) => {
        // Verificar si el click es en un punto de datos
        if (config && config.dataPointIndex !== undefined && config.dataPointIndex !== null) {
          const dataPointIndex = config.dataPointIndex
          const selectedData = props.data[dataPointIndex]
          const selectedLabel = props.labels[dataPointIndex]
          
          if (selectedData) {
            emit('dataPointSelection', {
              chartType: 'line',
              category: selectedLabel,
              value: selectedData.rate,
              month: selectedData.month,
              dataPointIndex
            })
          }
        }
      },
      rendered: () => {
        // Cuando el gráfico se renderiza, configurar listeners adicionales
        setupMarkerListeners()
      }
    }
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  markers: {
    size: 7,
    hover: {
      size: 9
    },
    discrete: []
  },
  xaxis: {
    categories: props.labels,
    labels: {
      style: {
        colors: isDarkMode.value ? '#94a3b8' : '#6b7280'
      }
    },
    title: {
      text: 'Meses',
      style: {
        color: isDarkMode.value ? '#94a3b8' : '#6b7280'
      }
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: isDarkMode.value ? '#94a3b8' : '#6b7280'
      }
    },
    title: {
      text: 'Tasa de Aprobación (%)',
      style: {
        color: isDarkMode.value ? '#94a3b8' : '#6b7280'
      }
    },
    min: 0,
    max: 100
  },
  colors: ['#3b82f6'],
  grid: {
    borderColor: isDarkMode.value ? '#475569' : '#e5e7eb',
    strokeDashArray: 3
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val + '%'
      }
    },
    theme: isDarkMode.value ? 'dark' : 'light'
  },
  theme: {
    mode: isDarkMode.value ? 'dark' : 'light'
  }
}))
</script>

<style scoped>
.apex-chart-wrapper {
  width: 100%;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.dark .apex-chart-wrapper {
  background: #1e293b;
}

.apex-chart-wrapper :deep(.apexcharts-tooltip) {
  background: white;
  border: 1px solid #e5e7eb;
  color: #1f2937;
}

.dark .apex-chart-wrapper :deep(.apexcharts-tooltip) {
  background: #1e293b;
  border: 1px solid #475569;
  color: #f1f5f9;
}
</style>

