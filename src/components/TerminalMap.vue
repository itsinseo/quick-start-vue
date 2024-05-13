<script setup>
import { ref } from 'vue';

import GoogleMap from '@/components/GoogleMap.vue'
import KakaoMap from '@/components/KakaoMap.vue'

import MarkerList from '@/data/abroad-marker-list.json'

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

const needGoogleMap = isGlobal.value;

const updateIsGlobal = (newValue) => {
  isGlobal.value = newValue;
}

</script>

<template>
  <div class="wrapper-container" v-if="needGoogleMap">
    <Button v-if="isGlobal" label="국내 지도" icon="pi pi-map" @click="isGlobal = !isGlobal" class="button-test" />
    <Button v-else label="전세계 지도" icon="pi pi-globe" @click="isGlobal = !isGlobal" class="button-test" />
  </div>
  <GoogleMap :markerList="globalMarkerList" v-if="isGlobal" @update:isGlobal="updateIsGlobal" />
  <KakaoMap :markerList="domesticMarkerList" v-else @update:isGlobal="updateIsGlobal" />
</template>

<style></style>