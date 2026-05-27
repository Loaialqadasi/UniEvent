<script setup>
import PriceBreakdown from './PriceBreakdown.vue'

defineProps({
  summary: {
    type: Object,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <section class="booking-summary" :class="{ 'booking-summary--compact': compact }">
    <h2>Booking Summary</h2>

    <div v-if="summary.event" class="booking-summary__event">
      <img :src="summary.event.image" :alt="summary.event.title" />
      <div>
        <strong>{{ summary.event.title }}</strong>
        <span>{{ summary.event.date }} | {{ summary.event.time }}</span>
        <span>{{ summary.event.venue }}</span>
      </div>
    </div>

    <PriceBreakdown
      :quantity="summary.quantity"
      :ticket-price="summary.ticketPrice"
      :subtotal="summary.subtotal"
      :service-fee="summary.serviceFee"
      :total="summary.total"
    />
  </section>
</template>

<style scoped>
.booking-summary {
  display: grid;
  gap: 24px;
  padding: 24px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.12);
}

.booking-summary--compact {
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
}

h2 {
  margin: 0;
  color: #101828;
  font-size: 24px;
}

.booking-summary__event {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 16px;
}

.booking-summary__event img {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 10px;
}

.booking-summary__event div {
  display: grid;
  align-content: center;
  gap: 6px;
}

.booking-summary__event strong {
  color: #101828;
  font-size: 18px;
}

.booking-summary__event span {
  color: #4a5565;
}

@media (max-width: 520px) {
  .booking-summary__event {
    grid-template-columns: 1fr;
  }

  .booking-summary__event img {
    width: 100%;
    height: 150px;
  }
}
</style>
