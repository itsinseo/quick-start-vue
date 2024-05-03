<script setup>
import { onMounted } from 'vue';

import { Loader } from '@googlemaps/js-api-loader'
import { MarkerClusterer } from '@googlemaps/markerclusterer'

import markerList from '@/data/abroad-marker-list.json'

let map;
let zoomLevel = 7;
let centerPosition = { lat: 35.95, lng: 127.75 };
const sampleMarkerList = markerList.markerList;

function formatMarkerInfo(coordinate) {
  return coordinate.name
    + ' '
    + 'CTM0000NRC000'
}

function codeAddress(address) {
  return new Promise((resolve, reject) => {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function (results, status) {
      if (status == 'OK') {
        resolve(results);
      } else {
        reject(new Error(status));
      }
    });
  });
}

function testGoogleGeocoding() {
  codeAddress('서울시 강남구 도곡로 7길')
    .then(coords => {
      console.log(coords);
    })
    .catch(error => {
      alert("에러: " + error);
    });
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
      mapId: "DEMO_GLOBAL_MAP",
      streetViewControl: false,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        mapTypeIds: ["roadmap", "terrain"],
      },
      minZoom: 1,
      maxZoom: 15,
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
        position: coordinate,
        content: pinGlyph.element,
      });

      marker.addListener("click", () => {
        infoWindow.setContent(formatMarkerInfo(coordinate))
        infoWindow.open(map, marker)
      })

      return marker;
    });

    var mcOptions = {
      onClusterclick: (cluster) => {
        var markerContentList = cluster.markers.map((marker) => marker.title);

        const infoWindow = new google.maps.InfoWindow({
          content: markerContentList,
          disableAutoPan: true,
        });

        infoWindow.open(map)
      }
    };
    const markerClusterer = new MarkerClusterer({ markers, map, mcOptions });
  });
}

onMounted(() => {
  initMap();
});

</script>

<template>
  <Button label="Geocoding TEST" icon="pi pi-wrench" @click="testGoogleGeocoding" class="button-test"></Button>
  <div id="map">
    <p>
      google map div fallback message
    </p>
  </div>
</template>

<style></style>