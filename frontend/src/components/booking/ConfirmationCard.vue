<script setup>
import { CircleCheckBig } from 'lucide-vue-next'

defineProps({
  reference: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <section class="confirmation-card">
    <div class="confirmation-card__icon">
      <CircleCheckBig :size="40" />
    </div>
    <h1>Booking Confirmed!</h1>
    <p>Your tickets have been sent to your email and are available in your dashboard.</p>

    <div class="confirmation-card__reference">
      <span>Booking Reference</span>
      <strong>{{ reference }}</strong>
      <span>Keep this reference for your records</span>
    </div>
  </section>
</template>

<style scoped>
.confirmation-card {
  display: grid;
  justify-items: center;
  gap: 16px;
  text-align: center;
}

.confirmation-card__icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #00a63e;
  background: #dcfce7;
}

h1 {
  margin: 0;
  color: #101828;
  font-size: 24px;
}

p {
  max-width: 600px;
  margin: 0;
  color: #4a5565;
}

.confirmation-card__reference {
  width: 100%;
  display: grid;
  gap: 8px;
  margin-top: 16px;
  padding: 24px;
  border-radius: 10px;
  background: #f9fafb;
}

.confirmation-card__reference span {
  color: #4a5565;
}

.confirmation-card__reference strong {
  color: #101828;
  font-size: 24px;
  letter-spacing: 1px;
}
</style>
