<script setup>
import { CreditCard, Landmark, WalletCards } from 'lucide-vue-next'

defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const methods = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'bank', label: 'Online Banking', icon: Landmark },
  { id: 'wallet', label: 'E-Wallet', icon: WalletCards },
]
</script>

<template>
  <div class="method-selector" role="radiogroup" aria-label="Payment method">
    <button
      v-for="method in methods"
      :key="method.id"
      class="method-selector__item"
      :class="{ 'method-selector__item--active': modelValue === method.id }"
      type="button"
      role="radio"
      :aria-checked="modelValue === method.id"
      @click="emit('update:modelValue', method.id)"
    >
      <component :is="method.icon" :size="22" />
      <span>{{ method.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.method-selector {
  display: grid;
  gap: 12px;
}

.method-selector__item {
  min-height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid #d1d5dc;
  border-radius: 10px;
  color: #364153;
  background: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.method-selector__item svg {
  color: #4f39f6;
}

.method-selector__item--active {
  border-color: #4f39f6;
  background: #eef2ff;
  color: #4f39f6;
}
</style>
