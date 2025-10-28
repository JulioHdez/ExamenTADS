import { ref, computed } from 'vue'
import axios from 'axios'

export function useMaterias() {
    const materias = ref([])
    const materiasBasicas = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Obtener todas las materias
    const fetchMaterias = async () => {
        try {
            loading.value = true
            error.value = null
            
            const response = await axios.get('/api/materias/active')
            materias.value = response.data.data || []
            
            return materias.value
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al obtener materias'
            console.error('Error fetching materias:', err)
            return []
        } finally {
            loading.value = false
        }
    }

    // Obtener materias por carrera
    const fetchMateriasByCarrera = async (carreraId) => {
        try {
            loading.value = true
            error.value = null
            
            const response = await axios.get(`/api/materias/carrera/${carreraId}`)
            return response.data.data || []
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al obtener materias por carrera'
            console.error('Error fetching materias by carrera:', err)
            return []
        } finally {
            loading.value = false
        }
    }

    // Obtener materias básicas comunes
    const fetchMateriasBasicas = async () => {
        try {
            loading.value = true
            error.value = null
            
            const response = await axios.get('/api/materias/basicas')
            materiasBasicas.value = response.data.data || []
            
            return materiasBasicas.value
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al obtener materias básicas'
            console.error('Error fetching materias basicas:', err)
            return []
        } finally {
            loading.value = false
        }
    }

    // Obtener materias completas (básicas + específicas de carrera)
    const fetchMateriasCompletas = async (carreraId) => {
        console.log('=== INICIO fetchMateriasCompletas ===')
        console.log('Carrera ID:', carreraId)
        
        try {
            loading.value = true
            error.value = null
            
            console.log('Llamando a fetchMateriasBasicas...')
            const basicas = await fetchMateriasBasicas()
            console.log('Materias básicas obtenidas:', basicas)
            
            console.log('Llamando a fetchMateriasByCarrera...')
            const especificas = await fetchMateriasByCarrera(carreraId)
            console.log('Materias específicas obtenidas:', especificas)
            
            const resultado = [...basicas, ...especificas]
            console.log('Resultado final:', resultado)
            return resultado
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al obtener materias completas'
            console.error('Error fetching materias completas:', err)
            return []
        } finally {
            loading.value = false
            console.log('=== FIN fetchMateriasCompletas ===')
        }
    }

    // Buscar materias por nombre
    const searchMaterias = async (nombre) => {
        try {
            loading.value = true
            error.value = null
            
            const response = await axios.get(`/api/materias/search?nombre=${encodeURIComponent(nombre)}`)
            return response.data.data || []
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al buscar materias'
            console.error('Error searching materias:', err)
            return []
        } finally {
            loading.value = false
        }
    }

    // Obtener materia por ID
    const getMateriaById = async (id) => {
        try {
            const response = await axios.get(`/api/materias/${id}`)
            return response.data.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al obtener materia'
            console.error('Error getting materia by id:', err)
            return null
        }
    }

    // Computed para materias organizadas por tipo
    const materiasOrganizadas = computed(() => {
        const organizadas = {
            basicas: [],
            sistemas: [],
            industrial: [],
            administracion: [],
            contabilidad: [],
            psicologia: [],
            medicina: [],
            derecho: []
        }

        materias.value.forEach(materia => {
            const clave = materia.clave_materia
            
            if (clave.startsWith('MAT') || clave.startsWith('EST') || clave.startsWith('ING') || 
                clave.startsWith('FIL') || clave.startsWith('HIS') || clave.startsWith('COM') ||
                clave.startsWith('FIS') || clave.startsWith('QUI')) {
                organizadas.basicas.push(materia)
            } else if (clave.startsWith('ISC')) {
                organizadas.sistemas.push(materia)
            } else if (clave.startsWith('IND')) {
                organizadas.industrial.push(materia)
            } else if (clave.startsWith('ADM')) {
                organizadas.administracion.push(materia)
            } else if (clave.startsWith('CONT')) {
                organizadas.contabilidad.push(materia)
            } else if (clave.startsWith('PSI')) {
                organizadas.psicologia.push(materia)
            } else if (clave.startsWith('MED')) {
                organizadas.medicina.push(materia)
            } else if (clave.startsWith('DER')) {
                organizadas.derecho.push(materia)
            }
        })

        return organizadas
    })

    // Mapeo de carreras a nombres
    const carreraNames = {
        2: 'Ingeniería en Sistemas Computacionales',
        3: 'Ingeniería Industrial',
        4: 'Administración',
        5: 'Contabilidad',
        6: 'Psicología',
        7: 'Medicina',
        8: 'Derecho'
    }

    // Obtener nombre de carrera por ID
    const getCarreraName = (carreraId) => {
        return carreraNames[carreraId] || 'Carrera no encontrada'
    }

    return {
        // Estado
        materias,
        materiasBasicas,
        loading,
        error,
        
        // Métodos
        fetchMaterias,
        fetchMateriasByCarrera,
        fetchMateriasBasicas,
        fetchMateriasCompletas,
        searchMaterias,
        getMateriaById,
        
        // Computed
        materiasOrganizadas,
        
        // Utilidades
        getCarreraName
    }
}
