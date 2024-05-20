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

    renderMarkersAndClusterers(propsMarkerList);

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
    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: new google.maps.LatLng(markerData.lat, markerData.lng),
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

const selectedBizcode = ref();
const selectedRegion = ref();
const selectedCompany = ref();
const selectedStatus = ref();

const TM_BIZCODE = [
  {
    label: '3세대',
    items: [
      { label: 'LTM - LG전자', code: 'LTM', svc: 'NRL', sn: '001', corp: 'LG' },
      { label: 'TSC - 삼성전자', code: 'TSC', svc: '9', sn: '00001', corp: 'SAMSUNG' },
      { label: 'CTM - 중소기업', code: 'CTM', svc: 'NRC', sn: '001', corp: null },
      { label: 'BTM - 해외', code: 'BTM', svc: 'NRE', sn: '001', corp: null },
      { label: 'ATM - 아모레', code: 'ATM', svc: 'NRA', sn: '001', corp: null },
    ]
  },
  {
    label: '1, 2세대',
    items: [
      { label: 'LTM - LG전자 2G', code: 'LTM', svc: 'KRL', sn: '001', corp: 'LG' },
      { label: 'CTM - 중소기업 2G', code: 'CTM', svc: 'KRC', sn: '001', corp: null },
      { label: 'BTM - 해외 2G', code: 'BTM', svc: 'KRE', sn: '001', corp: null },
      { label: 'ATM - 아모레 2G', code: 'ATM', svc: 'KRA', sn: '001', corp: null },
      { label: 'TAP - 아모레 1G', code: 'TAP', svc: '000', sn: '001', corp: null },
      { label: 'TSC - 삼성전자 1G', code: 'TSC', svc: '0', sn: '00001', corp: 'SAMSUNG' },
    ]
  }
]
const TM_COUNTRY = [
  { name: '대한민국', code: '대한민국' },
  { name: '폴란드', code: '폴란드' },
  { name: '베트남', code: '베트남' },
  { name: '중국', code: '중국' },
  { name: '미국', code: '미국' },
  { name: '인도', code: '인도' },
  { name: '태국', code: '태국' },
  { name: '멕시코', code: '멕시코' },
  { name: '인도네시아', code: '인도네시아' },
  { name: '말레이시아', code: '말레이시아' },
  { name: '브라질', code: '브라질' },
  { name: '이집트', code: '이집트' },
]
const TM_COMPANY = [
  {
    name: 'LG',
    code: 'LG',
    divisions: ['H&A사업부', 'HE사업부', 'VS사업부', 'LG마그나'],
  },
  {
    name: 'SAMSUNG',
    code: 'SAMSUNG',
    divisions: ['생활가전사업부', '무선사업부'],
  },
]
const TM_STATUS = [
  {
    name: '정상',
    code: 'green'
  },
  {
    name: '수신 지연',
    code: 'yellow'
  },
  {
    name: '미수신',
    code: 'red'
  },
]

watch([selectedBizcode, selectedCompany, selectedRegion, selectedStatus], () => {
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
      (!selectedBizcode.value || (marker.data.tid && marker.data.tid.startsWith(selectedBizcode.value)))
      &&
      (!selectedCompany.value || (marker.data.company && marker.data.company === selectedCompany.value))
      &&
      (!selectedRegion.value || (marker.data.region && marker.data.region === selectedRegion.value))
      &&
      (!selectedStatus.value || (marker.data.commState && marker.data.commState === selectedStatus.value))
    ) {
      markerClusterer.addMarker(marker);
    }
  })
}

function clearFilter() {
  clearMap();
  selectedBizcode.value = null;
  selectedCompany.value = null;
  selectedRegion.value = null;
  selectedStatus.value = null;

  markers.map((marker) => {
    markerClusterer.addMarker(marker);
  })
}

</script>

<template>
  <Dropdown v-model="selectedBizcode" :options="TM_BIZCODE" optionLabel="label" optionValue="code"
    optionGroupLabel="label" optionGroupChildren="items" showClear placeholder="터미널 코드">
    <template #optiongroup="slotProps">
      <div>{{ slotProps.option.label }}</div>
    </template>
  </Dropdown>
  <Dropdown v-model="selectedCompany" :options="TM_COMPANY" optionLabel="name" optionValue="code" showClear
    placeholder="고객사" />
  <Dropdown v-model="selectedRegion" :options="TM_COUNTRY" optionLabel="name" optionValue="code" showClear
    placeholder="국가" />
  <Dropdown v-model="selectedStatus" :options="TM_STATUS" optionLabel="name" optionValue="code" showClear
    placeholder="통신 상태" />
  <Button @click="clearFilter" icon="pi pi-filter-slash" />
  <div id="map">
  </div>
</template>

<style></style>