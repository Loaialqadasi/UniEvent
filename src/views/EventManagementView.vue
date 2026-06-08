<script setup>
import { computed, onMounted, ref } from 'vue'

import EventCard from '../components/EventCard.vue'
import EventForm from '../components/EventForm.vue'
import EventDetailModal from '../components/EventDetailModal.vue'
import { authState } from '../service/auth'
import {
  createEvent,
  deleteEvent,
  fetchBookedEvents,
  fetchEventCategories,
  fetchEvents,
  bookEvent,
  updateEvent,
} from '../service/api'

// ─── Role ──────────────────────────────────────────────────────────────────
const role = computed(() => authState.user?.role ?? 'student')

// ─── Data ──────────────────────────────────────────────────────────────────
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const statusMessage = ref('')
const statusType = ref('ok') // 'ok' | 'warn'
const events = ref([])
const categories = ref([])
const bookedEventIds = ref([])

// ─── Search / Filter ───────────────────────────────────────────────────────
const searchText = ref('')
const selectedCategory = ref('All')

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

// ─── Form (create / edit) ──────────────────────────────────────────────────
const showForm = ref(false)
const editTarget = ref(null) // null = create mode; event obj = edit mode

function openCreate() {
  editTarget.value = null
  showForm.value = true
}

function openEdit(event) {
  editTarget.value = event
  showForm.value = true
}

// ─── Detail modal (student) ────────────────────────────────────────────────
const detailEvent = ref(null)
const bookingBusy = ref(false)

// ─── Delete confirm ────────────────────────────────────────────────────────
const deleteTarget = ref(null)
const deleting = ref(false)

// ─── Load ──────────────────────────────────────────────────────────────────
const loadInitial = async () => {
  loading.value = true
  error.value = ''
  try {
    const [eventData, categoryData, booked] = await Promise.all([
      fetchEvents(),
      fetchEventCategories(),
      fetchBookedEvents(),
    ])
    events.value = eventData
    categories.value = categoryData
    bookedEventIds.value = booked
  } catch {
    error.value = 'Unable to load events right now. Please refresh.'
  } finally {
    loading.value = false
  }
}

onMounted(loadInitial)

// ─── Organizer Actions ─────────────────────────────────────────────────────
const onFormSubmit = async (payload) => {
  saving.value = true
  statusMessage.value = ''

  try {
    if (payload.id) {
      // Edit mode
      const updated = await updateEvent(payload.id, payload)
      events.value = events.value.map((e) => (e.id === updated.id ? updated : e))
      flash('Event updated successfully.', 'ok')
    } else {
      // Create mode
      const created = await createEvent(payload)
      events.value = [created, ...events.value]
      flash('Event published successfully.', 'ok')
    }
    showForm.value = false
  } catch {
    flash('Could not save event. Please try again.', 'warn')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (event) => {
  deleteTarget.value = event
}

const onDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await deleteEvent(deleteTarget.value.id)
    events.value = events.value.filter((e) => e.id !== deleteTarget.value.id)
    flash('Event deleted.', 'ok')
    deleteTarget.value = null
  } catch {
    flash('Could not delete event.', 'warn')
  } finally {
    deleting.value = false
  }
}

// ─── Student Actions ───────────────────────────────────────────────────────
const onBookEvent = async (eventId) => {
  bookingBusy.value = true
  try {
    await bookEvent(eventId)
    bookedEventIds.value = [...bookedEventIds.value, eventId]
    events.value = events.value.map((e) =>
      e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e
    )
    flash('Event booked! Check your notifications.', 'ok')
    detailEvent.value = events.value.find((e) => e.id === eventId) ?? null
  } catch (err) {
    flash(err.message ?? 'Booking failed.', 'warn')
  } finally {
    bookingBusy.value = false
  }
}

// ─── Helper ────────────────────────────────────────────────────────────────
function flash(msg, type = 'ok') {
  statusMessage.value = msg
  statusType.value = type
  setTimeout(() => {
    statusMessage.value = ''
  }, 4000)
}

// computed for the organizer event table
const categoryColors = {
  Technology: '#3b82f6',
  Career: '#22c55e',
  Academic: '#a855f7',
  Sports: '#f97316',
  Arts: '#6366f1',
  Entertainment: '#ec4899',
}
</script>

