<script setup>
import terminalManagement from '@/data/terminal-management.json'
import { ref } from "vue"
import { FilterMatchMode } from 'primevue/api'

const dataList = terminalManagement
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  terminal_id: { value: null, matchMode: FilterMatchMode.CONTAINS },
  customer: { value: null, matchMode: FilterMatchMode.CONTAINS },
  location: { value: null, matchMode: FilterMatchMode.IN },
  registered_date: { value: null, matchMode: FilterMatchMode.CONTAINS },
  modified_date: { value: null, matchMode: FilterMatchMode.CONTAINS },
  sim: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
const rowsPerPageOptions = [
  5, 10, 20
]
const globalFilterFields = [
  'terminal_id',
  'customer',
  'location',
  'registered_date',
  'modified_date'
]
const locationList = ref([
  { name: "대한민국" },
  { name: "멕시코" },
  { name: "미국" },
  { name: "인도" },
  { name: "인도네시아" },
  { name: "일본" }
])
function formatDate(date) {
  return date.split(' ')[0]
}

</script>

<template>
  <div class="card">
    <DataTable :value="dataList" datakey="terminal_id" v-model:filters="filters" filterDisplay="row" :globalFilterFields
      removableSort paginator :rows="5" :rowsPerPageOptions tableStyle="min-width: 50rem"
      paginatorTemplate="RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      currentPageReportTemplate="{first} - {last} of {totalRecords}" scrollable scrollHeight="600px">
      <template #header>
        <div class="table-header">
          <h2>터미널 관리</h2>
          <InputText v-model="filters['global'].value" placeholder="결과 내 검색" />
        </div>
      </template>
      <template #empty> No data found. </template>
      <Column field="terminal_id" header="터미널 ID" sortable></Column>
      <Column field="customer" header="고객사" class="custom-th">
      </Column>
      <Column filter-field="location" field="location" header="납품처" :showFilterMenu="false" sortable>
        <template #body="{ data }">
          {{ data.location }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback()" :options="locationList" optionValue="name"
            optionLabel="name" placeholder="모두" :maxSelectedLabels="2">
            <template #option="slotProps">
              <div>
                <span>{{ slotProps.option.name }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>
      <Column field="registered_date" header="납품일자" sortable>
        <template #body="{ data }">
          {{ formatDate(data.registered_date) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style>
@media (max-width: 1024px) {
  .custom-th {
    /* display: none; */
    width: 200px;
    font-weight: bold;
  }
}

.custom-th {
  min-width: 200px;
}
</style>