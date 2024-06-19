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

// const chartOptions = ref();
// const setChartOptions = () => {
//   const documentStyle = getComputedStyle(document.documentElement);
//   const textColor = documentStyle.getPropertyValue('--text-color');
//   const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
//   const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

//   chartOptions.value = {
//     plugins: {
//       legend: {
//         labels: {
//           color: textColor
//         }
//       }
//     },
//     scales: {
//       x: {
//         ticks: {
//           color: textColorSecondary
//         },
//         grid: {
//           color: surfaceBorder
//         }
//       },
//       y: {
//         beginAtZero: true,
//         ticks: {
//           color: textColorSecondary
//         },
//         grid: {
//           color: surfaceBorder
//         }
//       }
//     }
//   };
// }
// setChartOptions();

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
  <div class="card">
    <Chart type="bar" :data="mixedChartData" class="w-full lg:w-30rem" />
    <Chart type="pie" :data="pieChartData" class="w-full lg:w-30rem" />
  </div>
</template>

<style></style>
