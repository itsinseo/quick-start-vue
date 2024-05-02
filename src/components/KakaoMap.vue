<script setup>
import { onMounted } from 'vue'

import markerList from '@/data/domestic-marker-list.json'

let map = null;
const dataList = markerList.markerList;

onMounted(() => {
  initMap();
})

function initMap() {
  var container = document.getElementById('map');
  var options = {
    center: new kakao.maps.LatLng(35.95, 127.75),
    level: 13,
  };

  // 지도 객체는 반응형 관리 대상이 아니므로 initMap에서 선언
  map = new kakao.maps.Map(container, options);

  var clusterer = new kakao.maps.MarkerClusterer({
    map: map,
    averageCenter: true,
    minLevel: 6,
    disableClickZoom: true
  });

  var imageSrcGreen = '/marker-green.png';
  var imageSrcRed = '/marker-red.png';
  var imageSize = new kakao.maps.Size(29, 42);

  // 마커 클러스터러로 관리할 마커 객체는 생성할 때 지도 객체를 설정하지 않음 - 클러스터러가 이미 지도에 매핑되어 있음
  dataList.map((data) => {
    var imageSrc = imageSrcGreen;
    var lastCommunicationTime = new Date();
    if (data.disconnected === true) {
      imageSrc = imageSrcRed;
      lastCommunicationTime = new Date(70);
    }

    var infoWindowContent = formatDate(lastCommunicationTime);

    var marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(data.lat, data.lng),
      title: data.name,
      image: new kakao.maps.MarkerImage(
        imageSrc,
        imageSize
      )
    });

    var infowindow = new kakao.maps.InfoWindow({
      content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:1rem">${data.name}<br>${infoWindowContent}</div>`
    });

    kakao.maps.event.addListener(marker, 'mouseover', makeOverListener(map, marker, infowindow));
    kakao.maps.event.addListener(marker, 'mouseout', makeOutListener(infowindow));

    clusterer.addMarker(marker);
  });

  setClustererEvent(clusterer)

  var zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
}

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

function setClustererEvent(clusterer) {
  var infowindow = new kakao.maps.InfoWindow();

  kakao.maps.event.addListener(clusterer, 'clusterover', function (cluster) {
    var clusterMarkerNameList = cluster.getMarkers().map((marker) => '<br>' + marker.Gb);

    infowindow.setContent(
      `<div style="width:150px;text-align:left;padding:6px 0;font-size:0.8rem">업체 목록:${clusterMarkerNameList}</div>`
    )

    var position = cluster.getCenter();
    position.Ma += 0.1 * (2 ** (map.getLevel() - 12));
    infowindow.setPosition(position);
    return infowindow.open(map);
  })

  kakao.maps.event.addListener(clusterer, 'clusterout', () => {
    infowindow.close();
  })
}

function formatDate(date) {
  const formattedDate = date.toLocaleString('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  return formattedDate.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{1,2}):(\d{1,2})/, '$3-$1-$2 $4:$5:$6');
}

</script>

<template>
  <div id="map">
    <p>kakao map div fallback message</p>
  </div>
</template>

<style></style>