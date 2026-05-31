import { reactive } from 'vue'

const STORAGE_KEY = 'freshdev-auth-user'

const DEMO_USERS = [
  {
    id: 'u-org-1',
    name: 'Campus Organizer',
    email: 'organizer@unievents.test',
    password: 'organizer123',
    role: 'organizer',
  },
  {
    id: 'u-stu-1',
    name: 'Demo Student',
    email: 'student@unievents.test',
    password: 'student123',
    role: 'student',
  },
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

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

export const authState = reactive({
  user: readStoredUser(),
})

export function getDemoAccounts() {
  return DEMO_USERS.map((item) => ({
    name: item.name,
    email: item.email,
    password: item.password,
    role: item.role,
  }))
}

export function loginWithPassword(email, password) {
  const normalizedEmail = email.trim().toLowerCase()
  const match = DEMO_USERS.find(
    (item) => item.email.toLowerCase() === normalizedEmail && item.password === password
  )

  if (!match) {
    throw new Error('Invalid email or password.')
  }

  const user = toPublicUser(match)
  authState.user = user
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return user
}

export function logout() {
  authState.user = null
  localStorage.removeItem(STORAGE_KEY)
}

export function isAuthenticated() {
  return Boolean(authState.user)
}

export function isRoleAllowed(roles = []) {
  if (!roles.length) return true
  if (!authState.user) return false
  return roles.includes(authState.user.role)
}
