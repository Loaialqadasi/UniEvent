<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, MessageSquare, Plus, Calendar, User, Clock } from 'lucide-vue-next'
import { authState } from '../service/auth'
import { fetchForumPosts, fetchEvents, createForumPost } from '../service/api'

// Router
const router = useRouter()

// Current User State
const currentUser = computed(() => authState.user)

// Data loading states
const postsLoading = ref(true)
const postsError = ref('')
const eventsLoading = ref(true)
const saving = ref(false)
const statusMessage = ref('')
const statusType = ref('ok') // 'ok' | 'warn'

// Data arrays
const posts = ref([])
const events = ref([])
const commentCounts = ref({}) // mapping postId -> count

// Search/Filter values
const searchText = ref('')
const selectedEventFilter = ref('All')

// Form (New Post)
const showCreateForm = ref(false)
const form = ref({
  title: '',
  content: '',
  eventId: ''
})

// Client-side validations
const errors = ref({
  title: '',
  content: '',
  eventId: ''
})

// Load initial data
const loadData = async () => {
  postsLoading.value = true
  eventsLoading.value = true
  postsError.value = ''
  try {
    const [fetchedPosts, fetchedEvents] = await Promise.all([
      fetchForumPosts(),
      fetchEvents()
    ])
    posts.value = fetchedPosts
    events.value = fetchedEvents
    
    // Auto-select first event in form dropdown
    if (fetchedEvents.length > 0) {
      form.value.eventId = fetchedEvents[0].id
    }
  } catch (err) {
    postsError.value = 'Failed to load forum discussions. Please try again.'
  } finally {
    postsLoading.value = false
    eventsLoading.value = false
  }
}

onMounted(loadData)

// Map eventId to Event Title
const getEventTitle = (eventId) => {
  const match = events.value.find((e) => e.id === eventId)
  return match ? match.title : `Event #${eventId}`
}

// Map eventId to Event Category
const getEventCategory = (eventId) => {
  const match = events.value.find((e) => e.id === eventId)
  return match ? match.category : 'General'
}

// Categories mapping colors matching teammate's design system
const categoryColors = {
  Technology: '#3b82f6',
  Career: '#22c55e',
  Academic: '#a855f7',
  Sports: '#f97316',
  Arts: '#6366f1',
  Entertainment: '#ec4899',
  General: '#6b7280'
}

// Filtered posts based on search criteria and selected event category filter
const filteredPosts = computed(() => {
  const query = searchText.value.trim().toLowerCase()
  return posts.value.filter((post) => {
    const matchesSearch =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query)
    
    const eventCategory = getEventCategory(post.eventId)
    const matchesFilter = selectedEventFilter.value === 'All' || eventCategory === selectedEventFilter.value
    
    return matchesSearch && matchesFilter
  })
})

// Categories list for chips
const categories = ['All', 'Technology', 'Career', 'Academic', 'Sports', 'Arts', 'Entertainment']

// Form Validations
const validateForm = () => {
  let isValid = true
  errors.value = { title: '', content: '', eventId: '' }

  if (!form.value.eventId) {
    errors.value.eventId = 'You must select an associated event.'
    isValid = false
  }

  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required.'
    isValid = false
  } else if (form.value.title.trim().length < 5) {
    errors.value.title = 'Title must be at least 5 characters.'
    isValid = false
  }

  if (!form.value.content.trim()) {
    errors.value.content = 'Content is required.'
    isValid = false
  } else if (form.value.content.trim().length < 20) {
    errors.value.content = 'Content must be at least 20 characters.'
    isValid = false
  }

  return isValid
}

// Submit a new discussion thread
const onSubmit = async () => {
  if (!validateForm()) return
  saving.value = true
  statusMessage.value = ''

  try {
    const payload = {
      title: form.value.title,
      content: form.value.content,
      eventId: Number(form.value.eventId),
      author: currentUser.value ? currentUser.value.name : 'Guest User'
    }
    const createdPost = await createForumPost(payload)
    posts.value = [createdPost, ...posts.value]
    
    // Reset form
    form.value.title = ''
    form.value.content = ''
    if (events.value.length > 0) {
      form.value.eventId = events.value[0].id
    }
    showCreateForm.value = false
    flash('Discussion thread created successfully!', 'ok')
  } catch (err) {
    flash(err.message || 'Could not post discussion. Please check inputs.', 'warn')
  } finally {
    saving.value = false
  }
}

// Helper flash message banner
const flash = (msg, type = 'ok') => {
  statusMessage.value = msg
  statusType.value = type
  setTimeout(() => {
    statusMessage.value = ''
  }, 4000)
}

// Format relative date / clean representation
const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Open post detail thread
const openThread = (postId) => {
  router.push(`/forum/${postId}`)
}
</script>

