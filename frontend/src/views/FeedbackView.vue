<script setup>
import { computed, onMounted, ref } from 'vue'
import { Star, MessageSquare, Plus, User, Clock, Trash2, CheckCircle2 } from 'lucide-vue-next'
import { authState } from '../service/auth'
import { fetchFeedback, submitFeedback, deleteFeedback, fetchEvents } from '../service/api'

// Current User State
const currentUser = computed(() => authState.user)

// Loading and process states
const feedbackLoading = ref(true)
const feedbackError = ref('')
const submitting = ref(false)
const successMessage = ref('')
const statusMessage = ref('')
const statusType = ref('ok') // 'ok' | 'warn'

// Data models
const feedbacks = ref([])
const events = ref([])

// Form review model
const form = ref({
  eventId: '',
  rating: 0,
  review: ''
})

// Form error indicators
const errors = ref({
  eventId: '',
  rating: '',
  review: ''
})

// Hover rating for interactive stars
const hoverRating = ref(0)

// Load feedback list and events list
const loadData = async () => {
  feedbackLoading.value = true
  feedbackError.value = ''
  try {
    const [fetchedFeedback, fetchedEvents] = await Promise.all([
      fetchFeedback(),
      fetchEvents()
    ])
    feedbacks.value = fetchedFeedback
    events.value = fetchedEvents
  } catch (err) {
    feedbackError.value = 'Failed to load community feedback. Please reload.'
  } finally {
    feedbackLoading.value = false
  }
}

onMounted(loadData)

// Map Event Title from Event Database
const getEventTitle = (eventId) => {
  const match = events.value.find((e) => e.id === eventId)
  return match ? match.title : `Event #${eventId}`
}

// Map Event Category
const getEventCategory = (eventId) => {
  const match = events.value.find((e) => e.id === eventId)
  return match ? match.category : 'Event'
}

// Calculate aggregate statistics
const stats = computed(() => {
  if (feedbacks.value.length === 0) {
    return { average: 0.0, total: 0, distribution: [0, 0, 0, 0, 0] }
  }

  const total = feedbacks.value.length
  let sum = 0
  const dist = [0, 0, 0, 0, 0] // index 0 = 1 star, index 4 = 5 stars

  feedbacks.value.forEach((f) => {
    sum += f.rating
    const starIdx = Math.max(1, Math.min(5, f.rating)) - 1
    dist[starIdx]++
  })

  return {
    average: (sum / total).toFixed(1),
    total,
    distribution: [...dist].reverse() // [5-stars count, 4-stars count, ...]
  }
})

// Validate Feedback form
const validateForm = () => {
  let isValid = true
  errors.value = { eventId: '', rating: '', review: '' }

  if (!form.value.eventId) {
    errors.value.eventId = 'Please select the event you attended.'
    isValid = false
  }

  if (form.value.rating < 1 || form.value.rating > 5) {
    errors.value.rating = 'Please click to select a rating between 1 and 5 stars.'
    isValid = false
  }

  if (!form.value.review.trim()) {
    errors.value.review = 'Review text is required.'
    isValid = false
  } else if (form.value.review.trim().length < 10) {
    errors.value.review = 'Review comment must be at least 10 characters.'
    isValid = false
  }

  return isValid
}

// Submit a review
const onSubmitReview = async () => {
  if (!validateForm()) return
  submitting.value = true
  successMessage.value = ''
  statusMessage.value = ''

  try {
    const payload = {
      eventId: Number(form.value.eventId),
      rating: Number(form.value.rating),
      review: form.value.review,
      user: currentUser.value ? currentUser.value.name : 'Guest User'
    }
    const created = await submitFeedback(payload)
    feedbacks.value = [created, ...feedbacks.value]
    
    // Reset Form
    form.value.eventId = ''
    form.value.rating = 0
    form.value.review = ''
    
    successMessage.value = 'Thank you! Your feedback has been submitted successfully.'
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  } catch (err) {
    flash(err.message || 'Submission failed. Please check your fields.', 'warn')
  } finally {
    submitting.value = false
  }
}

// Delete review
const onDeleteReview = async (feedbackId) => {
  if (!confirm('Are you sure you want to delete your feedback?')) return
  try {
    await deleteFeedback(feedbackId)
    feedbacks.value = feedbacks.value.filter((f) => f.feedbackId !== feedbackId)
    flash('Feedback record deleted.', 'ok')
  } catch (err) {
    flash('Could not delete feedback. Try again.', 'warn')
  }
}

// Check ownership helper
const isOwner = (userName) => {
  return currentUser.value && currentUser.value.name === userName
}

// Helper flash message banner
const flash = (msg, type = 'ok') => {
  statusMessage.value = msg
  statusType.value = type
  setTimeout(() => {
    statusMessage.value = ''
  }, 4000)
}

