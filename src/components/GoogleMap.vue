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
      console.log(coords[0].formatted_address + ": " + coords[0].geometry.location.toString());
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
      scaleControl: true,
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
    const markers = sampleMarkerList.map((coordinate, i) => {
      const pinGlyph = new google.maps.marker.PinElement({
        glyph: coordinate.name.substr(0, 2),
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

      marker.title = coordinate.name;
      marker.data = coordinate;

      return marker;
    });

    const markerClusterer = new MarkerClusterer({ markers, map });
    markerClusterer.onClusterClick = function (event, cluster, map) {
      var markerContentList = "";
      cluster.markers.map((marker) => {
        var markerConnection = marker.data.disconnected === true ? " 연결 끊김 " : "";
        markerContentList += marker.title + markerConnection + '<br>'
      });

      infoWindow.close();
      infoWindow.setContent(markerContentList);

      // infoWindow.open 전달용 가상 marker
      var clustererMarker = new AdvancedMarkerElement({
        position: cluster.position
      })

      infoWindow.open(map, clustererMarker);
    }
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