<template>
  <!-- Role Switcher -->
  <section class="view-head">
    <div class="view-head__top">
      <div>
        <h1>Event Management</h1>
        <p v-if="role === 'organizer'">Create, update, and manage events. Control schedules and capacity.</p>
        <p v-else>Browse upcoming events, view details, and book your seat.</p>
      </div>
    </div>
  </section>

  <!-- Status Banner -->
  <p
    v-if="statusMessage"
    class="status-banner"
    :class="statusType === 'ok' ? 'status-banner--ok' : 'status-banner--warn'"
  >
    {{ statusMessage }}
  </p>

  <!-- ═══════════════════════ ORGANIZER VIEW ══════════════════════════════ -->
  <template v-if="role === 'organizer'">
    <section class="event-layout">
      <!-- Left: event table + controls -->
      <div class="panel event-board">
        <div class="event-board__controls">
          <input
            v-model="searchText"
            class="input"
            type="search"
            placeholder="Search events, venue, description"
            aria-label="Search events"
          />
          <button class="button button--primary" type="button" @click="openCreate">
            + New Event
          </button>
        </div>

        <!-- Category chips -->
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

        <!-- Table -->
        <div v-if="loading" class="empty">Loading events...</div>
        <div v-else-if="error" class="empty">{{ error }}</div>
        <div v-else-if="!visibleEvents.length" class="empty">No events match your filters.</div>
        <div v-else class="org-table-wrap">
          <table class="org-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in visibleEvents" :key="item.id">
                <td>
                  <div class="org-event-cell">
                    <span
                      class="org-dot"
                      :style="{ background: categoryColors[item.category] ?? '#6b7280' }"
                    ></span>
                    <div>
                      <div class="org-event-title">{{ item.title }}</div>
                      <div class="org-event-sub">{{ item.category }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ item.date }}</td>
                <td>{{ item.venue }}</td>
                <td>
                  <div class="cap-cell">
                    <div class="cap-mini-bar">
                      <div
                        class="cap-mini-fill"
                        :style="{
                          width: `${Math.min(100, (item.attendees / item.capacity) * 100)}%`,
                          background:
                            item.attendees >= item.capacity ? '#ef4444' : '#1d4ed8',
                        }"
                      ></div>
                    </div>
                    <span class="cap-label">{{ item.attendees }}/{{ item.capacity }}</span>
                  </div>
                </td>
                <td>
                  <span
                    class="status-pill"
                    :class="item.attendees >= item.capacity ? 'status-pill--full' : 'status-pill--open'"
                  >
                    {{ item.attendees >= item.capacity ? 'Full' : 'Open' }}
                  </span>
                </td>
                <td>
                  <div class="org-actions">
                    <button class="action-btn action-btn--edit" @click="openEdit(item)">Edit</button>
                    <button class="action-btn action-btn--delete" @click="confirmDelete(item)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary strip -->
        <div v-if="!loading && visibleEvents.length" class="org-summary">
          <span>{{ visibleEvents.length }} events</span>
          <span>·</span>
          <span>{{ visibleEvents.reduce((s, e) => s + e.attendees, 0) }} total registrations</span>
          <span>·</span>
          <span>{{ visibleEvents.filter(e => e.attendees >= e.capacity).length }} full</span>
        </div>
      </div>

      <!-- Right: create / edit form -->
      <EventForm
        v-model="showForm"
        :categories="categories.slice(1)"
        :busy="saving"
        :edit-data="editTarget"
        @submit="onFormSubmit"
      />
    </section>

    <!-- Delete Confirm Dialog -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="confirm-dialog">
          <h3>Delete Event?</h3>
          <p>
            This will permanently remove <strong>{{ deleteTarget.title }}</strong> and cannot be undone.
          </p>
          <div class="confirm-actions">
            <button class="button button--ghost" @click="deleteTarget = null">Cancel</button>
            <button class="button button--danger" :disabled="deleting" @click="onDelete">
              {{ deleting ? 'Deleting...' : 'Delete Event' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </template>

  <!-- ═══════════════════════ STUDENT VIEW ════════════════════════════════ -->
  <template v-else>
    <section class="event-layout-student">
      <div class="panel event-board">
        <!-- Controls -->
        <div class="event-board__controls">
          <input
            v-model="searchText"
            class="input"
            type="search"
            placeholder="Search events, venue, description"
            aria-label="Search events"
          />
        </div>

        <!-- Category chips -->
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

        <p class="event-board__count">{{ visibleEvents.length }} event(s) found</p>

        <div v-if="loading" class="empty">Loading events...</div>
        <div v-else-if="error" class="empty">{{ error }}</div>
        <div v-else-if="!visibleEvents.length" class="empty">No events match your current filters.</div>
        <div v-else class="event-grid">
          <div
            v-for="item in visibleEvents"
            :key="item.id"
            class="student-card-wrapper"
            @click="detailEvent = item"
          >
            <EventCard :event="item" />
            <div v-if="bookedEventIds.includes(item.id)" class="student-card-footer">
              <span class="booked-badge">✓ Booked</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Student detail / booking modal -->
    <EventDetailModal
      :event="detailEvent"
      :is-booked="detailEvent ? bookedEventIds.includes(detailEvent.id) : false"
      :busy="bookingBusy"
      @close="detailEvent = null"
      @book="onBookEvent"
    />
  </template>
</template>

<style scoped>
/* ── View header ─────────────────────────────────────────────────────────── */
.view-head__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.role-switcher {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.role-switcher__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

.role-tabs {
  display: flex;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.role-tab {
  padding: 6px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  color: #64748b;
  transition: all 0.18s;
}

.role-tab--active {
  background: #fff;
  color: #1d4ed8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
}

/* ── Status banner ───────────────────────────────────────────────────────── */
.status-banner {
  margin: 0 0 14px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-banner--ok {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.status-banner--warn {
  background: #fef9c3;
  color: #92400e;
  border: 1px solid #fde68a;
}

/* ── Organizer layout ────────────────────────────────────────────────────── */
.event-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 380px;
}

.event-board {
  padding: 18px;
  overflow: hidden;
}

.event-board__controls {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  margin-bottom: 14px;
}

/* ── Organizer table ─────────────────────────────────────────────────────── */
.org-table-wrap {
  overflow-x: auto;
  margin-top: 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.org-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
}

.org-table thead tr {
  background: #f8fafc;
}

.org-table th {
  padding: 10px 14px;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.org-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}

.org-table tbody tr:last-child td {
  border-bottom: none;
}

.org-table tbody tr:hover td {
  background: #f8fafc;
}

.org-event-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.org-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.org-event-title {
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.org-event-sub {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 1px;
}

/* Capacity mini-bar */
.cap-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 90px;
}

.cap-mini-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
}

.cap-mini-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.3s;
}

.cap-label {
  font-size: 0.72rem;
  color: #64748b;
}

/* Status pill */
.status-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 700;
}

.status-pill--open {
  background: #dcfce7;
  color: #15803d;
}

.status-pill--full {
  background: #fee2e2;
  color: #dc2626;
}

/* Action buttons */
.org-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 7px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}

.action-btn:hover {
  opacity: 0.8;
}

.action-btn--edit {
  background: #dbeafe;
  color: #1d4ed8;
}

.action-btn--delete {
  background: #fee2e2;
  color: #dc2626;
}

/* Summary strip */
.org-summary {
  display: flex;
  gap: 10px;
  padding: 10px 0 0;
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 600;
}

/* ── Delete confirm dialog ────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
}

.confirm-dialog {
  background: #fff;
  border-radius: 14px;
  padding: 28px 32px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 16px 40px rgba(0,0,0,0.18);
}

.confirm-dialog h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
  color: #0f172a;
}

.confirm-dialog p {
  margin: 0 0 22px;
  color: #475569;
  font-size: 0.875rem;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.button--danger {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.button--danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Student layout ──────────────────────────────────────────────────────── */
.event-layout-student {
  display: grid;
  gap: 16px;
}

.event-board__count {
  margin: 14px 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.event-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.student-card-wrapper {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.18s;
}

.student-card-wrapper:hover {
  box-shadow: 0 6px 24px rgba(29, 78, 216, 0.12);
}

.student-card-footer {
  padding: 10px 14px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.booked-badge {
  font-size: 0.8rem;
  font-weight: 700;
  color: #15803d;
  background: #dcfce7;
  padding: 4px 12px;
  border-radius: 99px;
}

@media (max-width: 1200px) {
  .event-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1080px) {
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

  .view-head__top {
    flex-direction: column;
  }
}
</style>
