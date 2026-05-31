<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'

import {
  fetchNotifications,
  fetchSentPushNotifications,
  fetchSyncedCalendarEvents,
  markAllNotificationsRead,
  markNotificationAsRead,
  sendPushNotification,
  syncCalendar,
} from '../service/api'
import { authState } from '../service/auth'

// ─── Role ──────────────────────────────────────────────────────────────────
const role = computed(() => authState.user?.role ?? 'student')

// ─── Shared ────────────────────────────────────────────────────────────────
const loading = ref(true)
const notifications = ref([])
const tab = ref('all')
const feedback = ref('')
const feedbackType = ref('ok')

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
  flash('Notification marked as read.', 'ok')
}

const markAll = async () => {
  notifications.value = await markAllNotificationsRead()
  flash('All notifications marked as read.', 'ok')
}

// ─── Student: Calendar Sync ─────────────────────────────────────────────────
const syncBusy = ref(false)
const syncDone = ref(false)
const syncedEvents = ref([])

const onSyncCalendar = async () => {
  syncBusy.value = true
  try {
    syncedEvents.value = await syncCalendar()
    syncDone.value = true
    notifications.value = await fetchNotifications()
    flash('Calendar synced! You will now receive event reminders.', 'ok')
  } catch {
    flash('Calendar sync failed. Try again.', 'warn')
  } finally {
    syncBusy.value = false
  }
}

const todayMs = Date.now()
const upcomingReminders = computed(() => {
  const fourteenDays = 14 * 24 * 60 * 60 * 1000
  return syncedEvents.value.filter((item) => {
    const d = new Date(item.date).getTime()
    return d >= todayMs && d <= todayMs + fourteenDays
  })
})

// ─── Organizer: Push Notification ──────────────────────────────────────────
const pushBusy = ref(false)
const sentPushList = ref([])
const pushLoadingHistory = ref(false)

const pushForm = reactive({
  title: '',
  message: '',
  target: 'All Students',
})

const pushErrors = reactive({})

const pushTargets = ['All Students', 'Technology', 'Career', 'Academic', 'Sports', 'Arts', 'Entertainment']

const validatePush = () => {
  Object.keys(pushErrors).forEach((k) => delete pushErrors[k])
  if (!pushForm.title.trim()) pushErrors.title = 'Title is required.'
  if (pushForm.message.trim().length < 8) pushErrors.message = 'Message must be at least 8 characters.'
  return Object.keys(pushErrors).length === 0
}

const onSendPush = async () => {
  if (!validatePush()) return
  pushBusy.value = true
  try {
    const item = await sendPushNotification({ ...pushForm })
    sentPushList.value = [item, ...sentPushList.value]
    pushForm.title = ''
    pushForm.message = ''
    pushForm.target = 'All Students'
    flash(`Notification sent to ${item.recipients} students.`, 'ok')
  } catch {
    flash('Failed to send notification.', 'warn')
  } finally {
    pushBusy.value = false
  }
}

const loadPushHistory = async () => {
  pushLoadingHistory.value = true
  try {
    sentPushList.value = await fetchSentPushNotifications()
  } finally {
    pushLoadingHistory.value = false
  }
}

// ─── Helper ────────────────────────────────────────────────────────────────
function flash(msg, type = 'ok') {
  feedback.value = msg
  feedbackType.value = type
  setTimeout(() => { feedback.value = '' }, 5000)
}

function catColor(cat) {
  const map = {
    Technology: '#3b82f6',
    Career: '#22c55e',
    Academic: '#a855f7',
    Sports: '#f97316',
    Arts: '#6366f1',
    Entertainment: '#ec4899',
  }
  return map[cat] ?? '#6b7280'
}

const typeIcon = { success: '✅', info: 'ℹ️', warning: '⚠️' }

onMounted(async () => {
  if (role.value === 'student') {
    await loadNotifications()
    syncedEvents.value = await fetchSyncedCalendarEvents()
    syncDone.value = syncedEvents.value.length > 0
    return
  }

  await loadPushHistory()
})

watch(role, async (nextRole) => {
  if (nextRole === 'student') {
    await loadNotifications()
    syncedEvents.value = await fetchSyncedCalendarEvents()
    syncDone.value = syncedEvents.value.length > 0
    return
  }

  await loadPushHistory()
})
</script>

