<script setup>
import { ref, onMounted } from 'vue';

import { Loader } from '@googlemaps/js-api-loader'

import commRawData from '@/data/comm-raw-data.json'

const commDataList = commRawData;

const inputText = ref();

const apiThreshold = 20;
const dt = ref();
const geocodedDataList = ref([]);

const exportCSV = () => {
  dt.value.exportCSV();
};

function codeAddress(address, region) {
  return new Promise((resolve, reject) => {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function (results, status) {
      if (status == 'OK') {
        results[0].address_components.map((addr_component) => {
          if (addr_component.types[0] === 'country' && addr_component.long_name !== region) {
            reject(new Error(`COUNTRY_INFO_NOT_MATCHING - Given:${region}, Result:${addr_component.long_name}`))
          }
        })
        resolve(results);
      } else {
        geocoder.geocode({ 'address': region }, function (secondaryResults, secondaryStatus) {
          if (secondaryStatus == 'OK') {
            resolve(secondaryResults);
          } else {
            reject(new Error(secondaryStatus));
          }
        })
      }
    });
  });
}

function googleGeocoding() {
  try {
    var count = 0;

    commDataList.map((commData) => {
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
      }
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
        })
      if (count === apiThreshold) {
        throw count;
      }
    })
  } catch (e) {
    console.log("API call threshold: " + e)
  }
}

function initMap() {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GMAPS_KEY,
    version: "weekly"
  });

  loader.load().then(async () => {
    const { Map } = await google.maps.importLibrary("maps");
  });
}

function testGoogleGeocoding(address) {
  codeAddress(address, '대한민국')
    .then(coords => {
      // console.log(address + " -> " + coords[0].formatted_address + ": " + coords[0].geometry.location.toString());
      console.log(coords);
    })
    .catch(error => {
      console.log(address + ": " + error);
    })
}

onMounted(() => {
  initMap();
})

</script>

<template>
  <div class="wrapper-container">
    <InputText type="text" v-model="inputText" class="button-test" />
    <Button @click="testGoogleGeocoding(inputText)" label="Test Geocoding" icon="pi pi-wrench" class="button-test" />
  </div>
  <DataTable :value="geocodedDataList" ref="dt" removableSort paginator :rows="10"
    :rowsPerPageOptions="[5, 10, 20, 50]">
    <template #header>
      <div style="text-align: left">
        <Button @click="googleGeocoding" label="Geocoding" icon="pi pi-google" class="button-test" />
        <Button icon="pi pi-download" label="CSV" @click="exportCSV($event)" class="button-test" />
      </div>
    </template>
    <Column field="tid" header="터미널ID" sortable />
    <Column field="address" header="주소" />
    <Column field="region" header="국가" />
    <Column field="formattedAddress" header="변환된 주소" />
    <Column field="coordinate" header="좌표값" />
    <Column field="memo" header="비고" />
  </DataTable>
</template>

<style scoped>
.button-test {
  display: inline;
}
</style>