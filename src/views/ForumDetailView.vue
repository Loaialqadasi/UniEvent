<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, User, Clock, MessageSquare, Send, Trash2 } from 'lucide-vue-next'
import { authState } from '../service/auth'
import { 
  fetchForumPostById, 
  fetchCommentsForPost, 
  createComment, 
  deleteComment, 
  deleteForumPost,
  fetchEvents 
} from '../service/api'

// Router and Route parameters
const route = useRoute()
const router = useRouter()
const postId = Number(route.params.id)

// Current User State
const currentUser = computed(() => authState.user)

// Loading states
const postLoading = ref(true)
const commentsLoading = ref(true)
const submittingComment = ref(false)
const deleting = ref(false)
const postError = ref('')
const deleteConfirmId = ref(null) // Track which item is pending delete confirmation
const deleteMessage = ref('')

// Data models
const post = ref(null)
const comments = ref([])
const events = ref([])
const newCommentContent = ref('')
const commentError = ref('')

// Load Thread & Comments
const loadThread = async () => {
  postLoading.value = true
  commentsLoading.value = true
  postError.value = ''
  try {
    const [fetchedPost, fetchedComments, fetchedEvents] = await Promise.all([
      fetchForumPostById(postId),
      fetchCommentsForPost(postId),
      fetchEvents()
    ])
    post.value = fetchedPost
    comments.value = fetchedComments
    events.value = fetchedEvents
  } catch (err) {
    postError.value = err.message || 'Discussion thread not found.'
  } finally {
    postLoading.value = false
    commentsLoading.value = false
  }
}

onMounted(loadThread)

// Map Event Title from Event Database
const getEventTitle = (eventId) => {
  const match = events.value.find((e) => e.id === eventId)
  return match ? match.title : `Event #${eventId}`
}

// Map Event Category from Event Database
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

// Formatting ISO strings into clean representation
const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Submit a reply
const onAddComment = async () => {
  commentError.value = ''
  
  // Validation
  const val = newCommentContent.value.trim()
  if (!val) {
    commentError.value = 'Comment cannot be empty.'
    return
  } else if (val.length < 2) {
    commentError.value = 'Comment must be at least 2 characters.'
    return
  }

  submittingComment.value = true
  try {
    const payload = {
      postId: postId,
      content: val,
      author: currentUser.value ? currentUser.value.name : 'Guest User'
    }
    const created = await createComment(payload)
    // API returns { success, message, commentId, comment } — extract the comment object
    const newComment = created.comment || { commentId: created.commentId, postId, userId: currentUser.value?.id, content: val, author: currentUser.value?.name || 'Guest User', createdAt: new Date().toISOString() }
    comments.value = [...comments.value, newComment]
    newCommentContent.value = ''
  } catch (err) {
    commentError.value = err.message || 'Failed to submit comment.'
  } finally {
    submittingComment.value = false
  }
}

// Request delete confirmation (replaces browser confirm())
const requestDeleteComment = (commentId) => {
  deleteConfirmId.value = commentId
}

const cancelDelete = () => {
  deleteConfirmId.value = null
}

// Delete comment (after inline confirmation)
const onDeleteComment = async (commentId) => {
  deleteConfirmId.value = null
  try {
    await deleteComment(commentId)
    comments.value = comments.value.filter((c) => c.commentId !== commentId)
  } catch (err) {
    deleteMessage.value = 'Could not delete comment. Please try again.'
    setTimeout(() => { deleteMessage.value = '' }, 3000)
  }
}

// Delete own post thread (with inline confirmation)
const confirmDeletePost = ref(false)

const onDeletePost = async () => {
  if (!confirmDeletePost.value) {
    confirmDeletePost.value = true
    return
  }
  deleting.value = true
  try {
    await deleteForumPost(postId)
    router.replace('/forum')
  } catch (err) {
    deleteMessage.value = 'Could not delete discussion. Please try again.'
    setTimeout(() => { deleteMessage.value = '' }, 3000)
    deleting.value = false
    confirmDeletePost.value = false
  }
}

// Check ownership helper
const isOwner = (authorName) => {
  return currentUser.value && currentUser.value.name === authorName
}
</script>