<template>
  <section class="view-head">
    <div class="view-head__top">
      <div>
        <h1>Notifications & Calendar</h1>
        <p v-if="role === 'student'">Sync your calendar, view event reminders, and manage notifications.</p>
        <p v-else>Send push notifications to students and track delivery history.</p>
      </div>
    </div>
  </section>

  <p v-if="feedback" class="status-banner" :class="feedbackType === 'ok' ? 'status-banner--ok' : 'status-banner--warn'">{{ feedback }}</p>

  <!-- ════ STUDENT VIEW ════ -->
  <template v-if="role === 'student'">
    <div class="student-layout">
      <!-- Notifications list -->
      <div class="panel notif-panel">
        <div class="notif-panel__top">
          <div class="chips">
            <button class="chip" :class="{ 'chip--active': tab === 'all' }" @click="tab = 'all'">All</button>
            <button class="chip" :class="{ 'chip--active': tab === 'unread' }" @click="tab = 'unread'">
              Unread <span v-if="unreadCount" class="unread-badge">{{ unreadCount }}</span>
            </button>
          </div>
          <button class="button button--secondary" @click="markAll" :disabled="!unreadCount">Mark all read</button>
        </div>

        <div v-if="loading" class="empty">Loading notifications...</div>
        <div v-else-if="!visibleNotifications.length" class="empty">No notifications here.</div>
        <ul v-else class="notice-list">
          <li v-for="item in visibleNotifications" :key="item.id" class="notice" :class="{ 'notice--read': item.read }">
            <span class="notice-icon">{{ typeIcon[item.type] ?? '🔔' }}</span>
            <div class="notice-body">
              <h3>{{ item.title }}</h3>
              <p>{{ item.message }}</p>
              <small>{{ item.createdAt }}</small>
            </div>
            <button v-if="!item.read" class="action-btn" @click="markOne(item.id)">Mark Read</button>
          </li>
        </ul>
      </div>

      <!-- Right: sync + reminders -->
      <div class="right-col">
        <div class="panel sync-card">
          <div class="sync-card__head">
            <div class="sync-icon-wrap" :class="{ 'sync-icon-wrap--done': syncDone }">📅</div>
            <div>
              <h3>Personal Calendar</h3>
              <p>{{ syncDone ? 'Synced — receiving reminders' : 'Not synced yet' }}</p>
            </div>
          </div>
          <button class="button button--primary sync-btn" :disabled="syncBusy" @click="onSyncCalendar">
            {{ syncBusy ? 'Syncing...' : syncDone ? '↻ Re-sync Calendar' : 'Sync My Calendar' }}
          </button>
          <div v-if="syncDone" class="sync-success">
            <span class="sync-tick">✓</span> {{ syncedEvents.length }} event(s) synced to your calendar
          </div>
        </div>

        <div class="panel reminders-card">
          <h3 class="reminders-title">Upcoming Reminders</h3>
          <p class="reminders-sub">Events within the next 14 days</p>
          <div v-if="!syncDone" class="empty">Sync your calendar to see reminders.</div>
          <div v-else-if="!upcomingReminders.length" class="empty">No upcoming events in 14 days.</div>
          <ul v-else class="reminder-list">
            <li v-for="item in upcomingReminders" :key="item.id" class="reminder-item">
              <div class="reminder-date-col">
                <div class="reminder-day">{{ new Date(item.date).getDate() }}</div>
                <div class="reminder-month">{{ new Date(item.date).toLocaleString('en', { month: 'short' }) }}</div>
              </div>
              <div class="reminder-info">
                <div class="reminder-name">{{ item.title }}</div>
                <div class="reminder-meta">{{ item.time }} · {{ item.venue }}</div>
              </div>
              <span class="reminder-cat-dot" :style="{ background: catColor(item.category) }"></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>

  <!-- ════ ORGANIZER VIEW ════ -->
  <template v-else>
    <div class="org-layout">
      <div class="panel push-panel">
        <h2 class="push-title">Send Push Notification</h2>
        <p class="push-sub">Broadcast a message to students immediately after calendar sync.</p>
        <div class="push-form">
          <div class="field">
            <label for="push-title">Notification Title</label>
            <input id="push-title" v-model="pushForm.title" class="input" type="text" placeholder="e.g. Event Update: Tech Summit" />
            <p v-if="pushErrors.title" class="field__error">{{ pushErrors.title }}</p>
          </div>
          <div class="field">
            <label for="push-msg">Message</label>
            <textarea id="push-msg" v-model="pushForm.message" class="textarea" placeholder="Write your notification message here..."></textarea>
            <p v-if="pushErrors.message" class="field__error">{{ pushErrors.message }}</p>
          </div>
          <div class="field">
            <label for="push-target">Target Audience</label>
            <select id="push-target" v-model="pushForm.target" class="select">
              <option v-for="t in pushTargets" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <button class="button button--primary push-send-btn" :disabled="pushBusy" @click="onSendPush">
            {{ pushBusy ? 'Sending...' : '📤 Send Notification' }}
          </button>
        </div>
      </div>

      <div class="panel history-panel">
        <h3 class="history-title">Sent History</h3>
        <div v-if="pushLoadingHistory" class="empty">Loading history...</div>
        <div v-else-if="!sentPushList.length" class="empty">No notifications sent yet.</div>
        <ul v-else class="history-list">
          <li v-for="item in sentPushList" :key="item.id" class="history-item">
            <div class="history-meta">
              <span class="history-target-badge">{{ item.target }}</span>
              <span class="history-time">{{ item.sentAt }}</span>
            </div>
            <div class="history-title-text">{{ item.title }}</div>
            <div class="history-msg">{{ item.message }}</div>
            <div class="history-reach">📡 Reached {{ item.recipients }} students</div>
          </li>
        </ul>
      </div>
    </div>
  </template>
