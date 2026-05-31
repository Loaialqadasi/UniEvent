<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from 'vue'
import axios from 'axios'
import { Search, MapPin, Clock, Users, CheckCircle, Loader2 } from 'lucide-vue-next'
import { authState, registerForEvent, unregisterFromEvent, isRegisteredForEvent } from '../service/auth'

const searchQuery = ref('')
const selectedCategory = ref('All')
const isLoading = ref(true)
const fetchError = ref('')

const categories = ['All', 'Academic', 'Sports', 'Arts', 'Technology', 'Career', 'Entertainment']

// Events array - initially empty, loaded asynchronously via Axios
const events = ref<Array<{
  id: string
  title: string
  date: string
  location: string
  attendees: string
  category: string
  image: string
}>>([])

// ---- ASYNC DATA FETCHING WITH AXIOS ----
onMounted(async () => {
  try {
    isLoading.value = true
    fetchError.value = ''

    // Async Axios GET request to fetch event data from JSON file
    const response = await axios.get('/data/mockData.json')

    // The response.data contains the full JSON object
    // We extract the events array from it
    events.value = response.data.events

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
      newEvents.filter(e => isRegisteredForEvent(e.id)).map(e => e.id)
    )
  }
}, { immediate: true })

const eventMessages = ref<Record<string, { text: string; type: 'success' | 'error' }>>({})

const filteredEvents = computed(() => {
  return events.value.filter(e => {
    const matchCategory = selectedCategory.value === 'All' || e.category === selectedCategory.value
    const matchSearch = e.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchCategory && matchSearch
  })
})

const isLoggedIn = computed(() => !!authState.user)

const openSignIn = inject<() => void>('openSignIn')

const handleRegister = (eventId: string) => {
  if (!isLoggedIn.value) {
    if (openSignIn) openSignIn()
    return
  }

  if (registeredEvents.value.has(eventId)) {
    const result = unregisterFromEvent(eventId)
    if (result.success) {
      registeredEvents.value.delete(eventId)
      eventMessages.value[eventId] = { text: result.message, type: 'success' }
    } else {
      eventMessages.value[eventId] = { text: result.message, type: 'error' }
    }
  } else {
    const result = registerForEvent(eventId)
    if (result.success) {
      registeredEvents.value.add(eventId)
      eventMessages.value[eventId] = { text: result.message, type: 'success' }
    } else {
      eventMessages.value[eventId] = { text: result.message, type: 'error' }
    }
  }

  setTimeout(() => {
    delete eventMessages.value[eventId]
  }, 3000)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Events</h1>
        <p class="text-gray-500">Discover and register for upcoming university events</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search -->
      <div class="relative mb-6">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search events by name or location..."
          class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
        />
      </div>

      <!-- Category Filters -->
      <div class="flex flex-wrap gap-2 mb-8">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          class="px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all border-none"
          :class="selectedCategory === cat
            ? 'bg-indigo-500 text-white shadow-sm'
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Loading State (Async Fetch Indicator) -->
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

      <!-- Events Grid - Responsive: 1 col mobile, 2 col tablet, 3 col desktop -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="h-44 overflow-hidden">
            <img :src="event.image" :alt="event.title" class="w-full h-full object-cover" />
          </div>
          <div class="p-5">
            <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mb-3">
              {{ event.category }}
            </span>
            <h3 class="text-base font-semibold text-gray-900 mb-3">{{ event.title }}</h3>
            <div class="flex flex-col gap-1.5 text-sm text-gray-500 mb-4">
              <span class="flex items-center gap-2"><Clock class="w-4 h-4 text-gray-400" /> {{ event.date }}</span>
              <span class="flex items-center gap-2"><MapPin class="w-4 h-4 text-gray-400" /> {{ event.location }}</span>
              <span class="flex items-center gap-2"><Users class="w-4 h-4 text-gray-400" /> {{ event.attendees }} going</span>
            </div>
            <button
              v-if="registeredEvents.has(event.id)"
              @click="handleRegister(event.id)"
              class="w-full flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-600 text-sm font-medium py-2.5 rounded-lg border-none cursor-pointer hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle class="w-4 h-4" /> Registered (Click to Unregister)
            </button>
            <button
              v-else
              @click="handleRegister(event.id)"
              class="w-full bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg border-none cursor-pointer hover:bg-indigo-600 transition-colors"
            >
              {{ isLoggedIn ? 'Register' : 'Sign In to Register' }}
            </button>
            <!-- Message -->
            <div v-if="eventMessages[event.id]" class="mt-3 text-sm px-3 py-2 rounded-lg"
              :class="eventMessages[event.id].type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'">
              {{ eventMessages[event.id].text }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && !fetchError && filteredEvents.length === 0" class="text-center py-16">
        <Search class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
        <p class="text-gray-500">Try adjusting your search or filters</p>
      </div>
    </div>
  </div>
</template>
