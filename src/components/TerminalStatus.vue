<script setup>
import { ref } from 'vue';

import terminalCommunication from '@/data/terminal-communication.json'

const terminalStatus = ref(terminalCommunication);

const selectedColumns = ref();
const columns = ref([
  { field: 'tid', header: '터미널 ID' },
  { field: 'customer', header: '업체' },
  { field: 'lastCommedAt', header: '최종통신일시' },
  { field: 'tmVer', header: '펌웨어 버전' },
  { field: 'company', header: '고객사' },
  { field: 'division', header: '사업부' },
  { field: 'region', header: '국가' },
  { field: 'state', header: '상태' },
])
const onToggle = (val) => {
  selectedColumns.value = columns.value.filter(col => val.includes(col));
};

const initSelectedColumns = () => {
  selectedColumns.value = columns.value.filter(col =>
    ['tid', 'customer', 'lastCommedAt', 'region', 'state'].includes(col.field)
  );
}

initSelectedColumns();

</script>

<template>
  <DataTable :value="terminalStatus" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]"
    paginatorTemplate="RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
    currentPageReportTemplate="{first} - {last} of {totalRecords}" scrollable removableSort :reorderableColumns="true" scrollHeight="70vh" rowHover>
    <template #header>
      <div style="text-align:left">
        <MultiSelect :modelValue="selectedColumns" :options="columns" optionLabel="header" @update:modelValue="onToggle"
          display="chip" scrollHeight="20vh" placeholder="항목 선택" />
      </div>
    </template>
    <Column v-for="(col, index) of selectedColumns" :field="col.field" :header="col.header"
      :key="col.field + '_' + index" style="word-break: break-all" sortable>
    </Column>
  </DataTable>
</template>

<style>
.p-datatable-header {
  padding: 0.2rem;
}

.p-multiselect-label {
  display: flex;
  flex-wrap: wrap;
}

.p-multiselect-token {
  margin: 0.1rem;
}

@media (max-width: 960px) {
  .p-multiselect-chip {
    max-width: 85vw;
  }
}
</style>