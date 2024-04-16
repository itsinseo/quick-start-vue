<script setup>
import { onMounted } from 'vue';

import { Loader } from '@googlemaps/js-api-loader'
import { MarkerClusterer } from '@googlemaps/markerclusterer'

import markerList from '@/data/marker-list.json'

let map;
const centerPosition = { lat: 35.95, lng: 127.75 };
const sampleMarkerList = markerList.positions;

function initMap() {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GMAPS_KEY,
    version: "weekly"
  });

  loader.load().then(async () => {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("map"), {
      center: centerPosition,
      zoom: 7,
      mapId: "DEMO_ROK_MAP"
    });
    const infoWindow = new google.maps.InfoWindow({
      content: "",
      disableAutoPan: true,
    });
    const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const markers = sampleMarkerList.map((coordinate, i) => {
      const label = labels[i % labels.length];
      const pinGlyph = new google.maps.marker.PinElement({
        glyph: label,
        glyphColor: "white"
      });
      const marker = new AdvancedMarkerElement({
        position: coordinate,
        content: pinGlyph.element
      });

      marker.addListener("click", () => {
        infoWindow.setContent(coordinate.name)
        infoWindow.open(map, marker)
      })
      return marker;
    });

    new MarkerClusterer({ markers, map });
  });
}

onMounted(() => {
  initMap();
});

function getMapSize() {
  let div = document.getElementById('map');
  console.log("width: " + div.offsetWidth)
  console.log("height: " + div.offsetHeight)
}

</script>

<template>
  <h2>터미널 지도</h2>

  <div id="map"></div>
  <div id="map2"></div>

  <!-- TODO: remove dev purpose button -->
  <Button @click="getMapSize" style="margin-top: 10px;">Get Map Size</Button>
</template>

<style>
#map {
  width: 100%;
  height: 75vh;
}
</style>