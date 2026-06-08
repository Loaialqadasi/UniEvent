import { reactive } from 'vue'

const STORAGE_KEY = 'freshdev-auth-user'
const USERS_KEY = 'freshdev-auth-users'
const REGISTRATIONS_KEY = 'freshdev-auth-registrations'

const avatarColors = [
  'bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-teal-500',
]

const DEMO_USERS = [
  {
    id: 'u-org-1',
    name: 'Campus Organizer',
    email: 'organizer@unievents.test',
    password: 'organizer123',
    role: 'organizer',
    avatar: 'CO',
    avatarColor: 'bg-purple-500',
    phone: '',
    bio: 'Event coordinator for UTM campus activities.',
    studentId: '',
    department: 'Student Affairs',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'u-stu-1',
    name: 'Demo Student',
    email: 'student@unievents.test',
    password: 'student123',
    role: 'student',
    avatar: 'DS',
    avatarColor: 'bg-indigo-500',
    phone: '+60 12-345-6789',
    bio: 'Software Engineering student at UTM.',
    studentId: 'A23CS0001',
    department: 'Computer Science',
    createdAt: '2026-01-20T00:00:00Z',
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
    avatar: user.avatar || getInitials(user.name),
    avatarColor: user.avatarColor || 'bg-indigo-500',
    phone: user.phone || '',
    bio: user.bio || '',
    studentId: user.studentId || '',
    department: user.department || '',
    createdAt: user.createdAt || '',
  }
}

function getInitials(name) {
  if (!name) return ''
  return name.split(' ').filter(w => w.length > 0).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getRandomAvatarColor() {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)]
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

// Load all registered users (demo + signed-up users)
function loadAllUsers() {
  try {
    const stored = localStorage.getItem(USERS_KEY)
    if (!stored) {
      // Initialize with demo users on first load
      const initial = DEMO_USERS.map(u => toPublicUser(u))
      localStorage.setItem(USERS_KEY, JSON.stringify(initial))
      return initial
    }
    return JSON.parse(stored)
  } catch {
    return DEMO_USERS.map(u => toPublicUser(u))
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Registration tracking
function loadRegistrations() {
  try {
    const stored = localStorage.getItem(REGISTRATIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRegistrations(registrations) {
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations))
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

  // Check demo users first
  const demoMatch = DEMO_USERS.find(
    (item) => item.email.toLowerCase() === normalizedEmail && item.password === password
  )

  if (demoMatch) {
    const user = toPublicUser(demoMatch)
    authState.user = user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    return user
  }

  // Check registered users
  const allUsers = loadAllUsers()
  const usersWithPasswords = JSON.parse(localStorage.getItem(USERS_KEY + '_passwords') || '[]')
  const registeredUser = usersWithPasswords.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password)

  if (registeredUser) {
    const { password: _, ...userWithoutPassword } = registeredUser
    const user = toPublicUser(userWithoutPassword)
    authState.user = user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    return user
  }

  throw new Error('Invalid email or password.')
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

// ─── Sign Up ────────────────────────────────────────────────────────────────
export function signUp(name, email, password) {
  const allUsers = loadAllUsers()

  if (!name.trim()) {
    return { success: false, message: 'Please enter your full name.' }
  }
  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { success: false, message: 'Please enter a valid email address.' }
  }
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.' }
  }
  if (allUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return { success: false, message: 'An account with this email already exists.' }
  }

  const newUser = toPublicUser({
    id: generateId(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: 'student',
    avatar: getInitials(name),
    avatarColor: getRandomAvatarColor(),
    phone: '',
    bio: '',
    studentId: '',
    department: '',
    createdAt: new Date().toISOString(),
  })

  allUsers.push(newUser)
  saveUsers(allUsers)

  // Store password separately (simulated, would be server-side in production)
  const passwordStore = JSON.parse(localStorage.getItem(USERS_KEY + '_passwords') || '[]')
  passwordStore.push({ ...newUser, password })
  localStorage.setItem(USERS_KEY + '_passwords', JSON.stringify(passwordStore))

  // Auto-login after sign up
  authState.user = newUser
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))

  return { success: true, message: 'Account created successfully! Welcome to UniEvents!' }
}

