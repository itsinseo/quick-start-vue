<script setup>
import { ref, computed } from 'vue';

import dayjs from 'dayjs';

import GoogleMap from '@/components/GoogleMap.vue'
import KakaoMap from '@/components/KakaoMap.vue'

import commRawData from '@/data/merged-240517.json'

const minLat = 33.11;
const maxLat = 38.61;
const minLng = 124.60;
const maxLng = 131.87;

const mapCenter = ref({
  lat: 35.86,
  lng: 128.23
});

const today = computed(() => dayjs());

const allMarkerList = ref(commRawData);
const markerList = ref([]);
var domesticMarkerCount = 0;
const lostMarkerList = ref([]);
allMarkerList.value.map((markerData) => {
  // define commState
  if (markerData.lastCommedAt) {
    const tmp = today.value.diff(dayjs(markerData.lastCommedAt, 'YYYY-MM-DD HH:mm:ss.0'), 'h');
    markerData.commState = tmp < 6 ? 'green' : tmp < 24 ? 'yellow' : 'red';
  } else {
    markerData.commState = 'red';
  }
  // determine lost, global
  if (markerData.lat === null || markerData.lng === null) {
    lostMarkerList.value.push(markerData);
  } else {
    markerList.value.push(markerData);
    if (markerData.lat >= minLat && markerData.lat <= maxLat && markerData.lng >= minLng && markerData.lng <= maxLng) {
      domesticMarkerCount++;
    }
  }
})

const isGlobal = ref(markerList.value.length !== domesticMarkerCount);

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
  <div v-if="needGoogleMap">
    <p>우리나라 동 단위까지 줌인 시 카카오 지도로 전환됩니다.</p>
  </div>
  <KeepAlive>
    <GoogleMap v-if="isGlobal" :markerList="markerList" :mapCenter="mapCenter" @updateIsGlobal="updateIsGlobal" />
  </KeepAlive>
  <KeepAlive>
    <KakaoMap v-if="!isGlobal" :markerList="markerList" :mapCenter="mapCenter" :needGoogleMap="needGoogleMap"
      @updateIsGlobal="updateIsGlobal" />
  </KeepAlive>
</template>

<style></style>