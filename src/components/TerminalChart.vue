<script setup>
import { ref } from 'vue';

const mixedChartData = ref();
const setMixedChartData = () => {
  mixedChartData.value = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        type: 'line',
        label: 'Dataset 1',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        data: [50, 25, 12, 48, 56, 76, 42]
      },
      {
        type: 'bar',
        label: 'Dataset 2',
        data: [21, 84, 24, 75, 37, 65, 34],
        borderColor: 'red',
        borderWidth: 2
      },
      {
        type: 'bar',
        label: 'Dataset 3',
        backgroundColor: 'green',
        data: [41, 52, 24, 74, 23, 21, 32]
      }
    ]
  };
};
setMixedChartData();

const pieChartData = ref();
const setPieChartData = () => {
  pieChartData.value = {
    labels: ['A', 'B', 'C'],
    datasets: [
      {
        data: [540, 325, 702]
      }
    ]
  };
};
setPieChartData();
</script>

<template>
  <div class="grid grid-cols-6 gap-1 p-4 lg:grid-cols-12">
    <div class="col-span-12 justify-items-center md:col-span-6">
      <Chart class="max-h-[70vh] w-full" type="bar" :data="mixedChartData" />
    </div>
    <div class="col-span-12 justify-items-center md:col-span-6">
      <Chart class="max-h-[70vh] w-full" type="pie" :data="pieChartData" />
    </div>
  </div>
</template>

<style></style>
