import { fetchEvents } from '../service/api'

const parseTicketPrice = (priceLabel) => {
  const amount = Number(String(priceLabel).replace(/[^\d.]/g, ''))
  return Number.isFinite(amount) ? amount : 0
}

export async function fetchEventForBooking(eventId) {
  const events = await fetchEvents()
  const event = events.find((item) => String(item.id) === String(eventId)) ?? events[0]

  return {
    ...event,
    ticketPrice: parseTicketPrice(event.price),
    organizer: event.organizer ?? 'Student Union',
    location: event.location ?? event.venue,
    heroImage: event.image,
  }
}

export function generateBookingReference() {
  return `UE${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}
