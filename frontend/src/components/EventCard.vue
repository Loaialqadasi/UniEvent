<script setup>
import { computed } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
})

const seatsLeft = computed(() => Math.max(0, props.event.capacity - props.event.attendees))
const isFull = computed(() => seatsLeft.value <= 0)
</script>

<template>
  <article class="event-card panel">
    <img :src="event.image" :alt="event.title" class="event-card__cover" />

    <div class="event-card__content">
      <div class="event-card__head">
        <h3>{{ event.title }}</h3>
        <span class="event-card__tag">{{ event.category }}</span>
      </div>

      <p class="event-card__meta">{{ event.date }} | {{ event.time }}</p>
      <p class="event-card__meta">{{ event.venue }}</p>
      <p class="event-card__desc">{{ event.description }}</p>

      <div class="event-card__foot">
        <span>{{ event.attendees }} / {{ event.capacity }} attending</span>
        <strong>{{ event.price }}</strong>
      </div>

      <div class="event-card__action-row">
        <span class="event-card__seats" :class="isFull ? 'event-card__seats--full' : 'event-card__seats--open'">
          {{ isFull ? 'Full' : `${seatsLeft} seats left` }}
        </span>
        <RouterLink class="event-card__book button button--primary" :to="`/manage-events/${event.id}`">
          View & Book
        </RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.event-card {
  overflow: hidden;
  border-radius: 14px;
  box-shadow: none;
}

.event-card__cover {
  width: 100%;
  height: 148px;
  object-fit: cover;
  display: block;
}

.event-card__content {
  padding: 14px;
}

.event-card__head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 10px;
}

.event-card h3 {
  margin: 0;
  font-size: 17px;
  line-height: 1.25;
}

.event-card__tag {
  border-radius: 999px;
  padding: 4px 9px;
  background: #dce7ff;
  color: #1f365f;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.event-card__meta {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
}

.event-card__desc {
  margin: 8px 0;
  color: #334155;
  font-size: 13px;
  min-height: 38px;
}

.event-card__foot {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.event-card__foot strong {
  color: #1748c8;
}

.event-card__action-row {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.event-card__seats {
  font-size: 12px;
  font-weight: 700;
}

.event-card__seats--open {
  color: #15803d;
}

.event-card__seats--full {
  color: #dc2626;
}

.event-card__book {
  display: inline-flex;
  justify-content: center;
  white-space: nowrap;
  text-decoration: none;
}
</style>
