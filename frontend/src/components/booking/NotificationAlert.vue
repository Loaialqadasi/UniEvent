<script setup>
defineProps({
  message: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'error',
  },
})
</script>

<template>
  <p v-if="message" class="notification-alert" :class="`notification-alert--${tone}`">{{ message }}</p>
</template>

<style scoped>
.notification-alert {
  margin: 0;
  padding: 12px 14px;
  border-radius: 10px;
  font-weight: 800;
}

.notification-alert--error {
  color: #b42318;
  background: #fef3f2;
}

.notification-alert--success {
  color: #067647;
  background: #ecfdf3;
}
</style>
