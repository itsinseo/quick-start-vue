<!--
https://eugenkiss.github.io/7guis/tasks/#crud
-->

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const names = reactive(['Emil, Hans', 'Mustermann, Max', 'Tisch, Roman'])
const selected = ref('')
const prefix = ref('')
const first = ref('')
const last = ref('')

const filteredNames = computed(() =>
  names.filter((n) =>
    n.toLowerCase().startsWith(prefix.value.toLowerCase())
  )
)

watch(selected, (name) => {
  [last.value, first.value] = name.split(', ')
})

function create() {
  if (hasValidInput()) {
    const fullName = `${last.value}, ${first.value}`
    if (!names.includes(fullName)) {
      names.push(fullName)
      first.value = last.value = ''
    }
  }
}

function update() {
  if (hasValidInput() && selected.value) {
    const i = names.indexOf(selected.value)
    names[i] = selected.value = `${last.value}, ${first.value}`
  }
}

function del() {
  if (selected.value) {
    const i = names.indexOf(selected.value)
    names.splice(i, 1)
    selected.value = first.value = last.value = ''
  }
}

function hasValidInput() {
  if ((first.value === undefined || last.value === undefined)
    || (first.value.trim() === '' || last.value.trim() === '')) {
    alert('Proper name and surname required.')
    return false;
  } else {
    return true;
  }
}
</script>

<template>
  <div>
    <input v-model="prefix" placeholder="Filter prefix">
  </div>

  <div>
    <select size="8" v-model="selected">
      <option v-for="name in filteredNames" :key="name">{{ name }}</option>
    </select>

    <label>Name: <input v-model="first"></label>
    <label>Surname: <input v-model="last"></label>
  </div>

  <div class="buttons">
    <button @click="create">Create</button>
    <button @click="update">Update</button>
    <button @click="del">Delete</button>
  </div>
</template>

<style scoped>
* {
  font-size: inherit;
}

input {
  display: block;
  margin-bottom: 10px;
}

select {
  float: left;
  margin: 0 1em 1em 0;
  width: 14em;
}

.buttons {
  clear: both;
}

button+button {
  margin-left: 5px;
}
</style>