<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';

import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

// Stepper requires explicit import
import Stepper from 'primevue/stepper';
import StepPanel from 'primevue/steppanel';

import kakaoGeocode from '@/utils/kakao-geocoding';

import terminalManagement from '@/data/mock-terminal-management.json';

const dataList = terminalManagement;
const filters = ref();
const rowsPerPageOptions = [1, 5, 10, 20];
const globalFilterFields = [
  'terminal_id',
  'customer',
  'location',
  'registered_date',
  'modified_date',
  'sim'
];
const terminalHeaderList = [
  { name: 'TSC', description: '삼성전자' },
  { name: 'LTM', description: 'LG' },
  { name: 'CTM', description: '중소기업' },
  { name: 'MTL', description: '임시' }
];
const locationList = [
  { name: '대한민국' },
  { name: '멕시코' },
  { name: '미국' },
  { name: '인도' },
  { name: '인도네시아' },
  { name: '일본' }
];

const clearFilter = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    terminal_id: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    customer: { value: null, matchMode: FilterMatchMode.CONTAINS },
    location: { value: null, matchMode: FilterMatchMode.IN },
    registered_date: { value: null, matchMode: FilterMatchMode.CONTAINS },
    modified_date: { value: null, matchMode: FilterMatchMode.CONTAINS },
    sim: { value: null, matchMode: FilterMatchMode.CONTAINS }
  };
};
const formatDate = date => date.split(' ')[0];
const formatCustomer = customer => {
  if (customer.length > 20) {
    customer = customer.slice(0, 20) + '...';
  }
  return customer;
};

const salesStatus = ['정상출고', '회수', 'A/S'];
const customerDepartment = ref([
  { name: 'LG', department: ['VS', 'MAGNA'] },
  { name: 'SAMSUNG', department: ['생활가전', '무선'] },
  { name: 'LS', department: [] }
]);

const filteredCustomers = ref();
const searchCustomers = event => {
  setTimeout(() => {
    if (!event.query.trim().length) {
      filteredCustomers.value = [...customerDepartment];
    } else {
      filteredCustomers.value = customerDepartment.value
        .filter(customer => {
          return customer.name
            .toLowerCase()
            .startsWith(event.query.toLowerCase());
        })
        .map(customer => customer.name);
    }
  }, 100);
};

const desktopDialog = ref(false);
const currentPage = ref(1);
const totalPages = 3;

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
  status: '정상출고'
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
  callGeocodingApi();

  desktopDialog.value = false;
  currentPage.value = 1;
}

const mobileDialog = ref(false);
function submitMobileTerminalForm() {
  callGeocodingApi();

  mobileDialog.value = false;
}

function callGeocodingApi() {
  kakaoGeocode(installInfo.details)
    .then(coords => {
      console.log(coords);

      resetObject(codeInfo);
      resetObject(salesInfo);
      resetObject(installInfo);
    })
    .catch(error => {
      alert('에러: ' + error);
    });
}

function resetObject(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      obj[key] = null;
    }
  }
}

clearFilter();

const windowWidth = ref(window.innerWidth);
const resizeWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};
const isLargeWindow = computed(() => {
  return windowWidth.value > 960;
});

onMounted(() => {
  window.addEventListener('resize', resizeWindowWidth);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeWindowWidth);
});
</script>

