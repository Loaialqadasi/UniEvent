<script setup lang="ts">
import { ArrowRight, Calendar } from 'lucide-vue-next'
</script>

<template>
  <section class="w-full relative overflow-hidden bg-gradient-to-br from-[#5E60CE] to-[#8B5CF6] py-24 px-4 sm:px-6 lg:px-8">
    <!-- Decorative elements -->
    <div class="absolute top-0 left-1/4 w-[400px] h-[400px] bg-white/[0.08] rounded-full blur-[80px]"></div>
    <div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-400/[0.1] rounded-full blur-[80px]"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/[0.05] rounded-full blur-[100px]"></div>

    <div class="relative max-w-7xl mx-auto text-center">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-white/80 text-sm font-medium mb-8 backdrop-blur-sm border border-white/10">
        <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
        48 events happening now
      </div>
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
        Discover Amazing<br />University Events
      </h1>
      <p class="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed">
        Join thousands of students in exciting campus activities, workshops, and social events. Your campus life starts here.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-4">
        <router-link
          to="/gallery"
          class="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-8 py-3.5 rounded-xl no-underline shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Browse Events
          <ArrowRight class="w-4 h-4" />
        </router-link>
        <router-link
          to="/gallery/calendar"
          class="inline-flex items-center gap-2 bg-white/15 text-white font-semibold px-8 py-3.5 rounded-xl no-underline border border-white/25 backdrop-blur-sm hover:bg-white/25 transition-all"
        >
          <Calendar class="w-4 h-4" />
          View Calendar
        </router-link>
      </div>
    </div>
  </section>
</template>
