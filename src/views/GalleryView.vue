<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Search, MapPin, Clock, Users, CheckCircle, Loader2, Ticket } from 'lucide-vue-next'
import { authState, registerForEvent, unregisterFromEvent, isRegisteredForEvent } from '../service/auth'

const router = useRouter()
const searchQuery = ref('')
const selectedCategory = ref('All')
const sortBy = ref('date')
const isLoading = ref(true)
const fetchError = ref('')

const categories = ['All', 'Technology', 'Career', 'Academic', 'Sports', 'Arts', 'Entertainment']

// Events array - loaded asynchronously from events.json via Axios
const events = ref<Array<{
  id: number
  title: string
  date: string
  time: string
  location: string
  attendees: number
  category: string
  price: string
  image_url: string
  description: string
}>>([])

// ---- ASYNC DATA FETCHING WITH AXIOS ----
onMounted(async () => {
  try {
    isLoading.value = true
    fetchError.value = ''

    // Async Axios GET request to fetch event data from events.json
    const response = await axios.get('/data/events.json')

    // The response.data is a flat array of events
    events.value = response.data

    console.log('Events loaded via Axios:', events.value.length, 'events fetched')
  } catch (error: any) {
    console.error('Failed to fetch events:', error)
    fetchError.value = 'Failed to load events. Please try again later.'
  } finally {
    isLoading.value = false
  }
})

// Registered events set - initialized after events load to avoid race condition
const registeredEvents = ref<Set<string>>(new Set())

// Watch for events to load, then populate registeredEvents
watch(events, (newEvents) => {
  if (newEvents.length > 0) {
    registeredEvents.value = new Set(
      newEvents.filter(e => isRegisteredForEvent(String(e.id))).map(e => String(e.id))
    )
  }
}, { immediate: true })

const eventMessages = ref<Record<string, { text: string; type: 'success' | 'error' }>>({})

const filteredEvents = computed(() => {
  let result = [...events.value]

  // Category filter
  if (selectedCategory.value !== 'All') {
    result = result.filter(e => e.category === selectedCategory.value)
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    )
  }

  // Sort
  if (sortBy.value === 'date') {
    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } else if (sortBy.value === 'popular') {
    result.sort((a, b) => b.attendees - a.attendees)
  } else if (sortBy.value === 'priceLow') {
    result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
  }

  return result
})

const isLoggedIn = computed(() => !!authState.user)

