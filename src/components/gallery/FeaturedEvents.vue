<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { MapPin, Users, Clock, ArrowRight, CheckCircle, Loader2 } from 'lucide-vue-next'
import { authState, registerForEvent, isRegisteredForEvent } from '../../service/auth'
import axios from 'axios'

const isLoggedIn = computed(() => !!authState.user)

interface Event {
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
}

const allEvents = ref<Event[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await axios.get('/data/events.json')
    allEvents.value = response.data
  } catch (err) {
    console.error('Failed to fetch featured events:', err)
  } finally {
    isLoading.value = false
  }
})

// Show only the first 3 events as featured
const events = computed(() => allEvents.value.slice(0, 3))

const categoryBadge = (category: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    Technology: { bg: 'bg-blue-100', color: 'text-blue-700' },
    Career: { bg: 'bg-purple-100', color: 'text-purple-700' },
    Entertainment: { bg: 'bg-pink-100', color: 'text-pink-700' },
    Academic: { bg: 'bg-yellow-100', color: 'text-yellow-700' },
    Sports: { bg: 'bg-green-100', color: 'text-green-700' },
    Arts: { bg: 'bg-orange-100', color: 'text-orange-700' },
  }
  return map[category] || { bg: 'bg-gray-100', color: 'text-gray-700' }
}

const registeredEvents = ref<Set<string>>(new Set())

// Watch for events to load, then populate registeredEvents
onMounted(() => {
  setTimeout(() => {
    if (allEvents.value.length > 0) {
      registeredEvents.value = new Set(
        allEvents.value.filter(e => isRegisteredForEvent(String(e.id))).map(e => String(e.id))
      )
    }
  }, 200)
})

const registerMessage = ref<Record<string, { text: string; type: 'success' | 'error' }>>({})

const handleRegister = (eventId: number) => {
  const eventIdStr = String(eventId)
  const result = registerForEvent(eventIdStr)
  if (result.success) {
    registeredEvents.value.add(eventIdStr)
    registerMessage.value[eventIdStr] = { text: result.message, type: 'success' }
  } else {
    registerMessage.value[eventIdStr] = { text: result.message, type: 'error' }
  }
  setTimeout(() => {
    delete registerMessage.value[eventIdStr]
  }, 3000)
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <section class="w-full py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Featured Events</h2>
          <p class="text-gray-500 mt-1">Don't miss out on these popular events</p>
        </div>
        <router-link
          to="/gallery"
          class="text-indigo-600 font-medium text-sm flex items-center gap-1 no-underline hover:text-indigo-700 transition-colors"
        >
          View All <ArrowRight class="w-4 h-4" />
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <Loader2 class="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p class="text-gray-400 text-sm">Loading featured events...</p>
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="event in events"
          :key="event.id"
          class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <div class="relative h-48 overflow-hidden">
            <img
              :src="event.image_url"
              :alt="event.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <span
              :class="[categoryBadge(event.category).bg, categoryBadge(event.category).color]"
              class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold"
            >
              {{ event.category }}
            </span>
          </div>
          <div class="p-5">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ event.title }}</h3>
            <div class="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <span class="flex items-center gap-1.5">
                <Clock class="w-4 h-4 text-gray-400" /> {{ formatDate(event.date) }}
              </span>
              <span class="flex items-center gap-1.5">
                <MapPin class="w-4 h-4 text-gray-400" /> {{ event.location }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1.5 text-sm text-gray-400">
                <Users class="w-4 h-4" /> {{ event.attendees }} going
              </span>
              <button
                v-if="registeredEvents.has(String(event.id))"
                disabled
                class="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-sm font-medium px-4 py-2 rounded-lg border-none cursor-default"
              >
                <CheckCircle class="w-4 h-4" /> Registered
              </button>
              <button
                v-else
                @click.stop="handleRegister(event.id)"
                class="bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg border-none cursor-pointer hover:bg-indigo-600 transition-colors"
              >
                {{ isLoggedIn ? 'Register' : 'Sign In to Register' }}
              </button>
            </div>
            <!-- Success/Error Message -->
            <div v-if="registerMessage[String(event.id)]" class="mt-3 text-sm px-3 py-2 rounded-lg"
              :class="registerMessage[String(event.id)].type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'">
              {{ registerMessage[String(event.id)].text }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
