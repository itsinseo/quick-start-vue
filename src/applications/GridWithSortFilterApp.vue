<script setup>
import DemoGrid from '@/components/Grid.vue'
import { ref } from 'vue'

const searchQuery = ref('')
const gridColumns = ['name', 'power', 'age']
const gridData = [
  { name: 'Chuck Norris', power: Infinity, age: 99 },
  { name: 'Bruce Lee', power: 9000, age: 80 },
  { name: 'Jackie Chan', power: 7000, age: 40 },
  { name: 'Jet Li', power: 8000, age: 20 }
]
</script>

<template>
  <form id="search">
    Search <input name="query" v-model="searchQuery">
  </form>
  <DemoGrid :data="gridData" :columns="gridColumns" :filter-key="searchQuery">
  </DemoGrid>
</template>