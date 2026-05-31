<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from './components/AppHeader.vue'

import { authState } from './service/auth'

const route = useRoute()
const showHeader = computed(() => route.name !== 'login' && Boolean(authState.user))
</script>

<template>
  <div class="app-shell">
    <AppHeader v-if="showHeader" />

    <main class="page-wrapper">
      <RouterView />
    </main>
  </div>
</template>
