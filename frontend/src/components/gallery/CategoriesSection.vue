<script setup lang="ts">
const categories = [
  { emoji: '📚', name: 'Academic', bg: 'bg-blue-50', color: 'text-blue-700', hoverBg: 'hover:bg-blue-100' },
  { emoji: '⚽', name: 'Sports', bg: 'bg-emerald-50', color: 'text-emerald-700', hoverBg: 'hover:bg-emerald-100' },
  { emoji: '🎨', name: 'Arts', bg: 'bg-pink-50', color: 'text-pink-700', hoverBg: 'hover:bg-pink-100' },
  { emoji: '💻', name: 'Technology', bg: 'bg-purple-50', color: 'text-purple-700', hoverBg: 'hover:bg-purple-100' },
  { emoji: '💼', name: 'Career', bg: 'bg-amber-50', color: 'text-amber-700', hoverBg: 'hover:bg-amber-100' },
  { emoji: '🎉', name: 'Entertainment', bg: 'bg-rose-50', color: 'text-rose-700', hoverBg: 'hover:bg-rose-100' },
]
</script>

<template>
  <section class="w-full py-16 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-2xl font-bold text-gray-900 mb-8">Event Categories</h2>
      <div class="flex flex-wrap gap-3">
        <router-link
          v-for="cat in categories"
          :key="cat.name"
          to="/gallery"
          :class="[cat.bg, cat.color, cat.hoverBg]"
          class="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium border-none cursor-pointer transition-all no-underline hover:shadow-sm"
        >
          <span class="text-lg">{{ cat.emoji }}</span>
          {{ cat.name }}
        </router-link>
      </div>
    </div>
  </section>
</template>
