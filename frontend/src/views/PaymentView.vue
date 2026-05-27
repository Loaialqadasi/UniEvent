<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import BookingStepper from '../components/booking/BookingStepper.vue'
import BookingSummary from '../components/booking/BookingSummary.vue'
import CardPaymentForm from '../components/booking/CardPaymentForm.vue'
import DemoAlert from '../components/booking/DemoAlert.vue'
import NotificationAlert from '../components/booking/NotificationAlert.vue'
import PaymentMethodSelector from '../components/booking/PaymentMethodSelector.vue'
import PrimaryButton from '../components/booking/PrimaryButton.vue'
import SecondaryButton from '../components/booking/SecondaryButton.vue'
import { useBooking } from '../composables/useBooking'
import { simulatePayment } from '../services/paymentSimulator'

const router = useRouter()
const booking = useBooking()
const processing = ref(false)
const paymentError = ref('')
const fieldErrors = ref({})
const cardDetails = reactive({
  cardName: 'Demo Student',
  cardNumber: '1234 5678 9012 3456',
  expiry: '12/30',
  cvv: '123',
})

const completePayment = async () => {
  processing.value = true
  paymentError.value = ''
  fieldErrors.value = {}

  const result = await simulatePayment({
    amount: booking.total.value,
    method: booking.paymentMethod.value,
    details: cardDetails,
  })

  processing.value = false

  if (!result.ok) {
    fieldErrors.value = result.errors ?? {}
    paymentError.value = result.errors?.payment ?? 'Please check your payment details.'
    return
  }

  booking.confirmPayment(result.transactionId)
  router.push('/booking/success')
}

onMounted(() => {
  if (!booking.event.value) {
    router.replace('/events/3')
  }
})
</script>

<template>
  <section class="payment-layout">
    <div class="payment-panel">
      <BookingStepper :current-step="2" />

      <h1>Payment Simulator</h1>

      <PaymentMethodSelector :model-value="booking.paymentMethod.value" @update:model-value="booking.setPaymentMethod" />

      <CardPaymentForm
        v-if="booking.paymentMethod.value === 'card'"
        :model-value="cardDetails"
        :errors="fieldErrors"
        @update:model-value="Object.assign(cardDetails, $event)"
      />

      <DemoAlert />
      <NotificationAlert :message="paymentError" />

      <div class="booking-actions">
        <SecondaryButton @click="router.push('/booking/review')">Back</SecondaryButton>
        <PrimaryButton :disabled="processing" @click="completePayment">
          {{ processing ? 'Processing...' : 'Complete Payment' }}
        </PrimaryButton>
      </div>
    </div>

    <BookingSummary v-if="booking.event.value" :summary="booking.bookingSummary.value" compact />
  </section>
</template>

<style scoped>
.payment-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.8fr);
  gap: 24px;
  align-items: start;
  margin-top: 26px;
}

.payment-panel {
  display: grid;
  gap: 28px;
  padding: 32px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.12);
}

h1 {
  margin: 0;
  color: #101828;
  font-size: 24px;
}

.booking-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 900px) {
  .payment-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .payment-panel {
    padding: 22px;
  }

  .booking-actions {
    grid-template-columns: 1fr;
  }
}
</style>
