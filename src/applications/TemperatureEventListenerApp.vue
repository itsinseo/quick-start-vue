<!--
https://eugenkiss.github.io/7guis/tasks/#temp
-->

<script setup>
import { ref } from 'vue'

const c = ref(0)
const f = ref(32)
const k = ref(273.15)

function setC(e, v = +e.target.value) {
  c.value = v
  f.value = v * (9 / 5) + 32
  k.value = v + 273.15
}

function setF(e, v = +e.target.value) {
  f.value = v
  c.value = (v - 32) * (5 / 9)
  k.value = c.value + 273.15
}

function setK(e, v = +e.target.value) {
  k.value = v
  c.value = v - 273.15
  f.value = c.value * (9 / 5) + 32
}

</script>

<template>
  <input type="number" :value="c" @change="setC"> Celsius
  <br>
  <input type="number" :value="f" @change="setF"> Fahrenheit
  <br>
  <input type="number" :value="k" @change="setK"> Kelvin
</template>