// Format date nicely
const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <section class="view-head">
    <div class="view-head__top">
      <div>
        <h1>Community Feedback</h1>
        <p>Read event reviews, view scores, and submit your event ratings to help us improve campus events.</p>
      </div>
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

  <div v-if="successMessage" class="feedback-success-banner">
    <CheckCircle2 :size="20" />
    <span>{{ successMessage }}</span>
  </div>

  <div class="feedback-grid">
    <!-- Left column: reviews and summary stats -->
    <div class="reviews-list-col">
      <!-- Ratings Summary Card -->
      <section class="panel summary-card">
        <h2>Overall Event Satisfaction</h2>
        
        <div class="summary-card__content">
          <div class="average-score-box">
            <span class="score-number">{{ stats.average }}</span>
            <div class="score-stars">
              <div class="stars-row">
                <Star 
                  v-for="i in 5" 
                  :key="i" 
                  :size="18"
                  :class="i <= Math.round(Number(stats.average)) ? 'star--filled' : 'star--empty'"
                />
              </div>
              <span class="score-count">{{ stats.total }} reviews</span>
            </div>
          </div>

          <!-- Distribution graph bars -->
          <div class="score-distribution">
            <div 
              v-for="(count, index) in stats.distribution" 
              :key="index"
              class="dist-bar-item"
            >
              <span class="dist-label">{{ 5 - index }} ★</span>
              <div class="dist-bar-track">
                <div 
                  class="dist-bar-fill" 
                  :style="{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }"
                ></div>
              </div>
              <span class="dist-count">{{ count }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Feedback List -->
      <section class="panel feed-list-panel">
        <div class="feed-list-header">
          <MessageSquare :size="18" />
          <h2>Recent Reviews</h2>
        </div>

        <div v-if="feedbackLoading" class="empty">Loading recent reviews...</div>
        <div v-else-if="feedbackError" class="empty error-empty">{{ feedbackError }}</div>
        <div v-else-if="!feedbacks.length" class="empty">No feedback records have been published yet.</div>
        
        <div v-else class="feed-list">
          <article 
            v-for="feed in feedbacks" 
            :key="feed.feedbackId" 
            class="feed-card"
          >
            <div class="feed-card__header">
              <div class="user-meta">
                <span class="user-avatar">{{ feed.user.charAt(0) }}</span>
                <div>
                  <div class="user-row">
                    <span class="user-name">{{ feed.user }}</span>
                    <span v-if="isOwner(feed.user)" class="my-review-badge">You</span>
                  </div>
                  <span class="feed-date">{{ formatDate(feed.createdAt) }}</span>
                </div>
              </div>

              <button 
                v-if="isOwner(feed.user)" 
                class="feed-delete-btn" 
                title="Delete review"
                @click="onDeleteReview(feed.feedbackId)"
              >
                <Trash2 :size="14" />
                <span>Delete</span>
              </button>
            </div>

            <!-- Event target and stars row -->
            <div class="feed-rating-row">
              <div class="stars-row">
                <Star 
                  v-for="i in 5" 
                  :key="i" 
                  :size="15"
                  :class="i <= feed.rating ? 'star--filled' : 'star--empty'"
                />
              </div>
              <span class="event-tag">
                [{{ getEventCategory(feed.eventId) }}] {{ getEventTitle(feed.eventId) }}
              </span>
            </div>

            <div class="feed-review-content">
              <p>{{ feed.review }}</p>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- Right column: Submit Review Form -->
    <div class="form-col">
      <section class="panel review-form-card">
        <h2>Submit Feedback</h2>
        
        <!-- Only allow students to submit reviews -->
        <template v-if="currentUser?.role === 'student'">
          <p class="form-instructions">
            Share your experience at campus events. Your rating and comments will help organizers improve future schedules and operations.
          </p>

          <form class="feedback-form-element" @submit.prevent="onSubmitReview">
            <!-- Event Selection -->
            <div class="field">
              <label for="event-review-select">Event Visited</label>
              <select id="event-review-select" v-model="form.eventId" class="select" required>
                <option value="" disabled>-- Select Event --</option>
                <option v-for="ev in events" :key="ev.id" :value="ev.id">
                  {{ ev.title }}
                </option>
              </select>
              <p v-if="errors.eventId" class="field__error">{{ errors.eventId }}</p>
            </div>

            <!-- Interactive Star Picker -->
            <div class="field">
              <label>Your Rating</label>
              <div class="star-picker-wrapper">
                <div class="star-picker">
                  <button 
                    v-for="i in 5" 
                    :key="i"
                    type="button"
                    class="picker-star-btn"
                    @click="form.rating = i"
                    @mouseover="hoverRating = i"
                    @mouseleave="hoverRating = 0"
                  >
                    <Star 
                      :size="30"
                      :class="(hoverRating || form.rating) >= i ? 'star--filled' : 'star--empty'"
                    />
                  </button>
                </div>
                <span class="rating-label">
                  {{ form.rating > 0 ? `${form.rating} out of 5 stars` : 'Select a rating' }}
                </span>
              </div>
              <p v-if="errors.rating" class="field__error">{{ errors.rating }}</p>
            </div>

            <!-- Review Text Area -->
            <div class="field">
              <label for="review-text">Review Comments</label>
              <textarea 
                id="review-text"
                v-model="form.review"
                class="textarea"
                placeholder="What did you think of the venue, speakers, organization, and food? (minimum 10 characters)..."
                required
              ></textarea>
              <p v-if="errors.review" class="field__error">{{ errors.review }}</p>
            </div>

            <button 
              class="button button--primary submit-review-btn" 
              type="submit" 
              :disabled="submitting"
            >
              {{ submitting ? 'Submitting...' : 'Submit Feedback' }}
            </button>
          </form>
        </template>
        
        <!-- Showcase instructions to organizers -->
        <template v-else-if="currentUser?.role === 'organizer'">
          <div class="info-alert">
            <p><strong>Organizer Interface Mode</strong></p>
            <p>You have view-only rights for reviews as an event organizer. Explore reviews left by students to understand event performance metrics.</p>
          </div>
        </template>

        <!-- Anonymous users -->
        <template v-else>
          <div class="info-alert info-alert--warning">
            <p>Please log in as a student to write event feedback reviews.</p>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
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

.feedback-success-banner {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  animation: fadeIn 0.3s ease-out;
}

.feedback-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(320px, 1fr);
  gap: 24px;
  align-items: start;
}

