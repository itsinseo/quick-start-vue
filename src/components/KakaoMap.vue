<script setup>
import { onMounted, ref, watch } from 'vue';

import { MAP } from '@/config/index.js';

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
});
const propsMarkerList = props.markerList;
const filterOptions = props.filterOptions;

const emits = defineEmits(['updateIsGlobal']);
const switchToGoogleMap = () => {
  emits('updateIsGlobal', {
    isGlobal: true,
    lat: kakaoMapCenter.value.lat,
    lng: kakaoMapCenter.value.lng
  });
};

const mapBounds = ref({
  minLat: null,
  maxLat: null,
  minLng: null,
  maxLng: null
});
const kakaoMapCenter = ref({
  lat: null,
  lng: null,
  level: null
});

const mapSwitchLevel = ref(5);
const initialLevel = props.needGoogleMap ? mapSwitchLevel.value : 13;

// Kakao Map 전용, 최초 렌더링 범위 결정용
const initialLatMin = ref(90);
const initialLatMax = ref(-90);
const initialLngMin = ref(180);
const initialLngMax = ref(-180);

let map = null;
const markers = ref([]);
const markerClusterer = ref();
var infoWindow;
var customOverlay;

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
    mapBounds.value.latMin = rawBounds.getNorthEast().getLat();
    mapBounds.value.latMax = rawBounds.getSouthWest().getLat();
    mapBounds.value.lngMin = rawBounds.getNorthEast().getLng();
    mapBounds.value.lngMax = rawBounds.getSouthWest().getLng();
  });

  kakao.maps.event.addListener(map, 'zoom_changed', () => {
    infoWindow.setMap(null);
    customOverlay.setMap(null);
    kakaoMapCenter.value.level = map.getLevel();
  });

  var initialSw = new kakao.maps.LatLng(
    initialLatMin.value,
    initialLngMin.value
  );
  var initialNe = new kakao.maps.LatLng(
    initialLatMax.value,
    initialLngMax.value
  );
  var initialBounds = new kakao.maps.LatLngBounds(initialSw, initialNe);
  if (!props.needGoogleMap) {
    map.setBounds(initialBounds);
  }
}

function renderMarkersAndClusters(markerList) {
  infoWindow = new kakao.maps.InfoWindow({
    content: null,
    removable: true
  });

  customOverlay = new kakao.maps.CustomOverlay({
    position: null,
    xAnchor: 0.5,
    yAnchor: 1.05
  });

  markerClusterer.value = new kakao.maps.MarkerClusterer({
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
  markerList.map(markerData => {
    var imageSrc = imageSrcGreen;
    if (markerData.commState === 'yellow') {
      imageSrc = imageSrcYellow;
    } else if (markerData.commState === 'red') {
      imageSrc = imageSrcRed;
    }

    const markerLat = markerData.lat;
    const markerLng = markerData.lng;
    initialLatMin.value = Math.min(initialLatMin.value, markerLat);
    initialLatMax.value = Math.max(initialLatMax.value, markerLat);
    initialLngMin.value = Math.min(initialLngMin.value, markerLng);
    initialLngMax.value = Math.max(initialLngMax.value, markerLng);

    var marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(markerLat, markerLng),
      title: markerData.customer,
      image: new kakao.maps.MarkerImage(imageSrc, imageSize)
    });
    marker.data = markerData;

    kakao.maps.event.addListener(marker, 'click', () => {
      infoWindow.setContent(
        ` <div style="width: 150px; text-align: center; padding: 6px 0; font-size: 1rem">
            ${markerData.tid}<br>
            ${markerData.customer}<br>
            ${markerData.lastCommedAt}
          </div>`
      );
      customOverlay.setMap(null);
      infoWindow.open(map, marker);
    });

    markerClusterer.value.addMarker(marker);

    markers.value.push(marker);
  });

  setClustererOverlay(markerClusterer.value);
}

