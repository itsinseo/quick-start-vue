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

// const clusterStyles = [{
//   width: '52px', height: '52px',
//   background: 'url(/map-images/cluster-green.png) no-repeat',
//   color: '#FFFFFF',
//   textAlign: 'center',
//   lineHeight: '52px'
// }, {
//   width: '52px', height: '52px',
//   background: 'url(/map-images/cluster-blue.png) no-repeat',
//   color: '#FFFFFF',
//   textAlign: 'center',
//   lineHeight: '52px'
// }, {
//   width: '52px', height: '52px',
//   background: 'url(/map-images/cluster-dark-blue.png) no-repeat',
//   color: '#FFFFFF',
//   textAlign: 'center',
//   lineHeight: '52px'
// }];

let map = null;
const propsMarkerList = props.markerList;
var markers = [];
var markerClusterer;
var infoWindow;
var customOverlay;

function initMap() {
  var container = document.getElementById('map');
  var options = {
    center: new kakao.maps.LatLng(props.mapCenter.lat, props.mapCenter.lng),
    level: initialLevel
  };

  // 지도 객체는 반응형 관리 대상이 아니므로 initMap에서 선언
  map = new kakao.maps.Map(container, options);

  var zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.BOTTOMRIGHT);

  // clusterer.setCalculator([5, 10]);
  // clusterer.setStyles(clusterStyles);

  renderMarkersAndClusters(propsMarkerList);

  kakao.maps.event.addListener(map, 'bounds_changed', () => {
    const rawBounds = map.getBounds();
    mapBounds.latMin = rawBounds.qa;
    mapBounds.latMax = rawBounds.pa;
    mapBounds.lngMin = rawBounds.ha;
    mapBounds.lngMax = rawBounds.oa;
  })

  kakao.maps.event.addListener(map, 'zoom_changed', () => {
    customOverlay.setMap(null);
    mapCenter.value.level = map.getLevel();
  })
}

function renderMarkersAndClusters(markerList) {
  infoWindow = new kakao.maps.InfoWindow({
    content: null,
    removable: true
  })

  customOverlay = new kakao.maps.CustomOverlay({
    position: null,
    xAnchor: 0.5,
    yAnchor: 1.1 + 1 / map.getLevel(),
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

    var marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(markerData.lat, markerData.lng),
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

  setClustererOverlay(markerClusterer)
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

// TODO: find way to close customOverlay
function setClustererOverlay(clusterer) {
  kakao.maps.event.addListener(clusterer, 'clusterclick', function (cluster) {
    customOverlay.setPosition(cluster.getCenter());

    var markerContentList = `<div style="background-color: white">
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
      markerContentList += `
          <tr>
            <td>${marker.data.customer}</td>
            <td style="color: ${color}">${marker.data.lastCommedAt}</td>
          </tr>`;
    });
    markerContentList += `</table></div>`;

    customOverlay.setContent(markerContentList);

    infoWindow.setMap(null);
    customOverlay.setMap(map);
  })
}

onMounted(() => {
  initMap();
})

function clearMap() {
  infoWindow.setMap(null);
  customOverlay.setMap(null);
  markerClusterer.clear();
}

function showConnected() {
  clearMap();

  markers.map((marker) => {
    if (marker.data.commState !== 'red') {
      markerClusterer.addMarker(marker);
    }
  })
}
function showDisconnected() {
  clearMap();

  markers.map((marker) => {
    if (marker.data.commState === 'red') {
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