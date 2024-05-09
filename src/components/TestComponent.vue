<script setup>
import { ref, onMounted } from 'vue';

import { Loader } from '@googlemaps/js-api-loader'

import commRawData from '@/data/comm-raw-data.json'

const commDataList = commRawData;

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

function testGoogleGeocoding() {
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

onMounted(() => {
  initMap();
})

</script>

<template>
  <DataTable :value="geocodedDataList" ref="dt">
    <template #header>
      <div style="text-align: left">
        <Button @click="testGoogleGeocoding" label="Test Geocoding" icon="pi pi-wrench" class="button-test" />
        <Button icon="pi pi-download" label="CSV" @click="exportCSV($event)" class="button-test" />
      </div>
    </template>
    <Column field="tid" header="터미널ID" exportHeader="Product Code" />
    <Column field="address" header="주소" />
    <Column field="region" header="국가" />
    <Column field="formattedAddress" header="변환된 주소" />
    <Column field="coordinate" header="좌표값" />
    <Column field="memo" header="비고" />
  </DataTable>
</template>

<style></style>