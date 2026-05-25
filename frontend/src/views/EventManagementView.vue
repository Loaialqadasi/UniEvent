<script setup>
import { computed, onMounted, ref } from 'vue'

import EventCard from '../components/EventCard.vue'
import EventForm from '../components/EventForm.vue'
import { createEvent, fetchEventCategories, fetchEvents } from '../service/api'

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const statusMessage = ref('')
const events = ref([])
const categories = ref([])
const searchText = ref('')
const selectedCategory = ref('All')
const showForm = ref(false)

const visibleEvents = computed(() => {
  const query = searchText.value.trim().toLowerCase()

  return events.value.filter((item) => {
    const inCategory = selectedCategory.value === 'All' || item.category === selectedCategory.value
    const inSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.venue.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)

    return inCategory && inSearch
  })
})

const loadInitial = async () => {
  loading.value = true
  error.value = ''

  try {
    const [eventData, categoryData] = await Promise.all([fetchEvents(), fetchEventCategories()])
    events.value = eventData
    categories.value = categoryData
  } catch (err) {
    error.value = 'Unable to load events right now. Please refresh.'
  } finally {
    loading.value = false
  }
}

const onCreateEvent = async (payload) => {
  saving.value = true
  statusMessage.value = ''

  try {
    const created = await createEvent(payload)
    events.value = [created, ...events.value]
    statusMessage.value = 'Event published successfully.'
    showForm.value = false
  } catch (err) {
    statusMessage.value = 'Could not save event, please try again.'
  } finally {
    saving.value = false
  }
}

onMounted(loadInitial)
</script>

<template>
  <section class="view-head">
    <h1>Event Management</h1>
    <p>Manage university events, search quickly, and publish new listings with validation.</p>
  </section>

  <section class="event-layout">
    <div class="panel event-board">
      <div class="event-board__controls">
        <input
          v-model="searchText"
          class="input"
          type="search"
          placeholder="Search events, venue, description"
          aria-label="Search events"
        />

        <button class="button button--primary" type="button" @click="showForm = !showForm">
          {{ showForm ? 'Hide Form' : 'Add New Event' }}
        </button>
      </div>

      <div class="chips">
        <button
          v-for="category in categories"
          :key="category"
          class="chip"
          :class="{ 'chip--active': selectedCategory === category }"
          type="button"
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <p class="event-board__count">Showing {{ visibleEvents.length }} event(s)</p>

      <div v-if="loading" class="empty">Loading events...</div>
      <div v-else-if="error" class="empty">{{ error }}</div>
      <div v-else-if="!visibleEvents.length" class="empty">No events match your current filters.</div>
      <div v-else class="event-grid">
        <EventCard v-for="item in visibleEvents" :key="item.id" :event="item" />
      </div>
    </div>

    <EventForm v-model="showForm" :categories="categories.slice(1)" :busy="saving" @submit="onCreateEvent" />
  </section>

  <p v-if="statusMessage" class="status" :class="saving ? 'status--warn' : 'status--ok'">
    {{ statusMessage }}
  </p>
</template>

<style scoped>
.event-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: 1.8fr 1fr;
}

.event-board {
  padding: 18px;
}

.event-board__controls {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  margin-bottom: 14px;
}

.event-board__count {
  margin: 14px 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.event-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 1080px) {
  .event-layout {
    grid-template-columns: 1fr;
  }

  .event-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .event-board__controls {
    grid-template-columns: 1fr;
  }

  .event-grid {
    grid-template-columns: 1fr;
  }
}
</style>
