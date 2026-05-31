<script setup lang="ts">
import { computed } from 'vue'
import { MapPin, Users, Clock, ArrowRight, CheckCircle } from 'lucide-vue-next'
import { authState, registerForEvent, isRegisteredForEvent } from '../../service/auth'
import { ref } from 'vue'

const isLoggedIn = computed(() => !!authState.user)

const events = [
  {
    id: 'tech-summit',
    title: 'Tech Innovation Summit 2026',
    date: 'Jun 15, 2026',
    location: 'Main Auditorium',
    attendees: '350+',
    image: '/images/event-tech.png',
    badge: 'Technology',
    badgeBg: 'bg-blue-100',
    badgeColor: 'text-blue-700',
  },
  {
    id: 'career-fair',
    title: 'Annual Career Fair 2026',
    date: 'Jul 2, 2026',
    location: 'Student Center Hall',
    attendees: '500',
    image: '/images/event-career.png',
    badge: 'Career',
    badgeBg: 'bg-purple-100',
    badgeColor: 'text-purple-700',
  },
  {
    id: 'music-festival',
    title: 'Music Festival Spring 2026',
    date: 'Aug 20, 2026',
    location: 'Campus Park',
    attendees: '1000+',
    image: '/images/event-music.png',
    badge: 'Entertainment',
    badgeBg: 'bg-pink-100',
    badgeColor: 'text-pink-700',
  },
]

const registeredEvents = ref<Set<string>>(new Set(
  events.filter(e => isRegisteredForEvent(e.id)).map(e => e.id)
))

const registerMessage = ref<Record<string, { text: string; type: 'success' | 'error' }>>({})

const handleRegister = (eventId: string) => {
  const result = registerForEvent(eventId)
  if (result.success) {
    registeredEvents.value.add(eventId)
    registerMessage.value[eventId] = { text: result.message, type: 'success' }
  } else {
    registerMessage.value[eventId] = { text: result.message, type: 'error' }
  }
  setTimeout(() => {
    delete registerMessage.value[eventId]
  }, 3000)
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

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="event in events"
          :key="event.id"
          class="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <div class="relative h-48 overflow-hidden">
            <img
              :src="event.image"
              :alt="event.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <span
              :class="[event.badgeBg, event.badgeColor]"
              class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold"
            >
              {{ event.badge }}
            </span>
          </div>
          <div class="p-5">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ event.title }}</h3>
            <div class="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <span class="flex items-center gap-1.5">
                <Clock class="w-4 h-4 text-gray-400" /> {{ event.date }}
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
                v-if="registeredEvents.has(event.id)"
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
                Register
              </button>
            </div>
            <!-- Success/Error Message -->
            <div v-if="registerMessage[event.id]" class="mt-3 text-sm px-3 py-2 rounded-lg"
              :class="registerMessage[event.id].type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'">
              {{ registerMessage[event.id].text }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
