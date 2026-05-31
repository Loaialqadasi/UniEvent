<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import { Home, Search, Calendar, MessageCircle, ChevronDown, HelpCircle, LogOut, User, LayoutDashboard } from 'lucide-vue-next'
import { authState, logout } from '../../service/auth'

const emit = defineEmits(['sign-in'])
const route = useRoute()
const isLoggedIn = computed(() => !!authState.user)
const userName = computed(() => authState.user?.name || '')
const userAvatar = computed(() => authState.user?.avatar || '')
const userAvatarColor = computed(() => authState.user?.avatarColor || 'bg-indigo-500')
const userRole = computed(() => authState.user?.role || 'student')

const mobileMenuOpen = ref(false)
const profileDropdown = ref(false)

const navItems = [
  { name: 'Home', icon: Home, path: '/' },
  { name: 'Events', icon: Search, path: '/gallery' },
  { name: 'Calendar', icon: Calendar, path: '/gallery/calendar' },
  { name: 'Forum', icon: MessageCircle, path: '/forum' },
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
]

const isActive = (path: string) => {
  return route.path === path
}

const handleSignOut = () => {
  logout()
  profileDropdown.value = false
}
</script>

<template>
  <header class="w-full">
    <!-- Top Bar -->
    <div class="w-full bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10">
        <div class="flex items-center gap-1 text-[13px] text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
          <span>University Event Management System</span>
          <ChevronDown class="w-3 h-3" />
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="!isLoggedIn"
            @click="emit('sign-in')"
            class="text-[13px] font-medium text-indigo-600 px-3 py-1 rounded-md border border-indigo-200 bg-white hover:border-indigo-300 hover:text-indigo-700 transition-all cursor-pointer"
          >
            Sign up with email
          </button>
          <button class="text-gray-400 hover:text-gray-600 bg-none border-none cursor-pointer">
            <HelpCircle class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Navbar -->
    <nav class="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2 no-underline">
          <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">U</span>
          </div>
          <span class="text-xl font-bold text-gray-900">UniEvents</span>
        </router-link>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-1">
          <router-link
            v-for="item in navItems"
            :key="item.name"
            :to="item.path"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all no-underline"
            :class="isActive(item.path) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
          >
            <component :is="item.icon" class="w-4 h-4" />
            {{ item.name }}
          </router-link>
        </div>

        <!-- Sign In / User Menu -->
        <div class="flex items-center gap-3">
          <template v-if="!isLoggedIn">
            <button
              @click="emit('sign-in')"
              class="bg-indigo-500 text-white text-sm font-medium px-5 py-2 rounded-lg border-none cursor-pointer hover:bg-indigo-600 transition-colors"
            >
              Sign In
            </button>
          </template>
          <template v-else>
            <div class="relative">
              <button
                @click="profileDropdown = !profileDropdown"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border-none bg-white cursor-pointer"
              >
                <div :class="userAvatarColor" class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {{ userAvatar }}
                </div>
                <span class="text-sm font-medium text-gray-700 hidden sm:inline">{{ userName }}</span>
                <ChevronDown class="w-3.5 h-3.5 text-gray-400" />
              </button>
              <!-- Dropdown -->
              <div
                v-if="profileDropdown"
                class="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
              >
                <div class="px-4 py-2 border-b border-gray-100">
                  <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
                  <p class="text-xs text-gray-400">{{ userRole === 'organizer' ? 'Organizer' : 'Student' }}</p>
                </div>
                <router-link
                  to="/dashboard"
                  @click="profileDropdown = false"
                  class="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 cursor-pointer no-underline"
                >
                  <LayoutDashboard class="w-4 h-4" /> Dashboard
                </router-link>
                <router-link
                  to="/dashboard"
                  @click="profileDropdown = false"
                  class="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 cursor-pointer no-underline"
                >
                  <User class="w-4 h-4" /> My Profile
                </router-link>
                <button
                  @click="handleSignOut"
                  class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                >
                  <LogOut class="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </template>

          <!-- Mobile Toggle -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-lg border-none bg-transparent cursor-pointer text-gray-500"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-100 bg-white px-4 py-3">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium no-underline"
          :class="isActive(item.path) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500'"
          @click="mobileMenuOpen = false"
        >
          <component :is="item.icon" class="w-5 h-5" />
          {{ item.name }}
        </router-link>
      </div>
    </nav>
  </header>
</template>
