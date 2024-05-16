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

const updateIsGlobal = () => {
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
const mapSwitchZoom = 13;
const initialZoom = 2;

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
    const infoWindow = new google.maps.InfoWindow({
      content: ""
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
        infoWindow.setOptions({
          pixelOffset: new google.maps.Size(0, 0)
        })
        infoWindow.setContent(formatMarkerInfo(coordinate))
        infoWindow.open(map, marker)
      })

      marker.title = coordinate.name;
      marker.data = coordinate;

      return marker;
    });

    const markerClusterer = new MarkerClusterer({ markers, map });
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
      var clustererMarker = new AdvancedMarkerElement({
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
      const clusterOptions2 = {
        map,
        position,
        zIndex,
        title,
        content: svgEl
      };
      return new google.maps.marker.AdvancedMarkerElement(clusterOptions2);
    }

    map.addListener("bounds_changed", () => {
      const rawBounds = map.getBounds();
      mapBounds.latMin = rawBounds.Wh.lo;
      mapBounds.latMax = rawBounds.Wh.hi;
      mapBounds.lngMin = rawBounds.Gh.lo;
      mapBounds.lngMax = rawBounds.Gh.hi;
    })

    map.addListener("zoom_changed", () => {
      mapCenter.value.level = map.getZoom();
    })
  });
}

// switch to Kakao Map
watch([mapBounds, mapCenter], () => {
  if (mapBounds.latMin > 32 && mapBounds.latMax < 40 && mapBounds.lngMin > 120 && mapBounds.lngMax < 135 && mapCenter.value.level > mapSwitchZoom) {
    map.setZoom(mapSwitchZoom);
    const rawCenter = map.getCenter();
    mapCenter.value.lat = rawCenter.lat();
    mapCenter.value.lng = rawCenter.lng();
    updateIsGlobal();
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

</script>

<template>
  <div id="map">
  </div>
</template>

<style></style>