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

// ─── Forum Discussion (Mock DB & API) ───────────────────────────────────────

let postIdCounter = 6
let commentIdCounter = 11

let forumPosts = [
  {
    postId: 1,
    eventId: 1,
    title: 'Looking for Vue.js Devs for Summit Showcase',
    content: 'Hey everyone! My team is looking for a Vue.js developer to help us finish our final prototype for the Tech Innovation Summit showcase. We have the backend ready in Node.js. Drop a comment if interested!',
    author: 'Bob Lim',
    createdAt: '2026-05-28T14:30:00Z',
  },
  {
    postId: 2,
    eventId: 2,
    title: 'Preparation Guide for Resume Reviews',
    content: 'Hi juniors, just wanted to share some tips for the resume reviews at the Career Fair. Make sure to print at least 5 copies of your resume, highlight your GitHub projects, and practice a 30-second elevator pitch. Good luck!',
    author: 'Alice Tan',
    createdAt: '2026-05-29T09:15:00Z',
  },
  {
    postId: 3,
    eventId: 3,
    title: 'Food Vendor Applications and Lineup Details',
    content: 'Does anyone know if the food trucks line-up is finalized yet? Last year we had awesome options, hoping we get local burgers and bubble tea again. Also, will there be vegetarian options?',
    author: 'Charlie Teh',
    createdAt: '2026-05-30T16:45:00Z',
  },
  {
    postId: 4,
    eventId: 4,
    title: 'Poster Presentation Templates and Guideline',
    content: 'For those presenting at the symposium, can we use standard UTM PowerPoint slide layouts or is there a specific template we must adhere to? The submission portal mentions A0 format size.',
    author: 'Dr. Farah',
    createdAt: '2026-05-25T11:00:00Z',
  },
  {
    postId: 5,
    eventId: 5,
    title: 'Rules regarding external players and supporters',
    content: "Can students from other colleges or universities enter the sports complex to support our teams? My friends want to come, but they don't have UTM student IDs. Do they need tickets?",
    author: 'David Chong',
    createdAt: '2026-05-27T10:20:00Z',
  },
]

let forumComments = [
  {
    commentId: 1,
    postId: 1,
    author: 'Sarah Ahmad',
    content: "I'm interested! I have experience with Vue 3 and Pinia. Let's discuss.",
    createdAt: '2026-05-28T15:00:00Z',
  },
  {
    commentId: 2,
    postId: 1,
    author: 'Campus Organizer',
    content: 'Great initiative. Feel free to use the computer labs if you need space.',
    createdAt: '2026-05-28T16:30:00Z',
  },
  {
    commentId: 3,
    postId: 2,
    author: 'Jack Wong',
    content: 'Thanks for the tips, Alice! Do we need to dress in formal attire?',
    createdAt: '2026-05-29T10:00:00Z',
  },
  {
    commentId: 4,
    postId: 2,
    author: 'Alice Tan',
    content: 'Yes Jack, smart casual or formal is highly recommended by recruiters.',
    createdAt: '2026-05-29T10:45:00Z',
  },
  {
    commentId: 5,
    postId: 2,
    author: 'Liyana Rosli',
    content: 'Is it open for first-year students too, or is it mostly for final-year students?',
    createdAt: '2026-05-30T08:00:00Z',
  },
  {
    commentId: 6,
    postId: 3,
    author: 'Campus Organizer',
    content: 'Yes, I heard there will be 12 food trucks this year, including vegetarian choices!',
    createdAt: '2026-05-30T17:00:00Z',
  },
  {
    commentId: 7,
    postId: 3,
    author: 'Amirul Amin',
    content: 'Hyped for the local bands lineup. Hope the rain doesn\'t ruin it.',
    createdAt: '2026-05-30T18:15:00Z',
  },
  {
    commentId: 8,
    postId: 4,
    author: 'Siti Aminah',
    content: 'You can download the UTM poster template from the library website.',
    createdAt: '2026-05-26T09:30:00Z',
  },
  {
    commentId: 9,
    postId: 4,
    author: 'Dr. Farah',
    content: 'Yes, A0 vertical orientation is standard for our poster boards.',
    createdAt: '2026-05-26T12:00:00Z',
  },
  {
    commentId: 10,
    postId: 5,
    author: 'Kamal Hassan',
    content: 'They can buy entry tickets at the gate for RM 10, no student card required!',
    createdAt: '2026-05-27T11:40:00Z',
  },
]

export async function fetchForumPosts() {
  await wait(400)
  return [...forumPosts]
}

export async function fetchForumPostById(postId) {
  await wait(300)
  const post = forumPosts.find((p) => p.postId === Number(postId))
  if (!post) throw new Error('Forum post not found')
  return { ...post }
}

export async function createForumPost(payload) {
  await wait(600)
  if (!payload.title || payload.title.trim().length < 5) {
    throw new Error('Title must be at least 5 characters.')
  }
  if (!payload.content || payload.content.trim().length < 20) {
    throw new Error('Content must be at least 20 characters.')
  }
  if (!payload.eventId) {
    throw new Error('Event association is required.')
  }

  const newPost = {
    postId: postIdCounter++,
    eventId: Number(payload.eventId),
    title: payload.title.trim(),
    content: payload.content.trim(),
    author: payload.author || 'Anonymous Student',
    createdAt: new Date().toISOString(),
  }

  forumPosts = [newPost, ...forumPosts]
  return newPost
}

