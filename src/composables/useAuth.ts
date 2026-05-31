import { ref, computed, watch } from 'vue'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  avatarColor: string
  createdAt: string
  phone?: string
  bio?: string
  studentId?: string
  department?: string
}

export interface Registration {
  eventId: string
  userId: string
  registeredAt: string
}

const STORAGE_KEY = 'unievents_user'
const USERS_KEY = 'unievents_users'
const REGISTRATIONS_KEY = 'unievents_registrations'

// Shared reactive state
const currentUser = ref<User | null>(null)
const initialized = ref(false)

function loadUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

function loadUsers(): User[] {
  try {
    const stored = localStorage.getItem(USERS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function loadRegistrations(): Registration[] {
  try {
    const stored = localStorage.getItem(REGISTRATIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRegistrations(registrations: Registration[]) {
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations))
}

const avatarColors = [
  'bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-teal-500',
]

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getRandomAvatarColor(): string {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)]
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

// Initialize on first use
if (!initialized.value) {
  currentUser.value = loadUser()
  initialized.value = true
}

watch(currentUser, (newVal) => {
  saveUser(newVal)
}, { deep: true })

export function useAuth() {
  const isLoggedIn = computed(() => !!currentUser.value)
  const userName = computed(() => currentUser.value?.name || '')
  const userEmail = computed(() => currentUser.value?.email || '')
  const userAvatar = computed(() => currentUser.value?.avatar || '')
  const userAvatarColor = computed(() => currentUser.value?.avatarColor || 'bg-indigo-500')

  function signUp(name: string, email: string, password: string): { success: boolean; message: string } {
    const users = loadUsers()

    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'An account with this email already exists.' }
    }

    // Validate
    if (!name.trim()) {
      return { success: false, message: 'Please enter your full name.' }
    }
    if (!email.trim() || !email.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' }
    }
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' }
    }

    const newUser: User = {
      id: generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: getInitials(name),
      avatarColor: getRandomAvatarColor(),
      createdAt: new Date().toISOString(),
    }

    // Store user with password (in real app, this would be server-side)
    const usersWithPasswords = [...users, { ...newUser, password }]
    saveUsers(usersWithPasswords)

    // Auto-login after sign up
    currentUser.value = newUser

    return { success: true, message: 'Account created successfully! Welcome to UniEvents!' }
  }

  function signIn(email: string, password: string): { success: boolean; message: string } {
    const users = loadUsers() as Array<User & { password?: string }>
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())

    if (!user) {
      return { success: false, message: 'No account found with this email address.' }
    }

    if (user.password && user.password !== password) {
      return { success: false, message: 'Incorrect password. Please try again.' }
    }

    // Login
    const { password: _, ...userWithoutPassword } = user
    currentUser.value = userWithoutPassword as User

    return { success: true, message: `Welcome back, ${user.name}!` }
  }

  function signOut() {
    currentUser.value = null
  }

  function registerForEvent(eventId: string): { success: boolean; message: string } {
    if (!currentUser.value) {
      return { success: false, message: 'Please sign in to register for events.' }
    }

    const registrations = loadRegistrations()
    const existing = registrations.find(
      r => r.eventId === eventId && r.userId === currentUser.value!.id
    )

    if (existing) {
      return { success: false, message: 'You are already registered for this event.' }
    }

    registrations.push({
      eventId,
      userId: currentUser.value.id,
      registeredAt: new Date().toISOString(),
    })

    saveRegistrations(registrations)
    return { success: true, message: 'Successfully registered for the event!' }
  }

  function unregisterFromEvent(eventId: string): { success: boolean; message: string } {
    if (!currentUser.value) {
      return { success: false, message: 'Please sign in first.' }
    }

    let registrations = loadRegistrations()
    const initialLength = registrations.length

    registrations = registrations.filter(
      r => !(r.eventId === eventId && r.userId === currentUser.value!.id)
    )

    if (registrations.length === initialLength) {
      return { success: false, message: 'You are not registered for this event.' }
    }

    saveRegistrations(registrations)
    return { success: true, message: 'Successfully unregistered from the event.' }
  }

  function isRegisteredForEvent(eventId: string): boolean {
    if (!currentUser.value) return false
    const registrations = loadRegistrations()
    return registrations.some(
      r => r.eventId === eventId && r.userId === currentUser.value!.id
    )
  }

  function getEventRegistrations(eventId: string): Registration[] {
    const registrations = loadRegistrations()
    return registrations.filter(r => r.eventId === eventId)
  }

  function getUserRegistrations(): Registration[] {
    if (!currentUser.value) return []
    const registrations = loadRegistrations()
    return registrations.filter(r => r.userId === currentUser.value!.id)
  }

  function updateProfile(updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'bio' | 'studentId' | 'department'>>): { success: boolean; message: string } {
    if (!currentUser.value) {
      return { success: false, message: 'Please sign in first.' }
    }

    // Validate name
    if (updates.name !== undefined && !updates.name.trim()) {
      return { success: false, message: 'Name cannot be empty.' }
    }

    // Validate email
    if (updates.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updates.email.trim())) {
        return { success: false, message: 'Please enter a valid email address.' }
      }
    }

    // Update currentUser reactively
    if (updates.name !== undefined) {
      currentUser.value.name = updates.name.trim()
      currentUser.value.avatar = getInitials(updates.name.trim())
    }
    if (updates.email !== undefined) {
      currentUser.value.email = updates.email.trim().toLowerCase()
    }
    if (updates.phone !== undefined) {
      currentUser.value.phone = updates.phone.trim()
    }
    if (updates.bio !== undefined) {
      currentUser.value.bio = updates.bio.trim()
    }
    if (updates.studentId !== undefined) {
      currentUser.value.studentId = updates.studentId.trim()
    }
    if (updates.department !== undefined) {
      currentUser.value.department = updates.department.trim()
    }

    // Also update the users list in localStorage so sign-in still works with new email
    const users = loadUsers() as Array<User & { password?: string }>
    const userIndex = users.findIndex(u => u.id === currentUser.value!.id)
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...currentUser.value }
      saveUsers(users)
    }

    // currentUser watcher auto-saves to localStorage via the watch()
    return { success: true, message: 'Profile updated successfully!' }
  }

  return {
    currentUser,
    isLoggedIn,
    userName,
    userEmail,
    userAvatar,
    userAvatarColor,
    signUp,
    signIn,
    signOut,
    updateProfile,
    registerForEvent,
    unregisterFromEvent,
    isRegisteredForEvent,
    getEventRegistrations,
    getUserRegistrations,
  }
}
