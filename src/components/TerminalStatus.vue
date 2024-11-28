<script setup>
import { ref } from 'vue';

import terminalCommunication from '@/data/terminal-communication.json';

const terminalStatus = ref(terminalCommunication);
const showDrawer = ref(false);

const selectedColumns = ref();
const columns = ref([
  { field: 'tid', header: '터미널 ID' },
  { field: 'customer', header: '업체' },
  { field: 'lastCommedAt', header: '최종통신일시' },
  { field: 'tmVer', header: '펌웨어 버전' },
  { field: 'company', header: '고객사' },
  { field: 'division', header: '사업부' },
  { field: 'region', header: '국가' },
  { field: 'state', header: '상태' }
]);
const onToggle = val => {
  selectedColumns.value = columns.value.filter(col => val.includes(col));
};

const initSelectedColumns = () => {
  selectedColumns.value = columns.value.filter(col =>
    ['tid', 'customer', 'lastCommedAt', 'region', 'state'].includes(col.field)
  );
};

initSelectedColumns();
</script>

<template>
  <DataTable
    :value="terminalStatus"
    paginator
    :rows="10"
    :rowsPerPageOptions="[10, 20, 50]"
    paginatorTemplate="RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
    currentPageReportTemplate="{first} - {last} of {totalRecords}"
    scrollable
    removableSort
    :reorderableColumns="true"
    scrollHeight="70vh"
    rowHover
  >
    <template #header>
      <div class="flex justify-end">
        <i class="pi pi-cog cursor-pointer" @click="showDrawer = true" />
      </div>
    </template>
    <Column
      v-for="(col, index) of selectedColumns"
      :field="col.field"
      :header="col.header"
      :key="col.field + '_' + index"
      sortable
    >
    </Column>
  </DataTable>

  <Drawer v-model:visible="showDrawer" position="right" class="min-w-[30vw]">
    <div class="my-2 text-xl">
      <span>표시할 열 선택</span>
    </div>
    <MultiSelect
      class="w-full"
      :modelValue="selectedColumns"
      :options="columns"
      optionLabel="header"
      @update:modelValue="onToggle"
      display="chip"
      :maxSelectedLabels="3"
      scrollHeight="60vh"
      placeholder="항목 선택"
      selectedItemsLabel="{0}개 선택됨"
    />
  </Drawer>
</template>

<style></style>
