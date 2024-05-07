<script setup>
import { ref } from 'vue';

import GoogleMap from '@/components/GoogleMap.vue'
import KakaoMap from '@/components/KakaoMap.vue'

import MarkerList from '@/data/domestic-marker-list.json'

const minLat = 33.11;
const maxLat = 38.61;
const minLng = 124.60;
const maxLng = 131.87;

const globalMarkerList = ref(MarkerList.markerList);
const domesticMarkerList = ref([]);
globalMarkerList.value.map((marker) => {
  if (marker.lat >= minLat && marker.lat <= maxLat && marker.lng >= minLng && marker.lng <= maxLng) {
    domesticMarkerList.value.push(marker);
  }
})

const isGlobal = ref(globalMarkerList.value.length !== domesticMarkerList.value.length);
console.log(isGlobal.value)

const needGoogleMap = isGlobal.value;

</script>

<template>
  <div class="wrapper-container">
    <Button v-if="needGoogleMap" label="국내/해외 전환(TEST)" icon="pi pi-wrench" @click="isGlobal = !isGlobal"
      class="button-test" />
    <GoogleMap :markerList="globalMarkerList" v-if="isGlobal" />
    <KakaoMap :markerList="domesticMarkerList" v-else />
  </div>
</template>

<style>
.button-test {
  margin: 0.5rem 0.5rem 0.5rem 0;
}
</style>