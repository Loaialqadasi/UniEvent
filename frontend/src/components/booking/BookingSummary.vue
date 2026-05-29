<script setup>
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

const formatCurrency = (value) => `RM ${value.toFixed(2)}`
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

    <dl class="price-breakdown">
      <div>
        <dt>{{ summary.quantity }} x Ticket</dt>
        <dd>{{ formatCurrency(summary.ticketPrice * summary.quantity) }}</dd>
      </div>
      <div>
        <dt>Subtotal</dt>
        <dd>{{ formatCurrency(summary.subtotal) }}</dd>
      </div>
      <div>
        <dt>Service Fee</dt>
        <dd>{{ formatCurrency(summary.serviceFee) }}</dd>
      </div>
      <div class="price-breakdown__total">
        <dt>Total</dt>
        <dd>{{ formatCurrency(summary.total) }}</dd>
      </div>
    </dl>

    <dl class="booking-summary__meta">
      <div>
        <dt>Booking status</dt>
        <dd>{{ summary.bookingStatus }}</dd>
      </div>
      <div>
        <dt>Payment status</dt>
        <dd>{{ summary.paymentStatus }}</dd>
      </div>
      <div v-if="summary.bookingReference">
        <dt>Reference</dt>
        <dd>{{ summary.bookingReference }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.booking-summary {
  width: 100%;
  min-width: 0;
  display: grid;
  gap: 20px;
  padding: 24px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.12);
}

.booking-summary--compact {
  gap: 18px;
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
  min-width: 0;
}

.booking-summary__event img {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 10px;
}

.booking-summary__event div {
  min-width: 0;
  display: grid;
  align-content: center;
  gap: 6px;
}

.booking-summary__event strong {
  color: #101828;
  font-size: 18px;
  line-height: 1.25;
}

.booking-summary__event span {
  color: #4a5565;
}

/* Price Breakdown Styles */
.price-breakdown {
  display: grid;
  gap: 14px;
  margin: 0;
}

.price-breakdown div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: #4a5565;
}

.price-breakdown dd {
  margin: 0;
  color: #101828;
  font-weight: 800;
}

.price-breakdown__total {
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  font-size: 20px;
}

.price-breakdown__total dt,
.price-breakdown__total dd {
  color: #101828;
  font-weight: 900;
}

/* Meta Styles */
.booking-summary__meta {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-top: 14px;
  border-top: 1px solid #e5e7eb;
}

.booking-summary__meta div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.booking-summary__meta dt {
  color: #4a5565;
  font-weight: 700;
}

.booking-summary__meta dd {
  margin: 0;
  color: #101828;
  font-weight: 800;
  text-transform: capitalize;
  text-align: right;
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
