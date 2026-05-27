import { storeToRefs } from 'pinia'

import { useBookingStore } from '../stores/bookingStore'

export function useBooking() {
  const bookingStore = useBookingStore()

  return {
    ...storeToRefs(bookingStore),
    loadEvent: bookingStore.loadEvent,
    setQuantity: bookingStore.setQuantity,
    setPaymentMethod: bookingStore.setPaymentMethod,
    confirmPayment: bookingStore.confirmPayment,
    resetBooking: bookingStore.resetBooking,
  }
}
