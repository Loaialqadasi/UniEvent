<template>
  <button class="button booking-button booking-button--primary" type="button">
    <slot />
  </button>
</template>

<style scoped>
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
</style>
