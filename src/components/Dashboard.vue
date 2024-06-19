<script setup>
import { ref } from 'vue';

import companyDeviceStatus from '@/data/company-device-status.json';
import simUsage from '@/data/sim.json';

const cds = ref(companyDeviceStatus);
const simData = ref(simUsage);

const expandedRows = ref({});
const expandAll = () => {
  expandedRows.value = cds.value.reduce(
    (acc, p) => (acc[p.company_name] = true) && acc,
    {}
  );
};
const collapseAll = () => {
  expandedRows.value = null;
};

const totalMonthlyCost = ref(simData.value[0].totalRate);
const totalRouterCount = ref(simData.value[0].totalCnt);
</script>

<template>
  <div class="grid">
    <div class="col-12 lg:col-6">
      <Panel header="사업자별 기기 현황" toggleable>
        <DataTable
          v-model:expandedRows="expandedRows"
          :value="cds"
          dataKey="company_name"
          rowHover
          removableSort
          scrollable
          scroll-height="80vh"
        >
          <template #header>
            <div class="flex flex-wrap justify-content-end">
              <Button
                text
                icon="pi pi-plus"
                label="모두 펼치기"
                @click="expandAll"
              />
              <Button
                text
                icon="pi pi-minus"
                label="모두 접기"
                @click="collapseAll"
              />
            </div>
          </template>
          <Column expander />
          <Column
            field="company_name"
            header="고객사"
            sortable
            style="word-break: break-all"
          />
          <Column field="terminal_count" header="터미널">
            <template #body="{ data }">
              {{ data.terminal_count - data.terminal_disconnected }} /
              {{ data.terminal_count }}
              <b v-if="data.terminal_disconnected !== 0" style="color: red"
                ><br />({{ data.terminal_disconnected }})</b
              >
            </template>
          </Column>
          <Column field="counter_count" header="카운터">
            <template #body="{ data }">
              {{ data.counter_count - data.counter_disconnected }} /
              {{ data.counter_count }}
              <b v-if="data.counter_disconnected !== 0"
                ><br />({{ data.counter_disconnected }})</b
              >
            </template>
          </Column>
          <template #expansion="{ data }">
            <DataTable
              v-if="data.children && data.children.length > 0"
              :value="data.children"
              style="font-size: 0.8rem"
            >
              <Column field="terminalId" header="터미널ID" />
              <Column field="location" header="위치" />
              <Column field="lastReceived" header="마지막 수신시각" />
            </DataTable>
            <div v-else>1시간 이상 미수신 터미널이 없습니다.</div>
          </template>
        </DataTable>
      </Panel>
    </div>
    <div class="col-12 lg:col-6">
      <Panel header="SIM 사용 현황" toggleable>
        <DataTable
          :value="simData"
          rowGroupMode="subheader"
          groupRowsBy="currencyCode"
          rowHover
          removableSort
          scrollable
          scroll-height="80vh"
        >
          <ColumnGroup type="header">
            <Row>
              <Column field="bizCode" header="코드" :rowspan="2" sortable />
              <Column field="routerCnt" header="대수" :rowspan="2" sortable />
              <Column field="serviceProfile" header="Profile" :rowspan="1" />
              <Column field="monthlyFee" header="월비용" :rowspan="2" />
            </Row>
            <Row>
              <Column field="rate" header="Rate" />
            </Row>
          </ColumnGroup>
          <Column field="bizCode" />
          <Column field="routerCnt" />
          <Column>
            <template #body="{ data }">
              {{ data.serviceProfile }}
              <br />
              {{ data.rate }}
            </template>
          </Column>
          <Column field="monthlyFee" />
          <!-- TODO: resolve incorrect colspan rendering -->
          <template #groupheader="{ data }">
            <div>(단위: {{ data.currencyCode }})</div>
          </template>
          <ColumnGroup type="footer">
            <Row>
              <Column footer="합계" style="background-color: aqua" />
              <Column
                :footer="totalRouterCount"
                :colspan="2"
                style="background-color: aqua"
              />
              <Column :footer="totalMonthlyCost" style="background-color: aqua">
                <template>
                  {{ totalMonthlyCost }}
                </template>
              </Column>
            </Row>
          </ColumnGroup>
        </DataTable>
      </Panel>
    </div>
  </div>
</template>

<style scoped>
th {
  background-color: #f3fbfd;
  font-weight: bold;
}

@media (max-width: 960px) {
  td {
    padding: 0.5rem;
  }
}
</style>
