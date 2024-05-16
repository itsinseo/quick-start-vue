<script setup>
import { onMounted, ref, reactive, watch } from 'vue';

import { Loader } from '@googlemaps/js-api-loader'
import { MarkerClusterer } from '@googlemaps/markerclusterer'

const props = defineProps({
  markerList: {
    type: Array,
    required: true
  },
  mapCenter: {
    type: Object,
    required: true
  }
})

const emits = defineEmits(['updateIsGlobal']);

const switchToKakaoMap = () => {
  emits('updateIsGlobal', {
    isGlobal: false,
    lat: mapCenter.value.lat,
    lng: mapCenter.value.lng
  });
}

let map;

const sampleMarkerList = props.markerList;

const mapBounds = reactive({
  minLat: null,
  maxLat: null,
  minLng: null,
  maxLng: null
});
const mapCenter = ref({
  lat: null,
  lng: null,
  level: null
});
const mapSwitchZoom = 14;
const initialZoom = 2;

var markers = [];
var markerClusterer;
var infoWindow;

function formatMarkerInfo(coordinate) {
  return coordinate.name
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
      center: props.mapCenter,
      zoom: initialZoom,
      gestureHandling: "greedy",
      mapId: "GOOGLE_MAP",
      streetViewControl: false,
      mapTypeControl: false,
      scaleControl: true,
      minZoom: 2,
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

    renderMarkersAndClusterers(sampleMarkerList);

    map.addListener("bounds_changed", () => {
      const rawBounds = map.getBounds();
      mapBounds.latMin = rawBounds.Wh.lo;
      mapBounds.latMax = rawBounds.Wh.hi;
      mapBounds.lngMin = rawBounds.Gh.lo;
      mapBounds.lngMax = rawBounds.Gh.hi;
    })

    map.addListener("zoom_changed", () => {
      infoWindow.close();
      mapCenter.value.level = map.getZoom();
    })
  });
}

function renderMarkersAndClusterers(markerList) {
  infoWindow = new google.maps.InfoWindow({
    content: ""
  });
  markerList.map((coordinate, i) => {
    const pinGlyph = new google.maps.marker.PinElement({
      glyph: coordinate.name.substr(0, 2),
      glyphColor: "white",
      background: coordinate.disconnected === true ? "red" : "green"
    });
    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: coordinate,
      content: pinGlyph.element,
    });

    marker.addListener("click", () => {
      infoWindow.setOptions({
        pixelOffset: new google.maps.Size(0, 0)
      })
      infoWindow.setContent(formatMarkerInfo(coordinate))
      infoWindow.open(map, marker)
    })

    marker.title = coordinate.name;
    marker.data = coordinate;

    markers.push(marker);
  });

  markerClusterer = new MarkerClusterer({ markers, map });
  markerClusterer.onClusterClick = function (event, cluster, map) {
    var markerContentList = `
        <table>
          <tr>
            <th style="background-color: lightblue">업체명</th>
            <th style="background-color: lightblue">통신 상태</th>
          </tr>`;
    cluster.markers.map((marker) => {
      var markerConnection = marker.data.disconnected === true ? " 연결 끊김 " : "";
      markerContentList += `
          <tr>
            <td>${marker.title}</td>
            <td style="color: red">${markerConnection}</td>
          </tr>`;
    });
    markerContentList += `</table>`;

    infoWindow.close();
    infoWindow.setOptions({
      pixelOffset: new google.maps.Size(0, -10)
    })
    infoWindow.setContent(markerContentList);

    // infoWindow.open 전달용 가상 marker
    var clustererMarker = new google.maps.marker.AdvancedMarkerElement({
      position: cluster.position
    })

    infoWindow.open(map, clustererMarker);
  }

  markerClusterer.renderer.render = function (cluster, stats, map) {
    const count = cluster.count
    const position = cluster.position;

    var color = "#008000";
    var disconnectedCount = 0;

    cluster.markers.map((marker) => {
      if (marker.data.disconnected === true) {
        color = "#ff0000";
        disconnectedCount++;
      }
    })

    const svg = ` <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="50" height="50">
                      <circle cx="120" cy="120" opacity=".6" r="70" />
                      <circle cx="120" cy="120" opacity=".3" r="90" />
                      <circle cx="120" cy="120" opacity=".2" r="110" />
                      <text x="50%" y="50%" style="fill:#fff" text-anchor="middle" font-size="50" dominant-baseline="middle" font-family="roboto,arial,sans-serif">${count}</text>
                    </svg>`;
    const title = `${disconnectedCount}대 미수신`, zIndex = Number(google.maps.Marker.MAX_ZINDEX) + count;
    const parser = new DOMParser();
    const svgEl = parser.parseFromString(svg, "image/svg+xml").documentElement;
    svgEl.setAttribute("transform", "translate(0 25)");
    const clusterOptions = {
      map,
      position,
      zIndex,
      title,
      content: svgEl
    };
    return new google.maps.marker.AdvancedMarkerElement(clusterOptions);
  }
}

// switch to Kakao Map
watch([mapBounds, mapCenter], () => {
  if (mapBounds.latMin > 32 && mapBounds.latMax < 40 && mapBounds.lngMin > 120 && mapBounds.lngMax < 135 && mapCenter.value.level > mapSwitchZoom) {
    map.setZoom(mapSwitchZoom);
    const rawCenter = map.getCenter();
    mapCenter.value.lat = rawCenter.lat();
    mapCenter.value.lng = rawCenter.lng();
    switchToKakaoMap();
  }
})

// switch from Kakao Map
watch(props.mapCenter, () => {
  map.setZoom(mapSwitchZoom);
  map.setCenter(new google.maps.LatLng(props.mapCenter.lat, props.mapCenter.lng));
})

onMounted(() => {
  initMap();
});

// TODO: optimize & implement filter function using primevue
var filteredMarkerList;

function clearMap() {
  markerClusterer.clearMarkers();
  infoWindow.close();
}

function showConnected() {
  clearMap();

  markers.map((marker) => {
    if (!marker.data.disconnected) {
      markerClusterer.addMarker(marker);
    }
  })
}
function showDisconnected() {
  clearMap();

  markers.map((marker) => {
    if (marker.data.disconnected) {
      markerClusterer.addMarker(marker);
    }
  })
}
function showAll() {
  clearMap();

  markers.map((marker) => {
    markerClusterer.addMarker(marker);
  })
}

</script>

<template>
  <Button @click="showConnected" icon="pi pi-filter" label="Connected" class="button-test" />
  <Button @click="showDisconnected" icon="pi pi-filter" label="Disconnected" class="button-test" />
  <Button @click="showAll" icon="pi pi-filter-slash" class="button-test" />
  <div id="map">
  </div>
</template>

<style></style>