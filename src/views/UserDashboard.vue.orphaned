<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Dashboard Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <h1 class="text-2xl font-bold text-gray-900">User Dashboard</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage your events, tickets, and account</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div class="flex flex-col lg:flex-row gap-6">

        <!-- Sidebar -->
        <aside class="w-full lg:w-56 flex-shrink-0">
          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <!-- User Info -->
            <div class="p-4 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-white font-bold text-xs">L</span>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate">Loai AlQadasi</p>
                  <p class="text-[11px] text-gray-400">A23EC9010</p>
                </div>
              </div>
            </div>

            <!-- Nav Items -->
            <nav class="p-1.5">
              <button
                v-for="item in sidebarItems"
                :key="item.id"
                @click="activeSidebar = item.id"
                class="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                :class="activeSidebar === item.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'"
              >
                <component :is="item.iconComponent" class="w-4 h-4 flex-shrink-0" />
                <span>{{ item.label }}</span>
                <span
                  v-if="item.badge"
                  class="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                >{{ item.badge }}</span>
              </button>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 min-w-0">

          <!-- My Tickets View -->
          <div v-if="activeSidebar === 'tickets'">
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <!-- Tabs -->
              <div class="border-b border-gray-200 flex">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  class="px-5 py-3 text-sm font-medium border-b-2 transition-colors"
                  :class="activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'"
                >
                  {{ tab.label }}
                  <span
                    class="ml-1.5 px-1.5 py-0.5 rounded-full text-[11px]"
                    :class="activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'"
                  >{{ tab.id === 'upcoming' ? upcomingEvents.length : pastEvents.length }}</span>
                </button>
              </div>

              <!-- Upcoming Events -->
              <div v-if="activeTab === 'upcoming'" class="p-5">
                <div v-if="upcomingEvents.length === 0" class="text-center py-10">
                  <p class="text-gray-400 text-sm">No upcoming events</p>
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="event in upcomingEvents"
                    :key="event.id"
                    class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary-100 transition-colors"
                  >
                    <img :src="event.image_url" :alt="event.title" class="w-12 h-12 rounded-md object-cover flex-shrink-0"/>
                    <div class="flex-1 min-w-0">
                      <h3 class="text-sm font-semibold text-gray-900 truncate">{{ event.title }}</h3>
                      <p class="text-[11px] text-gray-400 mt-0.5">{{ formatDate(event.date) }} &bull; {{ event.time }}</p>
                    </div>
                    <div class="flex flex-col items-end gap-1 flex-shrink-0">
                      <span class="text-xs font-semibold" :class="event.price === 'Free' || event.price === 'Free Entry' ? 'text-green-600' : 'text-primary-600'">{{ event.price }}</span>
                      <span class="text-[11px] text-primary-500 font-medium">Confirmed</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Past Events -->
              <div v-if="activeTab === 'past'" class="p-5">
                <div v-if="pastEvents.length === 0" class="text-center py-10">
                  <p class="text-gray-400 text-sm">No past events</p>
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="event in pastEvents"
                    :key="event.id"
                    class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 opacity-60"
                  >
                    <img :src="event.image_url" :alt="event.title" class="w-12 h-12 rounded-md object-cover flex-shrink-0 grayscale"/>
                    <div class="flex-1 min-w-0">
                      <h3 class="text-sm font-semibold text-gray-600 truncate">{{ event.title }}</h3>
                      <p class="text-[11px] text-gray-400 mt-0.5">{{ formatDate(event.date) }}</p>
                    </div>
                    <div class="flex flex-col items-end gap-1 flex-shrink-0">
                      <span class="text-[11px] text-gray-400 font-medium">Attended</span>
                      <a href="#" class="text-[11px] text-primary-600 font-medium hover:underline">Leave Feedback</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notifications View -->
          <div v-if="activeSidebar === 'notifications'">
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 class="text-sm font-bold text-gray-900">Notifications</h2>
                <button @click="markAllRead" class="text-primary-600 text-xs font-medium hover:text-primary-700">Mark all read</button>
              </div>
              <div class="divide-y divide-gray-50">
                <div
                  v-for="notif in notifications"
                  :key="notif.id"
                  class="px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  :class="!notif.is_read ? 'bg-primary-50/30' : ''"
                >
                  <div class="flex items-start gap-2.5">
                    <div
                      class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      :class="notif.type === 'booking' ? 'bg-green-100' : notif.type === 'reminder' ? 'bg-yellow-100' : 'bg-blue-100'"
                    >
                      <svg v-if="notif.type === 'booking'" class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                      <svg v-else-if="notif.type === 'reminder'" class="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <svg v-else class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-gray-900">{{ notif.title }}</p>
                      <p class="text-[11px] text-gray-500 mt-0.5">{{ notif.message }}</p>
                      <p class="text-[11px] text-gray-300 mt-1">{{ notif.created_at }}</p>
                    </div>
                    <span v-if="!notif.is_read" class="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings View -->
          <div v-if="activeSidebar === 'settings'">
            <ProfileSettings />
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import axios from 'axios'
import ProfileSettings from '../components/ProfileSettings.vue'

const activeSidebar = ref('tickets')
const activeTab = ref('upcoming')

// Icon components (small 16px icons rendered via h())
const TicketIcon = {
  render() {
    return h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '2', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' })
    ])
  }
}
const BellIcon = {
  render() {
    return h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '2', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' })
    ])
  }
}
const SettingsIcon = {
  render() {
    return h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '2', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }),
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
    ])
  }
}

const sidebarItems = [
  { id: 'tickets', label: 'My Tickets', iconComponent: TicketIcon },
  { id: 'notifications', label: 'Notifications', badge: 3, iconComponent: BellIcon },
  { id: 'settings', label: 'Settings', iconComponent: SettingsIcon },
]

const tabs = [
  { id: 'upcoming', label: 'Upcoming Events' },
  { id: 'past', label: 'Past Events' },
]

const allEvents = ref([])

async function fetchEvents() {
  try {
    const response = await axios.get('/data/events.json')
    allEvents.value = response.data
  } catch (err) {
    console.error('Failed to fetch events:', err)
  }
}

const upcomingEvents = computed(() => allEvents.value.slice(0, 4))
const pastEvents = computed(() => allEvents.value.slice(4).map(e => ({ ...e, date: '2026-04-10' })))

const notifications = ref([
  { id: 1, title: 'Booking Confirmed', message: 'Your ticket for Tech Innovation Summit 2026 has been confirmed.', type: 'booking', is_read: false, created_at: '2 hours ago' },
  { id: 2, title: 'Event Reminder', message: 'Art Exhibition starts tomorrow at 10:00 AM.', type: 'reminder', is_read: false, created_at: '5 hours ago' },
  { id: 3, title: 'Event Update', message: 'Basketball Championship venue changed to Main Sports Complex.', type: 'update', is_read: false, created_at: '1 day ago' },
  { id: 4, title: 'Payment Successful', message: 'Payment of RM 25 for Music Festival was successful.', type: 'booking', is_read: true, created_at: '2 days ago' },
  { id: 5, title: 'Event Reminder', message: 'Annual Career Fair 2026 is in 3 days.', type: 'reminder', is_read: true, created_at: '3 days ago' },
])

function markAllRead() {
  notifications.value.forEach(n => n.is_read = true)
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => fetchEvents())
</script>
