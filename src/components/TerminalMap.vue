<script setup>
import { ref, computed } from 'vue';

import { MAP } from '@/config/index.js';

import dayjs from 'dayjs';

import GoogleMap from '@/components/GoogleMap.vue';
import KakaoMap from '@/components/KakaoMap.vue';

import commRawData from '@/data/MOCK_DATA_240617.json';
// const props = defineProps({
//   tableMapCenter: {
//     type: Object,
//     required: false,
//   },
// });
// const tableMapCenter = props.tableMapCenter;

const googleMapCenter = ref({
  lat: (MAP.KOREA_LAT_MIN + MAP.KOREA_LAT_MAX) / 2,
  lng: (MAP.KOREA_LNG_MIN + MAP.KOREA_LNG_MAX) / 2
});
const kakaoMapCenter = ref({
  lat: (MAP.KOREA_LAT_MIN + MAP.KOREA_LAT_MAX) / 2,
  lng: (MAP.KOREA_LNG_MIN + MAP.KOREA_LNG_MAX) / 2
});

const today = computed(() => dayjs());

const allMarkerList = ref(commRawData);
const globalMarkerList = ref([]);
const domesticMarkerList = ref([]);
const lostMarkerList = ref([]);
allMarkerList.value.map(markerData => {
  // replaceMarkerNullData
  if (!markerData.customer) {
    markerData.customer = '업체명 없음';
  }
  if (!markerData.lastCommedAt) {
    markerData.lastCommedAt = '통신 기록 없음';
  }
  // define commState
  if (markerData.lastCommedAt) {
    const tmp = today.value.diff(
      dayjs(markerData.lastCommedAt, 'YYYY-MM-DD HH:mm:ss.0'),
      'h'
    );
    markerData.commState = tmp < 6 ? 'green' : tmp < 24 ? 'yellow' : 'red';
  } else {
    markerData.commState = 'red';
  }
  // determine lost, global
  if (markerData.lat === null || markerData.lng === null) {
    lostMarkerList.value.push(markerData);
  } else {
    globalMarkerList.value.push(markerData);
    if (
      markerData.lat >= MAP.KOREA_LAT_MIN &&
      markerData.lat <= MAP.KOREA_LAT_MAX &&
      markerData.lng >= MAP.KOREA_LNG_MIN &&
      markerData.lng <= MAP.KOREA_LNG_MAX
    ) {
      domesticMarkerList.value.push(markerData);
    }
  }
});

const isGlobal = ref(
  globalMarkerList.value.length > domesticMarkerList.value.length ||
    domesticMarkerList.value.length === 0
);
const needGoogleMap = isGlobal.value;

const updateGoogleMapCenter = newValue => {
  isGlobal.value = true;
  googleMapCenter.value.lat = 0; // 마커 위치로 이동하는 watcher 강제 발생용
  googleMapCenter.value.lat = newValue.lat;
  googleMapCenter.value.lng = newValue.lng;
};
const updateKakaoMapCenter = newValue => {
  isGlobal.value = false;
  kakaoMapCenter.value.lat = 0; // 마커 위치로 이동하는 watcher 강제 발생용
  kakaoMapCenter.value.lat = newValue.lat;
  kakaoMapCenter.value.lng = newValue.lng;
};

// start of filter code
const filterOptions = ref({
  selectedBizcode: null,
  selectedRegion: null,
  selectedCompany: null,
  selectedStatus: null
});
const TM_BIZCODE = [];
const TM_COUNTRY = [
  { name: '대한민국', code: '대한민국' },
  { name: '베트남', code: '베트남' },
  { name: '중국', code: '중국' },
  { name: '미국', code: '미국' },
  { name: '인도', code: '인도' },
  { name: '멕시코', code: '멕시코' },
  { name: '인도네시아', code: '인도네시아' },
  { name: '말레이시아', code: '말레이시아' },
  { name: '브라질', code: '브라질' }
];
const TM_COMPANY = [];
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
  }
];
function clearFilter() {
  filterOptions.value.selectedBizcode = null;
  filterOptions.value.selectedCompany = null;
  filterOptions.value.selectedRegion = null;
  filterOptions.value.selectedStatus = null;
}
// end of filter code

// watch(tableMapCenter, () => {
//   if (isGlobal.value) {
//     updateGoogleMapCenter(tableMapCenter);
//   } else {
//     updateKakaoMapCenter(tableMapCenter);
//   }
// });
</script>

<template>
  <div v-if="needGoogleMap">
    <p>우리나라 동 단위까지 줌인 시 카카오 지도로 전환됩니다.</p>
  </div>
  <div class="grid grid-cols-12">
    <div class="col-span-6 lg:col-span-2">
      <Select
        class="w-full"
        v-model="filterOptions.selectedBizcode"
        :options="TM_BIZCODE"
        optionLabel="label"
        optionValue="code"
        optionGroupLabel="label"
        optionGroupChildren="items"
        showClear
        placeholder="터미널 코드"
        :disabled="true"
      >
        <template #optiongroup="slotProps">
          <div>{{ slotProps.option.label }}</div>
        </template>
      </Select>
    </div>
    <div class="col-span-6 lg:col-span-2">
      <Select
        class="w-full"
        v-model="filterOptions.selectedCompany"
        :options="TM_COMPANY"
        optionLabel="name"
        optionValue="code"
        showClear
        placeholder="고객사"
        :disabled="true"
      />
    </div>
    <div class="col-span-6 lg:col-span-2">
      <Select
        class="w-full"
        v-model="filterOptions.selectedRegion"
        :options="TM_COUNTRY"
        optionLabel="name"
        optionValue="code"
        showClear
        placeholder="국가 - 검색으로 전환 중"
        :disabled="true"
      />
    </div>
    <div class="col-span-6 lg:col-span-2">
      <Select
        class="w-full"
        v-model="filterOptions.selectedStatus"
        :options="TM_STATUS"
        optionLabel="name"
        optionValue="code"
        showClear
        placeholder="통신 상태"
      />
    </div>
    <div class="col-span-6 lg:col-span-2">
      <Button class="w-full" @click="clearFilter" icon="pi pi-filter-slash" />
    </div>
  </div>
  <div style="width: 90vw; height: 65vh">
    <KeepAlive>
      <GoogleMap
        v-if="isGlobal"
        :markerList="globalMarkerList"
        :mapCenter="googleMapCenter"
        :filterOptions="filterOptions"
        @updateIsGlobal="updateKakaoMapCenter"
      />
    </KeepAlive>
    <KeepAlive>
      <KakaoMap
        v-if="!isGlobal"
        :markerList="domesticMarkerList"
        :mapCenter="kakaoMapCenter"
        :filterOptions="filterOptions"
        :needGoogleMap="needGoogleMap"
        @updateIsGlobal="updateGoogleMapCenter"
      />
    </KeepAlive>
  </div>
</template>

<style scoped></style>