<template>
  <section class="view-head">
    <div class="view-head__top">
      <div>
        <h1>Forum Discussions</h1>
        <p>Discuss campus events, ask questions, share project ideas, and interact with peers.</p>
      </div>
      <button 
        v-if="currentUser" 
        class="button button--primary new-discussion-btn" 
        type="button" 
        @click="showCreateForm = true"
      >
        <Plus :size="16" />
        New Discussion
      </button>
    </div>
  </section>

  <!-- Success/Warning Toast Banner -->
  <p 
    v-if="statusMessage" 
    class="status-banner" 
    :class="statusType === 'ok' ? 'status-banner--ok' : 'status-banner--warn'"
  >
    {{ statusMessage }}
  </p>

  <div class="forum-layout">
    <!-- Left panel: Forums list and controls -->
    <div class="panel forum-board">
      <div class="forum-board__controls">
        <div class="search-wrapper">
          <Search :size="18" class="search-icon" />
          <input
            v-model="searchText"
            class="input search-input"
            type="search"
            placeholder="Search discussions by keyword, author..."
            aria-label="Search forum"
          />
        </div>
      </div>

      <!-- Categories filter chips -->
      <div class="chips-container">
        <span class="filter-label">Category:</span>
        <div class="chips">
          <button
            v-for="cat in categories"
            :key="cat"
            class="chip"
            :class="{ 'chip--active': selectedEventFilter === cat }"
            type="button"
            @click="selectedEventFilter = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Posts List -->
      <div v-if="postsLoading" class="empty">Loading forum topics...</div>
      <div v-else-if="postsError" class="empty error-empty">{{ postsError }}</div>
      <div v-else-if="!filteredPosts.length" class="empty">No discussions found matching filters. Be the first to start a topic!</div>
      
      <div v-else class="posts-list">
        <article 
          v-for="post in filteredPosts" 
          :key="post.postId" 
          class="post-card"
          @click="openThread(post.postId)"
        >
          <div class="post-card__header">
            <span 
              class="category-tag" 
              :style="{ backgroundColor: `${categoryColors[getEventCategory(post.eventId)]}15`, color: categoryColors[getEventCategory(post.eventId)] }"
            >
              {{ getEventCategory(post.eventId) }}
            </span>
            <span class="event-badge">
              Event: {{ getEventTitle(post.eventId) }}
            </span>
          </div>

          <h3 class="post-card__title">{{ post.title }}</h3>
          <p class="post-card__snippet">{{ post.content }}</p>

          <div class="post-card__footer">
            <div class="meta-info">
              <span class="meta-item">
                <User :size="14" />
                {{ post.author }}
              </span>
              <span class="meta-item">
                <Clock :size="14" />
                {{ formatDate(post.createdAt) }}
              </span>
            </div>
            <span class="comments-badge">
              <MessageSquare :size="15" />
              Discuss
            </span>
          </div>
        </article>
      </div>
    </div>
  </div>

  <!-- Create Discussion Slide-over Modal -->
  <Teleport to="body">
    <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
      <div class="form-dialog panel">
        <div class="form-dialog__head">
          <h3>Create Discussion Thread</h3>
          <button class="close-btn" @click="showCreateForm = false">✕</button>
        </div>

        <form class="dialog-form" @submit.prevent="onSubmit">
          <div class="field">
            <label for="event-select">Related Event</label>
            <select id="event-select" v-model="form.eventId" class="select" required>
              <option v-for="ev in events" :key="ev.id" :value="ev.id">
                [{{ ev.category }}] {{ ev.title }}
              </option>
            </select>
            <p v-if="errors.eventId" class="field__error">{{ errors.eventId }}</p>
          </div>

          <div class="field">
            <label for="post-title">Discussion Title</label>
            <input 
              id="post-title" 
              v-model="form.title" 
              type="text" 
              class="input" 
              placeholder="Questions about UTM Career Fair 2026..." 
              required 
            />
            <p v-if="errors.title" class="field__error">{{ errors.title }}</p>
          </div>

          <div class="field">
            <label for="post-content">Message Content</label>
            <textarea 
              id="post-content" 
              v-model="form.content" 
              class="textarea" 
              placeholder="Provide a detailed description of what you would like to discuss (minimum 20 characters)..." 
              required
            ></textarea>
            <p v-if="errors.content" class="field__error">{{ errors.content }}</p>
          </div>

          <div class="form-dialog__actions">
            <button class="button button--secondary" type="button" @click="showCreateForm = false">Cancel</button>
            <button class="button button--primary" type="submit" :disabled="saving">
              {{ saving ? 'Creating...' : 'Post Discussion' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.new-discussion-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.status-banner {
  margin: 0 0 16px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
}

.status-banner--ok {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.status-banner--warn {
  background: #fef9c3;
  color: #92400e;
  border: 1px solid #fde68a;
}

.forum-layout {
  display: grid;
  gap: 20px;
}

.forum-board {
  padding: 24px;
}

.forum-board__controls {
  margin-bottom: 16px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  padding-left: 42px !important;
  font-size: 0.95rem;
}

.chips-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
}

.posts-list {
  display: grid;
  gap: 16px;
}

.post-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
  cursor: pointer;
  transition: all 0.18s ease-in-out;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.post-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 4px 18px rgba(79, 57, 246, 0.08);
  transform: translateY(-2px);
}

.post-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.category-tag {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
}

.event-badge {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-muted);
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-card__title {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: 1.15rem;
  color: #0f172a;
  line-height: 1.3;
}

.post-card__snippet {
  margin: 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
  margin-top: 6px;
  flex-wrap: wrap;
  gap: 10px;
}

.meta-info {
  display: flex;
  gap: 16px;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.comments-badge {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 5px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
}

.post-card:hover .comments-badge {
  background: var(--primary);
  color: #fff;
}

/* Modal Overlay Styling */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
}

.form-dialog {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 24px;
  max-width: 580px;
  width: 100%;
  box-shadow: 0 20px 48px rgba(0,0,0,0.18);
  animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.form-dialog__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.form-dialog__head h3 {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: 1.2rem;
  color: #0f172a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

.close-btn:hover {
  color: #475569;
}

.dialog-form {
  display: grid;
  gap: 16px;
}

.form-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .forum-board {
    padding: 16px;
  }
  .post-card {
    padding: 16px;
  }
  .chips-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
