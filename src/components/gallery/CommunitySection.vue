<script setup lang="ts">
import { MessageCircle } from 'lucide-vue-next'
</script>

<template>
  <section class="w-full py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
    <div class="max-w-7xl mx-auto text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Join the Community</h2>
      <p class="text-gray-500 max-w-lg mx-auto mb-8 leading-relaxed">
        Connect with fellow students, share your experiences, and stay updated on the latest campus happenings.
      </p>
      <router-link
        to="/forum"
        class="inline-flex items-center gap-2 bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl no-underline hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200"
      >
        <MessageCircle class="w-5 h-5" />
        Visit Forum
      </router-link>
    </div>
  </section>
</template>
