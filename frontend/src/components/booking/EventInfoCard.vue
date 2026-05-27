<script setup>
import { CalendarDays, MapPin, Users, Building2 } from 'lucide-vue-next'

defineProps({
  event: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="booking-card">
    <h2>Event Details</h2>

    <div class="info-grid">
      <div class="info-item">
        <CalendarDays :size="22" />
        <div>
          <strong>Date & Time</strong>
          <span>{{ event.date }}</span>
          <span>{{ event.time }}</span>
        </div>
      </div>

      <div class="info-item">
        <MapPin :size="22" />
        <div>
          <strong>Location</strong>
          <span>{{ event.location }}</span>
        </div>
      </div>

      <div class="info-item">
        <Users :size="22" />
        <div>
          <strong>Attendees</strong>
          <span>{{ event.attendees }} registered</span>
        </div>
      </div>

      <div class="info-item">
        <Building2 :size="22" />
        <div>
          <strong>Organizer</strong>
          <span>{{ event.organizer }}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="booking-card">
    <h2>About This Event</h2>
    <p>{{ event.description }}</p>
  </div>
</template>

<style scoped>
.booking-card {
  padding: 24px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
}

.booking-card + .booking-card {
  margin-top: 32px;
}

h2 {
  margin: 0 0 24px;
  color: #101828;
  font-size: 24px;
}

p {
  margin: 0;
  color: #364153;
  line-height: 1.65;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.info-item {
  display: flex;
  align-items: start;
  gap: 12px;
}

.info-item svg {
  flex: 0 0 auto;
  color: #4f39f6;
  margin-top: 2px;
}

.info-item div {
  display: grid;
  gap: 4px;
}

.info-item strong {
  color: #101828;
}

.info-item span {
  color: #4a5565;
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
