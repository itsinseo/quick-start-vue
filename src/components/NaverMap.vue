<script setup>
import { onMounted } from 'vue'

import markerList from '@/data/domestic-marker-list.json'

const dataList = markerList.markerList;

onMounted(() => {
  initMap();
})
const initMap = () => {
  var container = document.getElementById('map');
  var mapOptions = {
    center: new naver.maps.LatLng(35.95, 127.75),
    zoomControl: true,
    zoomControlOptions: {
      position: naver.maps.Position.RIGHT_CENTER,
      style: naver.maps.ZoomControlStyle.LARGE
    },
    zoom: 7
  };

  var map = new naver.maps.Map(container, mapOptions);

  dataList.map((data) => {
    var markerOptions = {
      position: new naver.maps.LatLng(data.lat, data.lng),
      map: map,
      icon: {
        url: '/marker-green.png'
      }
    };

    if (data.disconnected) {
      markerOptions.icon.url = '/marker-gray.png'
    }

    var marker = new naver.maps.Marker(markerOptions);
  })
}

</script>

<template>
  <div id="map">
    <p>naver map div fallback message</p>
  </div>
</template>

<style>
a {
  padding: 0;
}
</style>