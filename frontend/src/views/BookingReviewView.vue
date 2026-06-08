<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import BookingStepper from '../components/booking/BookingStepper.vue'
import BookingSummary from '../components/booking/BookingSummary.vue'
import { useBooking } from '../composables/useBooking'

const router = useRouter()
const booking = useBooking()

onMounted(() => {
  if (!booking.event.value) {
    router.replace('/manage-events')
    return
  }

  booking.startBooking()
})
</script>

<template>
  <section class="booking-flow">
    <BookingStepper :current-step="3" />

    <BookingSummary v-if="booking.event.value" :summary="booking.bookingSummary.value" />

    <div class="booking-actions">
      <button
        class="button booking-button booking-button--secondary"
        type="button"
        @click="router.push(`/manage-events/${booking.event.value?.id ?? ''}`)"
      >
        Back
      </button>
      <button
        class="button booking-button booking-button--primary"
        type="button"
        @click="router.push('/checkout')"
      >
        Continue to Payment
      </button>
    </div>
  </section>
</template>

<style scoped>
.booking-flow {
  width: min(100%, 760px);
  display: grid;
  gap: 24px;
  margin: 26px auto;
  padding: 30px 34px 34px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

.booking-flow :deep(.booking-summary) {
  padding: 24px 26px;
  border: 1px solid #e5e7eb;
  box-shadow: none;
}

.booking-flow :deep(.booking-summary h2) {
  font-size: 22px;
}

.booking-flow :deep(.booking-summary__event) {
  grid-template-columns: 88px 1fr;
}

.booking-flow :deep(.booking-summary__event img) {
  width: 88px;
  height: 88px;
}

.booking-flow :deep(.booking-summary__meta) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.booking-flow :deep(.booking-summary__meta div) {
  display: grid;
  gap: 4px;
}

.booking-flow :deep(.booking-summary__meta dd) {
  text-align: left;
  word-break: break-word;
}

.booking-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Button Styles */
.booking-button {
  width: 100%;
  min-height: 48px;
  border-radius: 10px;
  font-size: 16px;
}

.booking-button--primary {
  color: #fff;
  background: #4f39f6;
}

.booking-button--primary:hover:not(:disabled) {
  background: #432dd7;
}

.booking-button--secondary {
  border-width: 2px;
  border-color: #d1d5dc;
  color: #364153;
  background: #fff;
}

.booking-button--secondary:hover:not(:disabled) {
  border-color: #aab2c0;
  background: #f9fafb;
}

@media (max-width: 620px) {
  .booking-flow {
    padding: 22px;
  }

  .booking-flow :deep(.booking-summary__meta) {
    grid-template-columns: 1fr;
  }

  .booking-actions {
    grid-template-columns: 1fr;
  }
}
</style>