function setClustererOverlay(clusterer) {
  kakao.maps.event.addListener(clusterer, 'clusterclick', function (cluster) {
    customOverlay.setPosition(cluster.getCenter());

    var markerContentList = ` <div style="background: #fff; padding: 10px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                max-height:15rem; overflow:auto">
                                <button onclick="this.parentElement.style.display='none'" style="position: relative; float:right; font-size: 0.6rem">X</button>
                                <div style="background-color: white">
                                  <table>
                                    <tr>
                                      <th style="background-color: lightblue">No.</th>
                                      <th style="background-color: lightblue">터미널ID</th>
                                      <th style="background-color: lightblue">업체명</th>
                                      <th style="background-color: lightblue">통신 기록</th>
                                    </tr>`;
    var markerCount = 0;
    const clusterMarkers = cluster.getMarkers();
    clusterMarkers.map(marker => {
      var color = marker.data.commState;
      if (color === 'yellow') {
        color = 'gold';
      }
      markerContentList += `<tr>
                              <td>${clusterMarkers.length - markerCount}</td>
                              <td>${marker.data.tid}</td>
                              <td>${marker.data.customer}</td>
                              <td style="color: ${color}">${marker.data.lastCommedAt}</td>
                            </tr>`;
      markerCount++;
    });
    markerContentList += `</table></div></div>`;

    customOverlay.setContent(markerContentList);

    infoWindow.setMap(null);
    customOverlay.setMap(map);
  });

  var tempCustomOverlay = new kakao.maps.CustomOverlay({
    content: null,
    yAnchor: -1
  });
  kakao.maps.event.addListener(clusterer, 'clusterover', cluster => {
    var disconnectedCount = 0;
    cluster.getMarkers().map(marker => {
      if (marker.data.commState === 'red') {
        disconnectedCount++;
      }
    });
    tempCustomOverlay.setContent(`<div style="background-color: white; padding: 10px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                                    ${disconnectedCount}대 미수신
                                  </div>`);
    tempCustomOverlay.setPosition(cluster.getCenter());
    tempCustomOverlay.setMap(map);
  });
  kakao.maps.event.addListener(clusterer, 'clusterout', cluster => {
    tempCustomOverlay.setMap(null);
  });
}

// switch to Google Map
watch([mapBounds.value, kakaoMapCenter.value], () => {
  if (
    props.needGoogleMap &&
    (mapBounds.value.latMin < MAP.KOREA_LAT_MIN ||
      mapBounds.value.latMax > MAP.KOREA_LAT_MAX ||
      mapBounds.value.lngMin < MAP.KOREA_LNG_MIN ||
      mapBounds.value.lngMax > MAP.KOREA_LNG_MAX ||
      kakaoMapCenter.value.level > mapSwitchLevel.value)
  ) {
    map.setLevel(mapSwitchLevel.value);
    const rawCenter = map.getCenter();
    kakaoMapCenter.value.lat = rawCenter.getLat();
    kakaoMapCenter.value.lng = rawCenter.getLng();
    switchToGoogleMap();
  }
});

// switch from Google Map
watch(props.mapCenter, () => {
  map.setLevel(mapSwitchLevel.value);
  map.setCenter(
    new kakao.maps.LatLng(props.mapCenter.lat, props.mapCenter.lng)
  );
});

watch(filterOptions, () => {
  infoWindow.setMap(null);
  customOverlay.setMap(null);
  markerClusterer.value.clear();
  markers.value.map(marker => {
    if (
      (!filterOptions.selectedBizcode ||
        (marker.data.tid &&
          marker.data.tid.startsWith(filterOptions.selectedBizcode))) &&
      (!filterOptions.selectedCompany ||
        (marker.data.company &&
          marker.data.company === filterOptions.selectedCompany)) &&
      (!filterOptions.selectedRegion ||
        (marker.data.region &&
          marker.data.region === filterOptions.selectedRegion)) &&
      (!filterOptions.selectedStatus ||
        (marker.data.commState &&
          marker.data.commState === filterOptions.selectedStatus))
    ) {
      markerClusterer.value.addMarker(marker);
    }
  });
});

onMounted(() => {
  initMap();
});
</script>

<template>
  <div id="kakao-map"></div>
</template>

<style scoped>
#kakao-map {
  margin: 0.3rem;
  height: 100%;
}
</style>
