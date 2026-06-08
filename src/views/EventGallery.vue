<template>
  <div class="min-h-screen bg-white">
    <!-- Page Header -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
      <h1 class="text-2xl font-bold text-gray-900">All Events</h1>
      <p class="text-sm text-gray-500 mt-1">Discover and book tickets for university events</p>
    </div>

    <!-- Search & Filters -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <!-- Search Bar -->
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search events, venues..."
            class="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-colors"
          />
        </div>
        <!-- Sort Dropdown -->
        <select
          v-model="sortBy"
          class="py-2.5 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white cursor-pointer min-w-[160px]"
        >
          <option value="date">Sort by Date</option>
          <option value="popular">Most Popular</option>
          <option value="priceLow">Price: Low to High</option>
        </select>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex flex-wrap items-center gap-2 mt-3">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeCategory = cat"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
          :class="activeCategory === cat
            ? 'bg-primary-600 text-white shadow-sm'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Event Count -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 pb-3">
      <p class="text-sm text-gray-500">
        Showing <span class="font-semibold text-gray-700">{{ filteredEvents.length }}</span> events
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-2">
        <svg class="animate-spin h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
        <p class="text-gray-400 text-sm">Loading events...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <p class="text-red-500 font-medium text-sm">{{ error }}</p>
      <button @click="fetchEvents" class="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Try Again</button>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredEvents.length === 0" class="text-center py-20">
      <p class="text-gray-500 font-medium">No events found</p>
      <p class="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
    </div>

    <!-- Event Cards Grid -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary-100 transition-all duration-200 group"
        >
          <!-- Image -->
          <div class="relative overflow-hidden">
            <img
              :src="event.image_url"
              :alt="event.title"
              class="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <span
              class="absolute top-2 right-2 px-2 py-0.5 rounded text-[11px] font-semibold"
              :class="categoryBadgeClass(event.category)"
            >
              {{ event.category }}
            </span>
          </div>

          <!-- Card Body -->
          <div class="p-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-1.5 group-hover:text-primary-600 transition-colors line-clamp-1">
              {{ event.title }}
            </h3>
            <div class="flex items-center text-xs text-gray-500 mb-1">
              <svg class="w-3.5 h-3.5 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span>{{ formatDate(event.date) }} &bull; {{ event.time }}</span>
            </div>
            <div class="flex items-center text-xs text-gray-500 mb-3">
              <svg class="w-3.5 h-3.5 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span>{{ event.location }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-400">{{ event.attendees }} attending</span>
              <span class="text-xs font-semibold" :class="event.price === 'Free' || event.price === 'Free Entry' ? 'text-green-600' : 'text-primary-600'">
                {{ event.price }}
              </span>
            </div>
            <!-- View Details Button (Figma) -->
            <button class="mt-3 w-full py-2 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const events = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const activeCategory = ref('All')
const sortBy = ref('date')

const categories = ['All', 'Technology', 'Career', 'Academic', 'Sports', 'Arts', 'Entertainment']

async function fetchEvents() {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get('/data/events.json')
    events.value = response.data
  } catch (err) {
    error.value = err.message || 'Failed to load events.'
  } finally {
    loading.value = false
  }
}

const filteredEvents = computed(() => {
  let result = [...events.value]
  if (activeCategory.value !== 'All') {
    result = result.filter(e => e.category === activeCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    )
  }
  if (sortBy.value === 'date') result.sort((a, b) => new Date(a.date) - new Date(b.date))
  else if (sortBy.value === 'popular') result.sort((a, b) => b.attendees - a.attendees)
  else if (sortBy.value === 'priceLow') result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
  return result
})

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function parsePrice(s) {
  if (s === 'Free' || s === 'Free Entry') return 0
  const n = parseFloat(s.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : n
}
function categoryBadgeClass(cat) {
  return {
    Technology: 'bg-blue-100 text-blue-700',
    Career: 'bg-purple-100 text-purple-700',
    Academic: 'bg-yellow-100 text-yellow-700',
    Sports: 'bg-green-100 text-green-700',
    Arts: 'bg-pink-100 text-pink-700',
    Entertainment: 'bg-orange-100 text-orange-700',
  }[cat] || 'bg-gray-100 text-gray-700'
}

onMounted(() => fetchEvents())
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