export async function deleteForumPost(postId) {
  await wait(400)
  forumPosts = forumPosts.filter((p) => p.postId !== Number(postId))
  // clean comments
  forumComments = forumComments.filter((c) => c.postId !== Number(postId))
  return { success: true }
}

export async function fetchCommentsForPost(postId) {
  await wait(300)
  return forumComments
    .filter((c) => c.postId === Number(postId))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}

export async function createComment(payload) {
  await wait(400)
  if (!payload.content || payload.content.trim().length < 2) {
    throw new Error('Comment must be at least 2 characters.')
  }

  const newComment = {
    commentId: commentIdCounter++,
    postId: Number(payload.postId),
    author: payload.author || 'Anonymous Student',
    content: payload.content.trim(),
    createdAt: new Date().toISOString(),
  }

  forumComments = [...forumComments, newComment]
  return newComment
}

export async function deleteComment(commentId) {
  await wait(300)
  forumComments = forumComments.filter((c) => c.commentId !== Number(commentId))
  return { success: true }
}

// ─── Community Feedback (Mock DB & API) ─────────────────────────────────────

let feedbackIdCounter = 11

let feedbackRecords = [
  {
    feedbackId: 1,
    eventId: 1,
    rating: 5,
    review: 'The Innovation Summit was absolutely amazing. Got to see so many creative projects. Highly recommended!',
    user: 'Alice Tan',
    createdAt: '2026-05-16T12:00:00Z',
  },
  {
    feedbackId: 2,
    eventId: 1,
    rating: 4,
    review: 'Very informative talks, but the hall was a bit crowded during the panel sessions. Overall good experience.',
    user: 'Jack Wong',
    createdAt: '2026-05-17T15:30:00Z',
  },
  {
    feedbackId: 3,
    eventId: 2,
    rating: 5,
    review: 'Super helpful! Managed to secure two internship interviews on the spot. Kudos to the organizers.',
    user: 'Bob Lim',
    createdAt: '2026-05-20T17:45:00Z',
  },
  {
    feedbackId: 4,
    eventId: 2,
    rating: 3,
    review: 'Good selection of companies, but the lines were way too long. Some booths ran out of brochures early.',
    user: 'Liyana Rosli',
    createdAt: '2026-05-20T18:10:00Z',
  },
  {
    feedbackId: 5,
    eventId: 3,
    rating: 5,
    review: 'Best event of the semester! Sound quality was top-notch and the atmosphere was electric.',
    user: 'Charlie Teh',
    createdAt: '2026-05-22T23:00:00Z',
  },
  {
    feedbackId: 6,
    eventId: 3,
    rating: 4,
    review: 'Loved the performances, but the food trucks were overpriced. Had a great time dancing though!',
    user: 'Amirul Amin',
    createdAt: '2026-05-22T23:45:00Z',
  },
  {
    feedbackId: 7,
    eventId: 4,
    rating: 4,
    review: 'Excellent research presentations. The poster session was very engaging. Learnt a lot about AI trends.',
    user: 'Sarah Ahmad',
    createdAt: '2026-05-23T16:20:00Z',
  },
  {
    feedbackId: 8,
    eventId: 4,
    rating: 2,
    review: 'The scheduling was messy. Some presentations overlapped and it was hard to follow.',
    user: 'David Chong',
    createdAt: '2026-05-23T17:00:00Z',
  },
  {
    feedbackId: 9,
    eventId: 5,
    rating: 5,
    review: 'Thrilling finals! The atmosphere in the complex was insane. Loved the halftime show.',
    user: 'Kamal Hassan',
    createdAt: '2026-05-29T21:30:00Z',
  },
  {
    feedbackId: 10,
    eventId: 6,
    rating: 4,
    review: 'Stunning displays of artwork. The student designers are very talented. Wish it was open for more days.',
    user: 'Siti Aminah',
    createdAt: '2026-05-30T10:00:00Z',
  },
]

export async function fetchFeedback() {
  await wait(450)
  return [...feedbackRecords]
}

export async function submitFeedback(payload) {
  await wait(650)
  if (!payload.eventId) {
    throw new Error('Please select an event.')
  }
  if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
    throw new Error('Please provide a rating between 1 and 5 stars.')
  }
  if (!payload.review || payload.review.trim().length < 10) {
    throw new Error('Review comment must be at least 10 characters.')
  }

  const newFeedback = {
    feedbackId: feedbackIdCounter++,
    eventId: Number(payload.eventId),
    rating: Number(payload.rating),
    review: payload.review.trim(),
    user: payload.user || 'Anonymous Student',
    createdAt: new Date().toISOString(),
  }

  feedbackRecords = [newFeedback, ...feedbackRecords]
  return newFeedback
}

export async function deleteFeedback(feedbackId) {
  await wait(350)
  feedbackRecords = feedbackRecords.filter((f) => f.feedbackId !== Number(feedbackId))
  return { success: true }
}

