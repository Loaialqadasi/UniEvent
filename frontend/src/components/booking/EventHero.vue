<script setup>
defineProps({
  event: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section class="event-hero" :style="{ backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.62), rgba(0, 0, 0, 0.08)), url(${event.heroImage})` }">
    <span class="event-hero__tag">{{ event.category }}</span>
    <h1>{{ event.title }}</h1>
  </section>
</template>

<style scoped>
.event-hero {
  min-height: 384px;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: start;
  gap: 16px;
  padding: 32px;
  border-radius: 16px;
  overflow: hidden;
  background-position: center;
  background-size: cover;
}

.event-hero__tag {
  border-radius: 999px;
  padding: 8px 16px;
  color: #fff;
  background: #4f39f6;
  font-weight: 800;
}

.event-hero h1 {
  max-width: 760px;
  margin: 0;
  color: #fff;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1;
}
</style>