<template>
  <DataTable
    :value="dataList"
    datakey="terminal_id"
    v-model:filters="filters"
    :globalFilterFields
    removableSort
    paginator
    :rows="5"
    :rowsPerPageOptions
    rowHover
    paginatorTemplate="RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
    currentPageReportTemplate="{first} - {last} of {totalRecords}"
    scrollable
    scrollHeight="70vh"
  >
    <template #header>
      <div class="flex table-header">
        <div class="grid">
          <div class="col">
            <Button
              v-if="isLargeWindow"
              label="추가"
              @click="desktopDialog = true"
            />
            <Button v-else label="추가" @click="mobileDialog = true" />
          </div>
          <div class="col">
            <IconField iconPosition="left" class="icon-field-search">
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="filters['global'].value"
                placeholder="검색"
                class="input-search"
              />
            </IconField>
          </div>
          <div class="col">
            <Select
              v-model="filters['terminal_id'].value"
              :options="terminalHeaderList"
              optionValue="name"
              optionLabel="name"
              placeholder="터미널 코드"
              showClear
              class="dropdown-terminal-id"
            >
              <template #option="{ option }">
                {{ option.name }} - {{ option.description }}
              </template>
            </Select>
          </div>
          <div class="col">
            <MultiSelect
              v-model="filters['location'].value"
              :options="locationList"
              optionValue="name"
              optionLabel="name"
              placeholder="납품처"
              :maxSelectedLabels="1"
              selectedItemsLabel="{0}개 국가"
              class="select-location"
            />
          </div>
          <div class="col">
            <Button
              type="button"
              icon="pi pi-filter-slash"
              outlined
              @click="clearFilter()"
            />
          </div>
        </div>
      </div>
    </template>
    <template #empty> 검색 결과가 없습니다. </template>
    <Column field="terminal_id" header="터미널 ID" sortable>
      <template #body="{ data }">
        {{ data.terminal_id.slice(0, 7) }}<br class="break-terminal-id" />{{
          data.terminal_id.slice(7)
        }}
      </template>
    </Column>
    <Column field="customer" header="고객사" class="th-customer"></Column>
    <Column
      field="location"
      header="납품처"
      :showFilterMenu="false"
      sortable
      class="th-location"
    ></Column>
    <Column field="customer" class="th-customer-location" sortable>
      <template #header>
        <div>고객사<br />납품처</div>
      </template>
      <template #body="{ data }">
        {{ formatCustomer(data.customer) }}<br />
        {{ data.location }}
      </template>
    </Column>
    <Column
      field="registered_date"
      header="납품일자"
      sortable
      class="th-registered-date"
    >
      <template #body="{ data }">
        {{ formatDate(data.registered_date) }}
      </template>
    </Column>
    <Column field="sim" header="SIM"></Column>
    <Column
      field="modified_date"
      header="최종수정"
      sortable
      class="th-modified-date"
    ></Column>
  </DataTable>

  <!-- TOOD: apply required option, watch department with customer -->
  <Dialog
    v-model:visible="desktopDialog"
    modal
    header="터미널 상세 정보"
    style="max-width: 600px"
    :breakpoints="{ '960px': '95vw' }"
  >
    <div v-if="windowWidth" class="wrapper-container">
      <div class="grid">
        <div class="col-12">
          <span style="font-weight: bold; color: red">* 터미널ID (13자리)</span>
        </div>
        <div class="col-3 flex flex-column">
          <Select
            v-model="codeInfo.customer"
            :options="terminalHeaderList"
            optionValue="name"
            optionLabel="name"
            placeholder="터미널 코드"
          >
            <template #option="{ option }">
              {{ option.name }} - {{ option.description }}
            </template>
          </Select>
          <small>고객코드(3)</small>
        </div>
        <div class="col-2 flex flex-column">
          <InputMask v-model="codeInfo.year" mask="99" />
          <small>년도(2)</small>
        </div>
        <div class="col-2 flex flex-column">
          <InputMask v-model="codeInfo.week" mask="99" />
          <small>주차(2)</small>
        </div>
        <div class="col-3 flex flex-column">
          <InputMask v-model="codeInfo.server" mask="a**" />
          <small>서버코드(3)</small>
        </div>
        <div class="col-2 flex flex-column">
          <InputMask v-model="codeInfo.serial" mask="999" />
          <small>번호(3)</small>
        </div>
      </div>

      <Divider />

      <div class="grid">
        <div class="col-12">
          <span style="font-weight: bold; color: red">* 납품정보</span>
        </div>
        <div class="col-5 flex flex-column">
          <DatePicker
            v-model="salesInfo.date"
            dateFormat="yy-mm-dd"
            showButtonBar
          />
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
          <Select v-model="salesInfo.status" :options="salesStatus" />
        </div>
      </div>

      <Divider />

      <div class="grid">
        <div class="col-12">
          <span style="font-weight: bold; color: red">* 설치정보</span>
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
          <AutoComplete
            v-model="installInfo.customer"
            :suggestions="filteredCustomers"
            @complete="searchCustomers"
          />
          <small>고객사(출고)</small>
        </div>
        <div class="col-4 flex flex-column">
          <Select
            v-model="installInfo.department"
            :options="null"
            showClear
            disabled
          />
          <small>사업부</small>
        </div>
        <div class="col-5 flex flex-column">
          <InputText v-model="installInfo.memo" />
          <small>비고(메모)</small>
        </div>
      </div>

      <div class="flex justify-content-end gap-2 mt-2">
        <Button
          type="button"
          label="닫기"
          icon="pi pi-times"
          severity="secondary"
          @click="desktopDialog = false"
        ></Button>
        <Button
          type="button"
          label="저장"
          icon="pi pi-check"
          @click="submitTerminalForm"
        ></Button>
      </div>
    </div>

    <div v-else class="wrapper-container">
      <div v-if="currentPage === 1" class="grid">
        <div class="col-12">
          <span style="font-weight: bold; color: red">* 터미널ID (13자리)</span>
        </div>
        <div class="col-6 flex flex-column">
          <Select
            v-model="codeInfo.customer"
            :options="terminalHeaderList"
            optionValue="name"
            optionLabel="name"
            placeholder="터미널 코드"
          >
            <template #option="{ option }">
              {{ option.name }} - {{ option.description }}
            </template>
          </Select>
          <small>고객코드(3)</small>
        </div>
        <div class="col-3 flex flex-column">
          <InputMask v-model="codeInfo.year" mask="99" />
          <small>년도(2)</small>
        </div>
        <div class="col-3 flex flex-column">
          <InputMask v-model="codeInfo.week" mask="99" />
          <small>주차(2)</small>
        </div>
        <div class="col-6 flex flex-column">
          <InputMask v-model="codeInfo.server" mask="a**" />
          <small>서버코드(3)</small>
        </div>
        <div class="col-6 flex flex-column">
          <InputMask v-model="codeInfo.serial" mask="999" />
          <small>번호(3)</small>
        </div>
      </div>

      <div v-else-if="currentPage === 2" class="grid">
        <div class="col-12">
          <span style="font-weight: bold; color: red">* 납품정보</span>
        </div>
        <div class="col-5 flex flex-column">
          <DatePicker
            v-model="salesInfo.date"
            dateFormat="yy-mm-dd"
            showButtonBar
          />
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
          <Select v-model="salesInfo.status" :options="salesStatus" />
        </div>
      </div>

      <div v-else-if="currentPage === 3" class="grid">
        <div class="col-12">
          <span style="font-weight: bold; color: red">* 설치정보</span>
        </div>
        <div class="col-6 flex flex-column">
          <InputText v-model="installInfo.region" />
          <small>국가(Region)</small>
        </div>
        <div class="col-6 flex flex-column">
          <InputText v-model="installInfo.location" />
          <small>설치지역</small>
        </div>
        <div class="col-12 flex flex-column">
          <InputText v-model="installInfo.details" />
          <small>설치위치(상세)</small>
        </div>
        <div class="col-6 flex flex-column">
          <AutoComplete
            v-model="installInfo.customer"
            :suggestions="filteredCustomers"
            @complete="searchCustomers"
          />
          <small>고객사(출고)</small>
        </div>
        <div class="col-6 flex flex-column">
          <Select
            v-model="installInfo.department"
            :options="null"
            showClear
            disabled
          />
          <small>사업부</small>
        </div>
        <div class="col-12 flex flex-column">
          <InputText v-model="installInfo.memo" />
          <small>비고(메모)</small>
        </div>
      </div>

      <div class="flex justify-content-end gap-2 mt-2">
        <Button
          type="button"
          label="취소"
          icon="pi pi-times"
          severity="danger"
          @click="desktopDialog = false"
        />
        <Button
          v-if="currentPage > 1"
          type="button"
          label="이전"
          severity="secondary"
          @click="currentPage--"
        />
        <Button
          v-if="currentPage < totalPages"
          type="button"
          label="다음"
          @click="currentPage++"
        />
        <Button
          v-if="currentPage === totalPages"
          type="button"
          label="제출"
          icon="pi pi-check"
          @click="submitTerminalForm"
        />
      </div>
    </div>
  </Dialog>

  <Dialog
    v-model:visible="mobileDialog"
    modal
    header="터미널 상세 정보"
    style="width: 90vw; max-width: 600px"
  >
    <Stepper>
      <StepPanel header="ID">
        <template #content="{ nextCallback }">
          <div class="grid">
            <div class="col-12">
              <span style="font-weight: bold; color: red"
                >* 터미널ID (13자리)</span
              >
            </div>
            <div class="col-6 flex flex-column">
              <Select
                v-model="codeInfo.customer"
                :options="terminalHeaderList"
                optionValue="name"
                optionLabel="name"
                placeholder="터미널 코드"
              >
                <template #option="{ option }">
                  {{ option.name }} - {{ option.description }}
                </template>
              </Select>
              <small>고객코드(3)</small>
            </div>
            <div class="col-3 flex flex-column">
              <InputMask v-model="codeInfo.year" mask="99" />
              <small>년도(2)</small>
            </div>
            <div class="col-3 flex flex-column">
              <InputMask v-model="codeInfo.week" mask="99" />
              <small>주차(2)</small>
            </div>
            <div class="col-6 flex flex-column">
              <InputMask v-model="codeInfo.server" mask="a**" />
              <small>서버코드(3)</small>
            </div>
            <div class="col-6 flex flex-column">
              <InputMask v-model="codeInfo.serial" mask="999" />
              <small>번호(3)</small>
            </div>
          </div>
          <div class="flex pt-4 justify-content-end">
            <Button
              label="다음"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="nextCallback"
            />
          </div>
        </template>
      </StepPanel>
      <StepPanel header="납품">
        <template #content="{ prevCallback, nextCallback }">
          <div class="grid">
            <div class="col-12">
              <span style="font-weight: bold; color: red">* 납품정보</span>
            </div>
            <div class="col-5 flex flex-column">
              <DatePicker
                v-model="salesInfo.date"
                dateFormat="yy-mm-dd"
                showButtonBar
              />
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
              <Select v-model="salesInfo.status" :options="salesStatus" />
            </div>
          </div>
          <div class="flex pt-4 justify-content-between">
            <Button
              label="이전"
              severity="secondary"
              icon="pi pi-arrow-left"
              @click="prevCallback"
            />
            <Button
              label="다음"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="nextCallback"
            />
          </div>
        </template>
      </StepPanel>
      <StepPanel header="설치">
        <template #content="{ prevCallback }">
          <div class="grid">
            <div class="col-12">
              <span style="font-weight: bold; color: red">* 설치정보</span>
            </div>
            <div class="col-6 flex flex-column">
              <InputText v-model="installInfo.region" />
              <small>국가(Region)</small>
            </div>
            <div class="col-6 flex flex-column">
              <InputText v-model="installInfo.location" />
              <small>설치지역</small>
            </div>
            <div class="col-12 flex flex-column">
              <InputText v-model="installInfo.details" />
              <small>설치위치(상세)</small>
            </div>
            <div class="col-6 flex flex-column">
              <AutoComplete
                v-model="installInfo.customer"
                :suggestions="filteredCustomers"
                @complete="searchCustomers"
              />
              <small>고객사(출고)</small>
            </div>
            <div class="col-6 flex flex-column">
              <Select
                v-model="installInfo.department"
                :options="null"
                showClear
                disabled
              />
              <small>사업부</small>
            </div>
            <div class="col-12 flex flex-column">
              <InputText v-model="installInfo.memo" />
              <small>비고(메모)</small>
            </div>
          </div>
          <div class="flex pt-4 justify-content-between">
            <Button
              label="이전"
              severity="secondary"
              icon="pi pi-arrow-left"
              @click="prevCallback"
            />
            <Button
              label="완료"
              icon="pi pi-check"
              iconPos="right"
              @click="submitMobileTerminalForm"
            />
          </div>
        </template>
      </StepPanel>
    </Stepper>
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

div[class^='col'] {
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

.p-stepper-panels {
  padding: 0;
}

@media (max-width: 960px) {
  .th-customer,
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
    display: none;
  }
}
</style>
