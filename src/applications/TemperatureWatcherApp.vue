<!--
https://eugenkiss.github.io/7guis/tasks/#temp
-->

<script setup>
import { ref, watch } from 'vue'

const c = ref(0)
const f = ref(32)
const k = ref(273.15)

watch(c, (newValue) => {
  f.value = newValue * (9 / 5) + 32
  k.value = newValue + 273.15
})

watch(f, (newValue) => {
  c.value = (newValue - 32) * (5 / 9)
  k.value = c.value + 273.15
})

watch(k, (newValue) => {
  c.value = newValue - 273.15
  f.value = c.value * (9 / 5) + 32
})

</script>

<template>
  <input type="number" v-model="c"> Celsius
  <br>
  <input type="number" v-model="f"> Fahrenheit
  <br>
  <input type="number" v-model="k"> Kelvin
</template>