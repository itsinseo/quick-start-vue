<script setup>
import { onMounted, ref, reactive, watch } from 'vue'

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
  },
  needGoogleMap: {
    type: Boolean,
    required: true
  }
})

const emits = defineEmits(['updateIsGlobal']);

const switchToGoogleMap = () => {
  emits('updateIsGlobal', {
    isGlobal: true,
    lat: mapCenter.value.lat,
    lng: mapCenter.value.lng
  });
}

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
const mapSwitchLevel = 5;
const initialLevel = props.needGoogleMap === true ? mapSwitchLevel : 13;

let map = null;
const propsMarkerList = props.markerList;
var markers = [];
var markerClusterer;
var infoWindow;
var customOverlay;

var initialLatMin = 90;
var initialLatMax = -90;
var initialLngMin = 180;
var initialLngMax = -180;

function initMap() {
  var container = document.getElementById('kakao-map');
  var options = {
    center: new kakao.maps.LatLng(props.mapCenter.lat, props.mapCenter.lng),
    level: initialLevel
  };

  // 지도 객체는 반응형 관리 대상이 아니므로 initMap에서 선언
  map = new kakao.maps.Map(container, options);

  var zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.BOTTOMRIGHT);

  renderMarkersAndClusters(propsMarkerList);

  kakao.maps.event.addListener(map, 'bounds_changed', () => {
    const rawBounds = map.getBounds();
    mapBounds.latMin = rawBounds.getNorthEast().getLat();
    mapBounds.latMax = rawBounds.getSouthWest().getLat();
    mapBounds.lngMin = rawBounds.getNorthEast().getLng();
    mapBounds.lngMax = rawBounds.getSouthWest().getLng();
  })

  kakao.maps.event.addListener(map, 'zoom_changed', () => {
    customOverlay.setMap(null);
    mapCenter.value.level = map.getLevel();
  })

  var initialSw = new kakao.maps.LatLng(initialLatMin, initialLngMin);
  var initialNe = new kakao.maps.LatLng(initialLatMax, initialLngMax);
  var initialBounds = new kakao.maps.LatLngBounds(initialSw, initialNe);
  if (!props.needGoogleMap) {
    map.setBounds(initialBounds);
  }
}

function renderMarkersAndClusters(markerList) {
  infoWindow = new kakao.maps.InfoWindow({
    content: null,
    removable: true
  })

  customOverlay = new kakao.maps.CustomOverlay({
    position: null,
    xAnchor: 0.5,
    yAnchor: 1.05
  });

  markerClusterer = new kakao.maps.MarkerClusterer({
    map: map,
    averageCenter: true,
    minLevel: 1,
    disableClickZoom: true
  });

  var imageSrcGreen = '/map-images/marker-green.png';
  var imageSrcYellow = '/map-images/marker-yellow.png';
  var imageSrcRed = '/map-images/marker-red.png';
  var imageSize = new kakao.maps.Size(29, 42);

  // 마커 클러스터러로 관리할 마커 객체는 생성할 때 지도 객체를 설정하지 않음 - 클러스터러가 이미 지도에 매핑되어 있음
  markerList.map((markerData) => {
    var imageSrc = imageSrcGreen;
    if (markerData.commState === 'yellow') {
      imageSrc = imageSrcYellow;
    } else if (markerData.commState === 'red') {
      imageSrc = imageSrcRed;
    }

    const markerLat = markerData.lat;
    const markerLng = markerData.lng;
    initialLatMin = Math.min(initialLatMin, markerLat);
    initialLatMax = Math.max(initialLatMax, markerLat);
    initialLngMin = Math.min(initialLngMin, markerLng);
    initialLngMax = Math.max(initialLngMax, markerLng);

    var marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(markerLat, markerLng),
      title: markerData.customer,
      image: new kakao.maps.MarkerImage(
        imageSrc,
        imageSize
      )
    });
    marker.data = markerData;

    kakao.maps.event.addListener(marker, 'click', () => {
      infoWindow.setContent(`<div style="width: 150px; text-align: center; padding: 6px 0; font-size: 1rem">${markerData.customer}<br>${markerData.lastCommedAt}</div>`);
      customOverlay.setMap(null);
      infoWindow.open(map, marker);
    });

    markerClusterer.addMarker(marker);

    markers.push(marker);
  });

  setClustererOverlay(markerClusterer);
}

// switch to Google Map
watch([mapBounds, mapCenter], () => {
  if (props.needGoogleMap && (mapBounds.latMin < 31 || mapBounds.latMax > 41 || mapBounds.lngMin < 119 || mapBounds.lngMax > 136 || mapCenter.value.level > mapSwitchLevel)) {
    map.setLevel(mapSwitchLevel);
    const rawCenter = map.getCenter();
    mapCenter.value.lat = rawCenter.getLat();
    mapCenter.value.lng = rawCenter.getLng();
    switchToGoogleMap();
  }
})

// switch from Google Map
watch(props.mapCenter, () => {
  map.setLevel(mapSwitchLevel);
  map.setCenter(new kakao.maps.LatLng(props.mapCenter.lat, props.mapCenter.lng));
})

function setClustererOverlay(clusterer) {
  kakao.maps.event.addListener(clusterer, 'clusterclick', function (cluster) {
    customOverlay.setPosition(cluster.getCenter());

    var markerContentList = `
    <div style="background: #fff; padding: 10px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      max-height:15rem; overflow:auto">
      <button onclick="this.parentElement.style.display='none'" style="position: relative; float:right; font-size: 0.6rem">X</button>
      <div style="background-color: white">
        <table>
          <tr>
            <th style="background-color: lightblue">업체명</th>
            <th style="background-color: lightblue">통신 기록</th>
          </tr>`;
    cluster.getMarkers().map((marker) => {
      var color = marker.data.commState;
      if (color === 'yellow') {
        color = 'gold'
      }
      var lastCommedAt = marker.data.lastCommedAt === null ? "통신 기록 없음" : marker.data.lastCommedAt;
      markerContentList += `
          <tr>
            <td>${marker.data.customer}</td>
            <td style="color: ${color}">${lastCommedAt}</td>
          </tr>`;
    });
    markerContentList += `</table></div></div>`;

    customOverlay.setContent(markerContentList);

    infoWindow.setMap(null);
    customOverlay.setMap(map);
  })

  var tempCustomOverlay = new kakao.maps.CustomOverlay({
    content: null,
    yAnchor: -1
  })
  kakao.maps.event.addListener(clusterer, 'clusterover', (cluster) => {
    var disconnectedCount = 0;
    cluster.getMarkers().map((marker) => {
      if (marker.data.commState === 'red') {
        disconnectedCount++;
      }
    })
    tempCustomOverlay.setContent(
      `<div style="background-color: white; padding: 10px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        ${disconnectedCount}대 미수신
      </div>`
    );
    tempCustomOverlay.setPosition(cluster.getCenter());
    tempCustomOverlay.setMap(map);
  })
  kakao.maps.event.addListener(clusterer, 'clusterout', (cluster) => {
    tempCustomOverlay.setMap(null);
  });
}

onMounted(() => {
  initMap();
})

const filterOptions = props.filterOptions;
watch(filterOptions, () => {
  filterByOptions();
})

function clearMap() {
  infoWindow.setMap(null);
  customOverlay.setMap(null);
  markerClusterer.clear();
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
  <div id="kakao-map" style="width: 90vw; height: 65vh;"></div>
</template>

<style></style>