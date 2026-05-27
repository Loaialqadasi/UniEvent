<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import BookingStepper from '../components/booking/BookingStepper.vue'
import ConfirmationCard from '../components/booking/ConfirmationCard.vue'
import SuccessActions from '../components/booking/SuccessActions.vue'
import { useBooking } from '../composables/useBooking'

const router = useRouter()
const booking = useBooking()

onMounted(() => {
  if (!booking.bookingReference.value) {
    router.replace('/events/3')
  }
})
</script>

<template>
  <section class="success-panel">
    <BookingStepper :current-step="3" />
    <ConfirmationCard :reference="booking.bookingReference.value || 'UEPENDING'" />
    <SuccessActions
      @view-event="router.push(`/events/${booking.event.value?.id ?? 3}`)"
      @browse="router.push('/events')"
    />
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

@media (max-width: 620px) {
  .success-panel {
    padding: 22px;
  }
}
</style>
