<script setup>
import { ref } from 'vue';

import GoogleMap from '@/components/GoogleMap.vue'
import KakaoMap from '@/components/KakaoMap.vue'
import NaverMap from '@/components/NaverMap.vue'

const isGlobal = ref(false);

</script>

<template>
  <div class="wrapper-container">
    <Button label="국내/해외 전환(TEST)" icon="pi pi-wrench" @click="isGlobal = !isGlobal" class="button-test" />
    <GoogleMap v-if="isGlobal" />
    <div v-else>
      <!-- <KakaoMap /> -->
      <NaverMap />
    </div>
  </div>
</template>

<style>
.button-test {
  margin: 0.5rem 0 0.5rem 0;
}
</style>