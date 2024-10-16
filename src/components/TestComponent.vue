<script setup>
import { ref, computed, onMounted } from 'vue';

import dayjs from 'dayjs';
import { Loader } from '@googlemaps/js-api-loader';
import { useWindowSize } from '@/utils/useWindowSize.js';

import commRawData from '@/data/MOCK_DATA_240617.json';

const commDataList = commRawData;

const countryList = [
  '대한민국',
  '말레이시아',
  '멕시코',
  '미국',
  '베트남',
  '브라질',
  '이집트',
  '인도',
  '인도네시아',
  '중국',
  '폴란드'
];
const selectedCountry = ref('대한민국');
const inputText = ref();
const formattedAddress = ref();
const formattedCoordinate = ref();

const apiThreshold = 20;
const geocodedDataList = ref([]);

function codeAddress(address, region) {
  return new Promise((resolve, reject) => {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, function (results, status) {
      if (status == 'OK') {
        resolve(results);
      } else {
        geocoder.geocode(
          { address: region },
          function (secondaryResults, secondaryStatus) {
            if (secondaryStatus == 'OK') {
              resolve(secondaryResults);
            } else {
              reject(new Error(secondaryStatus));
            }
          }
        );
      }
    });
  });
}

function googleGeocoding() {
  try {
    var count = 0;

    commDataList.map(commData => {
      count++;
      const emplacement = commData.emplacement;
      const region = commData.region;
      const terminalId = commData.tid;
      const geocodedData = {
        tid: null,
        address: null,
        region: null,
        formattedAddress: null,
        coordinate: null,
        memo: null
      };
      codeAddress(emplacement, region)
        .then(coords => {
          geocodedData.formattedAddress = coords[0].formatted_address;
          geocodedData.coordinate = coords[0].geometry.location.toString();
        })
        .catch(error => {
          geocodedData.memo = error;
        })
        .finally(() => {
          geocodedData.tid = terminalId;
          geocodedData.address = emplacement;
          geocodedData.region = region;
          geocodedDataList.value.push(geocodedData);
        });
      if (count === apiThreshold) {
        throw count;
      }
    });
  } catch (e) {
    console.log('API call threshold: ' + e);
  }
}

function initMap() {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GMAPS_KEY,
    version: '3.55'
  });

  loader.load().then(async () => {
    const { Map } = await google.maps.importLibrary('maps');
  });
}

function testGoogleGeocoding(address) {
  codeAddress(address, selectedCountry.value)
    .then(coords => {
      formattedAddress.value = coords[0].formatted_address;
      formattedCoordinate.value = coords[0].geometry.location.toString();
    })
    .catch(error => {
      formattedAddress.value = address + ': ' + error;
      formattedCoordinate.value = null;
    });
}

onMounted(() => {
  initMap();
});

const today = computed(() => dayjs());

const dt = ref();
const geocodedDataArray = ref([]);
const columns = [
  // "state",
  'region',
  'tid',
  // "contactNo",
  // "tmVer",
  // "tmCreatedAt",
  'customer',
  // "manager",
  // "deliveredAt",
  // "emplacement",
  // "memo",
  // "company",
  'division',
  // "etc",
  // "label",
  // "lrCtn",
  // "lrUsim",
  // "lrImei",
  // "lrSp",
  // "lrRate",
  // "simIccid",
  // "simMsisdn",
  // "simImsi",
  // "simImei",
  // "simSp",
  // "simRate",
  // "atValue",
  // "recvData",
  'lastCommedAt',
  // "commState",
  'formattedAddr',
  'lat',
  'lng'
];

const defineCommState = () => {
  commDataList.map(d => {
    if (d.lastCommedAt) {
      const tmp = today.value.diff(
        dayjs(d.lastCommedAt, 'YYYY-MM-DD HH:mm:ss.0'),
        'h'
      );
      d.commState = tmp < 6 ? 'green' : tmp < 24 ? 'yellow' : 'red';
    } else {
      d.commState = 'red';
    }
  });
};

defineCommState();

function addGeocodingResults() {
  commDataList.map(commData => {
    var tempData = commData;
    if (!commData.hasOwnProperty('lat')) {
      tempData.formattedAddr = null;
      tempData.lat = null;
      tempData.lng = null;
      codeAddress(tempData.emplacement, tempData.region)
        .then(coords => {
          tempData.formattedAddr = coords[0].formatted_address;
          tempData.lat = coords[0].geometry.location.lat();
          tempData.lng = coords[0].geometry.location.lng();
        })
        .catch(error => {
          console.log(tempData.emplacement + ': ' + error);
        })
        .finally(() => {
          geocodedDataArray.value.push(tempData);
        });
    }
  });
}

const exportCSV2 = () => {
  dt.value.exportCSV();
};

const { windowWidth, isLargeWindow } = useWindowSize();
</script>

<template>
  <div>
    <div class="wrapper-container">
      <Dropdown
        v-model="selectedCountry"
        :options="countryList"
        placeholder="국가 선택"
        style="min-width: 10rem"
      />
      <InputText type="text" v-model="inputText" class="user-interaction" />
      <Button
        @click="testGoogleGeocoding(inputText)"
        label="Test Geocoding"
        icon="pi pi-wrench"
        class="user-interaction"
      />
      <div class="wrapper-container">
        <Textarea
          type="text"
          v-model="formattedAddress"
          autoResize
          rows="3"
          cols="20"
        />
        <Textarea
          type="text"
          v-model="formattedCoordinate"
          autoResize
          rows="3"
          cols="20"
        />
      </div>
    </div>
    <InputText
      type="text"
      v-model="today"
      class="user-interaction"
      style="width: 20rem"
    />
    <Button
      @click="addGeocodingResults"
      label="Geocode"
      icon="pi pi-google"
      disabled
      class="user-interaction"
    />
    <Button
      @click="exportCSV2"
      label="CSV"
      icon="pi pi-download"
      class="user-interaction"
    />
    <DataTable
      :value="geocodedDataArray"
      ref="dt"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
    >
      <template #empty> No data to geocode. </template>
      <Column v-for="col of columns" :field="col" :header="col" />
    </DataTable>
    <div>{{ windowWidth }} | {{ isLargeWindow }}</div>
  </div>
</template>

<style scoped>
.user-interaction {
  display: inline;
}
</style>
