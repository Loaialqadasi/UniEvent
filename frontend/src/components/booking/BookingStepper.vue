<script setup>
const props = defineProps({
  currentStep: {
    type: Number,
    required: true,
  },
})

const steps = [
  { id: 1, label: 'Tickets' },
  { id: 2, label: 'Payment' },
  { id: 3, label: 'Done' },
]
</script>

<template>
  <ol class="booking-stepper" aria-label="Booking progress">
    <li v-for="(step, index) in steps" :key="step.id" class="booking-stepper__item">
      <span class="booking-stepper__badge" :class="{ 'booking-stepper__badge--active': step.id <= props.currentStep }">
        {{ step.id }}
      </span>
      <span class="booking-stepper__label" :class="{ 'booking-stepper__label--active': step.id <= props.currentStep }">
        {{ step.label }}
      </span>
      <span v-if="index < steps.length - 1" class="booking-stepper__line" :class="{ 'booking-stepper__line--active': step.id < props.currentStep }"></span>
    </li>
  </ol>
</template>

<style scoped>
.booking-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.booking-stepper__item {
  display: contents;
}

.booking-stepper__badge {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #99a1af;
  background: #e5e7eb;
  font-weight: 700;
}

.booking-stepper__badge--active {
  color: #fff;
  background: #4f39f6;
}

.booking-stepper__label {
  color: #99a1af;
  font-weight: 800;
}

.booking-stepper__label--active {
  color: #4f39f6;
}

.booking-stepper__line {
  width: 48px;
  height: 4px;
  border-radius: 999px;
  background: #e5e7eb;
}

.booking-stepper__line--active {
  background: #4f39f6;
}

@media (max-width: 620px) {
  .booking-stepper {
    gap: 8px;
  }

  .booking-stepper__line {
    width: 24px;
  }

  .booking-stepper__label {
    font-size: 13px;
  }
}
</style>
