<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import BookingStepper from '../components/booking/BookingStepper.vue'
import BookingSummary from '../components/booking/BookingSummary.vue'
import PrimaryButton from '../components/booking/PrimaryButton.vue'
import SecondaryButton from '../components/booking/SecondaryButton.vue'
import { useBooking } from '../composables/useBooking'

const router = useRouter()
const booking = useBooking()

onMounted(() => {
  if (!booking.event.value) {
    router.replace('/events/3')
  }
})
</script>

<template>
  <section class="booking-flow">
    <BookingStepper :current-step="1" />

    <BookingSummary v-if="booking.event.value" :summary="booking.bookingSummary.value" />

    <div class="booking-actions">
      <SecondaryButton @click="router.push(`/events/${booking.event.value?.id ?? 3}`)">Back</SecondaryButton>
      <PrimaryButton @click="router.push('/booking/payment')">Continue to Payment</PrimaryButton>
    </div>
  </section>
</template>

<style scoped>
.booking-flow {
  max-width: 672px;
  display: grid;
  gap: 32px;
  margin: 26px auto;
  padding: 32px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.12);
}

.booking-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 620px) {
  .booking-flow {
    padding: 22px;
  }

  .booking-actions {
    grid-template-columns: 1fr;
  }
}
</style>
