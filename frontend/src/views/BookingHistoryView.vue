<script setup>
import BookingStepper from '../components/booking/BookingStepper.vue'
import { useBooking } from '../composables/useBooking'

const booking = useBooking()

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateStr
  }
}
</script>

<template>
  <section class="history-view">
    <div class="view-head">
      <h1>My Bookings</h1>
      <p>Review booking details, update ticket quantity, cancel a booking, and track demo payment history.</p>
    </div>

    <BookingStepper :current-step="5" />

    <div v-if="!booking.bookingHistory.value.length" class="empty">
      No bookings yet. Browse events to create your first ticket booking.
    </div>

    <article v-for="item in booking.bookingHistory.value" v-else :key="item.booking_id" class="history-card">
      <img :src="item.eventSnapshot.image" :alt="item.eventSnapshot.title" />

      <div class="history-card__content">
        <div>
          <h2>{{ item.eventSnapshot.title }}</h2>
          <p>{{ item.eventSnapshot.date }} | {{ item.eventSnapshot.time }} | {{ item.eventSnapshot.venue }}</p>
        </div>

        <dl>
          <div>
            <dt>Reference</dt>
            <dd>{{ item.bookingReference }}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{{ item.booking_status }}</dd>
          </div>
          <div>
            <dt>Payment Status</dt>
            <dd>{{ item.payment_status || 'completed' }}</dd>
          </div>
          <div>
            <dt>Quantity</dt>
            <dd>{{ item.ticket_quantity }}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>RM {{ (item.amount ?? 0).toFixed(2) }}</dd>
          </div>
          <div>
            <dt>Booking Date</dt>
            <dd>{{ formatDate(item.booking_date) }}</dd>
          </div>
        </dl>

        <div class="history-card__actions">
          <!-- Inlined TicketQuantitySelector -->
          <div class="quantity-selector" aria-label="Ticket quantity">
            <button
              type="button"
              :disabled="item.ticket_quantity <= 1"
              @click="booking.updateBookingQuantity(item.booking_id, item.ticket_quantity - 1)"
            >
              -
            </button>
            <strong>{{ item.ticket_quantity }}</strong>
            <button
              type="button"
              :disabled="item.ticket_quantity >= 5"
              @click="booking.updateBookingQuantity(item.booking_id, item.ticket_quantity + 1)"
            >
              +
            </button>
          </div>
          
          <button
            v-if="item.booking_status !== 'cancelled'"
            class="button booking-button booking-button--secondary"
            type="button"
            @click="booking.cancelBooking(item.booking_id)"
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </article>

    <section class="payment-history panel">
      <h2>Payment History</h2>
      <div v-if="!booking.paymentHistory.value.length" class="empty">No payment attempts recorded yet.</div>
      <ul v-else>
        <li v-for="payment in booking.paymentHistory.value" :key="payment.payment_id">
          <span>{{ payment.payment_id }}</span>
          <strong>{{ payment.payment_status }}</strong>
          <span>{{ payment.payment_method }} | RM {{ (payment.amount ?? 0).toFixed(2) }}</span>
        </li>
      </ul>
    </section>

    <button
      class="button booking-button booking-button--primary"
      type="button"
      @click="$router.push('/gallery')"
    >
      Browse Events
    </button>
  </section>
</template>

<style scoped>
.history-view {
  display: grid;
  gap: 24px;
}

.history-card {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 20px;
  padding: 20px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.12);
}

.history-card > img {
  width: 100%;
  height: 100%;
  min-height: 150px;
  object-fit: cover;
  border-radius: 10px;
}

.history-card__content {
  display: grid;
  gap: 18px;
}

h2 {
  margin: 0;
  color: #101828;
  font-size: 22px;
}

p {
  margin: 6px 0 0;
  color: #4a5565;
}

dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

dt {
  color: #4a5565;
  font-size: 13px;
  font-weight: 700;
}

dd {
  margin: 4px 0 0;
  color: #101828;
  font-weight: 800;
  text-transform: capitalize;
}

.history-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

/* Quantity Selector Styles */
.quantity-selector {
  display: inline-grid;
  grid-template-columns: 44px 54px 44px;
  align-items: center;
  overflow: hidden;
  border: 1px solid #d1d5dc;
  border-radius: 10px;
}

.quantity-selector button {
  height: 44px;
  border: 0;
  color: #364153;
  background: #f9fafb;
  font-size: 22px;
  font-weight: 800;
  cursor: pointer;
}

.quantity-selector button:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.quantity-selector strong {
  text-align: center;
  font-size: 18px;
}

.payment-history {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.payment-history ul {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.payment-history li {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f9fafb;
}

.payment-history strong {
  color: #4f39f6;
  text-transform: capitalize;
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

@media (max-width: 760px) {
  .history-card,
  dl,
  .payment-history li {
    grid-template-columns: 1fr;
  }
}
</style>
