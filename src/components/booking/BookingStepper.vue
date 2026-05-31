<script setup>
const props = defineProps({
  currentStep: {
    type: Number,
    required: true,
  },
})

const steps = [
  { id: 1, label: 'Event' },
  { id: 2, label: 'Tickets' },
  { id: 3, label: 'Review' },
  { id: 4, label: 'Payment' },
  { id: 5, label: 'Done' },
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
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
  overflow: hidden;
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
  white-space: nowrap;
}

.booking-stepper__label--active {
  color: #4f39f6;
}

.booking-stepper__line {
  width: clamp(18px, 4vw, 48px);
  height: 4px;
  flex: 0 1 48px;
  border-radius: 999px;
  background: #e5e7eb;
}

.booking-stepper__line--active {
  background: #4f39f6;
}

@media (max-width: 620px) {
  .booking-stepper {
    gap: 6px;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .booking-stepper__line {
    width: 20px;
    flex-basis: 20px;
  }

  .booking-stepper__label {
    font-size: 12px;
  }
}
</style>
