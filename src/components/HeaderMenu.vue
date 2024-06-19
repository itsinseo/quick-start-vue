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
  <div class="container-header">
    <h1>
      <a href="/">{{ title }}</a>
    </h1>
    <Divider layout="vertical" />
    <h2 class="page-title">{{ pageTitle }}</h2>
  </div>

  <div class="menu-bar">
    <Menubar :model="importedRoutes">
      <template #item="{ item, props, hasSubmenu }">
        <router-link
          v-if="item.path"
          v-slot="{ href, navigate }"
          :to="item.path"
          custom
        >
          <a :href="href" v-bind="props.action" @click="navigate">
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
  /* border: 1px solid #e2e8f0; */
  margin: 2px;
  padding: 2px;
}

@media (max-width: 960px) {
  .container-header > *:not(.page-title) {
    display: none;
  }

  .page-title {
    position: absolute;
    top: 0;
    right: 1rem;
  }

  .p-menubar-mobile {
    max-width: 50%;
    border: none;
    margin-bottom: 1rem;
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
