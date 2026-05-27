<script setup>
import TicketQuantitySelector from './TicketQuantitySelector.vue'
import PriceBreakdown from './PriceBreakdown.vue'
import PrimaryButton from './PrimaryButton.vue'

defineProps({
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
</script>

<template>
  <aside class="ticket-card">
    <div>
      <strong class="ticket-card__price">RM {{ event.ticketPrice }}</strong>
      <p>per ticket</p>
    </div>

    <div class="ticket-card__row">
      <div>
        <strong>Quantity</strong>
        <span>Maximum {{ maxTickets }} tickets per booking</span>
      </div>
      <TicketQuantitySelector :model-value="quantity" :max="maxTickets" @update:model-value="emit('update:quantity', $event)" />
    </div>

    <PriceBreakdown
      :quantity="quantity"
      :ticket-price="event.ticketPrice"
      :subtotal="subtotal"
      :service-fee="serviceFee"
      :total="total"
    />

    <PrimaryButton @click="emit('continue')">Book Now</PrimaryButton>
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

@media (max-width: 430px) {
  .ticket-card__row {
    align-items: start;
    flex-direction: column;
  }
}
</style>
