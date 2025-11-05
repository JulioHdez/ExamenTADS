<template>
  <div class="apex-chart-wrapper">
    <apexchart
      ref="chartRef"
      type="pie"
      :options="chartOptions"
      :series="series"
      height="350"
      @dataPointSelection="handleDataPointSelection"
    ></apexchart>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Gráfico de Pastel'
  }
})

const emit = defineEmits(['dataPointSelection'])

const isDarkMode = ref(false)
const chartRef = ref(null)

// Detectar el modo oscuro
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

const series = computed(() => {
  return props.data.map(item => item.percentage)
})

const chartOptions = computed(() => ({
  chart: {
    type: 'pie',
    height: 350,
    background: isDarkMode.value ? '#1e293b' : '#ffffff',
    toolbar: {
      show: true,
      tools: {
        download: true
      },
      export: {
        csv: {
          filename: 'distribucion-estado-academico',
          columnDelimiter: ',',
          headerCategory: 'Estado',
          headerValue: 'Porcentaje'
        },
        svg: {
          filename: 'distribucion-estado-academico'
        },
        png: {
          filename: 'distribucion-estado-academico'
        }
      }
    },
    events: {
      dataPointSelection: (event, chartContext, config) => {
        const dataPointIndex = config.dataPointIndex
        const selectedItem = props.data[dataPointIndex]
        
        if (selectedItem) {
          emit('dataPointSelection', {
            chartType: 'pie',
            category: selectedItem.status,
            value: selectedItem.count,
            percentage: selectedItem.percentage,
            dataPointIndex
          })
        }
      }
    }
  },
  labels: props.data.map(item => item.status),
  colors: props.data.map(item => item.color),
  legend: {
    position: 'bottom',
    fontSize: '14px',
    fontWeight: 600,
    labels: {
      colors: isDarkMode.value ? '#94a3b8' : '#6b7280'
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val, opts) {
      return opts.w.globals.labels[opts.seriesIndex] + ': ' + val.toFixed(0) + '%'
    },
    style: {
      fontSize: '12px',
      fontWeight: 600,
      colors: isDarkMode.value ? ['#f1f5f9'] : ['#1f2937']
    }
  },
  tooltip: {
    y: {
      formatter: function (val, opts) {
        const item = props.data[opts.seriesIndex]
        return item.status + ': ' + val.toFixed(1) + '% (' + item.count + ' estudiantes)'
      }
    },
    theme: isDarkMode.value ? 'dark' : 'light'
  },
  theme: {
    mode: isDarkMode.value ? 'dark' : 'light'
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
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

.apex-chart-wrapper :deep(.apexcharts-legend) {
  color: #1f2937;
}

.dark .apex-chart-wrapper :deep(.apexcharts-legend) {
  color: #f1f5f9;
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

