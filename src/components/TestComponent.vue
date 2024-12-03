<script setup>
import { ref, computed, onMounted } from 'vue';

import * as XLSX from 'xlsx';
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
  '인도',
  '인도네시아',
  '중국'
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
      if (status === 'OK') {
        resolve(results);
      } else {
        geocoder.geocode(
          { address: region },
          function (secondaryResults, secondaryStatus) {
            if (secondaryStatus === 'OK') {
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
  'region',
  'tid',
  'customer',
  'division',
  'lastCommedAt',
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

// Excel Sheet
const header = ref([
  'IMSI',
  'ICCID',
  'SIM State',
  'Service Profile',
  'Last APN',
  'MSISDN',
  'IMEI'
]);

const sheetDataArray = ref();
const workbook = ref();
const parseXlsxFile = () => {
  // workbook.value.SheetNames.forEach(sheetname => {
  //   const ws = workbook.value.Sheets[sheetname];
  //   const data = XLSX.utils.sheet_to_json(ws, {
  //     header: header.value
  //   });
  //   sheetDataArray.value.push(data);
  // });
  const ws = workbook.value.Sheets['Data'];
  const data = XLSX.utils.sheet_to_json(ws);
  // sheetDataArray.value.push(data);
  sheetDataArray.value = data;
};

// File Upload
const onFileSelect = event => {
  const file = event.files[0];
  const reader = new FileReader();

  reader.onload = async e => {
    workbook.value = XLSX.read(e.target.result, { type: 'array' });
    parseXlsxFile();
  };

  reader.readAsArrayBuffer(file);
};

// Clipboard
const copySheetData = () => {
  const tempArray = [];
  sheetDataArray.value.forEach(row => {
    tempArray.push(Object.values(row) + '\n');
  });
  var data = [
    new ClipboardItem({
      'text/plain': Promise.resolve(new Blob(tempArray, { type: 'text/plain' }))
    })
  ];
  navigator.clipboard.write(data);
};
</script>

<template>
  <div>
    <div>
      <Select
        class="min-w-40"
        v-model="selectedCountry"
        :options="countryList"
        placeholder="국가 선택"
      />
      <InputText type="text" v-model="inputText" />
      <Button
        @click="testGoogleGeocoding(inputText)"
        label="Test Geocoding"
        icon="pi pi-wrench"
      />
      <div>
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
    <InputText class="w-80" type="text" v-model="today" />
    <Button
      @click="addGeocodingResults"
      label="Geocode"
      icon="pi pi-google"
      disabled
    />
    <Button @click="exportCSV2" label="CSV" icon="pi pi-download" />
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
    <Button
      class="bg-purple-500"
      icon="pi pi-check"
      disabled
      label="TailwindCSS"
    />
  </div>
  <FileUpload
    mode="basic"
    :multiple="false"
    :maxFileSize="1000000"
    accept=".xlsx, .xls"
    customUpload
    @select="onFileSelect"
  />
  <Button icon="pi pi-copy" @click="copySheetData" label="Copy" />
  <DataTable
    :value="sheetDataArray"
    removableSort
    paginator
    :rows="5"
    :rowsPerPageOptions="[5, 10, 20, 50]"
    scrollable
    scrollHeight="400px"
  >
    <template #empty>No data.</template>
    <Column
      v-for="col of header"
      :key="col"
      :field="col"
      :header="col"
      sortable
    />
  </DataTable>
</template>

<style scoped></style>
