<script setup>
import { ref, reactive } from "vue"
import { FilterMatchMode } from 'primevue/api'

import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

import terminalManagement from '@/data/terminal-management.json'

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

const salesStatus = [
  '정상출고',
  '회수',
  'A/S'
]
const customerDepartment = ref([
  { name: 'LG', department: ['VS', 'MAGNA'] },
  { name: 'SAMSUNG', department: ['생활가전', '무선'] },
  { name: 'LS', department: [] }
]);

const filteredCustomers = ref();
const searchCustomers = (event) => {
  setTimeout(() => {
    if (!event.query.trim().length) {
      filteredCustomers.value = [...customerDepartment];
    } else {
      filteredCustomers.value = customerDepartment.value.filter((customer) => {
        return customer.name.toLowerCase().startsWith(event.query.toLowerCase());
      }).map(customer => customer.name);
    }
  }, 100);
};

// TODO: watch customer, select department

const visible = ref(false);

const codeInfo = reactive({
  customer: null,
  year: null,
  week: null,
  server: null,
  serial: null
});
const salesInfo = reactive({
  date: null,
  customer: null,
  manager: null,
  contact: null,
  email: null,
  status: "정상출고"
});
const installInfo = reactive({
  region: null,
  location: null,
  details: null,
  customer: null,
  department: null,
  memo: null
});

function submitTerminalForm() {
  console.log(
    codeInfo.customer
    + codeInfo.year
    + codeInfo.week
    + codeInfo.server
    + codeInfo.serial
  );
  visible.value = false;
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
        <div class="flex table-header">
          <div class="grid">
            <div class="col">
              <Button label="추가" @click="visible = true" />
            </div>
            <div class="col">
              <IconField iconPosition="left" class="icon-field-search">
                <InputIcon class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="검색" class="input-search" />
              </IconField>
            </div>
            <div class="col">
              <Dropdown v-model="filters['terminal_id'].value" :options="terminalHeaderList" optionValue="name"
                optionLabel="name" placeholder="터미널 코드" showClear class="dropdown-terminal-id">
                <template #option="{ option }">
                  {{ option.name }} - {{ option.description }}
                </template>
              </Dropdown>
            </div>
            <div class="col">
              <MultiSelect v-model="filters['location'].value" :options="locationList" optionValue="name"
                optionLabel="name" placeholder="납품처" :maxSelectedLabels="1" class="select-location" />
            </div>
            <div class="col">
              <Button type="button" icon="pi pi-filter-slash" outlined @click="initFilter()"
                class="button-filter-clear" />
            </div>
          </div>

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

  <!-- TOOD: apply required option to fields -->
  <Dialog v-model:visible="visible" modal header="터미널 상세 정보" style="width:50vw; max-width: 600px;"
    :breakpoints="{ '960px': '95vw' }">
    <div class="grid">
      <div class="col-12">
        <span style="font-weight: bold; color: red;">* 터미널ID (13자리)</span>
      </div>
      <div class="col-3 flex flex-column">
        <Dropdown v-model="codeInfo.customer" :options="terminalHeaderList" optionValue="name" optionLabel="name"
          placeholder="터미널 코드">
          <template #option="{ option }">
            {{ option.name }} - {{ option.description }}
          </template>
        </Dropdown>
        <small>고객코드(3)</small>
      </div>
      <div class="col-2 flex flex-column">
        <InputText v-model="codeInfo.year" />
        <small>년도(2)</small>
      </div>
      <div class="col-2 flex flex-column">
        <InputText v-model="codeInfo.week" />
        <small>주차(2)</small>
      </div>
      <div class="col-3 flex flex-column">
        <InputText v-model="codeInfo.server" />
        <small>서버코드(3)</small>
      </div>
      <div class="col-2 flex flex-column">
        <InputText v-model="codeInfo.serial" />
        <small>번호(3)</small>
      </div>
    </div>

    <Divider />

    <div class="grid">
      <div class="col-12">
        <span style="font-weight: bold; color: red;">* 납품정보</span>
      </div>
      <div class="col-5 flex flex-column">
        <Calendar v-model="salesInfo.date" dateFormat="yy-mm-dd" />
        <small>납품일자</small>
      </div>
      <div class="col-7 flex flex-column">
        <InputText v-model="salesInfo.customer" />
        <small>납품처</small>
      </div>
      <div class="col-5 flex flex-column">
        <InputText v-model="salesInfo.manager" />
        <small>담당자</small>
      </div>
      <div class="col-7 flex flex-column">
        <InputText v-model="salesInfo.contact" />
        <small>연락처</small>
      </div>
      <div class="col-7 flex flex-column">
        <InputText v-model="salesInfo.email" />
        <small>E-mail</small>
      </div>
      <div class="col-5 flex flex-column">
        <Dropdown v-model="salesInfo.status" :options="salesStatus" />
      </div>
    </div>

    <Divider />

    <div class="grid">
      <div class="col-12">
        <span style="font-weight: bold; color: red;">* 설치정보</span>
      </div>
      <div class="col-3 flex flex-column">
        <InputText v-model="installInfo.region" />
        <small>국가(Region)</small>
      </div>
      <div class="col-3 flex flex-column">
        <InputText v-model="installInfo.location" />
        <small>설치지역</small>
      </div>
      <div class="col-6 flex flex-column">
        <InputText v-model="installInfo.details" />
        <small>설치위치(상세)</small>
      </div>
      <div class="col-3 flex flex-column">
        <AutoComplete v-model="installInfo.customer" :suggestions="filteredCustomers" @complete="searchCustomers" />
        <small>고객사(출고)</small>
      </div>
      <div class="col-4 flex flex-column">
        <Dropdown v-model="installInfo.department" :options=null showClear />
        <small>사업부</small>
      </div>
      <div class="col-5 flex flex-column">
        <InputText v-model="installInfo.memo" />
        <small>비고(메모)</small>
      </div>
    </div>

    <div class="flex justify-content-end gap-2 mt-2">
      <Button type="button" label="닫기" icon="pi pi-times" severity="secondary" @click="visible = false"></Button>
      <Button type="button" label="저장" icon="pi pi-check" @click="submitTerminalForm"></Button>
    </div>
  </Dialog>
</template>

<style>
th {
  background-color: #f3fbfd;
  font-weight: bold;
}

.grid {
  margin: 0;
}

.p-button {
  word-break: keep-all;
}

.p-autocomplete-input {
  width: 100%;
}

.p-datatable-header {
  padding: 0.2rem;
}

div[class^="col"] {
  padding: 0.2rem;
}

.th-customer {
  min-width: 200px;
}

.p-inputtext,
.dropdown-terminal-id,
.select-location,
.p-button {
  display: flex;
  height: 2.5rem;
  align-items: center;
}

.break-terminal-id {
  display: none;
}

@media (max-width: 960px) {
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

  .p-dialog-header,
  .p-dialog-content {
    padding: 1rem;
  }
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
</style>