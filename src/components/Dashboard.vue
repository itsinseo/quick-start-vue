<script setup>
import { ref } from 'vue'

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import companyDeviceStatus from '@/data/company-device-status.json'

const cds = ref(companyDeviceStatus);
// const columns = ref([
//   { field: 'company_name', header: '업체명' },
//   { field: 'terminal_count', header: '터미널' },
//   { field: 'counter_count', header: '카운터' },
// ])

function makeChildrenData() {
  cds.value.map((data) => {
    data.children = [
      {
        terminalId: 'LTM0000NRL000',
        location: 'XX공장',
        lastReceived: '2024-04-19 16:43',
      },
      {
        terminalId: 'LTM0000NRL999',
        location: 'OO공장',
        lastReceived: '2024-04-19 16:51',
      }
    ]
  })
}

makeChildrenData();

// TODO: row-clicking expands row with children data(terminal disconnection details)
const rowClick = (rowData) => {
  console.log(rowData.index)
  rowData.data.children.map((child) => {
    console.log(child.terminalId + ' ' + child.location + ' ' + child.lastReceived)
  })
};

</script>

<template>
  <DataTable :value="cds" rowHover removableSort @row-click="rowClick">
    <Column field="company_name" header="고객사" sortable style="word-break: break-all;"></Column>
    <Column field="terminal_count" header="터미널">
      <template #body="{ data }">
        {{ data.terminal_count - data.terminal_disconnected }} / {{ data.terminal_count }}
        <b v-if="data.terminal_disconnected !== 0" style="color: red;">({{ data.terminal_disconnected }})</b>
      </template>
    </Column>
    <Column field="counter_count" header="카운터">
      <template #body="{ data }">
        {{ data.counter_count - data.counter_disconnected }} / {{ data.counter_count }}
        <b v-if="data.counter_disconnected !== 0" style="color: red;">({{ data.counter_disconnected }})</b>
      </template>
    </Column>
  </DataTable>

</template>

<style>
th {
  background-color: #f3fbfd;
  font-weight: bold;
}
</style>