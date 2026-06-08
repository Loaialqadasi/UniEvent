<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { ChevronLeft, ChevronRight, Clock, MapPin, CheckCircle, CalendarIcon } from 'lucide-vue-next'
import { authState, registerForEvent, unregisterFromEvent, isRegisteredForEvent } from '../service/auth'

const isLoggedIn = computed(() => !!authState.user)

const currentDate = ref(new Date())
const selectedDate = ref<number | null>(null)

const calendarMessages = ref<Record<string, { text: string; type: 'success' | 'error' }>>({})

const eventsByDate: Record<string, Array<{ id: string; title: string; time: string; location: string }>> = {
  '2026-06-15': [{ id: 'tech-summit', title: 'Tech Innovation Summit 2026', time: '9:00 AM - 5:00 PM', location: 'Main Auditorium' }],
  '2026-06-22': [{ id: 'ai-workshop', title: 'AI & Machine Learning Workshop', time: '2:00 PM - 5:00 PM', location: 'CS Lab 301' }],
  '2026-07-02': [{ id: 'career-fair', title: 'Annual Career Fair 2026', time: '10:00 AM - 4:00 PM', location: 'Student Center Hall' }],
  '2026-07-10': [{ id: 'basketball', title: 'Basketball Tournament', time: '8:00 AM - 6:00 PM', location: 'Sports Complex' }],
  '2026-07-15': [{ id: 'art-exhibit', title: 'Art Exhibition: Digital Horizons', time: '11:00 AM - 7:00 PM', location: 'Gallery Hall' }],
  '2026-08-05': [{ id: 'research-symposium', title: 'Research Symposium 2026', time: '9:00 AM - 3:00 PM', location: 'Science Block' }],
  '2026-08-12': [{ id: 'startup-pitch', title: 'Startup Pitch Night', time: '6:00 PM - 9:00 PM', location: 'Innovation Hub' }],
  '2026-08-20': [{ id: 'music-festival', title: 'Music Festival Spring 2026', time: '4:00 PM - 11:00 PM', location: 'Campus Park' }],
  '2026-08-25': [{ id: 'dance-festival', title: 'Cultural Dance Festival', time: '5:00 PM - 10:00 PM', location: 'Open Air Stage' }],
}

const registeredEvents = ref<Set<string>>(new Set(
  Object.values(eventsByDate).flat().filter(e => isRegisteredForEvent(e.id)).map(e => e.id)
))

const year = computed(() => currentDate.value.getFullYear())
const month = computed(() => currentDate.value.getMonth())

const monthName = computed(() => {
  return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' })
})

