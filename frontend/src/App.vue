<script setup>
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <div class="app-shell">
    <AppHeader />

    <main class="page-wrapper">
      <RouterView />
    </main>
  </div>
</template>
