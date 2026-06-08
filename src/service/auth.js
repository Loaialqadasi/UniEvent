import { reactive } from 'vue'
import api from './api.js'

const STORAGE_KEY = 'freshdev-auth-user'
const TOKEN_KEY = 'freshdev-auth-token'

const avatarColors = [
  'bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-teal-500',
]

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getInitials(name) {
  if (!name) return ''
  return name.split(' ').filter(w => w.length > 0).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export const authState = reactive({
  user: readStoredUser(),
})

// ─── Demo Accounts (for login page display) ────────────────────────────────
export function getDemoAccounts() {
  return [
    { name: 'Campus Organizer', email: 'organizer@unievents.test', password: 'organizer123', role: 'organizer' },
    { name: 'Demo Student', email: 'student@unievents.test', password: 'student123', role: 'student' },
  ]
}

// ─── Login with JWT ────────────────────────────────────────────────────────
export async function loginWithPassword(email, password) {
  try {
    const response = await api.post('/api/auth/login', { email, password })
    const { token, user } = response.data

    // Store token and user
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    authState.user = user

    return user
  } catch (error) {
    const message = error.response?.data?.message || 'Invalid email or password.'
    throw new Error(message)
  }
}

// ─── Logout ────────────────────────────────────────────────────────────────
export function logout() {
  authState.user = null
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(STORAGE_KEY)
}

// ─── Auth Check ────────────────────────────────────────────────────────────
export function isAuthenticated() {
  return Boolean(authState.user) && Boolean(localStorage.getItem(TOKEN_KEY))
}

export function isRoleAllowed(roles = []) {
  if (!roles.length) return true
  if (!authState.user) return false
  return roles.includes(authState.user.role)
}

// ─── Sign Up ───────────────────────────────────────────────────────────────
export async function signUp(name, email, password) {
  try {
    const response = await api.post('/api/auth/register', { name, email, password, role: 'student' })
    const { token, user } = response.data

    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    authState.user = user

    return { success: true, message: 'Account created successfully! Welcome to UniEvents!' }
  } catch (error) {
    const message = error.response?.data?.message || 'Registration failed.'
    return { success: false, message }
  }
}

// ─── Sign In (for SignInDialog) ─────────────────────────────────────────────
export async function signIn(email, password) {
  try {
    const user = await loginWithPassword(email, password)
    return { success: true, message: `Welcome back, ${user.name}!` }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

// ─── Profile Update ────────────────────────────────────────────────────────
export async function updateProfile(updates) {
  try {
    const response = await api.put('/api/auth/profile', updates)
    const { token, user } = response.data

    // Update stored token and user
    if (token) localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    authState.user = user

    return { success: true, message: 'Profile updated successfully!' }
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update profile.'
    return { success: false, message }
  }
}

// ─── Password Change ───────────────────────────────────────────────────────
export async function changePassword(currentPassword, newPassword) {
  try {
    const response = await api.post('/api/auth/change-password', { currentPassword, newPassword })
    return { success: true, message: response.data.message || 'Password updated successfully!' }
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to change password.'
    return { success: false, message }
  }
}

// ─── Event Registration (now uses booking API) ─────────────────────────────
export async function registerForEvent(eventId) {
  if (!authState.user) {
    return { success: false, message: 'Please sign in to register for events.' }
  }

  try {
    await api.post('/api/bookings', { eventId, ticketQuantity: 1 })
    return { success: true, message: 'Successfully registered for the event!' }
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to register.'
    return { success: false, message }
  }
}

export async function unregisterFromEvent(eventId) {
  if (!authState.user) {
    return { success: false, message: 'Please sign in first.' }
  }

  try {
    // Find the booking for this event
    const response = await api.get(`/api/bookings/user/${authState.user.id}`)
    const bookings = response.data.bookings || []
    const booking = bookings.find(b => b.eventId === eventId && b.bookingStatus !== 'cancelled')

    if (!booking) {
      return { success: false, message: 'You are not registered for this event.' }
    }

    await api.delete(`/api/bookings/${booking.bookingId}`)
    return { success: true, message: 'Successfully unregistered from the event.' }
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to unregister.'
    return { success: false, message }
  }
}

export async function isRegisteredForEvent(eventId) {
  if (!authState.user) return false

  try {
    const response = await api.get(`/api/bookings/user/${authState.user.id}`)
    const bookings = response.data.bookings || []
    return bookings.some(b => b.eventId === eventId && b.bookingStatus !== 'cancelled')
  } catch {
    return false
  }
}

export async function getUserRegistrations() {
  if (!authState.user) return []

  try {
    const response = await api.get(`/api/bookings/user/${authState.user.id}`)
    return response.data.bookings || []
  } catch {
    return []
  }
}

// ─── Get current user ID ───────────────────────────────────────────────────
export function getCurrentUserId() {
  return authState.user?.id || null
}
