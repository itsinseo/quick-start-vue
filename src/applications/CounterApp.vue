<!--
https://eugenkiss.github.io/7guis/tasks/#counter
-->

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  {{ count }}
  <div>
    <button @click="count++">Plus 1</button>
    <button @click="count--">Minus 1</button>
    <button @click="count*=2">Double</button>
    <button @click="count/=2">Half</button>
    <button @click="count=0">Zero</button>
  </div>
</template>