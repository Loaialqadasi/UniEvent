<script setup>
defineProps({
  quantity: {
    type: Number,
    required: true,
  },
  ticketPrice: {
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

const formatCurrency = (value) => `RM ${value.toFixed(2)}`
</script>

<template>
  <dl class="price-breakdown">
    <div>
      <dt>{{ quantity }} x Ticket</dt>
      <dd>{{ formatCurrency(ticketPrice * quantity) }}</dd>
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
</template>

<style scoped>
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
</style>
