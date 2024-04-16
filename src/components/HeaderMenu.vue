<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router';

defineProps({
  title: {
    type: String,
    required: true
  },
  msg: {
    type: String,
    required: true
  }
})

const explicitItems = ref([
  {
    path: '/',
    name: 'dashboard',
    label: '대쉬보드',
    icon: 'pi pi-th-large',
  },
  {
    path: '/status',
    name: 'terminalStatus',
    label: '터미널 통신 현황',
    icon: 'pi pi-wave-pulse',
  },
  {
    path: '/management',
    name: 'terminalManagement',
    label: '터미널 관리',
    icon: 'pi pi-list',
  },
  {
    path: '/map',
    name: 'terminalMap',
    label: '터미널 지도',
    icon: 'pi pi-map',
  },
])

</script>

<template>
  <div class="container-header">
    <h1><a href="/">{{ title }}</a></h1>
    <Divider layout="vertical" />
    <h2>{{ msg }}</h2>
  </div>

  <!-- router link with menubar: using explicitly defined data -->
  <div class="menu-bar">
    <Menubar :model="explicitItems">
      <template #item="{ item, props, hasSubmenu }">
        <router-link v-if="item.path" v-slot="{ href, navigate }" :to="item.path" custom>
          <a :href="href" v-bind="props.action" @click="navigate">
            <span :class="item.icon" />
            &nbsp;
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
      </template>
    </Menubar>
  </div>

  <RouterView />
</template>

<style>
.container-header {
  display: flex;
  align-items: center;
}

.p-menubar {
  margin: 2px;
}

.p-menuitem-content {
  font-weight: bold;
}

.p-menuitem {
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin: 2px;
  padding: 2px;
}

@media (max-width: 1024px) {
  .container-header {
    display: none;
    justify-content: center;
  }

  .p-menubar-mobile {
    max-width: 50%;
    border: none;
    margin: 0;
    padding: 0;
  }

  .p-menubar-button {
    padding: 2px;
  }

  .p-menubar-root-list {
    flex-wrap: nowrap;
  }
}
</style>