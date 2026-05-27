const wait = (ms = 900) => new Promise((resolve) => setTimeout(resolve, ms))

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

export async function simulatePayment({ amount, method, details }) {
  await wait()

  if (method === 'card') {
    const errors = validateCardPayment(details)
    if (Object.keys(errors).length) {
      return { ok: false, errors }
    }
  }

  if (!amount || amount < 0) {
    return { ok: false, errors: { payment: 'Invalid payment amount.' } }
  }

  return { ok: true, transactionId: `TXN-${Date.now()}` }
}
