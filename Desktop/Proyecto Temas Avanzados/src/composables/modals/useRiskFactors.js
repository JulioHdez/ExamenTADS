import { ref } from 'vue'

export function useRiskFactors() {
  const selectedFactor = ref('')

  // Datos de los factores de riesgo
  const riskFactors = ref([
    {
      id: 'academic',
      name: 'Factores Académicos',
      subtitle: 'Relacionados con el rendimiento y habilidades académicas',
      icon: '📚',
      description: 'Los factores académicos se refieren a las habilidades, conocimientos y competencias que un estudiante posee o carece en el ámbito educativo. Estos factores incluyen el nivel de preparación previa, habilidades de estudio, comprensión de conceptos básicos y la capacidad de adaptarse a diferentes metodologías de enseñanza.',
      characteristics: [
        'Dificultades en materias específicas',
        'Falta de hábitos de estudio efectivos',
        'Problemas de comprensión lectora',
        'Dificultades en matemáticas básicas',
        'Falta de motivación académica',
        'Problemas de concentración y atención'
      ]
    },
    {
      id: 'psychosocial',
      name: 'Factores Psicosociales',
      subtitle: 'Aspectos psicológicos y sociales que influyen en el aprendizaje',
      icon: '🧠',
      description: 'Los factores psicosociales engloban las condiciones psicológicas, emocionales y sociales que pueden afectar el desempeño académico. Incluyen aspectos como la autoestima, las relaciones interpersonales, el estrés, la ansiedad y otros estados emocionales que influyen en la capacidad de aprendizaje.',
      characteristics: [
        'Problemas de autoestima y confianza',
        'Ansiedad y estrés académico',
        'Dificultades en relaciones sociales',
        'Problemas familiares',
        'Depresión o trastornos del estado de ánimo',
        'Falta de apoyo emocional'
      ]
    },
    {
      id: 'institutional',
      name: 'Factores Institucionales',
      subtitle: 'Aspectos relacionados con la institución educativa',
      icon: '🏫',
      description: 'Los factores institucionales se refieren a las características, políticas y recursos de la institución educativa que pueden facilitar o dificultar el aprendizaje. Incluyen la calidad de la enseñanza, los recursos disponibles, el ambiente institucional y las políticas académicas.',
      characteristics: [
        'Calidad de la enseñanza',
        'Disponibilidad de recursos educativos',
        'Ambiente institucional',
        'Políticas académicas',
        'Apoyo estudiantil disponible',
        'Infraestructura adecuada'
      ]
    },
    {
      id: 'economic',
      name: 'Factores Económicos',
      subtitle: 'Condiciones económicas que afectan el acceso a la educación',
      icon: '💰',
      description: 'Los factores económicos se relacionan con las condiciones financieras del estudiante y su familia que pueden influir en el acceso a recursos educativos, alimentación adecuada, transporte, materiales de estudio y otras necesidades básicas para el aprendizaje.',
      characteristics: [
        'Recursos económicos limitados',
        'Falta de acceso a tecnología',
        'Problemas de alimentación',
        'Necesidad de trabajar mientras estudia',
        'Falta de materiales educativos',
        'Problemas de transporte'
      ]
    },
    {
      id: 'contextual',
      name: 'Factores Contextuales',
      subtitle: 'Condiciones del entorno y contexto social',
      icon: '🌍',
      description: 'Los factores contextuales incluyen las condiciones del entorno social, cultural y geográfico en el que se desarrolla el estudiante. Estos factores pueden influir en las oportunidades educativas, las expectativas sociales y el apoyo comunitario disponible.',
      characteristics: [
        'Contexto socioeconómico del barrio',
        'Cultura y valores familiares',
        'Acceso a servicios básicos',
        'Violencia o inseguridad',
        'Migración o desplazamiento',
        'Idioma materno diferente'
      ]
    },
    {
      id: 'health',
      name: 'Factores de Salud',
      subtitle: 'Condiciones de salud física y mental',
      icon: '🏥',
      description: 'Los factores de salud incluyen tanto condiciones físicas como mentales que pueden afectar la capacidad de aprendizaje, la asistencia a clases y el rendimiento académico general. Incluyen enfermedades crónicas, discapacidades, problemas de salud mental y otros aspectos relacionados con el bienestar físico.',
      characteristics: [
        'Enfermedades crónicas',
        'Discapacidades físicas o cognitivas',
        'Problemas de salud mental',
        'Falta de acceso a atención médica',
        'Problemas de visión o audición',
        'Trastornos del aprendizaje'
      ]
    }
  ])

  const getSelectedFactorData = () => {
    return riskFactors.value.find(factor => factor.id === selectedFactor.value)
  }

  return {
    selectedFactor,
    riskFactors,
    getSelectedFactorData
  }
}
