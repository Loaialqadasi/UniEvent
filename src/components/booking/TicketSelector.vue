<script setup>
const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  maxTickets: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  serviceFee: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update:quantity', 'continue'])

const updateQuantity = (nextValue) => {
  emit('update:quantity', Math.min(props.maxTickets, Math.max(1, nextValue)))
}

const formatCurrency = (value) => `RM ${value.toFixed(2)}`
</script>

<template>
  <aside class="ticket-card">
    <div>
      <strong class="ticket-card__price">RM {{ event.ticketPrice }}</strong>
      <p>per ticket</p>
      <p class="ticket-card__availability">{{ event.availableSeats }} tickets available</p>
    </div>

    <div class="ticket-card__row">
      <div>
        <strong>Quantity</strong>
        <span>Maximum {{ maxTickets }} tickets per booking</span>
      </div>
      <div class="quantity-selector" aria-label="Ticket quantity">
        <button type="button" :disabled="quantity <= 1" @click="updateQuantity(quantity - 1)">-</button>
        <strong>{{ quantity }}</strong>
        <button type="button" :disabled="quantity >= maxTickets" @click="updateQuantity(quantity + 1)">+</button>
      </div>
    </div>

    <dl class="price-breakdown">
      <div>
        <dt>{{ quantity }} x Ticket</dt>
        <dd>{{ formatCurrency(event.ticketPrice * quantity) }}</dd>
      </div>
      <div>
        <dt>Subtotal</dt>
        <dd>{{ formatCurrency(subtotal) }}</dd>
      </div>
      <div>
        <dt>Service Fee</dt>
        <dd>{{ formatCurrency(serviceFee) }}</dd>
      </div>
      <div class="price-breakdown__total">
        <dt>Total</dt>
        <dd>{{ formatCurrency(total) }}</dd>
      </div>
    </dl>

    <button
      class="button booking-button booking-button--primary"
      type="button"
      :disabled="event.availableSeats < 1"
      @click="emit('continue')"
    >
      {{ event.availableSeats < 1 ? 'Sold Out' : 'Book Now' }}
    </button>
  </aside>
</template>

<style scoped>
.ticket-card {
  display: grid;
  gap: 24px;
  padding: 24px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.12);
}

.ticket-card__price {
  display: block;
  color: #101828;
  font-size: 30px;
  line-height: 1.2;
}

.ticket-card p,
.ticket-card span {
  margin: 4px 0 0;
  color: #4a5565;
}

.ticket-card__availability {
  font-weight: 800;
}

.ticket-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}

.ticket-card__row > div {
  display: grid;
  gap: 4px;
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

/* Primary Button Styles */
.booking-button {
  width: 100%;
  min-height: 48px;
  border-radius: 10px;
  font-size: 16px;
}

.booking-button--primary {
  background: #4f39f6;
}

.booking-button--primary:hover:not(:disabled) {
  background: #432dd7;
}

@media (max-width: 430px) {
  .ticket-card__row {
    align-items: start;
    flex-direction: column;
  }
}
</style>
