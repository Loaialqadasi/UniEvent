<script setup>
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EventHero from '../components/booking/EventHero.vue'
import EventInfoCard from '../components/booking/EventInfoCard.vue'
import TicketBookingCard from '../components/booking/TicketBookingCard.vue'
import { useBooking } from '../composables/useBooking'

const route = useRoute()
const router = useRouter()
const booking = useBooking()

const loadCurrentEvent = () => {
  booking.loadEvent(route.params.id)
}

const continueToReview = () => {
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
  <RouterLink class="booking-back" to="/events">Back to Events</RouterLink>

  <div v-if="booking.eventLoading.value" class="empty">Loading booking details...</div>
  <div v-else-if="booking.eventError.value" class="empty">{{ booking.eventError.value }}</div>

  <div v-else-if="booking.event.value" class="booking-page">
    <EventHero :event="booking.event.value" />

    <section class="booking-layout">
      <div>
        <EventInfoCard :event="booking.event.value" />
      </div>

      <TicketBookingCard
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

.booking-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 0.95fr);
  gap: 32px;
  align-items: start;
}

@media (max-width: 980px) {
  .booking-layout {
    grid-template-columns: 1fr;
  }
}
</style>
