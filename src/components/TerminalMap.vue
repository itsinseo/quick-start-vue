<script setup>
import { onMounted } from 'vue';

// Use the NPM js-api-loader package
// https://developers.google.com/maps/documentation/javascript/load-maps-js-api?_gl=1*f619ec*_up*MQ..*_ga*MTI1ODc3MjIwNC4xNzEzMTY3NTE2*_ga_NRWSTWS78N*MTcxMzE3MDQ3NS4yLjAuMTcxMzE3MDQ3NS4wLjAuMA..#js-api-loader
import { Loader } from "@googlemaps/js-api-loader"

let map;
function initMap() {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GMAPS_KEY,
    version: "weekly"
  });

  loader.load().then(async () => {
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8,
    });
  });
}

onMounted(() => {
  initMap();
});

function getMapSize() {
  let div = document.getElementById('map');
  console.log(div.offsetWidth)
  console.log(div.offsetHeight)
}

</script>

<template>
  <h2>터미널 지도</h2>

  <div id="map"></div>
  <div id="map2"></div>

  <!-- TODO: remove dev purpose button -->
  <Button @click="getMapSize" style="margin: 2px;">Get Map Size</Button>
</template>

<style>
#map {
  width: 100%;
  height: 75vh;
}
</style>