const openSignIn = inject<() => void>('openSignIn')

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function parsePrice(s: string) {
  if (s === 'Free' || s === 'Free Entry') return 0
  const n = parseFloat(s.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : n
}

function categoryBadgeClass(cat: string) {
  return {
    Technology: 'bg-blue-100 text-blue-700',
    Career: 'bg-purple-100 text-purple-700',
    Academic: 'bg-yellow-100 text-yellow-700',
    Sports: 'bg-green-100 text-green-700',
    Arts: 'bg-pink-100 text-pink-700',
    Entertainment: 'bg-orange-100 text-orange-700',
  }[cat] || 'bg-gray-100 text-gray-700'
}

const handleRegister = (eventId: number) => {
  const eventIdStr = String(eventId)
  if (!isLoggedIn.value) {
    if (openSignIn) openSignIn()
    return
  }

  if (registeredEvents.value.has(eventIdStr)) {
    const result = unregisterFromEvent(eventIdStr)
    if (result.success) {
      registeredEvents.value.delete(eventIdStr)
      eventMessages.value[eventIdStr] = { text: result.message, type: 'success' }
    } else {
      eventMessages.value[eventIdStr] = { text: result.message, type: 'error' }
    }
  } else {
    const result = registerForEvent(eventIdStr)
    if (result.success) {
      registeredEvents.value.add(eventIdStr)
      eventMessages.value[eventIdStr] = { text: result.message, type: 'success' }
    } else {
      eventMessages.value[eventIdStr] = { text: result.message, type: 'error' }
    }
  }

  setTimeout(() => {
    delete eventMessages.value[eventIdStr]
  }, 3000)
}

const goToEventDetails = (eventId: number) => {
  if (!isLoggedIn.value) {
    if (openSignIn) openSignIn()
    return
  }
  router.push(`/manage-events/${eventId}`)
}
</script>

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
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search events, venues..."
            class="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-colors"
          />
        </div>
        <!-- Sort Dropdown -->
        <select
          v-model="sortBy"
          class="py-2.5 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white cursor-pointer min-w-[160px]"
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
          @click="selectedCategory = cat"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 border-none cursor-pointer"
          :class="selectedCategory === cat
            ? 'bg-indigo-500 text-white shadow-sm'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'"
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

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <Loader2 class="w-10 h-10 text-indigo-500 animate-spin mb-4" />
      <p class="text-gray-500 text-sm">Loading events...</p>
      <p class="text-gray-400 text-xs mt-1">Fetching data via Axios</p>
    </div>

    <!-- Error State -->
    <div v-else-if="fetchError" class="text-center py-16">
      <p class="text-red-500 text-sm">{{ fetchError }}</p>
      <button
        @click="() => location.reload()"
        class="mt-3 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm border-none cursor-pointer hover:bg-indigo-600"
      >
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredEvents.length === 0" class="text-center py-16">
      <Search class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
      <p class="text-gray-500">Try adjusting your search or filters</p>
    </div>

    <!-- Event Cards Grid -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-indigo-100 transition-all duration-200 group"
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
            <!-- Registered badge overlay -->
            <div
              v-if="registeredEvents.has(String(event.id))"
              class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500 text-white flex items-center gap-1"
            >
              <CheckCircle class="w-3 h-3" /> Registered
            </div>
          </div>

          <!-- Card Body -->
          <div class="p-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {{ event.title }}
            </h3>
            <div class="flex items-center text-xs text-gray-500 mb-1">
              <Clock class="w-3.5 h-3.5 mr-1 text-gray-400 flex-shrink-0" />
              <span>{{ formatDate(event.date) }} &bull; {{ event.time }}</span>
            </div>
            <div class="flex items-center text-xs text-gray-500 mb-3">
              <MapPin class="w-3.5 h-3.5 mr-1 text-gray-400 flex-shrink-0" />
              <span class="line-clamp-1">{{ event.location }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-400 flex items-center gap-1">
                <Users class="w-3 h-3" /> {{ event.attendees }} attending
              </span>
              <span class="text-xs font-semibold" :class="event.price === 'Free' || event.price === 'Free Entry' ? 'text-green-600' : 'text-indigo-600'">
                {{ event.price }}
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="mt-3 flex gap-2">
              <!-- View Details & Book - primary action -->
              <button
                @click="goToEventDetails(event.id)"
                class="flex-1 py-2 rounded-lg bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-600 transition-colors border-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Ticket class="w-3.5 h-3.5" /> Book Tickets
              </button>
              <!-- Register/Unregister toggle -->
              <button
                v-if="registeredEvents.has(String(event.id))"
                @click.stop="handleRegister(event.id)"
                class="py-2 px-3 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold border-none cursor-pointer hover:bg-emerald-100 transition-colors"
                title="Click to unregister"
              >
                <CheckCircle class="w-3.5 h-3.5" />
              </button>
              <button
                v-else
                @click.stop="handleRegister(event.id)"
                class="py-2 px-3 rounded-lg bg-gray-50 text-gray-500 text-xs font-semibold border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                title="Quick register"
              >
                Register
              </button>
            </div>

            <!-- Message -->
            <div v-if="eventMessages[String(event.id)]" class="mt-2 text-xs px-3 py-1.5 rounded-lg"
              :class="eventMessages[String(event.id)].type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'">
              {{ eventMessages[String(event.id)].text }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
