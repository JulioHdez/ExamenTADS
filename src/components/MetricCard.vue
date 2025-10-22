<template>
  <div class="metric-card">
    <div class="metric-header">
      <div class="metric-icon">
        <component :is="icon" class="icon" />
      </div>
      <div class="metric-title">{{ title }}</div>
    </div>
    <div class="metric-value">{{ value }}</div>
    <div class="metric-subtitle">{{ subtitle }}</div>
    <div v-if="trend" class="metric-trend" :class="trendClass">
      <component :is="trendIcon" class="trend-icon" />
      <span>{{ trend }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon 
} from '@heroicons/vue/24/outline'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: Object,
    required: true
  },
  trend: {
    type: String,
    default: ''
  },
  trendDirection: {
    type: String,
    default: 'neutral', // 'up', 'down', 'neutral'
    validator: (value) => ['up', 'down', 'neutral'].includes(value)
  }
})

const trendClass = computed(() => {
  return {
    'trend-up': props.trendDirection === 'up',
    'trend-down': props.trendDirection === 'down',
    'trend-neutral': props.trendDirection === 'neutral'
  }
})

const trendIcon = computed(() => {
  switch (props.trendDirection) {
    case 'up':
      return ArrowUpIcon
    case 'down':
      return ArrowDownIcon
    default:
      return MinusIcon
  }
})
</script>

<style scoped>
.metric-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon .icon {
  width: 20px;
  height: 20px;
  color: white;
}

.metric-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 2.25rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.metric-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.trend-up {
  color: #059669;
}

.trend-down {
  color: #dc2626;
}

.trend-neutral {
  color: #6b7280;
}

.trend-icon {
  width: 12px;
  height: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .metric-card {
    padding: 1rem;
  }
  
  .metric-value {
    font-size: 1.875rem;
  }
}
</style>
