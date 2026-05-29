const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

let eventId = 10

const categories = ['All', 'Technology', 'Career', 'Academic', 'Sports', 'Arts', 'Entertainment']

let events = [
  {
    id: 1,
    title: 'Tech Innovation Summit 2026',
    category: 'Technology',
    date: '2026-05-15',
    time: '8:30 AM - 5:00 PM',
    venue: 'Grand Hall A',
    attendees: 251,
    capacity: 400,
    price: 'Free',
    description: 'Talks and live demos by student teams and invited startups.',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    title: 'Annual Career Fair 2026',
    category: 'Career',
    date: '2026-05-19',
    time: '10:00 AM - 4:00 PM',
    venue: 'Student Center',
    attendees: 520,
    capacity: 800,
    price: 'Free',
    description: 'Connect with industry recruiters for internships and graduate roles.',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    title: 'Music Festival Spring 2026',
    category: 'Entertainment',
    date: '2026-05-21',
    time: '6:00 PM - 11:00 PM',
    venue: 'Campus Grounds',
    attendees: 804,
    capacity: 1200,
    price: 'RM 25',
    description: 'Open-air concert with local bands, food trucks, and light shows.',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    title: 'Research Symposium 2026',
    category: 'Academic',
    date: '2026-05-22',
    time: '9:00 AM - 3:00 PM',
    venue: 'Library Auditorium',
    attendees: 150,
    capacity: 300,
    price: 'Free',
    description: 'Poster session and panel review across engineering and social sciences.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    title: 'Basketball Championship',
    category: 'Sports',
    date: '2026-05-28',
    time: '5:30 PM - 8:00 PM',
    venue: 'Sports Complex',
    attendees: 610,
    capacity: 850,
    price: 'RM 10',
    description: 'Inter-faculty finals with halftime performances and prize draws.',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 6,
    title: 'Art Exhibition: Modern Perspective',
    category: 'Arts',
    date: '2026-05-29',
    time: '10:00 AM - 4:00 PM',
    venue: 'Art Gallery',
    attendees: 200,
    capacity: 350,
    price: 'Free',
    description: 'Curated work by students from design, architecture, and media.',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
  },
]

let notifications = [
  {
    id: 1,
    title: 'Registration Confirmed',
    message: 'You are registered for Tech Innovation Summit 2026.',
    type: 'success',
    createdAt: '2h ago',
    read: false,
  },
  {
    id: 2,
    title: 'Event Reminder',
    message: 'Annual Career Fair starts tomorrow at 10:00 AM.',
    type: 'info',
    createdAt: '5h ago',
    read: false,
  },
  {
    id: 3,
    title: 'Venue Updated',
    message: 'Research Symposium moved to Library Auditorium.',
    type: 'warning',
    createdAt: '1d ago',
    read: true,
  },
]

export async function fetchEventCategories() {
  await wait(250)
  return [...categories]
}

export async function fetchEvents() {
  await wait(600)
  return [...events]
}

export async function createEvent(payload) {
  await wait(800)
  const created = {
    ...payload,
    id: eventId++,
  }

  events = [created, ...events]
  return created
}

export async function fetchNotifications() {
  await wait(500)
  return [...notifications]
}

export async function markNotificationAsRead(notificationId) {
  await wait(250)
  notifications = notifications.map((item) => {
    if (item.id === notificationId) {
      return { ...item, read: true }
    }

    return item
  })

  return [...notifications]
}

export async function markAllNotificationsRead() {
  await wait(350)
  notifications = notifications.map((item) => ({
    ...item,
    read: true,
  }))

  return [...notifications]
}

// ─── Event CRUD (Organizer) ────────────────────────────────────────────────

export async function updateEvent(id, payload) {
  await wait(700)
  events = events.map((item) => (item.id === id ? { ...item, ...payload } : item))
  return events.find((item) => item.id === id)
}

export async function deleteEvent(id) {
  await wait(500)
  events = events.filter((item) => item.id !== id)
  return { success: true }
}

// ─── Student Booking ────────────────────────────────────────────────────────

let bookedEventIds = []

export async function fetchBookedEvents() {
  await wait(300)
  return [...bookedEventIds]
}

export async function bookEvent(eventId) {
  await wait(800)
  if (bookedEventIds.includes(eventId)) {
    throw new Error('Already booked')
  }

  bookedEventIds = [...bookedEventIds, eventId]

  events = events.map((item) => {
    if (item.id === eventId) {
      return { ...item, attendees: item.attendees + 1 }
    }

    return item
  })

  const event = events.find((item) => item.id === eventId)

  const notificationId = Date.now()
  notifications = [
    {
      id: notificationId,
      title: 'Booking Confirmed',
      message: `You have successfully booked "${event.title}".`,
      type: 'success',
      createdAt: 'just now',
      read: false,
    },
    ...notifications,
  ]

  return { success: true }
}

// ─── Calendar Sync (Student) ─────────────────────────────────────────────────

let calendarSynced = false
let syncedEvents = []

const hasDeliveredPush = (pushId) => {
  return notifications.some((item) => item.source === 'push' && item.pushId === pushId)
}

const shouldDeliverPushToStudent = (pushItem) => {
  if (!calendarSynced) return false
  if (pushItem.target === 'All Students') return true

  return syncedEvents.some((event) => event.category === pushItem.target)
}

const pushToStudentNotification = (pushItem) => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  title: pushItem.title,
  message: pushItem.message,
  type: 'info',
  createdAt: 'just now',
  read: false,
  source: 'push',
  pushId: pushItem.id,
})

const deliverPushToStudentInbox = (pushItem) => {
  if (!shouldDeliverPushToStudent(pushItem)) return
  if (hasDeliveredPush(pushItem.id)) return

  notifications = [pushToStudentNotification(pushItem), ...notifications]
}

export async function fetchSyncedCalendarEvents() {
  await wait(400)
  return [...syncedEvents]
}

export async function syncCalendar() {
  await wait(900)
  calendarSynced = true

  const upcoming = events.filter(
    (item) =>
      bookedEventIds.includes(item.id) ||
      new Date(item.date) >= new Date()
  )

  syncedEvents = upcoming.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    time: item.time,
    venue: item.venue,
    category: item.category,
  }))

  sentPushNotifications.forEach((item) => {
    deliverPushToStudentInbox(item)
  })

  const notificationId = Date.now() + 1
  notifications = [
    {
      id: notificationId,
      title: 'Calendar Synced',
      message: `Your personal calendar has been synced. ${syncedEvents.length} event(s) added.`,
      type: 'info',
      createdAt: 'just now',
      read: false,
    },
    ...notifications,
  ]

  return [...syncedEvents]
}

// ─── Push Notification (Organizer) ──────────────────────────────────────────

let sentPushNotifications = []
let pushNotifId = 100

export async function fetchSentPushNotifications() {
  await wait(300)
  return [...sentPushNotifications]
}

export async function sendPushNotification(payload) {
  await wait(700)
  const item = {
    id: pushNotifId++,
    ...payload,
    sentAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    recipients: Math.floor(Math.random() * 400) + 50,
  }

  sentPushNotifications = [item, ...sentPushNotifications]
  deliverPushToStudentInbox(item)
  return item
}
