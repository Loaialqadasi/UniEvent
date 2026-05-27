import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchEventForBooking, generateBookingReference } from '../services/bookingService'

const SERVICE_FEE_RATE = 0.06
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

  const ticketPrice = computed(() => event.value?.ticketPrice ?? 0)
  const subtotal = computed(() => ticketPrice.value * quantity.value)
  const serviceFee = computed(() => Math.round(subtotal.value * SERVICE_FEE_RATE * 100) / 100)
  const total = computed(() => subtotal.value + serviceFee.value)

  const bookingSummary = computed(() => ({
    event: event.value,
    quantity: quantity.value,
    ticketPrice: ticketPrice.value,
    subtotal: subtotal.value,
    serviceFee: serviceFee.value,
    total: total.value,
    paymentMethod: paymentMethod.value,
    bookingReference: bookingReference.value,
  }))

  const loadEvent = async (eventId) => {
    eventLoading.value = true
    eventError.value = ''

    try {
      event.value = await fetchEventForBooking(eventId)
    } catch (error) {
      eventError.value = 'Unable to load booking details. Please try again.'
    } finally {
      eventLoading.value = false
    }
  }

  const setQuantity = (value) => {
    const nextValue = Number(value)
    quantity.value = Math.min(MAX_TICKETS, Math.max(1, Number.isFinite(nextValue) ? nextValue : 1))
  }

  const setPaymentMethod = (method) => {
    paymentMethod.value = method
  }

  const confirmPayment = (paymentTransactionId) => {
    transactionId.value = paymentTransactionId
    bookingReference.value = generateBookingReference()
  }

  const resetBooking = () => {
    quantity.value = 1
    paymentMethod.value = 'card'
    bookingReference.value = ''
    transactionId.value = ''
  }

  return {
    event,
    eventLoading,
    eventError,
    quantity,
    paymentMethod,
    bookingReference,
    transactionId,
    ticketPrice,
    subtotal,
    serviceFee,
    total,
    bookingSummary,
    maxTickets,
    loadEvent,
    setQuantity,
    setPaymentMethod,
    confirmPayment,
    resetBooking,
  }
})
