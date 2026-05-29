import axios from 'axios'

import { fetchEvents } from '../service/api'

const DEMO_USER_ID = 1
const SERVICE_FEE_RATE = 0.06
const MAX_TICKETS = 5

const parseTicketPrice = (priceLabel) => {
  const amount = Number(String(priceLabel).replace(/[^\d.]/g, ''))
  return Number.isFinite(amount) ? amount : 0
}

export async function fetchEventForBooking(eventId) {
  const events = await fetchEvents()
  const event = events.find((item) => String(item.id) === String(eventId))

  if (!event) {
    throw new Error('Event not found')
  }

  const availableSeats = Math.max(0, Number(event.capacity ?? 0) - Number(event.attendees ?? 0))

  return {
    ...event,
    ticketPrice: parseTicketPrice(event.price),
    organizer: event.organizer ?? 'Student Union',
    location: event.location ?? event.venue,
    heroImage: event.image,
    availableSeats,
  }
}

export function generateBookingReference() {
  return `UE${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}

export function calculateBookingTotals(ticketPrice, quantity) {
  const subtotal = Number(ticketPrice) * Number(quantity)
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100

  return {
    subtotal,
    serviceFee,
    total: subtotal + serviceFee,
  }
}

export function getAllowedTicketLimit(event) {
  return Math.min(MAX_TICKETS, Math.max(0, Number(event?.availableSeats ?? MAX_TICKETS)))
}

export function createBookingPayload({ event, quantity, status = 'pending_payment' }) {
  return {
    user_id: DEMO_USER_ID,
    event_id: event.id,
    ticket_quantity: quantity,
    booking_status: status,
    booking_date: new Date().toISOString(),
  }
}

export function createLocalBookingRecord({ event, quantity, totals, reference, status = 'pending_payment' }) {
  const payload = createBookingPayload({ event, quantity, status })

  return {
    ...payload,
    booking_id: `BKG-${Date.now()}`,
    bookingReference: reference,
    eventSnapshot: {
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      venue: event.venue,
      image: event.image,
      ticketPrice: event.ticketPrice,
    },
    amount: totals.total,
  }
}

export const bookingApiRoutes = {
  history: (userId = DEMO_USER_ID) => `/api/bookings/user/${userId}`,
  create: '/api/bookings',
  update: (bookingId) => `/api/bookings/${bookingId}`,
  cancel: (bookingId) => `/api/bookings/${bookingId}`,
  notifications: '/api/notifications',
  calendar: '/api/calendar',
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
})

export const bookingService = {
  getUserBookings(userId = DEMO_USER_ID) {
    return apiClient.get(bookingApiRoutes.history(userId))
  },
  createBooking(payload) {
    return apiClient.post(bookingApiRoutes.create, payload)
  },
  updateBooking(bookingId, payload) {
    return apiClient.put(bookingApiRoutes.update(bookingId), payload)
  },
  cancelBooking(bookingId) {
    return apiClient.delete(bookingApiRoutes.cancel(bookingId))
  },
  createNotification(payload) {
    return apiClient.post(bookingApiRoutes.notifications, payload)
  },
  addCalendarEvent(payload) {
    return apiClient.post(bookingApiRoutes.calendar, payload)
  },
}
