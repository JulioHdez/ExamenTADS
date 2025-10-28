<template>
  <BaseModal :is-open="isOpen" title="Factores de Riesgo" @close="$emit('close')">
    <div class="risk-factors-content">
      <!-- Selector de Factor de Riesgo -->
      <div class="factor-selector">
        <label for="riskFactor" class="selector-label">Seleccione un Factor de Riesgo</label>
        <select 
          id="riskFactor" 
          v-model="selectedFactor" 
          class="factor-dropdown"
        >
          <option value="">-- Seleccione un factor --</option>
          <option 
            v-for="factor in riskFactors" 
            :key="factor.id" 
            :value="factor.id"
          >
            {{ factor.name }}
          </option>
        </select>
      </div>

      <!-- Información del Factor Seleccionado -->
      <div v-if="selectedFactor" class="factor-info">
        <div class="factor-header">
          <div class="factor-icon">
            <span>{{ getSelectedFactorData()?.icon }}</span>
          </div>
          <div class="factor-title">
            <h3>{{ getSelectedFactorData()?.name }}</h3>
            <p class="factor-subtitle">{{ getSelectedFactorData()?.subtitle }}</p>
          </div>
        </div>

        <div class="factor-description">
          <h4>Descripción</h4>
          <p>{{ getSelectedFactorData()?.description }}</p>
        </div>

        <div class="factor-characteristics">
          <h4>Características Principales</h4>
          <ul class="characteristics-list">
            <li v-for="characteristic in getSelectedFactorData()?.characteristics" :key="characteristic">
              <span class="characteristic-icon">•</span>
              {{ characteristic }}
            </li>
          </ul>
        </div>


      </div>

      <!-- Estado vacío cuando no hay factor seleccionado -->
      <div v-else class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Seleccione un Factor de Riesgo</h3>
        <p>Utilice el menú desplegable para explorar los diferentes factores de riesgo que pueden afectar el rendimiento académico de los estudiantes.</p>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">
        Cerrar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'
import { useRiskFactors } from '@/composables/modals/useRiskFactors'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const {
  selectedFactor,
  riskFactors,
  getSelectedFactorData
} = useRiskFactors()
</script>

<style scoped>
@import '@/styles/modals/RiskFactorsModal.css';
</style>
