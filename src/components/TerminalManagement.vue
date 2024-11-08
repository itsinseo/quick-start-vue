<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue';

import CustomQrScanner from './CustomQrScanner.vue';

import kakaoGeocode from '@/utils/kakao-geocoding';

import terminalManagement from '@/data/mock-terminal-management.json';

const toast = useToast();

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

// QR Scan
const showCustomQrScanner = ref(false);
const showQrScanResult = qrScanResult => {
  toast.add({
    severity: 'info',
    summary: 'QR 스캔 성공',
    detail: qrScanResult,
    // group: 'tr',
    life: 3000
  });
  showCustomQrScanner.value = false;
};

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
      <div class="grid grid-cols-6">
        <div class="col-span-1">
          <Button
            class="w-full"
            v-if="isLargeWindow"
            label="추가"
            @click="desktopDialog = true"
          />
          <Button
            class="w-full"
            v-else
            label="추가"
            @click="mobileDialog = true"
          />
        </div>
        <div class="col-span-1">
          <Button
            class="w-full"
            label="QR"
            @click.prevent="showCustomQrScanner = !showCustomQrScanner"
          />
        </div>
        <div class="col-span-4">
          <IconField iconPosition="left">
            <InputIcon class="pi pi-search" />
            <InputText
              class="w-full"
              v-model="filters['global'].value"
              placeholder="검색"
            />
          </IconField>
        </div>
        <div class="col-span-3">
          <Select
            class="w-full"
            v-model="filters['terminal_id'].value"
            :options="terminalHeaderList"
            optionValue="name"
            optionLabel="name"
            placeholder="터미널 코드"
            showClear
          >
            <template #option="{ option }">
              {{ option.name }} - {{ option.description }}
            </template>
          </Select>
        </div>
        <div class="col-span-2">
          <MultiSelect
            class="w-full"
            v-model="filters['location'].value"
            :options="locationList"
            optionValue="name"
            optionLabel="name"
            placeholder="납품처"
            :maxSelectedLabels="1"
            selectedItemsLabel="{0}개 국가"
          />
        </div>
        <div class="col-span-1">
          <Button
            class="w-full"
            icon="pi pi-filter-slash"
            outlined
            @click="clearFilter()"
          />
        </div>
        <div v-if="showCustomQrScanner" class="col-span-6 justify-items-center">
          <CustomQrScanner
            class="h-full w-full max-w-[600px]"
            @emit-qr-scan-result="showQrScanResult"
          />
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
    <Column class="hidden lg:table-cell" field="customer" header="고객사" />
    <Column
      class="hidden lg:table-cell"
      field="location"
      header="납품처"
      :showFilterMenu="false"
      sortable
    ></Column>
    <Column field="customer" sortable class="lg:hidden">
      <template #header>
        <div>고객사<br />납품처</div>
      </template>
      <template #body="{ data }">
        {{ formatCustomer(data.customer) }}<br />
        {{ data.location }}
      </template>
    </Column>
    <Column field="registered_date" header="납품일자" sortable>
      <template #body="{ data }">
        {{ formatDate(data.registered_date) }}
      </template>
    </Column>
    <Column field="sim" header="SIM" />
    <Column field="modified_date" header="최종수정" sortable />
  </DataTable>

  <Dialog
    v-model:visible="desktopDialog"
    modal
    header="터미널 상세 정보"
    style="max-width: 900px"
    :breakpoints="{ '960px': '95vw' }"
  >
    <div class="grid grid-cols-12">
      <div class="col-span-12">
        <span style="font-weight: bold; color: red">* 터미널ID (13자리)</span>
      </div>
      <div class="col-span-4 w-full">
        <Select
          class="w-full"
          v-model="codeInfo.customer"
          :options="terminalHeaderList"
          optionValue="name"
          optionLabel="name"
          placeholder="고객코드(3)"
        >
          <template #option="{ option }">
            {{ option.name }} - {{ option.description }}
          </template>
        </Select>
      </div>
      <div class="col-span-4 lg:col-span-2">
        <InputMask
          class="w-full"
          v-model="codeInfo.year"
          mask="99"
          placeholder="년도(2)"
        />
      </div>
      <div class="col-span-4 lg:col-span-2">
        <InputMask
          class="w-full"
          v-model="codeInfo.week"
          mask="99"
          placeholder="주차(2)"
        />
      </div>
      <div class="col-span-6 lg:col-span-2">
        <InputMask
          class="w-full"
          v-model="codeInfo.server"
          mask="a**"
          placeholder="서버코드(3)"
        />
      </div>
      <div class="col-span-6 lg:col-span-2">
        <InputMask
          class="w-full"
          v-model="codeInfo.serial"
          mask="999"
          placeholder="일련번호(3)"
        />
      </div>
    </div>

    <Divider />

    <div class="grid grid-cols-12">
      <div class="col-span-12">
        <span style="font-weight: bold; color: red">* 납품정보</span>
      </div>
      <div class="col-span-4">
        <DatePicker
          class="w-full"
          v-model="salesInfo.date"
          dateFormat="yy-mm-dd"
          showButtonBar
          placeholder="납품일자"
        />
      </div>
      <div class="col-span-4">
        <InputText
          class="w-full"
          v-model="salesInfo.customer"
          placeholder="납품처"
        />
      </div>
      <div class="col-span-4">
        <Select
          class="w-full"
          v-model="salesInfo.status"
          :options="salesStatus"
        />
      </div>
      <div class="col-span-4">
        <InputText
          class="w-full"
          v-model="salesInfo.manager"
          placeholder="담당자"
        />
      </div>
      <div class="col-span-4">
        <InputText
          class="w-full"
          v-model="salesInfo.contact"
          placeholder="연락처"
        />
      </div>
      <div class="col-span-4">
        <InputText
          class="w-full"
          v-model="salesInfo.email"
          placeholder="E-mail"
        />
      </div>
    </div>

    <Divider />

    <div class="grid grid-cols-12">
      <div class="col-span-12">
        <span style="font-weight: bold; color: red">* 설치정보</span>
      </div>
      <div class="col-span-3">
        <InputText
          class="w-full"
          v-model="installInfo.region"
          placeholder="국가(Region)"
        />
      </div>
      <div class="col-span-3">
        <InputText
          class="w-full"
          v-model="installInfo.location"
          placeholder="설치지역"
        />
      </div>
      <div class="col-span-6">
        <InputText
          class="w-full"
          v-model="installInfo.details"
          placeholder="설치위치(상세)"
        />
      </div>
      <div class="col-span-3">
        <AutoComplete
          class="w-full"
          v-model="installInfo.customer"
          :suggestions="filteredCustomers"
          @complete="searchCustomers"
          placeholder="고객사(출고)"
        />
      </div>
      <div class="col-span-3">
        <Select
          class="w-full"
          v-model="installInfo.department"
          :options="null"
          showClear
          disabled
          placeholder="사업부"
        />
      </div>
      <div class="col-span-6">
        <InputText
          class="w-full"
          v-model="installInfo.memo"
          placeholder="비고(메모)"
        />
      </div>
    </div>

    <Divider />

    <div class="flex justify-end gap-2">
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
  </Dialog>

  <Dialog
    v-model:visible="mobileDialog"
    modal
    header="터미널 상세 정보"
    style="width: 90vw; max-width: 600px"
  >
    <Stepper value="1">
      <StepList>
        <Step value="1">ID</Step>
        <Step value="2">납품</Step>
        <Step value="3">설치</Step>
      </StepList>
      <StepPanels>
        <StepPanel v-slot="{ activateCallback }" value="1">
          <div class="grid grid-cols-12">
            <div class="col-span-12">
              <span style="font-weight: bold; color: red"
                >* 터미널ID (13자리)</span
              >
            </div>
            <div class="col-span-6">
              <Select
                class="w-full"
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
            <div class="col-span-3">
              <InputMask class="w-full" v-model="codeInfo.year" mask="99" />
              <small>년도(2)</small>
            </div>
            <div class="col-span-3">
              <InputMask class="w-full" v-model="codeInfo.week" mask="99" />
              <small>주차(2)</small>
            </div>
            <div class="col-span-6">
              <InputMask class="w-full" v-model="codeInfo.server" mask="a**" />
              <small>서버코드(3)</small>
            </div>
            <div class="col-span-6">
              <InputMask class="w-full" v-model="codeInfo.serial" mask="999" />
              <small>번호(3)</small>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <Button
              label="다음"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="activateCallback('2')"
            />
          </div>
        </StepPanel>
        <StepPanel v-slot="{ activateCallback }" value="2">
          <div class="grid grid-cols-12">
            <div class="col-span-12">
              <span style="font-weight: bold; color: red">* 납품정보</span>
            </div>
            <div class="col-span-5">
              <DatePicker
                class="w-full"
                v-model="salesInfo.date"
                dateFormat="yy-mm-dd"
                showButtonBar
              />
              <small>납품일자</small>
            </div>
            <div class="col-span-7">
              <InputText class="w-full" v-model="salesInfo.customer" />
              <small>납품처</small>
            </div>
            <div class="col-span-5">
              <InputText class="w-full" v-model="salesInfo.manager" />
              <small>담당자</small>
            </div>
            <div class="col-span-7">
              <InputText class="w-full" v-model="salesInfo.contact" />
              <small>연락처</small>
            </div>
            <div class="col-span-7">
              <InputText class="w-full" v-model="salesInfo.email" />
              <small>E-mail</small>
            </div>
            <div class="col-span-5">
              <Select
                class="w-full"
                v-model="salesInfo.status"
                :options="salesStatus"
              />
            </div>
          </div>
          <div class="flex justify-between">
            <Button
              label="이전"
              severity="secondary"
              icon="pi pi-arrow-left"
              @click="activateCallback('1')"
            />
            <Button
              label="다음"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="activateCallback('3')"
            />
          </div>
        </StepPanel>
        <StepPanel v-slot="{ activateCallback }" value="3">
          <div class="grid grid-cols-12">
            <div class="col-span-12">
              <span style="font-weight: bold; color: red">* 설치정보</span>
            </div>
            <div class="col-span-6">
              <InputText class="w-full" v-model="installInfo.region" />
              <small>국가(Region)</small>
            </div>
            <div class="col-span-6">
              <InputText class="w-full" v-model="installInfo.location" />
              <small>설치지역</small>
            </div>
            <div class="col-span-12">
              <InputText class="w-full" v-model="installInfo.details" />
              <small>설치위치(상세)</small>
            </div>
            <div class="col-span-6">
              <AutoComplete
                class="w-full"
                v-model="installInfo.customer"
                :suggestions="filteredCustomers"
                @complete="searchCustomers"
              />
              <small>고객사(출고)</small>
            </div>
            <div class="col-span-6">
              <Select
                class="w-full"
                v-model="installInfo.department"
                :options="null"
                showClear
                disabled
              />
              <small>사업부</small>
            </div>
            <div class="col-span-12">
              <InputText class="w-full" v-model="installInfo.memo" />
              <small>비고(메모)</small>
            </div>
          </div>
          <div class="flex justify-between">
            <Button
              label="이전"
              severity="secondary"
              icon="pi pi-arrow-left"
              @click="activateCallback('2')"
            />
            <Button
              label="완료"
              icon="pi pi-check"
              iconPos="right"
              @click="submitMobileTerminalForm"
            />
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </Dialog>
</template>

<style></style>