// ─── Sign In (for SignInDialog) ─────────────────────────────────────────────
export function signIn(email, password) {
  try {
    loginWithPassword(email, password)
    return { success: true, message: `Welcome back, ${authState.user.name}!` }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

// ─── Profile Update ─────────────────────────────────────────────────────────
export function updateProfile(updates) {
  if (!authState.user) {
    return { success: false, message: 'Please sign in first.' }
  }

  if (updates.name !== undefined && !updates.name.trim()) {
    return { success: false, message: 'Name cannot be empty.' }
  }
  if (updates.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(updates.email.trim())) {
      return { success: false, message: 'Please enter a valid email address.' }
    }
  }

  // Update authState reactively
  if (updates.name !== undefined) {
    authState.user.name = updates.name.trim()
    authState.user.avatar = getInitials(updates.name.trim())
  }
  if (updates.email !== undefined) {
    authState.user.email = updates.email.trim().toLowerCase()
  }
  if (updates.phone !== undefined) {
    authState.user.phone = updates.phone.trim()
  }
  if (updates.bio !== undefined) {
    authState.user.bio = updates.bio.trim()
  }
  if (updates.studentId !== undefined) {
    authState.user.studentId = updates.studentId.trim()
  }
  if (updates.department !== undefined) {
    authState.user.department = updates.department.trim()
  }

  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(authState.user))

  // Also update the users list
  const allUsers = loadAllUsers()
  const userIndex = allUsers.findIndex(u => u.id === authState.user.id)
  if (userIndex !== -1) {
    allUsers[userIndex] = { ...authState.user }
    saveUsers(allUsers)
  }

  return { success: true, message: 'Profile updated successfully!' }
}

// ─── Event Registration ─────────────────────────────────────────────────────
export function registerForEvent(eventId) {
  if (!authState.user) {
    return { success: false, message: 'Please sign in to register for events.' }
  }

  const registrations = loadRegistrations()
  const existing = registrations.find(
    r => r.eventId === String(eventId) && r.userId === authState.user.id
  )

  if (existing) {
    return { success: false, message: 'You are already registered for this event.' }
  }

  registrations.push({
    eventId: String(eventId),
    userId: authState.user.id,
    registeredAt: new Date().toISOString(),
  })

  saveRegistrations(registrations)
  return { success: true, message: 'Successfully registered for the event!' }
}

export function unregisterFromEvent(eventId) {
  if (!authState.user) {
    return { success: false, message: 'Please sign in first.' }
  }

  let registrations = loadRegistrations()
  const initialLength = registrations.length

  registrations = registrations.filter(
    r => !(r.eventId === String(eventId) && r.userId === authState.user.id)
  )

  if (registrations.length === initialLength) {
    return { success: false, message: 'You are not registered for this event.' }
  }

  saveRegistrations(registrations)
  return { success: true, message: 'Successfully unregistered from the event.' }
}

export function isRegisteredForEvent(eventId) {
  if (!authState.user) return false
  const registrations = loadRegistrations()
  return registrations.some(
    r => r.eventId === String(eventId) && r.userId === authState.user.id
  )
}

export function getUserRegistrations() {
  if (!authState.user) return []
  const registrations = loadRegistrations()
  return registrations.filter(r => r.userId === authState.user.id)
}

// ─── Password Change ────────────────────────────────────────────────────────
export function changePassword(currentPassword, newPassword) {
  if (!authState.user) {
    return { success: false, message: 'Please sign in first.' }
  }
  if (newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters.' }
  }

  // Verify current password against demo users or stored passwords
  const demoMatch = DEMO_USERS.find(u => u.email.toLowerCase() === authState.user.email.toLowerCase())
  if (demoMatch) {
    if (demoMatch.password !== currentPassword) {
      return { success: false, message: 'Current password is incorrect.' }
    }
    // Demo user passwords can't be changed, but we simulate success
    return { success: true, message: 'Password updated successfully!' }
  }

  const passwordStore = JSON.parse(localStorage.getItem(USERS_KEY + '_passwords') || '[]')
  const storedUser = passwordStore.find(u => u.id === authState.user.id)
  if (!storedUser || storedUser.password !== currentPassword) {
    return { success: false, message: 'Current password is incorrect.' }
  }

  storedUser.password = newPassword
  localStorage.setItem(USERS_KEY + '_passwords', JSON.stringify(passwordStore))
  return { success: true, message: 'Password updated successfully!' }
}
