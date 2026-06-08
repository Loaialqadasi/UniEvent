<script setup lang="ts">
import { CalendarDays, Users, MapPin, TrendingUp } from 'lucide-vue-next'

const stats = [
  { value: '48', label: 'Active Events', icon: CalendarDays, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { value: '12.5K', label: 'Total Attendees', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { value: '15', label: 'Campus Venues', icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: '+24%', label: 'This Month', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
]
</script>

<template>
  <section class="w-full py-16 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
      <div v-for="stat in stats" :key="stat.label" class="text-center">
        <div :class="[stat.bg, stat.color]" class="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3">
          <component :is="stat.icon" class="w-6 h-6" />
        </div>
        <div class="text-3xl font-bold text-gray-900">{{ stat.value }}</div>
        <div class="text-sm text-gray-500 mt-1">{{ stat.label }}</div>
      </div>
    </div>
  </section>
</template>
