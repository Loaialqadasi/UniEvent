<script setup>
import { computed, onMounted, ref } from 'vue'

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationAsRead,
} from '../service/api'

const loading = ref(true)
const notifications = ref([])
const tab = ref('all')
const feedback = ref('')

const unreadCount = computed(() => notifications.value.filter((item) => !item.read).length)

const visibleNotifications = computed(() => {
  if (tab.value === 'unread') {
    return notifications.value.filter((item) => !item.read)
  }

  return notifications.value
})

const loadNotifications = async () => {
  loading.value = true

  try {
    notifications.value = await fetchNotifications()
  } finally {
    loading.value = false
  }
}

const markOne = async (id) => {
  notifications.value = await markNotificationAsRead(id)
  feedback.value = 'Notification marked as read.'
}

const markAll = async () => {
  notifications.value = await markAllNotificationsRead()
  feedback.value = 'All notifications marked as read.'
}

onMounted(loadNotifications)
</script>

<template>
  <section class="view-head">
    <h1>Notifications</h1>
    <p>Track reminders and update message read status in real time.</p>
  </section>

  <section class="panel notifications">
    <div class="notifications__top">
      <div class="chips">
        <button class="chip" :class="{ 'chip--active': tab === 'all' }" type="button" @click="tab = 'all'">
          All
        </button>
        <button class="chip" :class="{ 'chip--active': tab === 'unread' }" type="button" @click="tab = 'unread'">
          Unread ({{ unreadCount }})
        </button>
      </div>

      <button class="button button--secondary" type="button" @click="markAll" :disabled="!unreadCount">
        Mark all as read
      </button>
    </div>

    <div v-if="loading" class="empty">Loading notifications...</div>

    <div v-else-if="!visibleNotifications.length" class="empty">No notifications in this tab.</div>

    <ul v-else class="notice-list">
      <li v-for="item in visibleNotifications" :key="item.id" class="notice" :class="{ 'notice--read': item.read }">
        <div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.message }}</p>
          <small>{{ item.createdAt }}</small>
        </div>

        <button v-if="!item.read" class="button button--primary" type="button" @click="markOne(item.id)">
          Mark Read
        </button>
      </li>
    </ul>
  </section>

  <p v-if="feedback" class="status status--ok">{{ feedback }}</p>
</template>

<style scoped>
.notifications {
  padding: 18px;
}

.notifications__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.notice {
  border: 1px solid #d6deea;
  border-radius: 12px;
  background: #f8fafc;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.notice h3 {
  margin: 0;
  font-size: 16px;
}

.notice p {
  margin: 6px 0;
  color: #334155;
}

.notice small {
  color: #64748b;
  font-weight: 700;
}

.notice--read {
  opacity: 0.78;
  background: #fbfdff;
}

@media (max-width: 720px) {
  .notice {
    flex-direction: column;
    align-items: start;
  }
}
</style>
