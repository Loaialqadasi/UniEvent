<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isMenuOpen = ref(false)

watch(
  () => route.path,
  () => {
    isMenuOpen.value = false
  }
)
</script>

<template>
  <header class="top-nav">
    <div class="top-nav__inner">
      <RouterLink to="/events" class="brand">
        <span class="brand__badge">UE</span>
        <span>UniEvents</span>
      </RouterLink>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="isMenuOpen"
        aria-controls="main-menu"
        @click="isMenuOpen = !isMenuOpen"
      >
        {{ isMenuOpen ? 'Close' : 'Menu' }}
      </button>

      <nav id="main-menu" class="menu" :class="{ 'menu--open': isMenuOpen }" aria-label="Main navigation">
        <RouterLink to="/events" class="menu__item">Events</RouterLink>
        <RouterLink to="/calendar" class="menu__item">Calendar</RouterLink>
        <RouterLink to="/notifications" class="menu__item">Notifications</RouterLink>
      </nav>
    </div>
  </header>
</template>
