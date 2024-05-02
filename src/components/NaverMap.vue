<script setup>
import { onMounted } from 'vue'

import markerList from '@/data/domestic-marker-list.json'

const dataList = markerList.markerList;

onMounted(() => {
  initMap();
  // if (window.naver && window.naver.maps) {
  //   initMap();
  // } else {
  //   initScript();
  // }
})
// function initScript() {
//   const script = document.createElement("script");
//   script.src =
//     "https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=6gv9uc8ehp";
//   script.async = true;
//   script.defer = true;
//   document.head.appendChild(script);
// }

function initMap() {
  var container = document.getElementById('map');
  var mapOptions = {
    center: new naver.maps.LatLng(35.95, 127.75),
    zoomControl: true,
    zoomControlOptions: {
      position: naver.maps.Position.RIGHT_CENTER,
      style: naver.maps.ZoomControlStyle.LARGE
    },
    zoom: 7
  };

  var map = new naver.maps.Map(container, mapOptions);

  var markers = dataList.map((data) => {
    var markerOptions = {
      position: new naver.maps.LatLng(data.lat, data.lng),
      map: map,
      icon: {
        url: '/marker-green.png'
      },
      title: data.name
    };

    var connectionIconClass = "pi pi-check";
    if (data.disconnected) {
      markerOptions.icon.url = '/marker-red.png';
      connectionIconClass = "pi pi-times";
    }

    var marker = new naver.maps.Marker(markerOptions);
    var contentString = `
      <div class="iw_inner">
        <h3>${data.name}</h3>
        <i class="${connectionIconClass}"></i>
      </div>
      `;

    var infowindow = new naver.maps.InfoWindow({
      content: contentString
    });

    naver.maps.Event.addListener(marker, "click", function (e) {
      if (infowindow.getMap()) {
        infowindow.close();
      } else {
        infowindow.open(map, marker);
      }
    });

    return marker;
  })

  var htmlMarker1 = {
    content: '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:1rem;color:white;text-align:center;font-weight:bold;background:url(/cluster-green.png);background-size:contain;"></div>',
    size: N.Size(40, 40),
    anchor: N.Point(20, 20)
  },
    htmlMarker2 = {
      content: '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:1rem;color:white;text-align:center;font-weight:bold;background:url(/cluster-blue.png);background-size:contain;"></div>',
      size: N.Size(40, 40),
      anchor: N.Point(20, 20)
    },
    htmlMarker3 = {
      content: '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:1rem;color:white;text-align:center;font-weight:bold;background:url(/cluster-dark-blue.png);background-size:contain;"></div>',
      size: N.Size(40, 40),
      anchor: N.Point(20, 20)
    }

  var markerClustering = new MarkerClustering({
    minClusterSize: 2,
    maxZoom: 13,
    map: map,
    markers: markers,
    disableClickZoom: true,
    gridSize: 120,
    icons: [htmlMarker1, htmlMarker2, htmlMarker3],
    indexGenerator: [5, 10, 50],
    stylingFunction: function (clusterMarker, count) {
      $(clusterMarker.getElement()).find('div:first-child').text(count);
    }
  });

  // naver.maps.Event.addListener(map, 'zoom_changed', function () {
  //   markerClustering._clusters.map((cluster) => {

  //     var clusterMarkerList = [];
  //     cluster._clusterMember.map((marker) => {
  //       clusterMarkerList.push(marker.title);
  //     })

  //     naver.maps.Event.addListener(cluster, 'mouseover', () => {
  //       console.log(clusterMarkerList)
  //     })
  //   })
  // })
}

</script>

<template>
  <div id="map">
    <p>naver map div fallback message</p>
  </div>
</template>

<style></style>