<template>
  <div class="apex-chart-wrapper">
    <apexchart
      type="line"
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
    default: 'Gráfico de Líneas'
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
    }
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  markers: {
    size: 5,
    hover: {
      size: 7
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

