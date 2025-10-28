<template>
  <div class="dispersion-chart-wrapper">
    <apexchart
      type="scatter"
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
    default: 'Diagrama de Dispersión'
  },
  xLabel: {
    type: String,
    default: 'Variable X'
  },
  yLabel: {
    type: String,
    default: 'Variable Y'
  },
  correlation: {
    type: Number,
    default: 0
  }
})

const series = computed(() => [
  {
    name: 'Puntos',
    data: props.data.map((point, index) => ({
      x: point.x,
      y: point.y,
      studentId: point.studentId,
      studentName: point.name
    }))
  }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'scatter',
    height: 400,
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: true,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: true
      }
    },
    zoom: {
      enabled: true,
      type: 'xy',
      autoSelected: 'xy'
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    }
  },
  colors: ['#3b82f6'],
  plotOptions: {
    scatter: {
      distributed: false,
      dataLabels: {
        enabled: false
      }
    }
  },
  markers: {
    size: 6,
    hover: {
      size: 10
    }
  },
  xaxis: {
    title: {
      text: props.xLabel,
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
  yaxis: {
    title: {
      text: props.yLabel,
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
    shared: false,
    intersect: true,
    followCursor: true,
    marker: {
      show: true,
      fillColors: ['#3b82f6']
    },
    custom: function({ seriesIndex, dataPointIndex, w }) {
      const dataPoint = w.globals.initialSeries[seriesIndex].data[dataPointIndex]
      
      if (!dataPoint) return ''
      
      // Obtener información del punto
      const xValue = dataPoint.x
      const yValue = dataPoint.y
      const studentName = dataPoint.studentName || 'Estudiante'
      
      // Buscar si hay más puntos en la misma posición X
      const sameXPoints = w.globals.initialSeries[seriesIndex].data.filter(
        (p, idx) => p && Math.abs(p.x - xValue) < 0.01
      )
      
      let tooltipContent = ''
      
      if (sameXPoints.length > 1) {
        // Si hay múltiples puntos en la misma X, mostrar todos
        tooltipContent = `
          <div style="padding: 12px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 8px; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
              Múltiples estudiantes (X = ${xValue})
            </div>
        `
        
        sameXPoints.forEach((p, idx) => {
          tooltipContent += `
            <div style="margin-bottom: ${idx < sameXPoints.length - 1 ? '8px' : '0'}; padding-bottom: ${idx < sameXPoints.length - 1 ? '8px' : '0'}; border-bottom: ${idx < sameXPoints.length - 1 ? '1px solid #e5e7eb' : 'none'};">
              <div style="font-weight: 600; color: #1f2937; font-size: 12px; margin-bottom: 4px;">
                ${p.studentName || 'Estudiante'}
              </div>
              <div style="color: #6b7280; font-size: 11px;">
                ${props.yLabel}: ${p.y}
              </div>
            </div>
          `
        })
        
        tooltipContent += '</div>'
      } else {
        // Un solo punto, mostrar normalmente
        tooltipContent = `
          <div style="padding: 12px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 8px; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
              ${studentName}
            </div>
            <div style="color: #374151; margin-bottom: 4px; font-size: 12px;">
              <strong>${props.xLabel}:</strong> ${xValue}
            </div>
            <div style="color: #374151; font-size: 12px;">
              <strong>${props.yLabel}:</strong> ${yValue}
            </div>
          </div>
        `
      }
      
      return tooltipContent
    }
  },
  annotations: {
    text: [
      {
        x: '50%',
        y: '95%',
        text: `Correlación: ${props.correlation}`,
        textAnchor: 'middle',
        style: {
          fontSize: '12px',
          fontWeight: 600,
          color: props.correlation > 0.7 ? '#10b981' : props.correlation > 0.4 ? '#f59e0b' : '#ef4444'
        }
      }
    ]
  }
}))
</script>

<style scoped>
.dispersion-chart-wrapper {
  width: 100%;
  padding: 1rem;
  background: transparent;
}
</style>

