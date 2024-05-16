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

const updateIsGlobal = () => {
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
const mapSwitchLevel = 6;
const initialLevel = props.needGoogleMap === true ? mapSwitchLevel : 13;

const clusterStyles = [{
  width: '52px', height: '52px',
  background: 'url(/map-images/cluster-green.png) no-repeat',
  color: '#FFFFFF',
  textAlign: 'center',
  lineHeight: '52px'
}, {
  width: '52px', height: '52px',
  background: 'url(/map-images/cluster-blue.png) no-repeat',
  color: '#FFFFFF',
  textAlign: 'center',
  lineHeight: '52px'
}, {
  width: '52px', height: '52px',
  background: 'url(/map-images/cluster-dark-blue.png) no-repeat',
  color: '#FFFFFF',
  textAlign: 'center',
  lineHeight: '52px'
}];

let map = null;
const sampleMarkerList = props.markerList;

function initMap() {
  var container = document.getElementById('map');
  var options = {
    center: new kakao.maps.LatLng(props.mapCenter.lat, props.mapCenter.lng),
    level: initialLevel
  };

  // 지도 객체는 반응형 관리 대상이 아니므로 initMap에서 선언
  map = new kakao.maps.Map(container, options);

  var clusterer = new kakao.maps.MarkerClusterer({
    map: map,
    averageCenter: true,
    minLevel: mapSwitchLevel + 1,
    disableClickZoom: true
  });

  clusterer.setCalculator([5, 10]);
  clusterer.setStyles(clusterStyles);

  var imageSrcGreen = '/map-images/marker-green.png';
  var imageSrcRed = '/map-images/marker-red.png';
  var imageSize = new kakao.maps.Size(29, 42);

  // 마커 클러스터러로 관리할 마커 객체는 생성할 때 지도 객체를 설정하지 않음 - 클러스터러가 이미 지도에 매핑되어 있음
  sampleMarkerList.map((data) => {
    var imageSrc = imageSrcGreen;
    if (data.disconnected === true) {
      imageSrc = imageSrcRed;
    }

    var infoWindowContent = "";

    var marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(data.lat, data.lng),
      title: data.name,
      image: new kakao.maps.MarkerImage(
        imageSrc,
        imageSize
      )
    });
    marker.data = data;

    var infowindow = new kakao.maps.InfoWindow({
      content: `<div style="width: 150px; text-align: center; padding: 6px 0; font-size: 1rem">${data.name}<br>${infoWindowContent}</div>`
    });

    kakao.maps.event.addListener(marker, 'mouseover', makeOverListener(map, marker, infowindow));
    kakao.maps.event.addListener(marker, 'mouseout', makeOutListener(infowindow));

    clusterer.addMarker(marker);
  });

  setClustererOverlay(clusterer)

  var zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  kakao.maps.event.addListener(map, 'bounds_changed', () => {
    const rawBounds = map.getBounds();
    mapBounds.latMin = rawBounds.qa;
    mapBounds.latMax = rawBounds.pa;
    mapBounds.lngMin = rawBounds.ha;
    mapBounds.lngMax = rawBounds.oa;
  })

  kakao.maps.event.addListener(map, 'zoom_changed', () => {
    mapCenter.value.level = map.getLevel();
  })
}

// switch to Google Map
watch([mapBounds, mapCenter], () => {
  if (props.needGoogleMap && (mapBounds.latMin < 31 || mapBounds.latMax > 41 || mapBounds.lngMin < 119 || mapBounds.lngMax > 136 || mapCenter.value.level > mapSwitchLevel)) {
    map.setLevel(mapSwitchLevel);
    const rawCenter = map.getCenter();
    mapCenter.value.lat = rawCenter.getLat();
    mapCenter.value.lng = rawCenter.getLng();
    updateIsGlobal();
  }
})

// switch from Google Map
watch(props.mapCenter, () => {
  map.setLevel(mapSwitchLevel);
  map.setCenter(new kakao.maps.LatLng(props.mapCenter.lat, props.mapCenter.lng));
})

function makeOverListener(map, marker, infowindow) {
  return function () {
    infowindow.open(map, marker);
  };
}

function makeOutListener(infowindow) {
  return function () {
    infowindow.close();
  };
}

function setClustererOverlay(clusterer) {
  var customOverlay;
  kakao.maps.event.addListener(clusterer, 'clusterover', function (cluster) {
    customOverlay = new kakao.maps.CustomOverlay({
      position: cluster.getCenter(),
      xAnchor: 0.5,
      yAnchor: 1.1 + 1 / map.getLevel(),
    });

    var markerContentList = `<div style="background-color: white">
        <table>
          <tr>
            <th style="background-color: lightblue">업체명</th>
            <th style="background-color: lightblue">통신 상태</th>
          </tr>`;
    cluster.getMarkers().map((marker) => {
      var markerConnection = marker.data.disconnected === true ? " 연결 끊김 " : "";
      markerContentList += `
          <tr>
            <td>${marker.data.name}</td>
            <td style="color: red">${markerConnection}</td>
          </tr>`;
    });
    markerContentList += `</table></div>`;

    customOverlay.setContent(markerContentList);

    customOverlay.setMap(map);
  })

  kakao.maps.event.addListener(clusterer, 'clusterout', function (cluster) {
    customOverlay.setMap(null);
  })
}

onMounted(() => {
  initMap();
})

</script>

<template>
  <div id="map">
  </div>
</template>

<style></style>