<script setup>
import { computed, onMounted, ref } from 'vue'

import { fetchEvents } from '../service/api'

const events = ref([])
const loading = ref(true)
const mode = ref('month')
const selectedDate = ref('')
const currentMonth = ref(new Date(2026, 4, 1))

const categoryColors = {
  Technology: '#3b82f6',
  Career: '#22c55e',
  Academic: '#a855f7',
  Sports: '#f97316',
  Arts: '#6366f1',
  Entertainment: '#ec4899',
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const todayIso = new Date().toISOString().slice(0, 10)

const monthLabel = computed(() =>
  currentMonth.value.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })
)

const eventsByDate = computed(() => {
  return events.value.reduce((map, event) => {
    if (!map[event.date]) {
      map[event.date] = []
    }

    map[event.date].push(event)
    return map
  }, {})
})

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startWeekday = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const previousMonthLastDay = new Date(year, month, 0).getDate()

  const days = []

  for (let i = 0; i < startWeekday; i += 1) {
    const dayNumber = previousMonthLastDay - startWeekday + i + 1
    const dateObj = new Date(year, month - 1, dayNumber)
    const date = dateObj.toISOString().slice(0, 10)

    days.push({
      day: dayNumber,
      date,
      inCurrentMonth: false,
      events: eventsByDate.value[date] ?? [],
      isToday: date === todayIso,
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateObj = new Date(year, month, day)
    const date = dateObj.toISOString().slice(0, 10)

    days.push({
      day,
      date,
      inCurrentMonth: true,
      events: eventsByDate.value[date] ?? [],
      isToday: date === todayIso,
    })
  }

  const trailingCells = 42 - days.length
  for (let day = 1; day <= trailingCells; day += 1) {
    const dateObj = new Date(year, month + 1, day)
    const date = dateObj.toISOString().slice(0, 10)

    days.push({
      day,
      date,
      inCurrentMonth: false,
      events: eventsByDate.value[date] ?? [],
      isToday: date === todayIso,
    })
  }

  return days
})

const selectedEvents = computed(() => {
  if (!selectedDate.value) {
    return []
  }

  return eventsByDate.value[selectedDate.value] ?? []
})

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) {
    return 'No date selected'
  }

  const date = new Date(`${selectedDate.value}T00:00:00`)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
})

const eventCategories = computed(() => Object.keys(categoryColors))

const startTimeOnly = (time) => {
  if (!time) {
    return '-'
  }

  return time.split('-')[0].trim()
}

const isSelected = (date) => date && date === selectedDate.value

const badgeColor = (category) => {
  return categoryColors[category] ?? '#64748b'
}

const changeMonth = (value) => {
  const next = new Date(currentMonth.value)
  next.setMonth(next.getMonth() + value)
  currentMonth.value = new Date(next.getFullYear(), next.getMonth(), 1)
}

