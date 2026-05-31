import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  calculateBookingTotals,
  createLocalBookingRecord,
  fetchEventForBooking,
  generateBookingReference,
  getAllowedTicketLimit,
} from '../services/bookingService'
import { createLocalPaymentRecord } from '../services/paymentSimulator'

const MAX_TICKETS = 5
const STORAGE_KEY = 'unievents.booking'

const readSavedState = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

export const useBookingStore = defineStore('booking', () => {
  const savedState = readSavedState()

  const event = ref(null)
  const eventLoading = ref(false)
  const eventError = ref('')
  const quantity = ref(savedState.quantity ?? 1)
  const maxTickets = ref(MAX_TICKETS)
  const paymentMethod = ref(savedState.paymentMethod ?? 'card')
  const bookingReference = ref(savedState.bookingReference ?? '')
  const transactionId = ref(savedState.transactionId ?? '')
  const activeBookingId = ref(savedState.activeBookingId ?? '')
  const bookingStatus = ref(savedState.bookingStatus ?? 'draft')
  const paymentStatus = ref(savedState.paymentStatus ?? 'not_started')
  const bookingHistory = ref(savedState.bookingHistory ?? [])
  const paymentHistory = ref(savedState.paymentHistory ?? [])
  const pendingNotifications = ref(savedState.pendingNotifications ?? [])
  const calendarEvents = ref(savedState.calendarEvents ?? [])

  const ticketPrice = computed(() => event.value?.ticketPrice ?? 0)
  const availableSeats = computed(() => event.value?.availableSeats ?? 0)
  const totals = computed(() => calculateBookingTotals(ticketPrice.value, quantity.value))
  const subtotal = computed(() => totals.value.subtotal)
  const serviceFee = computed(() => totals.value.serviceFee)
  const total = computed(() => totals.value.total)

  const bookingSummary = computed(() => ({
    event: event.value,
    quantity: quantity.value,
    ticketPrice: ticketPrice.value,
    subtotal: subtotal.value,
    serviceFee: serviceFee.value,
    total: total.value,
    paymentMethod: paymentMethod.value,
    bookingReference: bookingReference.value,
    bookingStatus: bookingStatus.value,
    paymentStatus: paymentStatus.value,
    transactionId: transactionId.value,
    availableSeats: availableSeats.value,
  }))

  const persist = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        quantity: quantity.value,
        paymentMethod: paymentMethod.value,
        bookingReference: bookingReference.value,
        transactionId: transactionId.value,
        activeBookingId: activeBookingId.value,
        bookingStatus: bookingStatus.value,
        paymentStatus: paymentStatus.value,
        bookingHistory: bookingHistory.value,
        paymentHistory: paymentHistory.value,
        pendingNotifications: pendingNotifications.value,
        calendarEvents: calendarEvents.value,
      })
    )
  }

  const loadEvent = async (eventId) => {
    eventLoading.value = true
    eventError.value = ''

    try {
      event.value = await fetchEventForBooking(eventId)
      maxTickets.value = getAllowedTicketLimit(event.value)
      
      const isCompleted = bookingStatus.value === 'active' || bookingStatus.value === 'confirmed'
      if (!event.value || String(event.value.id) !== String(eventId) || isCompleted) {
        resetBooking()
      } else {
        setQuantity(quantity.value)
      }
    } catch (error) {
      eventError.value = 'Unable to load booking details. Please try again.'
    } finally {
      eventLoading.value = false
    }
  }

  const setQuantity = (value) => {
    const nextValue = Number(value)
    const upperLimit = Math.max(1, maxTickets.value)
    quantity.value = Math.min(upperLimit, Math.max(1, Number.isFinite(nextValue) ? nextValue : 1))

    if (activeBookingId.value) {
      updateBookingQuantity(activeBookingId.value, quantity.value)
    }

    persist()
  }

  const setPaymentMethod = (method) => {
    paymentMethod.value = method
    persist()
  }

  const startBooking = () => {
    if (!event.value || maxTickets.value < 1) {
      return null
    }

    const isCompleted = bookingStatus.value === 'active' || bookingStatus.value === 'confirmed'
    const reference = (isCompleted ? '' : bookingReference.value) || generateBookingReference()
    const existingId = isCompleted ? '' : activeBookingId.value
    const record = createLocalBookingRecord({
      event: event.value,
      quantity: quantity.value,
      totals: totals.value,
      reference,
      status: 'pending_payment',
    })

    const nextRecord = existingId
      ? { ...record, booking_id: existingId, bookingReference: reference }
      : record

    activeBookingId.value = nextRecord.booking_id
    bookingReference.value = reference
    bookingStatus.value = 'pending_payment'
    paymentStatus.value = 'pending'
    bookingHistory.value = [
      nextRecord,
      ...bookingHistory.value.filter((item) => item.booking_id !== nextRecord.booking_id),
    ]
    persist()

    return nextRecord
  }

  const updateBookingQuantity = (bookingId, nextQuantity) => {
    bookingHistory.value = bookingHistory.value.map((item) => {
      if (item.booking_id !== bookingId) {
        return item
      }

      const nextTotals = calculateBookingTotals(item.eventSnapshot.ticketPrice, nextQuantity)

      return {
        ...item,
        ticket_quantity: nextQuantity,
        amount: nextTotals.total,
      }
    })
    persist()
  }

  const cancelBooking = (bookingId) => {
    bookingHistory.value = bookingHistory.value.map((item) => {
      if (item.booking_id !== bookingId) {
        return item
      }

      return {
        ...item,
        booking_status: 'cancelled',
      }
    })

    if (activeBookingId.value === bookingId) {
      bookingStatus.value = 'cancelled'
    }

    persist()
  }

  const recordPaymentAttempt = ({ status, paymentTransactionId }) => {
    const bookingId = activeBookingId.value

    if (!bookingId) {
      return
    }

    transactionId.value = paymentTransactionId
    paymentStatus.value = status
    if (status === 'successful') {
      bookingStatus.value = 'active'
    } else if (status === 'completed' || status === 'free') {
      bookingStatus.value = 'confirmed'
    } else {
      bookingStatus.value = 'payment_failed'
    }

    bookingHistory.value = bookingHistory.value.map((item) => {
      if (item.booking_id !== bookingId) {
        return item
      }

      return {
        ...item,
        booking_status: bookingStatus.value,
        payment_status: status,
      }
    })

    paymentHistory.value = [
      createLocalPaymentRecord({
        bookingId,
        amount: total.value,
        method: paymentMethod.value,
        status,
        transactionId: paymentTransactionId,
      }),
      ...paymentHistory.value,
    ]

    if (status === 'successful') {
      pendingNotifications.value = [
        {
          id: `NOT-${Date.now()}`,
          title: 'Booking Confirmed',
          message: `${event.value.title} is confirmed. Reference ${bookingReference.value}.`,
          notification_type: 'booking_confirmation',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        ...pendingNotifications.value,
      ]

      calendarEvents.value = [
        {
          calendar_id: `CAL-${Date.now()}`,
          user_id: 1,
          event_id: event.value.id,
          title: event.value.title,
          calendar_date: event.value.date,
          start_time: event.value.time,
          end_time: event.value.time,
          venue: event.value.venue,
        },
        ...calendarEvents.value.filter((item) => item.event_id !== event.value.id),
      ]
    }

    persist()
  }

  const resetBooking = () => {
    quantity.value = 1
    paymentMethod.value = 'card'
    bookingReference.value = ''
    transactionId.value = ''
    activeBookingId.value = ''
    bookingStatus.value = 'draft'
    paymentStatus.value = 'not_started'
    persist()
  }

  return {
    event,
    eventLoading,
    eventError,
    quantity,
    paymentMethod,
    bookingReference,
    transactionId,
    activeBookingId,
    bookingStatus,
    paymentStatus,
    bookingHistory,
    paymentHistory,
    pendingNotifications,
    calendarEvents,
    ticketPrice,
    availableSeats,
    subtotal,
    serviceFee,
    total,
    bookingSummary,
    maxTickets,
    loadEvent,
    setQuantity,
    setPaymentMethod,
    startBooking,
    updateBookingQuantity,
    cancelBooking,
    recordPaymentAttempt,
    resetBooking,
  }
})
