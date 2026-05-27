<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>

<template>
  <div class="card-form">
    <div class="field field--full">
      <label for="cardName">Name on Card</label>
      <input id="cardName" class="input" type="text" :value="modelValue.cardName" placeholder="Aiman Hakim" @input="updateField('cardName', $event.target.value)" />
      <p v-if="errors.cardName" class="field__error">{{ errors.cardName }}</p>
    </div>

    <div class="field field--full">
      <label for="cardNumber">Card Number</label>
      <input id="cardNumber" class="input" type="text" :value="modelValue.cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" @input="updateField('cardNumber', $event.target.value)" />
      <p v-if="errors.cardNumber" class="field__error">{{ errors.cardNumber }}</p>
    </div>

    <div class="field">
      <label for="expiry">Expiry Date</label>
      <input id="expiry" class="input" type="text" :value="modelValue.expiry" placeholder="MM/YY" maxlength="5" @input="updateField('expiry', $event.target.value)" />
      <p v-if="errors.expiry" class="field__error">{{ errors.expiry }}</p>
    </div>

    <div class="field">
      <label for="cvv">CVV</label>
      <input id="cvv" class="input" type="password" :value="modelValue.cvv" placeholder="123" maxlength="4" @input="updateField('cvv', $event.target.value)" />
      <p v-if="errors.cvv" class="field__error">{{ errors.cvv }}</p>
    </div>
  </div>
</template>

<style scoped>
.card-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field--full {
  grid-column: 1 / -1;
}

@media (max-width: 620px) {
  .card-form {
    grid-template-columns: 1fr;
  }
}
</style>
