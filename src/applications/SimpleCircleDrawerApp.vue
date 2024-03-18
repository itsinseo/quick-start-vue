<!--
https://eugenkiss.github.io/7guis/tasks/#circle
-->

<script setup>
import { ref } from 'vue'

const history = ref([])
const undoHistory = ref([])
const circles = ref([])
const selected = ref()

function onClick({ clientX: x, clientY: y }) {
  selected.value = [...circles.value].reverse().find(({ cx, cy, r }) => {
    const dx = cx - x
    const dy = cy - y
    return Math.sqrt(dx * dx + dy * dy) <= r
  })

  if (!selected.value) {
    circles.value.push({
      cx: x,
      cy: y,
      r: 50
    })
    push()
  }
}

function push() {
  history.value.push(circles.value[circles.value.length - 1])
  undoHistory.value = []
}

function undo() {
  undoHistory.value.push(circles.value.pop())
  history.value.pop()
}

function redo() {
  const undoneCircle = undoHistory.value.pop()
  circles.value.push(undoneCircle)
  history.value.push(undoneCircle)
}

</script>

<template>
  <svg @click="onClick">
    <foreignObject x="0" y="40%" width="100%" height="200">
      <p class="tip" v-if="!circles.length">
        Click on the canvas to draw a circle. Click on a circle to select it.
        Right-click to unselect it.
      </p>
    </foreignObject>
    <circle v-for="circle in circles" :cx="circle.cx" :cy="circle.cy" :r="circle.r"
      :fill="circle === selected ? '#ccc' : '#fff'" @click="selected = circle" @contextmenu.prevent="selected = null">
    </circle>
  </svg>

  <div class="controls">
    <button @click="undo" :disabled="history.length <= 0">Undo</button>
    <button @click="redo" :disabled="undoHistory.length <= 0">Redo</button>
  </div>
</template>

<style>
body {
  margin: 0;
  overflow: hidden;
}

svg {
  width: 100%;
  height: 100vh;
  background-color: #eee;
}

circle {
  stroke: #000;
}

.controls {
  position: fixed;
  top: 10px;
  left: 0;
  right: 0;
  text-align: center;
}

.controls button+button {
  margin-left: 6px;
}

.tip {
  text-align: center;
  padding: 0 50px;
  color: #bbb;
}
</style>