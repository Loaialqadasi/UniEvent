<script setup>
import PrimaryButton from './PrimaryButton.vue'
import SecondaryButton from './SecondaryButton.vue'

defineEmits(['viewEvent', 'browse'])
</script>

<template>
  <div class="success-actions">
    <PrimaryButton @click="$emit('viewEvent')">View Event Details</PrimaryButton>
    <SecondaryButton @click="$emit('browse')">Browse More Events</SecondaryButton>
  </div>
</template>

<style scoped>
.success-actions {
  display: grid;
  gap: 12px;
  width: 100%;
}
</style>