onMounted(async () => {
  try {
    events.value = await fetchEvents()
    selectedDate.value = events.value[0]?.date ?? ''
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="view-head">
    <h1>Event Calendar</h1>
    <p>View all upcoming events in calendar format.</p>
  </section>

  <section class="panel calendar">
    <div class="calendar__head">
      <div class="calendar__title">
        <button class="calendar__nav-btn" type="button" @click="changeMonth(-1)" aria-label="Previous month">
          &lsaquo;
        </button>
        <h2>{{ monthLabel }}</h2>
        <button class="calendar__nav-btn" type="button" @click="changeMonth(1)" aria-label="Next month">
          &rsaquo;
        </button>
      </div>

      <div class="calendar__switch">
        <button
          class="calendar__switch-btn"
          :class="{ 'calendar__switch-btn--active': mode === 'month' }"
          type="button"
          @click="mode = 'month'"
        >
          Month View
        </button>
        <button
          class="calendar__switch-btn"
          :class="{ 'calendar__switch-btn--active': mode === 'list' }"
          type="button"
          @click="mode = 'list'"
        >
          List View
        </button>
      </div>
    </div>

    <div v-if="loading" class="empty">Loading calendar data...</div>

    <template v-else>
      <div v-if="mode === 'month'" class="calendar__month-layout">
        <div class="calendar__month-board">
          <div class="calendar__grid-wrap">
            <div class="calendar__weekday" v-for="day in weekDays" :key="day">
              {{ day }}
            </div>

            <button
              v-for="item in calendarDays"
              :key="item.date"
              class="calendar__cell"
              :class="{
                'calendar__cell--muted': !item.inCurrentMonth,
                'calendar__cell--active': isSelected(item.date),
                'calendar__cell--today': item.isToday,
              }"
              type="button"
              @click="selectedDate = item.date"
            >
              <span class="calendar__date">{{ item.day }} <em v-if="item.isToday">(Today)</em></span>

              <div class="calendar__badges">
                <small
                  v-for="event in item.events.slice(0, 1)"
                  :key="event.id"
                  class="calendar__event-badge"
                  :style="{ backgroundColor: badgeColor(event.category) }"
                >
                  {{ event.title }}
                </small>
              </div>
            </button>
          </div>
        </div>

        <aside class="calendar__side panel">
          <h3>Events on {{ selectedDateLabel }}</h3>

          <div v-if="!selectedEvents.length" class="calendar__empty-side">No events for this date.</div>

          <article v-for="event in selectedEvents" :key="event.id" class="calendar__side-card">
            <h4>{{ event.title }}</h4>
            <p>{{ startTimeOnly(event.time) }}</p>
            <p>{{ event.venue }}</p>
          </article>
        </aside>
      </div>

      <div v-else class="calendar-list">
        <article v-for="event in events" :key="event.id" class="calendar-list__item">
          <h3>{{ event.title }}</h3>
          <p>{{ event.date }} | {{ event.time }}</p>
          <p>{{ event.venue }} | {{ event.category }}</p>
        </article>
      </div>

      <section class="calendar__legend panel">
        <h3>Event Categories</h3>

        <div class="calendar__legend-list">
          <span v-for="category in eventCategories" :key="category" class="calendar__legend-item">
            <i :style="{ backgroundColor: badgeColor(category) }"></i>
            {{ category }}
          </span>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.calendar {
  padding: 16px;
}

.calendar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 16px;
}

.calendar__title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.calendar__title h2 {
  margin: 0;
  min-width: 170px;
  text-align: center;
  font-size: 32px;
  font-size: clamp(1.2rem, 2.6vw, 2rem);
  color: #0f172a;
}

.calendar__nav-btn {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
}

.calendar__nav-btn:hover {
  background: #e2e8f0;
}

.calendar__switch {
  display: flex;
  gap: 6px;
  background: #edf2f7;
  border-radius: 10px;
  padding: 4px;
}

.calendar__switch-btn {
  border: 0;
  background: transparent;
  color: #334155;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.calendar__switch-btn--active {
  background: linear-gradient(145deg, #4f46e5 0%, #4338ca 100%);
  color: #fff;
}

.calendar__month-layout {
  display: grid;
  grid-template-columns: 1.8fr 0.6fr;
  gap: 14px;
  align-items: start;
}

.calendar__month-board {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.calendar__grid-wrap {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.calendar__weekday {
  padding: 10px 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.calendar__cell {
  min-height: 68px;
  border: 0;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  text-align: left;
  cursor: pointer;
}

.calendar__cell:nth-child(7n + 8),
.calendar__cell:nth-child(7n + 15),
.calendar__cell:nth-child(7n + 22),
.calendar__cell:nth-child(7n + 29),
.calendar__cell:nth-child(7n + 36),
.calendar__cell:nth-child(7n + 43) {
  border-right: 0;
}

.calendar__date {
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
}

.calendar__date em {
  font-style: normal;
  color: #6366f1;
  font-size: 11px;
  font-weight: 700;
}

.calendar__cell--muted {
  background: #fafbff;
}

.calendar__cell--muted .calendar__date {
  color: #94a3b8;
}

.calendar__cell--active {
  background: #eef2ff;
  box-shadow: inset 0 0 0 1px #c7d2fe;
}

.calendar__cell--today {
  box-shadow: inset 0 0 0 1px #93c5fd;
}

.calendar__badges {
  display: grid;
  gap: 4px;
}

.calendar__event-badge {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 4px;
  color: #fff;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 700;
}

.calendar__side {
  box-shadow: none;
  border-radius: 12px;
  padding: 12px;
}

.calendar__side h3 {
  margin: 0 0 10px;
  font-size: 24px;
  font-size: clamp(1rem, 2vw, 1.15rem);
  color: #0f172a;
}

.calendar__empty-side {
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  padding: 10px;
  color: #64748b;
  text-align: center;
  font-size: 13px;
}

.calendar__side-card {
  border: 1px solid #dbe4f5;
  border-top: 3px solid #3b82f6;
  border-radius: 10px;
  padding: 10px;
  background: #f8fbff;
}

.calendar__side-card + .calendar__side-card {
  margin-top: 8px;
}

.calendar__side-card h4 {
  margin: 0;
  font-size: 14px;
  color: #1e293b;
}

.calendar__side-card p {
  margin: 5px 0 0;
  font-size: 12px;
  color: #64748b;
}

.calendar-list {
  display: grid;
  gap: 10px;
}

.calendar-list__item {
  border: 1px solid #d6deea;
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px;
}

.calendar-list__item h3,
.calendar-list__item p {
  margin: 0;
}

.calendar-list__item p {
  color: #64748b;
  margin-top: 4px;
}

.calendar__legend {
  margin-top: 14px;
  box-shadow: none;
  border-radius: 12px;
  padding: 14px;
}

.calendar__legend h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.calendar__legend-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 28px;
}

.calendar__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-size: 13px;
}

.calendar__legend-item i {
  width: 12px;
  height: 12px;
  border-radius: 4px;
}

@media (max-width: 1040px) {
  .calendar__month-layout {
    grid-template-columns: 1fr;
  }

  .calendar__side {
    order: -1;
  }
}

@media (max-width: 800px) {
  .calendar__head {
    align-items: stretch;
  }

  .calendar__title {
    justify-content: space-between;
    width: 100%;
  }

  .calendar__switch {
    width: 100%;
  }

  .calendar__switch-btn {
    flex: 1;
  }

  .calendar__cell {
    min-height: 62px;
    padding: 6px;
  }

  .calendar__event-badge {
    font-size: 9px;
    padding: 2px 5px;
  }

  .calendar__legend-list {
    gap: 10px 14px;
  }
}

@media (max-width: 620px) {
  .calendar__date {
    font-size: 11px;
  }

  .calendar__date em {
    display: none;
  }
}
</style>
