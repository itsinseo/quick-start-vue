<!--
https://eugenkiss.github.io/7guis/tasks/#timer
-->

<script setup>
import { ref, onUnmounted, computed } from 'vue'
const duration = ref(3 * 1000)
const elapsed = ref(0)

const lastTime = ref(0)
const handle = ref(0)
const isRunning = ref(true)
const isPaused = ref(false)

function update() {
  elapsed.value = performance.now() - lastTime.value
  if (elapsed.value >= duration.value) {
    cancelAnimationFrame(handle.value)
    isRunning.value = false
    isPaused.value = true
  } else {
    isRunning.value = true
    isPaused.value = false
    handle.value = requestAnimationFrame(update)
  }
}

function reset() {
  if (!isPaused.value) {
    pause()
  }
  elapsed.value = 0
  lastTime.value = performance.now()
  update()
}

const progressRate = computed(() =>
  Math.min(elapsed.value / duration.value, 1)
)

reset()

onUnmounted(() => {
  cancelAnimationFrame(handle.value)
})

function pause() {
  cancelAnimationFrame(handle.value)
  elapsed.value = performance.now() - lastTime.value

  isPaused.value = true
  isRunning.value = true
}

function start() {
  lastTime.value = performance.now() - elapsed.value
  handle.value = requestAnimationFrame(update)
  isPaused.value = false
  isRunning.value = true
}

</script>

<template>
  <label>Elapsed Time: <progress :value="progressRate"></progress></label>

  <div>{{ (elapsed / 1000).toFixed(1) }}s</div>

  <div>
    Duration: <input type="range" v-model="duration" min="100" max="30000">
    {{ (duration / 1000).toFixed(1) }}s
  </div>

  <button @click="reset">Reset</button>
  <div v-if="isRunning">
    <button v-if="!isPaused" @click="pause">Pause</button>
    <button v-else @click="start">Resume</button>
  </div>
</template>

<style>
.elapsed-container {
  width: 300px;
}

.elapsed-bar {
  background-color: red;
  height: 10px;
}
</style>