<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import BookingStepper from '../components/booking/BookingStepper.vue'
import BookingSummary from '../components/booking/BookingSummary.vue'
import PaymentMethodSelector from '../components/booking/PaymentMethodSelector.vue'
import { useBooking } from '../composables/useBooking'
import { simulatePayment } from '../services/paymentSimulator'

const router = useRouter()
const booking = useBooking()
const processing = ref(false)
const paymentError = ref('')
const fieldErrors = ref({})
const forceFailure = ref(false)
const cardDetails = reactive({
  cardName: 'Demo Student',
  cardNumber: '1234 5678 9012 3456',
  expiry: '12/30',
  cvv: '123',
})

const completePayment = async () => {
  const activeBooking = booking.startBooking()

  if (!activeBooking) {
    paymentError.value = 'Please select an event before starting payment.'
    return
  }

  processing.value = true
  paymentError.value = ''
  fieldErrors.value = {}

  const result = await simulatePayment({
    amount: booking.total.value,
    method: booking.paymentMethod.value,
    details: cardDetails,
    forceFailure: forceFailure.value,
  })

  processing.value = false

  if (!result.ok) {
    booking.recordPaymentAttempt({
      status: result.status ?? 'failed',
      paymentTransactionId: result.transactionId ?? `TXN-${Date.now()}`,
    })
    fieldErrors.value = result.errors ?? {}
    paymentError.value = result.errors?.payment ?? 'Please check your payment details.'
    return
  }

  booking.recordPaymentAttempt({
    status: result.status,
    paymentTransactionId: result.transactionId,
  })
  router.push('/booking/success')
}

onMounted(() => {
  if (!booking.event.value) {
    router.replace('/events')
  }
})
</script>

<template>
  <section class="payment-layout">
    <div class="payment-panel">
      <BookingStepper :current-step="4" />

      <h1>Payment Simulator</h1>

      <PaymentMethodSelector :model-value="booking.paymentMethod.value" @update:model-value="booking.setPaymentMethod" />

      <!-- Inlined CardPaymentForm -->
      <div v-if="booking.paymentMethod.value === 'card'" class="card-form">
        <div class="field field--full">
          <label for="cardName">Name on Card</label>
          <input id="cardName" v-model="cardDetails.cardName" class="input" type="text" placeholder="Aiman Hakim" />
          <p v-if="fieldErrors.cardName" class="field__error">{{ fieldErrors.cardName }}</p>
        </div>

        <div class="field field--full">
          <label for="cardNumber">Card Number</label>
          <input id="cardNumber" v-model="cardDetails.cardNumber" class="input" type="text" placeholder="1234 5678 9012 3456" maxlength="19" />
          <p v-if="fieldErrors.cardNumber" class="field__error">{{ fieldErrors.cardNumber }}</p>
        </div>

        <div class="field">
          <label for="expiry">Expiry Date</label>
          <input id="expiry" v-model="cardDetails.expiry" class="input" type="text" placeholder="MM/YY" maxlength="5" />
          <p v-if="fieldErrors.expiry" class="field__error">{{ fieldErrors.expiry }}</p>
        </div>

        <div class="field">
          <label for="cvv">CVV</label>
          <input id="cvv" v-model="cardDetails.cvv" class="input" type="password" placeholder="123" maxlength="4" />
          <p v-if="fieldErrors.cvv" class="field__error">{{ fieldErrors.cvv }}</p>
        </div>
      </div>

      <label class="failure-toggle">
        <input v-model="forceFailure" type="checkbox" />
        <span>Simulate failed payment</span>
      </label>

      <!-- Inlined DemoAlert -->
      <div class="demo-alert">
        <strong>Demo Mode:</strong>
        <span>This is a payment simulator. No actual charges will be made.</span>
      </div>

      <!-- Inlined NotificationAlert -->
      <p v-if="paymentError" class="notification-alert notification-alert--error">{{ paymentError }}</p>

      <div class="booking-actions">
        <button
          class="button booking-button booking-button--secondary"
          type="button"
          @click="router.push('/booking/review')"
        >
          Back
        </button>
        <button
          class="button booking-button booking-button--primary"
          type="button"
          :disabled="processing"
          @click="completePayment"
        >
          {{ processing ? 'Processing...' : 'Complete Payment' }}
        </button>
      </div>
    </div>

    <BookingSummary v-if="booking.event.value" :summary="booking.bookingSummary.value" compact />
  </section>
</template>

<style scoped>
.payment-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 26px;
  align-items: start;
  margin-top: 26px;
}

.payment-panel {
  min-width: 0;
  display: grid;
  gap: 24px;
  padding: 30px 34px 34px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

.payment-layout > :deep(.booking-summary) {
  position: sticky;
  top: 92px;
  padding: 24px 26px;
  border: 1px solid #e5e7eb;
}

.payment-layout > :deep(.booking-summary h2) {
  font-size: 22px;
}

.payment-layout > :deep(.booking-summary__event) {
  grid-template-columns: 86px 1fr;
}

.payment-layout > :deep(.booking-summary__event img) {
  width: 86px;
  height: 86px;
}

.payment-layout > :deep(.booking-summary__event strong) {
  font-size: 17px;
}

h1 {
  margin: 0;
  color: #101828;
  font-size: 24px;
}

/* Card Payment Form Styles */
.card-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field--full {
  grid-column: 1 / -1;
}

.failure-toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #364153;
  font-weight: 800;
}

.failure-toggle input {
  width: 18px;
  height: 18px;
  accent-color: #4f39f6;
}

/* Demo Alert Styles */
.demo-alert {
  padding: 16px;
  border: 1px solid #fff085;
  border-radius: 10px;
  color: #894b00;
  background: #fefce8;
  line-height: 1.45;
}

.demo-alert strong {
  margin-right: 4px;
}

/* Notification Alert Styles */
.notification-alert {
  margin: 0;
  padding: 12px 14px;
  border-radius: 10px;
  font-weight: 800;
}

.notification-alert--error {
  color: #b42318;
  background: #fef3f2;
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

@media (max-width: 900px) {
  .payment-layout {
    grid-template-columns: 1fr;
  }

  .payment-layout > :deep(.booking-summary) {
    position: static;
  }
}

@media (max-width: 620px) {
  .payment-panel {
    padding: 22px;
  }

  .card-form {
    grid-template-columns: 1fr;
  }

  .booking-actions {
    grid-template-columns: 1fr;
  }
}
</style>
