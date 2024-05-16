<script setup>
import { ref } from 'vue';

import GoogleMap from '@/components/GoogleMap.vue'
import KakaoMap from '@/components/KakaoMap.vue'

import MarkerList from '@/data/abroad-marker-list.json'

const minLat = 33.11;
const maxLat = 38.61;
const minLng = 124.60;
const maxLng = 131.87;

const mapCenter = ref({
  lat: 35.86,
  lng: 128.23
});

const allMarkerList = ref(MarkerList.markerList);
const globalMarkerList = ref([]);
const domesticMarkerList = ref([]);
const lostMarkerList = ref([]);
allMarkerList.value.map((marker) => {
  if (marker.lat === null || marker.lng === null) {
    lostMarkerList.value.push(marker);
  } else {
    globalMarkerList.value.push(marker);
    if (marker.lat >= minLat && marker.lat <= maxLat && marker.lng >= minLng && marker.lng <= maxLng) {
      domesticMarkerList.value.push(marker);
    }
  }
})

const isGlobal = ref(globalMarkerList.value.length !== domesticMarkerList.value.length);

const needGoogleMap = isGlobal.value;

const updateIsGlobal = (newValue) => {
  if (needGoogleMap) {
    isGlobal.value = newValue.isGlobal;
    mapCenter.value.lat = newValue.lat;
    mapCenter.value.lng = newValue.lng;
  }
}

</script>

<template>
  <KeepAlive>
    <GoogleMap v-if="isGlobal" :markerList="globalMarkerList" :mapCenter="mapCenter" @updateIsGlobal="updateIsGlobal" />
  </KeepAlive>
  <KeepAlive>
    <KakaoMap v-if="!isGlobal" :markerList="domesticMarkerList" :mapCenter="mapCenter" :needGoogleMap="needGoogleMap"
      @updateIsGlobal="updateIsGlobal" />
  </KeepAlive>
</template>

<style></style>