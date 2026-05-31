<script setup>
import { computed } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    default: null,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  busy: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'book'])

const seatsLeft = computed(() => {
  if (!props.event) return 0
  return props.event.capacity - props.event.attendees
})

const isFull = computed(() => seatsLeft.value <= 0)

const categoryColors = {
  Technology: '#3b82f6',
  Career: '#22c55e',
  Academic: '#a855f7',
  Sports: '#f97316',
  Arts: '#6366f1',
  Entertainment: '#ec4899',
}

const categoryColor = computed(() => {
  if (!props.event) return '#6b7280'
  return categoryColors[props.event.category] ?? '#6b7280'
})
</script>

<template>
  <Teleport to="body">
    <div v-if="event" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-card">
        <!-- Cover Image -->
        <div class="modal-cover">
          <img :src="event.image" :alt="event.title" />
          <button class="modal-close" @click="emit('close')" aria-label="Close">✕</button>
          <span class="modal-category-badge" :style="{ background: categoryColor }">
            {{ event.category }}
          </span>
        </div>

        <!-- Content -->
        <div class="modal-body">
          <h2 class="modal-title">{{ event.title }}</h2>

          <div class="modal-meta-grid">
            <div class="modal-meta-item">
              <span class="modal-meta-icon">📅</span>
              <div>
                <div class="modal-meta-label">Date</div>
                <div class="modal-meta-value">{{ event.date }}</div>
              </div>
            </div>
            <div class="modal-meta-item">
              <span class="modal-meta-icon">⏰</span>
              <div>
                <div class="modal-meta-label">Time</div>
                <div class="modal-meta-value">{{ event.time }}</div>
              </div>
            </div>
            <div class="modal-meta-item">
              <span class="modal-meta-icon">📍</span>
              <div>
                <div class="modal-meta-label">Venue</div>
                <div class="modal-meta-value">{{ event.venue }}</div>
              </div>
            </div>
            <div class="modal-meta-item">
              <span class="modal-meta-icon">🎟️</span>
              <div>
                <div class="modal-meta-label">Price</div>
                <div class="modal-meta-value">{{ event.price }}</div>
              </div>
            </div>
          </div>

          <!-- Capacity bar -->
          <div class="modal-capacity">
            <div class="modal-capacity-header">
              <span>Seats availability</span>
              <span :class="isFull ? 'cap-full' : 'cap-ok'"> 
                {{ isFull ? 'Full' : `${seatsLeft} seats left` }}
              </span>
            </div>
            <div class="cap-bar">
              <div
                class="cap-bar__fill"
                :style="{
                  width: `${Math.min(100, (event.attendees / event.capacity) * 100)}%`,
                  background: isFull ? '#ef4444' : '#1d4ed8',
                }"
              ></div>
            </div>
            <div class="modal-capacity-sub">{{ event.attendees }} / {{ event.capacity }} registered</div>
          </div>

          <!-- Description -->
          <p class="modal-description">{{ event.description }}</p>

          <!-- Actions -->
          <div class="modal-actions">
            <button class="button button--ghost" @click="emit('close')">Cancel</button>
            <button
              class="button button--primary"
              :disabled="isFull || isBooked || busy"
              @click="emit('book', event.id)"
            >
              <template v-if="busy">Booking...</template>
              <template v-else-if="isBooked">✓ Booked</template>
              <template v-else-if="isFull">Event Full</template>
              <template v-else>Book Event</template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
}

.modal-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.modal-category-badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border-radius: 99px;
  text-transform: uppercase;
}

.modal-body {
  padding: 22px 24px 26px;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0 0 16px;
  color: #0f172a;
  line-height: 1.3;
}

.modal-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
}

.modal-meta-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px 12px;
}

.modal-meta-icon {
  font-size: 1.1rem;
  margin-top: 1px;
}

.modal-meta-label {
  font-size: 0.68rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.modal-meta-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  margin-top: 1px;
}

.modal-capacity {
  margin-bottom: 16px;
}

.modal-capacity-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.cap-ok { color: #16a34a; }
.cap-full { color: #dc2626; }

.cap-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
}

.cap-bar__fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s ease;
}

.modal-capacity-sub {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 4px;
}

.modal-description {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.7;
  margin: 0 0 22px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
