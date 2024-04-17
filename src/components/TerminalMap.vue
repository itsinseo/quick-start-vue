<script setup>
import { onMounted } from 'vue';

import { Loader } from '@googlemaps/js-api-loader'
import { MarkerClusterer } from '@googlemaps/markerclusterer'

import markerList from '@/data/marker-list.json'

let map;
let zoomLevel = 7;
let centerPosition = { lat: 35.95, lng: 127.75 };
const sampleMarkerList = markerList;

function formatMarkerInfo(coordinate) {
  return coordinate.name
    + ' '
    + 'CTM0000NRC000'
}

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
      zoom: zoomLevel,
      gestureHandling: "greedy",
      mapId: "DEMO_ROK_MAP",
      streetViewControl: false,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        mapTypeIds: ["roadmap", "terrain"],
      },
      minZoom: 1,
      maxZoom: 12,
      restriction: {
        latLngBounds: {
          south: -60,
          north: 75,
          west: -180,
          east: 180,
        },
      },
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
        glyphColor: "white",
        background: coordinate.disconnected === true ? "red" : "green"
      });
      const marker = new AdvancedMarkerElement({
        // extracts 'lat' & 'lng' from provided object
        position: coordinate,
        content: pinGlyph.element,
      });

      marker.addListener("click", () => {
        infoWindow.setContent(formatMarkerInfo(coordinate))
        infoWindow.open(map, marker)
      })
      marker.title = coordinate.name;

      return marker;
    });

    const markerClusterer = new MarkerClusterer({ markers, map });
    // TODO: define markerClusterer's click function
    // markerClusterer.onClusterClick = () => {
    //   console.log("clusterer clicked")
    // }
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
  <div id="map"></div>

  <!-- TODO: remove dev purpose button -->
  <Button @click="getMapSize" style="margin-top: 10px;">Get Map Size</Button>
</template>

<style>
#map {
  width: 100%;
  height: 65vh;
}

@media (max-width: 960px) {
  #map {
    height: 75vh;
  }
}
</style>