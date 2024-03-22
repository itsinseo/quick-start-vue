<!--
https://eugenkiss.github.io/7guis/tasks/#flight
-->

<script setup>
import { ref, computed } from 'vue'

const flightType = ref()
const departureDate = ref(new Date())
const returnDate = ref(departureDate.value)

const isReturn = computed(() => flightType.value === 'Return Flight')

const typeSelected = computed(
  () => flightType.value
)

const canBook = computed(
  () =>
    !isReturn.value ||
    returnDate.value > departureDate.value
)

const flightOptions = ref([
  'One-way Flight',
  'Return Flight'
])

function book() {
  alert(
    isReturn.value
      ? `You have booked a return flight leaving on ${dateToString(departureDate.value)} and returning on ${dateToString(returnDate.value)}.`
      : `You have booked a one-way flight leaving on ${dateToString(departureDate.value)}.`
  )
}

function dateToString(date) {
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate())
  )
}

function pad(n, s = String(n)) {
  return s.length < 2 ? `0${s}` : s
}

</script>

<template>

  <div>
    <Dropdown v-model="flightType" :options="flightOptions" placeholder="One-way or Return" />
  </div>

  <div>
    <Calendar v-model="departureDate" dateFormat="yy-mm-dd" />
    <Calendar v-model="returnDate" dateFormat="yy-mm-dd" :disabled="!isReturn" />
  </div>

  <Button :disabled="!canBook || !typeSelected" @click="book">Book</Button>

  <p>{{ typeSelected ? '' : 'Select Flight Type First' }}</p>
  <p>{{ canBook ? '' : 'Return date must be after departure date.' }}</p>
</template>

<style scoped>
select,
input,
button {
  display: block;
  margin: 0.5em 0;
  font-size: 15px;
}

input[disabled] {
  color: #999;
}

p {
  color: red;
}
</style>