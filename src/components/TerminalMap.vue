<script setup>
import { ref } from 'vue';

import GoogleMap from '@/components/GoogleMap.vue'
import KakaoMap from '@/components/KakaoMap.vue'

import MarkerList from '@/data/abroad-marker-list.json'

const minLat = 33.11;
const maxLat = 38.61;
const minLng = 124.60;
const maxLng = 131.87;

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
    isGlobal.value = newValue;
  }
}

</script>

<template>
  <div class="wrapper-container" v-if="needGoogleMap">
    <Button v-if="isGlobal" label="국내 지도" icon="pi pi-map" @click="isGlobal = !isGlobal" class="button-test" />
    <Button v-else label="전세계 지도" icon="pi pi-globe" @click="isGlobal = !isGlobal" class="button-test" />
  </div>
  <KeepAlive>
    <GoogleMap :markerList="globalMarkerList" v-if="isGlobal" @update:isGlobal="updateIsGlobal" />
  </KeepAlive>
  <KeepAlive>
    <KakaoMap :markerList="domesticMarkerList" v-if="!isGlobal" @update:isGlobal="updateIsGlobal" />
  </KeepAlive>
  <DataTable :value="lostMarkerList">
    <Column field="name" header="업체명" />
    <Column field="disconnected" header="통신 상태" />
  </DataTable>
</template>

<style></style>