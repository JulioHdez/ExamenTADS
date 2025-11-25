import { ref, watch } from "vue";

const isGreyMode = ref(localStorage.getItem("grey-mode") === "true");

export function useGreyMode() {
  const toggleGreyMode = () => {
    isGreyMode.value = !isGreyMode.value;
  };

  // Cada vez que cambie, se guarda y se aplica al body
  watch(isGreyMode, (value) => {
    localStorage.setItem("grey-mode", value);
    if (value) {
      document.body.style.filter = "grayscale(100%)";
    } else {
      document.body.style.filter = "";
    }
  }, { immediate: true });

  return { isGreyMode, toggleGreyMode };
}