</template>

<style scoped>
.view-head__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.role-switcher { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.role-switcher__label { font-size: 0.8rem; font-weight: 600; color: #64748b; }
.role-tabs { display: flex; background: #f1f5f9; border-radius: 10px; padding: 3px; gap: 2px; }
.role-tab { padding: 6px 16px; border: none; border-radius: 8px; background: transparent; font-size: 0.82rem; font-weight: 600; cursor: pointer; color: #64748b; transition: all 0.18s; }
.role-tab--active { background: #fff; color: #1d4ed8; box-shadow: 0 1px 4px rgba(0,0,0,0.12); }

.status-banner { margin: 0 0 14px; padding: 10px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; }
.status-banner--ok { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.status-banner--warn { background: #fef9c3; color: #92400e; border: 1px solid #fde68a; }

/* Student layout */
.student-layout { display: grid; grid-template-columns: 1fr 320px; gap: 16px; align-items: start; }

.notif-panel { padding: 18px; }
.notif-panel__top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }

.unread-badge {
  display: inline-flex; align-items: center; justify-content: center;
  background: #ef4444; color: #fff; font-size: 0.68rem; font-weight: 800;
  border-radius: 99px; min-width: 18px; height: 18px; padding: 0 4px; margin-left: 4px; vertical-align: middle;
}

.notice-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.notice { border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; padding: 14px 16px; display: flex; align-items: flex-start; gap: 12px; }
.notice--read { opacity: 0.65; background: #fbfdff; }
.notice-icon { font-size: 1.3rem; flex-shrink: 0; margin-top: 1px; }
.notice-body { flex: 1; }
.notice-body h3 { margin: 0 0 4px; font-size: 0.92rem; color: #0f172a; }
.notice-body p { margin: 0 0 6px; color: #475569; font-size: 0.85rem; line-height: 1.5; }
.notice-body small { font-size: 0.72rem; color: #94a3b8; font-weight: 600; }
.action-btn { flex-shrink: 0; padding: 5px 12px; border: none; border-radius: 7px; font-size: 0.75rem; font-weight: 700; cursor: pointer; background: #dbeafe; color: #1d4ed8; }

/* Right column */
.right-col { display: flex; flex-direction: column; gap: 16px; }

.sync-card { padding: 20px; }
.sync-card__head { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.sync-icon-wrap { width: 48px; height: 48px; border-radius: 12px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
.sync-icon-wrap--done { background: #dcfce7; }
.sync-card__head h3 { margin: 0 0 2px; font-size: 1rem; color: #0f172a; }
.sync-card__head p { margin: 0; font-size: 0.8rem; color: #64748b; }
.sync-btn { width: 100%; justify-content: center; }
.sync-success { margin-top: 12px; font-size: 0.8rem; color: #16a34a; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.sync-tick { background: #dcfce7; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 900; }

.reminders-card { padding: 20px; }
.reminders-title { margin: 0 0 2px; font-size: 1rem; color: #0f172a; }
.reminders-sub { margin: 0 0 14px; font-size: 0.78rem; color: #94a3b8; }
.reminder-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.reminder-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; }
.reminder-date-col { text-align: center; min-width: 34px; }
.reminder-day { font-size: 1.1rem; font-weight: 900; color: #1d4ed8; line-height: 1; }
.reminder-month { font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
.reminder-info { flex: 1; }
.reminder-name { font-size: 0.83rem; font-weight: 700; color: #0f172a; }
.reminder-meta { font-size: 0.72rem; color: #64748b; margin-top: 2px; }
.reminder-cat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* Organizer layout */
.org-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
.push-panel { padding: 22px 24px; }
.push-title { margin: 0 0 4px; font-size: 1.15rem; color: #0f172a; }
.push-sub { margin: 0 0 20px; font-size: 0.83rem; color: #64748b; }
.push-form { display: grid; gap: 14px; }
.push-send-btn { width: 100%; justify-content: center; font-size: 0.9rem; }
.history-panel { padding: 22px 24px; }
.history-title { margin: 0 0 16px; font-size: 1rem; color: #0f172a; }
.history-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
.history-item { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; background: #f8fafc; }
.history-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.history-target-badge { background: #dbeafe; color: #1d4ed8; font-size: 0.7rem; font-weight: 700; padding: 2px 10px; border-radius: 99px; }
.history-time { font-size: 0.72rem; color: #94a3b8; font-weight: 600; }
.history-title-text { font-size: 0.9rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
.history-msg { font-size: 0.82rem; color: #475569; line-height: 1.5; margin-bottom: 8px; }
.history-reach { font-size: 0.75rem; color: #64748b; font-weight: 600; }

@media (max-width: 1080px) {
  .student-layout, .org-layout { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .view-head__top { flex-direction: column; }
}
</style>
