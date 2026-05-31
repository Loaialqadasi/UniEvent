<script setup>
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CalendarDays, MapPin, Users, Building2 } from 'lucide-vue-next'

import BookingStepper from '../components/booking/BookingStepper.vue'
import TicketSelector from '../components/booking/TicketSelector.vue'
import { useBooking } from '../composables/useBooking'

const route = useRoute()
const router = useRouter()
const booking = useBooking()

const loadCurrentEvent = () => {
  booking.loadEvent(route.params.id)
}

const continueToReview = () => {
  booking.startBooking()
  router.push('/booking/review')
}

onMounted(loadCurrentEvent)

watch(
  () => route.params.id,
  () => {
    booking.resetBooking()
    loadCurrentEvent()
  }
)
</script>

<template>
  <RouterLink class="booking-back" to="/manage-events">Back to Events</RouterLink>

  <div v-if="booking.eventLoading.value" class="empty">Loading booking details...</div>
  <div v-else-if="booking.eventError.value" class="empty">{{ booking.eventError.value }}</div>

  <div v-else-if="booking.event.value" class="booking-page">
    <BookingStepper :current-step="2" />
    
    <section class="event-hero" :style="{ backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.62), rgba(0, 0, 0, 0.08)), url(${booking.event.value.heroImage})` }">
      <span class="event-hero__tag">{{ booking.event.value.category }}</span>
      <h1>{{ booking.event.value.title }}</h1>
    </section>

    <section class="booking-layout">
      <div>
        <div class="booking-card">
          <h2>Event Details</h2>

          <div class="info-grid">
            <div class="info-item">
              <CalendarDays :size="22" />
              <div>
                <strong>Date & Time</strong>
                <span>{{ booking.event.value.date }}</span>
                <span>{{ booking.event.value.time }}</span>
              </div>
            </div>

            <div class="info-item">
              <MapPin :size="22" />
              <div>
                <strong>Location</strong>
                <span>{{ booking.event.value.location }}</span>
              </div>
            </div>

            <div class="info-item">
              <Users :size="22" />
              <div>
                <strong>Attendees</strong>
                <span>{{ booking.event.value.attendees }} registered</span>
              </div>
            </div>

            <div class="info-item">
              <Building2 :size="22" />
              <div>
                <strong>Organizer</strong>
                <span>{{ booking.event.value.organizer }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="booking-card">
          <h2>About This Event</h2>
          <p>{{ booking.event.value.description }}</p>
        </div>
      </div>

      <TicketSelector
        :event="booking.event.value"
        :quantity="booking.quantity.value"
        :max-tickets="booking.maxTickets.value"
        :subtotal="booking.subtotal.value"
        :service-fee="booking.serviceFee.value"
        :total="booking.total.value"
        @update:quantity="booking.setQuantity"
        @continue="continueToReview"
      />
    </section>
  </div>
</template>

<style scoped>
.booking-back {
  display: inline-flex;
  margin-bottom: 20px;
  color: #4a5565;
  font-weight: 800;
  text-decoration: none;
}

.booking-back:hover {
  color: #4f39f6;
}

.booking-page {
  display: grid;
  gap: 32px;
}

/* Event Hero Styles */
.event-hero {
  min-height: 384px;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: start;
  gap: 16px;
  padding: 32px;
  border-radius: 16px;
  overflow: hidden;
  background-position: center;
  background-size: cover;
}

.event-hero__tag {
  border-radius: 999px;
  padding: 8px 16px;
  color: #fff;
  background: #4f39f6;
  font-weight: 800;
}

.event-hero h1 {
  max-width: 760px;
  margin: 0;
  color: #fff;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1;
}

/* Booking Layout */
.booking-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 0.95fr);
  gap: 32px;
  align-items: start;
}

/* Event Details & Info Card Styles */
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

@media (max-width: 980px) {
  .booking-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
