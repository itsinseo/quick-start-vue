<script setup>
import { ref, watchEffect } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

import router from '@/router';

defineProps({
  title: {
    type: String,
    required: true
  }
});

const route = useRoute();

const pageTitle = ref('');

watchEffect(() => {
  pageTitle.value = route.meta.title;
});

const importedRoutes = ref(router.options.routes.filter(route => route.name));
</script>

<template>
  <div class="flex m-2">
    <a class="text-4xl text-primary font-bold" href="/">{{ title }}</a>
    <Divider layout="vertical" />
    <h2 class="text-2xl self-center">{{ pageTitle }}</h2>
  </div>

  <div class="menu-bar">
    <Menubar :model="importedRoutes">
      <template #item="{ item, props }">
        <router-link
          v-if="item.path"
          v-slot="{ href, navigate }"
          :to="item.path"
          custom
        >
          <a
            :href="href"
            v-bind="props.action"
            :class="item.path === route.fullPath ? 'selectedMenu' : ''"
            @click="navigate"
          >
            <span :class="item.meta?.icon" />
            <span class="ml-2">{{ item.meta?.title }}</span>
          </a>
        </router-link>
      </template>
    </Menubar>
  </div>

  <RouterView />
</template>

<style>
.selectedMenu {
  background-color: #2ba06f;
  color: white;
  border-radius: 10px;
}
</style>
