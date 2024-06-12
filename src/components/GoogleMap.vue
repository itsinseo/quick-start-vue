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
  },
  filterOptions: {
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

const propsMarkerList = props.markerList;

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

var initialLatMin = 90;
var initialLatMax = -90;
var initialLngMin = 180;
var initialLngMax = -180;

function initMap() {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GMAPS_KEY,
    version: "3.55"
  });

  loader.load().then(async () => {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("google-map"), {
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

    renderMarkersAndClusterers(propsMarkerList);

    map.addListener("bounds_changed", () => {
      const rawBounds = map.getBounds().toJSON();
      mapBounds.latMin = rawBounds.north;
      mapBounds.latMax = rawBounds.south;
      mapBounds.lngMin = rawBounds.west;
      mapBounds.lngMax = rawBounds.east;
    })

    map.addListener("zoom_changed", () => {
      infoWindow.close();
      mapCenter.value.level = map.getZoom();
    })

    map.fitBounds({
      south: initialLatMin,
      north: initialLatMax,
      west: initialLngMin,
      east: initialLngMax,
    },)
  });
}

function renderMarkersAndClusterers(markerList) {
  infoWindow = new google.maps.InfoWindow({
    content: ""
  });
  markerList.map((markerData, i) => {
    var formattedCustomer;
    if (!markerData.customer) {
      formattedCustomer = "없음";
    } else if (markerData.customer.substr(0, 3) === '(주)') {
      formattedCustomer = markerData.customer.substr(3, 2);
    } else {
      formattedCustomer = markerData.customer.substr(0, 2);
    }

    const pinGlyph = new google.maps.marker.PinElement({
      glyph: formattedCustomer,
      glyphColor: 'white',
      borderColor: 'gray',
      background: markerData.commState === 'yellow' ? 'orange' : markerData.commState,
      scale: 1.1
    });

    const markerLat = markerData.lat;
    const markerLng = markerData.lng;
    initialLatMin = Math.min(initialLatMin, markerLat);
    initialLatMax = Math.max(initialLatMax, markerLat);
    initialLngMin = Math.min(initialLngMin, markerLng);
    initialLngMax = Math.max(initialLngMax, markerLng);
    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: new google.maps.LatLng(markerLat, markerLng),
      content: pinGlyph.element,
    });

    marker.addListener("click", () => {
      infoWindow.setOptions({
        pixelOffset: new google.maps.Size(0, 0)
      })
      infoWindow.setContent(` ${marker.data.customer}<br>
                              ${marker.data.lastCommedAt}  `)
      infoWindow.open(map, marker)
    })

    marker.title = markerData.customer ? markerData.customer : "업체명 없음";
    marker.data = markerData;

    markers.push(marker);
  });

  markerClusterer = new MarkerClusterer({ markers, map });
  markerClusterer.onClusterClick = function (event, cluster, map) {
    var markerContentList = `
      <div style="max-height:15rem; overflow:auto">
        <table>
          <tr>
            <th style="background-color: lightblue">업체명</th>
            <th style="background-color: lightblue">통신 기록</th>
          </tr>`;
    cluster.markers.map((marker) => {
      var color = marker.data.commState;
      if (color === 'yellow') {
        color = 'gold'
      }
      markerContentList += `
          <tr>
            <td>${marker.title}</td>
            <td style="color: ${color}">${marker.data.lastCommedAt}</td>
          </tr>`;
    });
    markerContentList += `</table></div>`;

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
      if (marker.data.commState === 'red') {
        color = '#ff0000';
        disconnectedCount++;
      }
    })

    const svg = `   <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="50" height="50">
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

const filterOptions = props.filterOptions;
watch(filterOptions, () => {
  filterByOptions();
})

function clearMap() {
  markerClusterer.clearMarkers();
  infoWindow.close();
}

function filterByOptions() {
  clearMap();
  markers.map((marker) => {
    if (
      (!filterOptions.selectedBizcode || (marker.data.tid && marker.data.tid.startsWith(filterOptions.selectedBizcode)))
      &&
      (!filterOptions.selectedCompany || (marker.data.company && marker.data.company === filterOptions.selectedCompany))
      &&
      (!filterOptions.selectedRegion || (marker.data.region && marker.data.region === filterOptions.selectedRegion))
      &&
      (!filterOptions.selectedStatus || (marker.data.commState && marker.data.commState === filterOptions.selectedStatus))
    ) {
      markerClusterer.addMarker(marker);
    }
  })
}
</script>

<template>
  <div id="google-map" style="width:80vw; height: 65vh;"></div>
</template>

<style></style>
