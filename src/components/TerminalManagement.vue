<script setup>
import terminalManagement from '@/data/terminal-management.json'
import { ref } from "vue"
import { FilterMatchMode } from 'primevue/api'

import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

const dataList = terminalManagement
const filters = ref()
const rowsPerPageOptions = [
  1, 5, 10, 20
]
const globalFilterFields = [
  'terminal_id',
  'customer',
  'location',
  'registered_date',
  'modified_date',
  'sim'
]
const terminalHeaderList = [
  { name: "TSC", description: "삼성전자" },
  { name: "LTM", description: "LG" },
  { name: "CTM", description: "중소기업" },
  { name: "BTM", description: "해외" },
  { name: "ATM", description: "아모레" },
  { name: "MTL", description: "임시" }
]
const locationList = [
  { name: "대한민국" },
  { name: "멕시코" },
  { name: "미국" },
  { name: "인도" },
  { name: "인도네시아" },
  { name: "일본" }
]
const initFilter = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    terminal_id: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    customer: { value: null, matchMode: FilterMatchMode.CONTAINS },
    location: { value: null, matchMode: FilterMatchMode.IN },
    registered_date: { value: null, matchMode: FilterMatchMode.CONTAINS },
    modified_date: { value: null, matchMode: FilterMatchMode.CONTAINS },
    sim: { value: null, matchMode: FilterMatchMode.CONTAINS }
  }
}
const formatDate = (date) => date.split(' ')[0]
const formatCustomer = (customer) => {
  if (customer.length > 20) {
    customer = customer.slice(0, 20) + "..."
  }
  return customer
}

initFilter();

</script>

<template>
  <div class="card">
    <DataTable :value="dataList" datakey="terminal_id" v-model:filters="filters" :globalFilterFields removableSort
      paginator :rows="5" :rowsPerPageOptions rowHover
      paginatorTemplate="RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      currentPageReportTemplate="{first} - {last} of {totalRecords}" scrollable scrollHeight="600px">
      <template #header>
        <div class="table-header">
          <IconField iconPosition="left" class="icon-field-search">
            <InputIcon class="pi pi-search" />
            <InputText v-model="filters['global'].value" placeholder="검색" class="input-search" />
          </IconField>
          <Dropdown v-model="filters['terminal_id'].value" :options="terminalHeaderList" optionValue="name"
            optionLabel="name" placeholder="터미널 코드" showClear class="dropdown-terminal-id">
            <template #option="{ option }">
              {{ option.name }} - {{ option.description }}
            </template>
          </Dropdown>
          <MultiSelect v-model="filters['location'].value" :options="locationList" optionValue="name" optionLabel="name"
            placeholder="납품처" :maxSelectedLabels="1" class="select-location" />
          <Button type="button" icon="pi pi-filter-slash" outlined @click="initFilter()" class="button-filter-clear" />
        </div>
      </template>
      <template #empty> 검색 결과가 없습니다. </template>
      <Column field="terminal_id" header="터미널 ID" sortable>
        <template #body="{ data }">
          {{ data.terminal_id.slice(0, 7) }}<br class="break-terminal-id">{{ data.terminal_id.slice(7) }}
        </template>
      </Column>
      <Column field="customer" header="고객사" class="th-customer"></Column>
      <Column field="location" header="납품처" :showFilterMenu="false" sortable class="th-location"></Column>
      <Column field="customer" class="th-customer-location" sortable>
        <template #header>
          <div>고객사<br>납품처</div>
        </template>
        <template #body="{ data }">
          {{ formatCustomer(data.customer) }}<br>
          {{ data.location }}
        </template>
      </Column>
      <Column field="registered_date" header="납품일자" sortable class="th-registered-date">
        <template #body="{ data }">
          {{ formatDate(data.registered_date) }}
        </template>
      </Column>
      <Column field="sim" header="SIM"></Column>
      <Column field="modified_date" header="최종수정" sortable class="th-modified-date"></Column>
    </DataTable>
  </div>
</template>

<style>
th {
  background-color: #f3fbfd;
  font-weight: bold;
}

.p-datatable-header {
  margin: 2px 0 2px 0;
  padding: 0;
}

.th-customer {
  min-width: 200px;
}

.input-search,
.dropdown-terminal-id,
.select-location,
.button-filter-clear {
  height: 40px;
  margin: 2px;
  align-items: center;
}

.break-terminal-id {
  display: none;
}

@media (min-width: 961px) {
  .card {
    width: 100%;
  }

  .icon-field-search {
    float: left;
  }

  .th-customer-location {
    display: none
  }
}

@media (max-width: 960px) {
  .input-search {
    width: 100%;
  }

  .select-location {
    max-width: 45%;
  }

  .th-customer {
    display: none;
  }

  .th-location {
    display: none;
  }

  .th-customer-location {
    min-width: 150px;
    max-width: 200px;
    word-break: break-all;
  }

  .th-registered-date {
    word-break: keep-all;
  }

  .th-modified-date {
    word-break: keep-all;
  }

  .break-terminal-id {
    display: inline;
  }
}
</style>