const daysInMonth = computed(() => {
  return new Date(year.value, month.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(year.value, month.value, 1).getDay()
})

const calendarDays = computed(() => {
  const days: Array<{ day: number; hasEvent: boolean; dateKey: string; isToday: boolean }> = []
  const today = new Date()

  for (let d = 1; d <= daysInMonth.value; d++) {
    const dateKey = `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isToday = today.getFullYear() === year.value && today.getMonth() === month.value && today.getDate() === d
    days.push({
      day: d,
      hasEvent: !!eventsByDate[dateKey],
      dateKey,
      isToday,
    })
  }
  return days
})

const selectedDateEvents = computed(() => {
  if (!selectedDate.value) return []
  const dateKey = `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(selectedDate.value).padStart(2, '0')}`
  return eventsByDate[dateKey] || []
})

const prevMonth = () => {
  currentDate.value = new Date(year.value, month.value - 1, 1)
  selectedDate.value = null
}

const nextMonth = () => {
  currentDate.value = new Date(year.value, month.value + 1, 1)
  selectedDate.value = null
}

const selectDate = (day: number) => {
  selectedDate.value = day
}

const openSignIn = inject<() => void>('openSignIn')

const handleRegister = (eventId: string) => {
  if (!isLoggedIn) {
    if (openSignIn) openSignIn()
    return
  }

  if (registeredEvents.value.has(eventId)) {
    const result = unregisterFromEvent(eventId)
    if (result.success) {
      registeredEvents.value.delete(eventId)
      calendarMessages.value[eventId] = { text: result.message, type: 'success' }
    } else {
      calendarMessages.value[eventId] = { text: result.message, type: 'error' }
    }
  } else {
    const result = registerForEvent(eventId)
    if (result.success) {
      registeredEvents.value.add(eventId)
      calendarMessages.value[eventId] = { text: result.message, type: 'success' }
    } else {
      calendarMessages.value[eventId] = { text: result.message, type: 'error' }
    }
  }

  setTimeout(() => {
    delete calendarMessages.value[eventId]
  }, 3000)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
        <p class="text-gray-500">View upcoming events on the calendar</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Calendar -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <!-- Month Navigation -->
          <div class="flex items-center justify-between mb-6">
            <button @click="prevMonth" class="p-2 hover:bg-gray-100 rounded-lg transition-colors bg-transparent border-none cursor-pointer">
              <ChevronLeft class="w-5 h-5 text-gray-600" />
            </button>
            <h2 class="text-xl font-semibold text-gray-900">{{ monthName }}</h2>
            <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-lg transition-colors bg-transparent border-none cursor-pointer">
              <ChevronRight class="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <!-- Day headers -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="text-center text-xs font-semibold text-gray-400 py-2">
              {{ day }}
            </div>
          </div>

          <!-- Calendar grid -->
          <div class="grid grid-cols-7 gap-1">
            <!-- Empty cells for offset -->
            <div v-for="n in firstDayOfMonth" :key="'empty-' + n" class="aspect-square"></div>
            <!-- Day cells -->
            <button
              v-for="day in calendarDays"
              :key="day.day"
              @click="selectDate(day.day)"
              class="aspect-square flex flex-col items-center justify-center rounded-xl text-sm relative transition-colors border-none cursor-pointer"
              :class="{
                'bg-indigo-500 text-white': selectedDate === day.day,
                'bg-indigo-50 text-indigo-600 font-semibold': day.isToday && selectedDate !== day.day,
                'hover:bg-gray-100 text-gray-700': selectedDate !== day.day && !day.isToday,
              }"
            >
              {{ day.day }}
              <div v-if="day.hasEvent" class="w-1.5 h-1.5 rounded-full mt-0.5" :class="selectedDate === day.day ? 'bg-white' : 'bg-indigo-400'"></div>
            </button>
          </div>
        </div>

        <!-- Events sidebar -->
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {{ selectedDate ? `Events on ${selectedDate}` : 'Select a date' }}
          </h3>

          <div v-if="selectedDateEvents.length > 0" class="space-y-4">
            <div
              v-for="(event, idx) in selectedDateEvents"
              :key="idx"
              class="p-4 bg-indigo-50 rounded-xl"
            >
              <h4 class="font-semibold text-gray-900 mb-2">{{ event.title }}</h4>
              <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Clock class="w-4 h-4" /> {{ event.time }}
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <MapPin class="w-4 h-4" /> {{ event.location }}
              </div>
              <button
                v-if="registeredEvents.has(event.id)"
                @click="handleRegister(event.id)"
                class="mt-3 w-full flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-600 text-sm font-medium py-2 rounded-lg border-none cursor-pointer hover:bg-emerald-100 transition-colors"
              >
                <CheckCircle class="w-4 h-4" /> Registered
              </button>
              <button
                v-else
                @click="handleRegister(event.id)"
                class="mt-3 w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg transition-colors border-none cursor-pointer"
              >
                {{ isLoggedIn ? 'Register' : 'Sign In to Register' }}
              </button>
              <!-- Message -->
              <div v-if="calendarMessages[event.id]" class="mt-2 text-sm px-3 py-2 rounded-lg"
                :class="calendarMessages[event.id].type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'">
                {{ calendarMessages[event.id].text }}
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <CalendarIcon class="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p class="text-sm text-gray-400">No events on this date</p>
          </div>

          <!-- Upcoming Events -->
          <div class="mt-6 pt-6 border-t border-gray-100">
            <h4 class="text-sm font-semibold text-gray-900 mb-3">Upcoming Events</h4>
            <div class="space-y-2">
              <div
                v-for="(events, dateKey) in eventsByDate"
                :key="dateKey"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs font-bold">
                  {{ dateKey.split('-')[2] }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ events[0].title }}</p>
                  <p class="text-xs text-gray-400">{{ dateKey }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
