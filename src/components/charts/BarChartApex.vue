<template>
  <div class="apex-chart-wrapper">
    <apexchart
      type="bar"
      :options="chartOptions"
      :series="series"
      height="350"
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
  labels: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Gráfico de Barras'
  }
})

const isDarkMode = ref(false)

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

const series = computed(() => [
  {
    name: 'Estudiantes',
    data: props.data
  }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
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
    }
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: false,
      columnWidth: '55%',
      dataLabels: {
        position: 'top'
      }
    }
  },
  dataLabels: {
    enabled: true,
    offsetY: -20,
    style: {
      fontSize: '12px',
      colors: isDarkMode.value ? ['#f1f5f9'] : ['#304758']
    }
  },
  xaxis: {
    categories: props.labels,
    labels: {
      style: {
        colors: isDarkMode.value ? '#94a3b8' : '#6b7280'
      }
    },
    title: {
      text: 'Semestres',
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
      text: 'Número de Estudiantes',
      style: {
        color: isDarkMode.value ? '#94a3b8' : '#6b7280'
      }
    }
  },
  colors: ['#3b82f6'],
  grid: {
    borderColor: isDarkMode.value ? '#475569' : '#e5e7eb',
    strokeDashArray: 3
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val + " estudiantes"
      }
    },
    theme: isDarkMode.value ? 'dark' : 'light'
  },
  theme: {
    mode: isDarkMode.value ? 'dark' : 'light'
  },
  fill: {
    colors: ['#3b82f6']
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

