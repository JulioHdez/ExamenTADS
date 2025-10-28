<template>
  <div class="pareto-chart-wrapper">
    <apexchart
      type="line"
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
  }
})

const categories = computed(() => props.data.map(item => item.category))
const frequencies = computed(() => props.data.map(item => item.value))
const cumulativePercentages = computed(() => props.data.map(item => item.cumulativePercentage))

const series = computed(() => [
  {
    name: 'Frecuencia',
    type: 'column',
    data: frequencies.value,
    color: '#3b82f6'
  },
  {
    name: 'Porcentaje Acumulado',
    type: 'line',
    data: cumulativePercentages.value,
    color: '#ef4444'
  }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    height: 400,
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    sparkline: {
      enabled: false
    }
  },
  colors: ['#3b82f6', '#ef4444'],
  stroke: {
    width: [0, 4],
    curve: 'smooth',
    dashArray: [0, 5]
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '50%'
    }
  },
  dataLabels: {
    enabled: true,
    enabledOnSeries: [1],
    offsetY: -10,
    formatter: (val) => `${val}%`,
    style: {
      fontSize: '12px',
      fontWeight: 600,
      colors: ['#ef4444']
    }
  },
  xaxis: {
    categories: categories.value,
    labels: {
      style: {
        colors: '#6b7280',
        fontSize: '11px',
        fontWeight: 600
      }
    },
    crosshairs: {
      show: true
    }
  },
  yaxis: [
    {
      title: {
        text: 'Frecuencia',
        style: {
          color: '#3b82f6',
          fontSize: '12px',
          fontWeight: 600
        }
      },
      labels: {
        style: {
          colors: '#6b7280'
        }
      }
    },
    {
      opposite: true,
      title: {
        text: 'Porcentaje Acumulado',
        style: {
          color: '#ef4444',
          fontSize: '12px',
          fontWeight: 600
        }
      },
      min: 0,
      max: 100,
      labels: {
        style: {
          colors: '#ef4444',
          fontWeight: 600
        },
        formatter: (val) => `${val}%`
      }
    }
  ],
  grid: {
    borderColor: '#e5e7eb',
    strokeDashArray: 3,
    xaxis: {
      lines: {
        show: true
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    }
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'right',
    fontSize: '14px',
    fontWeight: 600,
    labels: {
      colors: '#374151'
    },
    markers: {
      width: 12,
      height: 12,
      radius: 6
    }
  },
  tooltip: {
    enabled: true,
    shared: true,
    intersect: false,
    y: {
      formatter: (val) => `${val}%`
    }
  },
  markers: {
    size: [0, 6],
    colors: ['#3b82f6', '#ef4444'],
    strokeWidth: 2,
    strokeColors: '#fff',
    hover: {
      size: [0, 8]
    }
  },
  fill: {
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
  }
}))
</script>

<style scoped>
.pareto-chart-wrapper {
  width: 100%;
  padding: 1rem;
  background: transparent;
}
</style>