.reviews-list-col {
  display: grid;
  gap: 24px;
}

.summary-card {
  padding: 24px;
}

.summary-card h2 {
  margin: 0 0 20px;
  font-family: 'Sora', sans-serif;
  font-size: 1.25rem;
  color: #0f172a;
}

.summary-card__content {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 32px;
  align-items: center;
}

.average-score-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-right: 1px solid #e2e8f0;
  padding-right: 32px;
}

.score-number {
  font-size: 3.5rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.score-stars {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-count {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 700;
}

.stars-row {
  display: flex;
  gap: 2px;
}

.star--filled {
  color: #fbbf24;
  fill: #fbbf24;
}

.star--empty {
  color: #d1d5db;
  fill: transparent;
}

.score-distribution {
  display: grid;
  gap: 8px;
}

.dist-bar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
}

.dist-label {
  min-width: 28px;
  text-align: right;
}

.dist-bar-track {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 99px;
  overflow: hidden;
}

.dist-bar-fill {
  height: 100%;
  background: #fbbf24;
  border-radius: 99px;
  transition: width 0.3s;
}

.dist-count {
  min-width: 20px;
  color: var(--text-muted);
}

/* Feed list panel */
.feed-list-panel {
  padding: 24px;
}

.feed-list-header {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.feed-list-header h2 {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: 1.2rem;
  color: #0f172a;
}

.feed-list {
  display: grid;
  gap: 20px;
}

.feed-card {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 20px;
}

.feed-card:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.feed-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ddd6fe, #a78bfa);
  color: #4c1d95;
  display: grid;
  place-items: center;
  font-size: 0.95rem;
  font-weight: 800;
  text-transform: uppercase;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.my-review-badge {
  font-size: 0.68rem;
  font-weight: 800;
  background: var(--primary-soft);
  color: var(--primary);
  padding: 2px 6px;
  border-radius: 6px;
}

.feed-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.feed-delete-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid #fee2e2;
  background: #fee2e2;
  color: #dc2626;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.feed-delete-btn:hover {
  background: #fecaca;
}

.feed-rating-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.event-tag {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-muted);
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 6px;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feed-review-content {
  font-size: 0.92rem;
  color: #334155;
  line-height: 1.5;
}

.feed-review-content p {
  margin: 0;
  white-space: pre-line;
}

/* Review form styling */
.review-form-card {
  padding: 24px;
}

.review-form-card h2 {
  margin: 0 0 16px;
  font-family: 'Sora', sans-serif;
  font-size: 1.25rem;
  color: #0f172a;
}

.form-instructions {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 20px;
}

.feedback-form-element {
  display: grid;
  gap: 18px;
}

.star-picker-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.star-picker {
  display: flex;
  gap: 4px;
}

.picker-star-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  transition: transform 0.15s;
}

.picker-star-btn:hover {
  transform: scale(1.15);
}

.rating-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
}

.submit-review-btn {
  width: 100%;
  justify-content: center;
  padding: 12px;
  font-size: 0.95rem;
}

.info-alert {
  padding: 16px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: var(--radius-md);
  color: #1e40af;
  font-size: 0.88rem;
  line-height: 1.5;
}

.info-alert strong {
  color: #1e3a8a;
  display: block;
  margin-bottom: 6px;
}

.info-alert--warning {
  background: #fffbeb;
  border-color: #fde68a;
  color: #b45309;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 980px) {
  .feedback-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .summary-card__content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .average-score-box {
    border-right: none;
    padding-right: 0;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 20px;
  }
  .review-form-card, .feed-list-panel, .summary-card {
    padding: 16px;
  }
}
</style>
