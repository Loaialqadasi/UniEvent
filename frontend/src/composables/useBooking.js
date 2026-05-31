import { storeToRefs } from 'pinia'

import { useBookingStore } from '../stores/bookingStore'

export function useBooking() {
  const bookingStore = useBookingStore()

  return {
    ...storeToRefs(bookingStore),
    loadEvent: bookingStore.loadEvent,
    setQuantity: bookingStore.setQuantity,
    setPaymentMethod: bookingStore.setPaymentMethod,
    startBooking: bookingStore.startBooking,
    updateBookingQuantity: bookingStore.updateBookingQuantity,
    cancelBooking: bookingStore.cancelBooking,
    recordPaymentAttempt: bookingStore.recordPaymentAttempt,
    resetBooking: bookingStore.resetBooking,
  }
}
