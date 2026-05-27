<script setup>
const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    default: 5,
  },
})

const emit = defineEmits(['update:modelValue'])

const updateQuantity = (nextValue) => {
  emit('update:modelValue', Math.min(props.max, Math.max(1, nextValue)))
}
</script>

<template>
  <div class="quantity-selector" aria-label="Ticket quantity">
    <button type="button" :disabled="modelValue <= 1" @click="updateQuantity(modelValue - 1)">-</button>
    <strong>{{ modelValue }}</strong>
    <button type="button" :disabled="modelValue >= max" @click="updateQuantity(modelValue + 1)">+</button>
  </div>
</template>

<style scoped>
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
</style>
