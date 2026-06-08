<script setup>
import { computed, ref, provide } from 'vue'
import { useRoute } from 'vue-router'

import { authState } from './service/auth'
import AppHeader from './components/AppHeader.vue'
import Navbar from './components/dashboard/Navbar.vue'
import Footer from './components/shared/Footer.vue'
import CookieBanner from './components/shared/CookieBanner.vue'
import SignInDialog from './components/dashboard/SignInDialog.vue'

const route = useRoute()

// Routes that use the public-facing Navbar + Footer (Module C layout)
const publicRoutes = ['landing', 'gallery', 'gallery-calendar']

// Routes that hide the header entirely
const noHeaderRoutes = ['login', 'booking-success']

const isPublicLayout = computed(() => publicRoutes.includes(route.name))
const showHeader = computed(() =>
  !noHeaderRoutes.includes(route.name) &&
  !isPublicLayout.value
)
const showAppHeader = computed(() => showHeader.value && Boolean(authState.user))

// Modal state (used by Module C's SignInDialog)
const showSignIn = ref(false)
const cookieVisible = ref(true)

provide('openSignIn', () => { showSignIn.value = true })

const dismissCookie = () => { cookieVisible.value = false }
</script>

<template>
  <div :class="isPublicLayout ? 'min-h-screen flex flex-col bg-white' : 'app-shell'">

    <!-- Module C: Public Navbar (Landing / Gallery / Dashboard) -->
    <Navbar v-if="isPublicLayout" @sign-in="showSignIn = true" />

    <!-- Modules A & B: Authenticated App Header -->
    <AppHeader v-if="showAppHeader" />

    <!-- Main Content -->
    <main :class="isPublicLayout ? 'flex-1 w-full' : 'page-wrapper'">
      <RouterView />
    </main>

    <!-- Module C: Footer + Overlays (public layout only) -->
    <template v-if="isPublicLayout">
      <Footer />
      <CookieBanner v-if="cookieVisible" @dismiss="dismissCookie" />
      <SignInDialog :visible="showSignIn" @close="showSignIn = false" />
    </template>

  </div>
</template>
