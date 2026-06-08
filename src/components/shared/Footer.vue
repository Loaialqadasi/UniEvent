<script setup lang="ts">
const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'Events', path: '/gallery' },
  { name: 'Calendar', path: '/gallery/calendar' },
  { name: 'Forum', path: '/forum' },
  { name: 'Dashboard', path: '/dashboard' },
]

const categories = ['Academic', 'Sports', 'Arts', 'Technology', 'Career', 'Entertainment']
const support = ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service']
</script>

<template>
  <footer class="w-full bg-gray-900 text-gray-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Brand -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">U</span>
            </div>
            <span class="text-xl font-bold text-white">UniEvents</span>
          </div>
          <p class="text-sm text-gray-400 leading-relaxed">
            Your gateway to amazing university events. Discover, connect, and engage with campus life.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-sm font-semibold text-white mb-4">Quick Links</h3>
          <ul class="list-none p-0 m-0 flex flex-col gap-2">
            <li v-for="link in quickLinks" :key="link.name">
              <router-link :to="link.path" class="text-sm text-gray-400 no-underline hover:text-white transition-colors">
                {{ link.name }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Categories -->
        <div>
          <h3 class="text-sm font-semibold text-white mb-4">Categories</h3>
          <ul class="list-none p-0 m-0 flex flex-col gap-2">
            <li v-for="cat in categories" :key="cat">
              <span class="text-sm text-gray-400">{{ cat }}</span>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h3 class="text-sm font-semibold text-white mb-4">Support</h3>
          <ul class="list-none p-0 m-0 flex flex-col gap-2">
            <li v-for="item in support" :key="item">
              <a href="#" class="text-sm text-gray-400 no-underline hover:text-white transition-colors">{{ item }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-800 mt-8 pt-8 text-center">
        <p class="text-sm text-gray-500">&copy; 2026 UniEvents. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>
