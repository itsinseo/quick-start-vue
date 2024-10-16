import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

export function useWindowSize() {
  const windowWidth = ref(window.innerWidth);

  const resizeWindowWidth = () => {
    windowWidth.value = window.innerWidth;
  };

  onMounted(() => {
    window.addEventListener('resize', resizeWindowWidth);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeWindowWidth);
  });

  return {
    windowWidth,
    isLargeWindow: computed(() => windowWidth.value > 960)
  };
}
