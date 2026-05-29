<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CircleCheckBig } from 'lucide-vue-next'

import BookingStepper from '../components/booking/BookingStepper.vue'
import BookingSummary from '../components/booking/BookingSummary.vue'
import { useBooking } from '../composables/useBooking'

const router = useRouter()
const booking = useBooking()

onMounted(() => {
  if (!booking.bookingReference.value || booking.paymentStatus.value !== 'successful') {
    router.replace('/events')
  }
})
</script>

<template>
  <section class="success-panel">
    <BookingStepper :current-step="5" />

    <!-- Inlined ConfirmationCard -->
    <div class="confirmation-card">
      <div class="confirmation-card__icon">
        <CircleCheckBig :size="40" />
      </div>
      <h1>Booking Confirmed!</h1>
      <p>Your tickets have been sent to your email and are available in your dashboard.</p>

      <div class="confirmation-card__reference">
        <span>Booking Reference</span>
        <strong>{{ booking.bookingReference.value || 'UEPENDING' }}</strong>
        <span>Keep this reference for your records</span>
      </div>
    </div>

    <BookingSummary v-if="booking.event.value" :summary="booking.bookingSummary.value" compact />

    <!-- Inlined SuccessActions -->
    <div class="success-actions">
      <button
        class="button booking-button booking-button--primary"
        type="button"
        @click="router.push(`/events/${booking.event.value?.id ?? 3}`)"
      >
        View Event Details
      </button>
      <button
        class="button booking-button booking-button--secondary"
        type="button"
        @click="router.push('/events')"
      >
        Browse More Events
      </button>
    </div>
  </section>
</template>

<style scoped>
.success-panel {
  max-width: 672px;
  display: grid;
  gap: 32px;
  margin: 26px auto;
  padding: 32px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.12);
}

/* Confirmation Card Styles */
.confirmation-card {
  display: grid;
  justify-items: center;
  gap: 16px;
  text-align: center;
}

.confirmation-card__icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #00a63e;
  background: #dcfce7;
}

h1 {
  margin: 0;
  color: #101828;
  font-size: 24px;
}

p {
  max-width: 600px;
  margin: 0;
  color: #4a5565;
}

.confirmation-card__reference {
  width: 100%;
  display: grid;
  gap: 8px;
  margin-top: 16px;
  padding: 24px;
  border-radius: 10px;
  background: #f9fafb;
}

.confirmation-card__reference span {
  color: #4a5565;
}

.confirmation-card__reference strong {
  color: #101828;
  font-size: 24px;
  letter-spacing: 1px;
}

/* Success Actions Styles */
.success-actions {
  display: grid;
  gap: 12px;
  width: 100%;
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
  .success-panel {
    padding: 22px;
  }
}
</style>
