<template>
  <div class="min-h-screen bg-white">
    <!-- Top Bar -->
    <div class="border-b border-gray-100 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
        <div class="flex items-center gap-1">
          <span class="text-gray-500 text-sm font-medium">University Event Management System</span>
          <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
        </div>
        <div class="flex items-center gap-2">
          <button class="bg-primary-600 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-primary-700 transition-colors">Sign up with email</button>
          <button class="bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Navigation -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
            <span class="text-white font-bold text-sm">U</span>
          </div>
          <span class="text-lg font-semibold text-gray-900">UniEvents</span>
        </router-link>

        <!-- Nav Links (Desktop) -->
        <nav class="hidden md:flex items-center gap-8">
          <router-link to="/" class="flex items-center gap-1.5 text-sm font-medium transition-colors" :class="isNavActive('/') ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Home
          </router-link>
          <router-link to="/gallery" class="flex items-center gap-1.5 text-sm font-medium transition-colors" :class="isNavActive('/gallery') ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            Events
          </router-link>
          <router-link to="/dashboard" class="flex items-center gap-1.5 text-sm font-medium transition-colors" :class="isNavActive('/dashboard') ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Calendar
          </router-link>
          <router-link to="/dashboard" class="flex items-center gap-1.5 text-sm font-medium transition-colors" :class="isNavActive('/forum') ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            Forum
          </router-link>
        </nav>

        <!-- Sign In -->
        <button class="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors">
          Sign In
        </button>

        <!-- Mobile Menu Toggle -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-100 bg-white px-4 pb-3">
        <router-link to="/" class="block py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600" @click="mobileMenuOpen = false">Home</router-link>
        <router-link to="/gallery" class="block py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600" @click="mobileMenuOpen = false">Events</router-link>
        <router-link to="/dashboard" class="block py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600" @click="mobileMenuOpen = false">Calendar</router-link>
        <router-link to="/dashboard" class="block py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600" @click="mobileMenuOpen = false">Forum</router-link>
      </div>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const mobileMenuOpen = ref(false)
const route = useRoute()

function isNavActive(path) {
  if (path === '/') return route.path === '/' || route.path === '/gallery'
  return route.path === path
}
</script>
