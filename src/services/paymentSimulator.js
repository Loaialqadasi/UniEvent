import axios from 'axios'

const wait = (ms = 900) => new Promise((resolve) => setTimeout(resolve, ms))

const DEMO_USER_ID = 1

export function validateCardPayment(details) {
  const errors = {}
  const cardNumber = details.cardNumber.replace(/\s/g, '')

  if (details.cardName.trim().length < 3) {
    errors.cardName = 'Enter the name shown on the card.'
  }

  if (!/^\d{16}$/.test(cardNumber)) {
    errors.cardNumber = 'Use the demo format: 1234 5678 9012 3456.'
  }

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(details.expiry)) {
    errors.expiry = 'Use MM/YY format.'
  }

  if (!/^\d{3,4}$/.test(details.cvv)) {
    errors.cvv = 'CVV must be 3 or 4 digits.'
  }

  return errors
}

export async function simulatePayment({ amount, method, details, forceFailure = false }) {
  await wait()

  if (method === 'card') {
    const errors = validateCardPayment(details)
    if (Object.keys(errors).length) {
      return { ok: false, errors }
    }
  }

  if (amount === undefined || amount === null || amount < 0) {
    return { ok: false, errors: { payment: 'Invalid payment amount.' } }
  }

  if (forceFailure) {
    return {
      ok: false,
      transactionId: `TXN-${Date.now()}`,
      status: 'failed',
      errors: { payment: 'Demo failed payment: transaction declined by simulator.' },
    }
  }

  return {
    ok: true,
    transactionId: `TXN-${Date.now()}`,
    status: 'successful',
  }
}

export function createPaymentPayload({ bookingId, amount, method, status }) {
  return {
    user_id: DEMO_USER_ID,
    booking_id: bookingId,
    amount,
    payment_method: method,
    payment_status: status,
    payment_date: new Date().toISOString(),
  }
}

export function createLocalPaymentRecord({ bookingId, amount, method, status, transactionId }) {
  return {
    ...createPaymentPayload({ bookingId, amount, method, status }),
    payment_id: transactionId,
  }
}

export const paymentApiRoutes = {
  create: '/api/payments',
  history: (userId = DEMO_USER_ID) => `/api/payments/user/${userId}`,
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
})

export const paymentService = {
  createPayment(payload) {
    return apiClient.post(paymentApiRoutes.create, payload)
  },
  getUserPayments(userId = DEMO_USER_ID) {
    return apiClient.get(paymentApiRoutes.history(userId))
  },
}
