<!--
Modal component with customizable slots and CSS transitions.
-->

<script setup>
import Modal from '@/components/Modal.vue'
import { ref } from 'vue'

const showModal = ref(false)


function hiFromChild() {
  alert("hello~ from child")
}

function hi() {
  alert("hello~")
}

</script>

<template>
  <button id="show-modal" @click="showModal = true">Show Modal</button>

  <Teleport to="body">
    <!-- use the modal component, pass in the prop -->
    <modal :show="showModal" @close="showModal = false" @hi-event="hiFromChild">
      <template #header>
        <h2>custom header</h2>
      </template>
      <template #body>
        <h3>custom body!</h3>
        <p>p tag custom body</p>
        <button @click="hi">hi~</button>
      </template>
    </modal>
  </Teleport>
</template>