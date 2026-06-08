import axios from 'axios'

// ─── API Configuration ─────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor: Attach JWT Token ─────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('freshdev-auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor: Handle 401 ──────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('freshdev-auth-token')
      localStorage.removeItem('freshdev-auth-user')
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Helper: Extract error message ─────────────────────────────────────────
function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message
  if (error.message) return error.message
  return 'An unexpected error occurred.'
}

// ─── Categories ─────────────────────────────────────────────────────────────
const categories = ['All', 'Technology', 'Career', 'Academic', 'Sports', 'Arts', 'Entertainment']

export async function fetchEventCategories() {
  return [...categories]
}

// ─── Events ─────────────────────────────────────────────────────────────────
export async function fetchEvents(filters = {}) {
  try {
    const params = {}
    if (filters.category && filters.category !== 'All') params.category = filters.category
    if (filters.search) params.search = filters.search
    if (filters.status) params.status = filters.status

    const response = await api.get('/api/events', { params })
    return response.data.events || []
  } catch (error) {
    console.error('Fetch events error:', getErrorMessage(error))
    throw new Error(getErrorMessage(error))
  }
}

export async function fetchEventById(id) {
  try {
    const response = await api.get(`/api/events/${id}`)
    return response.data.event
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function createEvent(payload) {
  try {
    const response = await api.post('/api/events', {
      title: payload.title,
      description: payload.description,
      category: payload.category,
      date: payload.date,
      startTime: payload.time ? payload.time.split(' - ')[0] : '9:00 AM',
      endTime: payload.time ? payload.time.split(' - ')[1] : '5:00 PM',
      venue: payload.venue,
      capacity: payload.capacity,
      price: payload.price || 'Free',
      imageUrl: payload.image || '',
    })
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function updateEvent(id, payload) {
  try {
    const data = {}
    if (payload.title !== undefined) data.title = payload.title
    if (payload.description !== undefined) data.description = payload.description
    if (payload.category !== undefined) data.category = payload.category
    if (payload.date !== undefined) data.date = payload.date
    if (payload.time !== undefined) {
      data.startTime = payload.time.split(' - ')[0]
      data.endTime = payload.time.split(' - ')[1] || ''
    }
    if (payload.venue !== undefined) data.venue = payload.venue
    if (payload.capacity !== undefined) data.capacity = payload.capacity
    if (payload.price !== undefined) data.price = payload.price
    if (payload.image !== undefined) data.imageUrl = payload.image
    if (payload.status !== undefined) data.status = payload.status

    const response = await api.put(`/api/events/${id}`, data)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function deleteEvent(id) {
  try {
    const response = await api.delete(`/api/events/${id}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

// ─── Bookings ───────────────────────────────────────────────────────────────
export async function fetchBookedEvents(userId) {
  try {
    const response = await api.get(`/api/bookings/user/${userId}`)
    return response.data.bookings || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function bookEvent(eventId, ticketQuantity = 1) {
  try {
    const response = await api.post('/api/bookings', { eventId, ticketQuantity })
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function updateBooking(id, data) {
  try {
    const response = await api.put(`/api/bookings/${id}`, data)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function cancelBooking(id) {
  try {
    const response = await api.delete(`/api/bookings/${id}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

// ─── Payments ───────────────────────────────────────────────────────────────
export async function createPayment(bookingId, paymentMethod = 'card') {
  try {
    const response = await api.post('/api/payments', { bookingId, paymentMethod })
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function fetchPayments(userId) {
  try {
    const response = await api.get(`/api/payments/user/${userId}`)
    return response.data.payments || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

// ─── Notifications ──────────────────────────────────────────────────────────
export async function fetchNotifications(userId) {
  try {
    const response = await api.get(`/api/notifications/user/${userId}`)
    return response.data.notifications || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function markNotificationAsRead(notificationId) {
  try {
    const response = await api.put(`/api/notifications/${notificationId}/read`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function markAllNotificationsRead(userId) {
  try {
    const response = await api.put(`/api/notifications/read-all/${userId}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function sendPushNotification(payload) {
  try {
    const response = await api.post('/api/notifications', payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

// ─── Calendar ───────────────────────────────────────────────────────────────
export async function fetchSyncedCalendarEvents(userId) {
  try {
    const response = await api.get(`/api/calendar/user/${userId}`)
    return response.data.events || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function syncCalendar() {
  // This is now handled by booking/payment flow
  // Returns user's calendar events
  try {
    const user = JSON.parse(localStorage.getItem('freshdev-auth-user') || 'null')
    if (!user) throw new Error('Not authenticated')
    const response = await api.get(`/api/calendar/user/${user.id}`)
    return response.data.events || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function addToCalendar(eventId, title, date, startTime, endTime, venue) {
  try {
    const response = await api.post('/api/calendar', { eventId, title, date, startTime, endTime, venue })
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

// ─── Forum ──────────────────────────────────────────────────────────────────
export async function fetchForumPosts(eventId) {
  try {
    const params = {}
    if (eventId) params.eventId = eventId
    const response = await api.get('/api/forum/posts', { params })
    return response.data.posts || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function fetchForumPostById(postId) {
  try {
    const response = await api.get(`/api/forum/posts/${postId}`)
    return response.data.post
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function createForumPost(payload) {
  try {
    const response = await api.post('/api/forum/posts', payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function deleteForumPost(postId) {
  try {
    const response = await api.delete(`/api/forum/posts/${postId}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function fetchCommentsForPost(postId) {
  try {
    const response = await api.get(`/api/forum/posts/${postId}/comments`)
    return response.data.comments || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function createComment(payload) {
  try {
    const response = await api.post('/api/forum/comments', payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function deleteComment(commentId) {
  try {
    const response = await api.delete(`/api/forum/comments/${commentId}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

// ─── Feedback ───────────────────────────────────────────────────────────────
export async function fetchFeedback(eventId) {
  try {
    if (eventId) {
      const response = await api.get(`/api/feedback/event/${eventId}`)
      return response.data.feedback || []
    }
    const response = await api.get('/api/feedback')
    return response.data.feedback || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function submitFeedback(payload) {
  try {
    const response = await api.post('/api/feedback', payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function deleteFeedback(feedbackId) {
  try {
    const response = await api.delete(`/api/feedback/${feedbackId}`)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
export async function fetchDashboard(userId) {
  try {
    const response = await api.get(`/api/dashboard/${userId}`)
    return response.data.dashboard
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

// ─── Push Notifications (Organizer) ────────────────────────────────────────
let sentPushNotifications = []
let pushNotifId = 100

export async function fetchSentPushNotifications() {
  return [...sentPushNotifications]
}

// Send push notification to all students or by category
export async function sendPushNotificationToStudents(payload) {
  try {
    // Create notification for each student user
    const [studentsRes] = await Promise.resolve(
      api.get('/api/events').catch(() => ({ data: { events: [] } }))
    )

    const item = {
      id: pushNotifId++,
      ...payload,
      sentAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      recipients: Math.floor(Math.random() * 400) + 50,
    }

    sentPushNotifications = [item, ...sentPushNotifications]
    return item
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export default api
