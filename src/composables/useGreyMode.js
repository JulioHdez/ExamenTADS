import { ref, watch } from "vue";

const isGreyMode = ref(false)
let initialized = false
let watcher = null

export function useGreyMode() {
  // Inicializar solo una vez
  if (!initialized && typeof window !== 'undefined' && typeof document !== 'undefined') {
    initialized = true

    // Inicializar desde localStorage de forma segura
    try {
      if (localStorage) {
        const saved = localStorage.getItem("grey-mode")
        if (saved === "true") {
          isGreyMode.value = true
        }
      }
    } catch (error) {
      // localStorage puede no estar disponible (modo incógnito, etc.)
      console.warn('No se pudo acceder a localStorage:', error)
    }

    // Aplicar el estado inicial si está activado
    const applyInitialState = () => {
      if (document.body && isGreyMode.value) {
        document.body.style.filter = "grayscale(100%)";
      }
    };

    // Aplicar estado inicial cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyInitialState, { once: true });
    } else {
      setTimeout(applyInitialState, 0);
    }

    // Watch para cambios futuros (solo una vez)
    watcher = watch(isGreyMode, (value) => {
      if (localStorage) {
        try {
          localStorage.setItem("grey-mode", value);
        } catch (error) {
          console.warn('Error al guardar modo gris:', error);
        }
      }
      if (document.body) {
        if (value) {
          document.body.style.filter = "grayscale(100%)";
        } else {
          document.body.style.filter = "";
        }
      }
    });
  }

  const toggleGreyMode = () => {
    isGreyMode.value = !isGreyMode.value;
  };

  return { isGreyMode, toggleGreyMode };
}
