<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { authState, logout } from '../service/auth'

const route = useRoute()
const router = useRouter()
const isMenuOpen = ref(false)

const currentUser = computed(() => authState.user)

const onLogout = async () => {
  logout()
  isMenuOpen.value = false
  await router.replace('/login')
}

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
        <RouterLink to="/bookings" class="menu__item">My Bookings</RouterLink>
        <RouterLink to="/calendar" class="menu__item">Calendar</RouterLink>
        <RouterLink to="/notifications" class="menu__item">Notifications</RouterLink>
        <span v-if="currentUser" class="menu__role">
          {{ currentUser.role === 'organizer' ? 'Organizer' : 'Student' }}
        </span>
        <button class="button button--secondary menu__logout" type="button" @click="onLogout">
          Logout
        </button>
      </nav>
    </div>
  </header>
</template>
