import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  calculateBookingTotals,
  fetchEventForBooking,
  generateBookingReference,
  getAllowedTicketLimit,
} from '../services/bookingService'
import { bookEvent, updateBooking, cancelBooking as cancelBookingApi, createPayment } from '../service/api'

const MAX_TICKETS = 5

export const useBookingStore = defineStore('booking', () => {
  const event = ref(null)
  const eventLoading = ref(false)
  const eventError = ref('')
  const quantity = ref(1)
  const maxTickets = ref(MAX_TICKETS)
  const paymentMethod = ref('card')
  const bookingReference = ref('')
  const transactionId = ref('')
  const activeBookingId = ref('')
  const bookingStatus = ref('draft')
  const paymentStatus = ref('not_started')
  const bookingHistory = ref([])
  const paymentHistory = ref([])
  const pendingNotifications = ref([])
  const calendarEvents = ref([])

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
  }

  const setPaymentMethod = (method) => {
    paymentMethod.value = method
  }

  // ─── Create booking via real API ─────────────────────────────────────────
  const startBooking = async () => {
    if (!event.value || maxTickets.value < 1) {
      return null
    }

    // If we already have an active booking in pending_payment, reuse it
    if (activeBookingId.value && bookingStatus.value === 'pending_payment') {
      return {
        booking_id: activeBookingId.value,
        bookingReference: bookingReference.value,
        eventSnapshot: {
          id: event.value.id,
          title: event.value.title,
          date: event.value.date,
          time: event.value.time,
          venue: event.value.venue,
          image: event.value.image,
          ticketPrice: event.value.ticketPrice,
        },
        ticket_quantity: quantity.value,
        amount: total.value,
        booking_status: 'pending_payment',
        payment_status: 'pending',
      }
    }

    try {
      const result = await bookEvent(event.value.id, quantity.value)

      if (!result.success) {
        eventError.value = result.message || 'Failed to create booking.'
        return null
      }

      const reference = generateBookingReference()
      activeBookingId.value = result.bookingId
      bookingReference.value = reference
      bookingStatus.value = result.bookingStatus || 'pending_payment'
      paymentStatus.value = 'pending'

      const record = {
        booking_id: result.bookingId,
        bookingReference: reference,
        eventSnapshot: {
          id: event.value.id,
          title: event.value.title,
          date: event.value.date,
          time: event.value.time,
          venue: event.value.venue,
          image: event.value.image,
          ticketPrice: event.value.ticketPrice,
        },
        ticket_quantity: quantity.value,
        amount: result.amount ?? total.value,
        booking_status: bookingStatus.value,
        payment_status: 'pending',
      }

      bookingHistory.value = [
        record,
        ...bookingHistory.value.filter((item) => item.booking_id !== record.booking_id),
      ]

      return record
    } catch (error) {
      eventError.value = error.message || 'Failed to create booking.'
      return null
    }
  }

  const updateBookingQuantity = async (bookingId, nextQuantity) => {
    try {
      await updateBooking(bookingId, { ticketQuantity: nextQuantity })
      quantity.value = nextQuantity

      bookingHistory.value = bookingHistory.value.map((item) => {
        if (item.booking_id !== bookingId) return item

        const nextTotals = calculateBookingTotals(item.eventSnapshot.ticketPrice, nextQuantity)
        return { ...item, ticket_quantity: nextQuantity, amount: nextTotals.total }
      })
    } catch (error) {
      console.error('Update booking quantity error:', error)
    }
  }

  const cancelBooking = async (bookingId) => {
    try {
      await cancelBookingApi(bookingId)

      bookingHistory.value = bookingHistory.value.map((item) => {
        if (item.booking_id !== bookingId) return item
        return { ...item, booking_status: 'cancelled' }
      })

      if (activeBookingId.value === bookingId) {
        bookingStatus.value = 'cancelled'
      }
    } catch (error) {
      console.error('Cancel booking error:', error)
    }
  }

  // ─── Record payment attempt via real API ─────────────────────────────────
  const recordPaymentAttempt = async ({ status, paymentTransactionId }) => {
    const bookingId = activeBookingId.value

    if (!bookingId) return

    try {
      if (status === 'completed' || status === 'free') {
        // Free event — booking already confirmed by the API
        bookingStatus.value = 'confirmed'
        paymentStatus.value = 'completed'
        transactionId.value = paymentTransactionId || `FREE-${Date.now()}`
      } else if (status === 'successful') {
        // Paid event — call the real payment API
        const result = await createPayment(bookingId, paymentMethod.value)

        if (result.success && result.paymentStatus === 'successful') {
          bookingStatus.value = 'confirmed'
          paymentStatus.value = 'successful'
          transactionId.value = `PAY-${result.paymentId}`
        } else {
          bookingStatus.value = 'payment_failed'
          paymentStatus.value = 'failed'
          transactionId.value = paymentTransactionId || `TXN-${Date.now()}`
        }
      } else {
        // Payment failed
        bookingStatus.value = 'payment_failed'
        paymentStatus.value = 'failed'
        transactionId.value = paymentTransactionId || `TXN-${Date.now()}`
      }

      bookingHistory.value = bookingHistory.value.map((item) => {
        if (item.booking_id !== bookingId) return item
        return { ...item, booking_status: bookingStatus.value, payment_status: paymentStatus.value }
      })

      paymentHistory.value = [
        {
          payment_id: transactionId.value,
          booking_id: bookingId,
          amount: total.value,
          payment_method: paymentMethod.value,
          payment_status: paymentStatus.value,
          payment_date: new Date().toISOString(),
        },
        ...paymentHistory.value,
      ]
    } catch (error) {
      console.error('Payment API error:', error)
      bookingStatus.value = 'payment_failed'
      paymentStatus.value = 'failed'
    }
  }

  const resetBooking = () => {
    quantity.value = 1
    paymentMethod.value = 'card'
    bookingReference.value = ''
    transactionId.value = ''
    activeBookingId.value = ''
    bookingStatus.value = 'draft'
    paymentStatus.value = 'not_started'
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