<template>
  <div class="back-nav">
    <RouterLink class="forum-back-btn" to="/forum">
      <ArrowLeft :size="16" />
      Back to Forums
    </RouterLink>
  </div>

  <!-- Delete message banner -->
  <div v-if="deleteMessage" class="status-banner status-banner--warn" style="margin-bottom:16px; padding:12px 16px; border-radius:10px; background:#fef9c3; color:#92400e; border:1px solid #fde68a; font-size:0.88rem; font-weight:600;">{{ deleteMessage }}</div>

  <div v-if="postLoading" class="empty">Loading discussion details...</div>
  <div v-else-if="postError" class="empty">{{ postError }}</div>

  <div v-else-if="post" class="detail-layout">
    <!-- Main thread card -->
    <article class="panel main-post-card">
      <div class="main-post-card__header">
        <div class="tags-row">
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

        <!-- Inline confirmation for deleting the thread -->
        <div v-if="isOwner(post.author) && confirmDeletePost" style="display:flex; align-items:center; gap:8px; font-size:0.8rem; color:#dc2626; font-weight:700;">
          <span>Delete this thread and all replies?</span>
          <button class="delete-thread-btn" @click="onDeletePost" :disabled="deleting" style="font-size:0.75rem;">Yes, Delete</button>
          <button class="delete-thread-btn" style="background:#f1f5f9; color:#64748b; border-color:#e2e8f0;" @click="confirmDeletePost = false">Cancel</button>
        </div>
        <button 
          v-if="isOwner(post.author) && !confirmDeletePost" 
          class="delete-thread-btn" 
          title="Delete this discussion"
          :disabled="deleting"
          @click="onDeletePost"
        >
          <Trash2 :size="16" />
          Delete Discussion
        </button>
      </div>

      <h1 class="main-post-card__title">{{ post.title }}</h1>
      
      <div class="meta-row">
        <div class="meta-item">
          <User :size="15" />
          <span>Posted by: <strong>{{ post.author }}</strong></span>
        </div>
        <div class="meta-item">
          <Clock :size="15" />
          <span>{{ formatDate(post.createdAt) }}</span>
        </div>
      </div>

      <div class="main-post-card__content">
        <p>{{ post.content }}</p>
      </div>
    </article>

    <!-- Comments board section -->
    <section class="panel comments-section">
      <div class="comments-header">
        <MessageSquare :size="20" />
        <h2>Replies ({{ comments.length }})</h2>
      </div>

      <!-- Add Comment Form (Active input) -->
      <div v-if="currentUser" class="add-reply-box">
        <form @submit.prevent="onAddComment">
          <div class="field">
            <label for="new-reply">Share your thoughts</label>
            <div class="reply-input-row">
              <textarea
                id="new-reply"
                v-model="newCommentContent"
                class="textarea reply-textarea"
                placeholder="Write your response here..."
                rows="3"
                required
              ></textarea>
              <button 
                class="button button--primary reply-submit-btn" 
                type="submit" 
                :disabled="submittingComment"
              >
                <Send :size="16" />
                <span>Reply</span>
              </button>
            </div>
            <p v-if="commentError" class="field__error">{{ commentError }}</p>
          </div>
        </form>
      </div>
      <div v-else class="login-prompt">
        Please sign in to participate in the discussion.
      </div>

      <!-- Comments Thread List -->
      <div v-if="commentsLoading" class="empty">Loading replies...</div>
      <div v-else-if="!comments.length" class="empty no-replies">No replies yet. Start the conversation!</div>
      <div v-else class="comments-list">
        <div 
          v-for="comment in comments" 
          :key="comment.commentId" 
          class="comment-card"
        >
          <div class="comment-card__header">
            <div class="comment-author">
              <span class="user-avatar">{{ comment.author.charAt(0) }}</span>
              <div>
                <span class="comment-author-name">{{ comment.author }}</span>
                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
              </div>
            </div>
            <template v-if="isOwner(comment.author)">
              <button 
                v-if="deleteConfirmId !== comment.commentId"
                class="comment-delete-btn" 
                title="Delete reply"
                @click="requestDeleteComment(comment.commentId)"
              >
                <Trash2 :size="14" />
              </button>
              <div v-else style="display:flex; align-items:center; gap:6px; font-size:0.72rem; color:#dc2626; font-weight:700;">
                <span>Delete?</span>
                <button class="comment-delete-btn" style="background:#fee2e2;" @click="onDeleteComment(comment.commentId)">Yes</button>
                <button class="comment-delete-btn" style="background:#f1f5f9; color:#64748b;" @click="cancelDelete">No</button>
              </div>
            </template>
          </div>
          <div class="comment-card__body">
            <p>{{ comment.content }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.back-nav {
  margin-bottom: 20px;
}

.forum-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-weight: 700;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.15s;
}

.forum-back-btn:hover {
  color: var(--primary);
}

.detail-layout {
  display: grid;
  gap: 24px;
}

.main-post-card {
  padding: 28px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-post-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.tags-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.category-tag {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.event-badge {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-muted);
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
}

.delete-thread-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #fee2e2;
  background: #fee2e2;
  color: #dc2626;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.delete-thread-btn:hover {
  background: #fecaca;
}

.main-post-card__title {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: 1.65rem;
  color: #0f172a;
  line-height: 1.25;
}

.meta-row {
  display: flex;
  gap: 20px;
  color: #64748b;
  font-size: 0.85rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.main-post-card__content {
  font-size: 1.05rem;
  color: #334155;
  line-height: 1.65;
}

.main-post-card__content p {
  margin: 0;
  white-space: pre-line;
}

/* Comments section styling */
.comments-section {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comments-header {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
}

.comments-header h2 {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: 1.25rem;
  color: #0f172a;
}

.add-reply-box {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
}

.reply-input-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: end;
}

.reply-textarea {
  min-height: 80px;
  font-size: 0.92rem;
}

.reply-submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 42px;
  align-self: end;
}

.login-prompt {
  text-align: center;
  padding: 16px;
  background: #f1f5f9;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.9rem;
}

.comments-list {
  display: grid;
  gap: 16px;
}

.no-replies {
  padding: 40px 20px;
}

.comment-card {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 16px;
}

.comment-card:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.comment-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c7d2fe, #818cf8);
  color: #312e81;
  display: grid;
  place-items: center;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
}

.comment-author-name {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.comment-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.comment-delete-btn {
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.15s;
}

.comment-delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.comment-card__body {
  padding-left: 42px;
  font-size: 0.92rem;
  color: #334155;
  line-height: 1.5;
}

.comment-card__body p {
  margin: 0;
  white-space: pre-line;
}

@media (max-width: 640px) {
  .main-post-card {
    padding: 16px;
  }
  .comments-section {
    padding: 16px;
  }
  .reply-input-row {
    grid-template-columns: 1fr;
  }
  .reply-submit-btn {
    width: 100%;
    justify-content: center;
  }
  .comment-card__body {
    padding-left: 0;
    margin-top: 8px;
  }
}
</style>
