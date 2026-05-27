<template>
  <button class="button booking-button booking-button--secondary" type="button">
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

.booking-button--secondary {
  border-width: 2px;
  border-color: #d1d5dc;
  color: #364153;
  background: #fff;
}

.booking-button--secondary:hover:not(:disabled) {
  border-color: #aab2c0;
  background: #f9fafb;
}
</style>
