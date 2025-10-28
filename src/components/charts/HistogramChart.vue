<template>
  <div class="histogram-chart-wrapper">
    <apexchart
      type="bar"
      :options="chartOptions"
      :series="series"
      height="400"
    ></apexchart>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Histograma de Distribución'
  }
})

const labels = computed(() => props.data.map(item => item.bin || item.range || item.label))
const frequencies = computed(() => props.data.map(item => item.frequency || item.value || item.count))

const series = computed(() => [
  {
    name: 'Frecuencia',
    data: frequencies.value
  }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 400,
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true
      }
    }
  },
  colors: ['#3b82f6'],
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '100%',
      distributed: false,
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
      colors: ['#6b7280']
    },
    formatter: (val) => val
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: labels.value,
    labels: {
      style: {
        colors: '#6b7280',
        fontSize: '11px',
        fontWeight: 600
      },
      rotate: -45,
      rotateAlways: false
    },
    title: {
      text: props.data.length > 0 && props.data[0].range ? 'Rango de Datos' : 'Categorías',
      style: {
        color: '#6b7280',
        fontSize: '14px',
        fontWeight: 600
      }
    }
  },
  yaxis: {
    title: {
      text: 'Frecuencia',
      style: {
        color: '#6b7280',
        fontSize: '14px',
        fontWeight: 600
      }
    },
    labels: {
      style: {
        colors: '#6b7280'
      }
    }
  },
  grid: {
    borderColor: '#e5e7eb',
    strokeDashArray: 3
  },
  tooltip: {
    enabled: true,
    y: {
      formatter: (val) => `${val} ocurrencias`
    },
    theme: 'dark',
    style: {
      fontSize: '12px'
    }
  },
  fill: {
    opacity: 0.8,
    type: 'solid',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.5,
      gradientToColors: ['#2563eb'],
      inverseColors: false,
      opacityFrom: 0.9,
      opacityTo: 0.3,
      stops: [0, 100],
      colorStops: []
    }
  }
}))
</script>

<style scoped>
.histogram-chart-wrapper {
  width: 100%;
  padding: 1rem;
  background: transparent;
}
</style>

