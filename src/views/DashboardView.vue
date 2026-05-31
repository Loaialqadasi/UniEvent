<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { User, Mail, Lock, Camera, Calendar, MapPin, Users, CheckCircle, AlertCircle, Settings, BookOpen } from 'lucide-vue-next'
import { authState, updateProfile, changePassword, getUserRegistrations } from '../service/auth'

// Active tab in dashboard
const activeTab = ref('profile')

// Profile form fields
const profileName = ref('')
const profileEmail = ref('')
const profilePhone = ref('')
const profileBio = ref('')
const profileStudentId = ref('')
const profileDepartment = ref('')

// Password form fields
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')

// Notification preferences (persisted in localStorage)
const notifPrefsKey = 'freshdev-notif-prefs'
const loadNotifPrefs = () => {
  try {
    const stored = localStorage.getItem(notifPrefsKey)
    return stored ? JSON.parse(stored) : { newEvents: true, confirmations: true, forumReplies: false }
  } catch {
    return { newEvents: true, confirmations: true, forumReplies: false }
  }
}
const notifPrefs = ref(loadNotifPrefs())
const saveNotifPrefs = () => {
  localStorage.setItem(notifPrefsKey, JSON.stringify(notifPrefs.value))
  passwordSuccess.value = 'Notification preferences saved.'
  setTimeout(() => { passwordSuccess.value = '' }, 3000)
}

// Validation error messages
const errors = ref<Record<string, string>>({})
// Success message
const saveSuccess = ref(false)
const passwordSuccess = ref('')
const passwordError = ref('')

// Current user computed
const currentUser = computed(() => authState.user)
const isLoggedIn = computed(() => !!authState.user)
const userName = computed(() => authState.user?.name || '')
const userEmail = computed(() => authState.user?.email || '')
const userAvatar = computed(() => authState.user?.avatar || '')
const userAvatarColor = computed(() => authState.user?.avatarColor || 'bg-indigo-500')

// Load profile data on mount
onMounted(() => {
  if (isLoggedIn.value) {
    profileName.value = currentUser.value?.name || ''
    profileEmail.value = currentUser.value?.email || ''
    profilePhone.value = currentUser.value?.phone || ''
    profileBio.value = currentUser.value?.bio || ''
    profileStudentId.value = currentUser.value?.studentId || ''
    profileDepartment.value = currentUser.value?.department || ''
  }
})

// Registered events
const myRegistrations = ref(getUserRegistrations())

const registeredEventsList = computed(() => {
  const allEvents = [
    { id: 'tech-summit', title: 'Tech Innovation Summit 2026', date: 'Jun 15, 2026', location: 'Main Auditorium', category: 'Technology' },
    { id: 'career-fair', title: 'Annual Career Fair 2026', date: 'Jul 2, 2026', location: 'Student Center Hall', category: 'Career' },
    { id: 'music-festival', title: 'Music Festival Spring 2026', date: 'Aug 20, 2026', location: 'Campus Park', category: 'Entertainment' },
    { id: 'ai-workshop', title: 'AI & Machine Learning Workshop', date: 'Jun 22, 2026', location: 'CS Lab 301', category: 'Technology' },
    { id: 'basketball', title: 'Inter-University Basketball Tournament', date: 'Jul 10, 2026', location: 'Sports Complex', category: 'Sports' },
    { id: 'art-exhibit', title: 'Art Exhibition: Digital Horizons', date: 'Jul 15, 2026', location: 'Gallery Hall', category: 'Arts' },
    { id: 'research-symposium', title: 'Research Symposium 2026', date: 'Aug 5, 2026', location: 'Science Block', category: 'Academic' },
    { id: 'startup-pitch', title: 'Startup Pitch Night', date: 'Aug 12, 2026', location: 'Innovation Hub', category: 'Career' },
    { id: 'dance-festival', title: 'Cultural Dance Festival', date: 'Aug 25, 2026', location: 'Open Air Stage', category: 'Arts' },
  ]
  return allEvents.filter(e => myRegistrations.value.some(r => r.eventId === e.id))
})

// --- VALIDATION LOGIC ---
function validateProfile(): boolean {
  errors.value = {}
  let isValid = true

  if (!profileName.value.trim()) {
    errors.value.name = 'Name is required. Please enter your full name.'
    isValid = false
  } else if (profileName.value.trim().length < 2) {
    errors.value.name = 'Name must be at least 2 characters.'
    isValid = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!profileEmail.value.trim()) {
    errors.value.email = 'Email is required. Please enter your email address.'
    isValid = false
  } else if (!emailRegex.test(profileEmail.value.trim())) {
    errors.value.email = 'Please enter a valid email address (e.g., name@university.edu).'
    isValid = false
  }

  if (profilePhone.value.trim()) {
    const phoneRegex = /^[\d\s\-+()]{7,15}$/
    if (!phoneRegex.test(profilePhone.value.trim())) {
      errors.value.phone = 'Please enter a valid phone number.'
      isValid = false
    }
  }

  if (!profileStudentId.value.trim()) {
    errors.value.studentId = 'Student ID is required.'
    isValid = false
  }

  if (!profileDepartment.value.trim()) {
    errors.value.department = 'Department is required.'
    isValid = false
  }

  if (profileBio.value.trim().length > 200) {
    errors.value.bio = 'Bio must be 200 characters or less.'
    isValid = false
  }

  return isValid
}

function saveProfile() {
  saveSuccess.value = false

  if (!validateProfile()) {
    return
  }

  const result = updateProfile({
    name: profileName.value.trim(),
    email: profileEmail.value.trim(),
    phone: profilePhone.value.trim(),
    bio: profileBio.value.trim(),
    studentId: profileStudentId.value.trim(),
    department: profileDepartment.value.trim(),
  })

  if (result.success) {
    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  }
}

// --- PASSWORD CHANGE ---
function handleChangePassword() {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (!currentPassword.value) {
    passwordError.value = 'Please enter your current password.'
    return
  }
  if (!newPassword.value) {
    passwordError.value = 'Please enter a new password.'
    return
  }
  if (newPassword.value.length < 6) {
    passwordError.value = 'New password must be at least 6 characters.'
    return
  }
  if (newPassword.value !== confirmNewPassword.value) {
    passwordError.value = 'New passwords do not match.'
    return
  }

  const result = changePassword(currentPassword.value, newPassword.value)
  if (result.success) {
    passwordSuccess.value = result.message
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
    setTimeout(() => { passwordSuccess.value = '' }, 3000)
  } else {
    passwordError.value = result.message
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p class="text-gray-500">Manage your profile and view your event registrations</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid lg:grid-cols-4 gap-8">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- User Card -->
          <div class="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <div class="text-center">
              <div class="relative inline-block">
                <div :class="userAvatarColor" class="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {{ userAvatar }}
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mt-3">{{ userName }}</h3>
              <p class="text-sm text-gray-500">{{ userEmail }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ currentUser?.role === 'organizer' ? 'Organizer' : 'Student' }}</p>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              @click="activeTab = 'profile'"
              class="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-none cursor-pointer text-left"
              :class="activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 bg-white'"
            >
              <User class="w-4 h-4" /> Profile Settings
            </button>
            <button
              @click="activeTab = 'registrations'"
              class="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-none cursor-pointer text-left"
              :class="activeTab === 'registrations' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 bg-white'"
            >
              <Calendar class="w-4 h-4" /> My Registrations
            </button>
            <button
              @click="activeTab = 'settings'"
              class="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-none cursor-pointer text-left"
              :class="activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 bg-white'"
            >
              <Settings class="w-4 h-4" /> Account Settings
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">

          <!-- ========== PROFILE SETTINGS TAB ========== -->
          <div v-if="activeTab === 'profile'" class="bg-white rounded-2xl shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-1">Profile Settings</h2>
            <p class="text-sm text-gray-500 mb-6">Update your personal information and preferences</p>

            <!-- Success Message -->
            <div v-if="saveSuccess" class="mb-6 flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm">
              <CheckCircle class="w-5 h-5" />
              Profile updated successfully!
            </div>

            <form @submit.prevent="saveProfile" class="space-y-6">
              <!-- Name Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    v-model="profileName"
                    type="text"
                    placeholder="Enter your full name"
                    class="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    :class="errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'"
                  />
                </div>
                <p v-if="errors.name" class="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle class="w-3.5 h-3.5" /> {{ errors.name }}
                </p>
              </div>

              <!-- Email Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    v-model="profileEmail"
                    type="email"
                    placeholder="you@university.edu"
                    class="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    :class="errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'"
                  />
                </div>
                <p v-if="errors.email" class="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle class="w-3.5 h-3.5" /> {{ errors.email }}
                </p>
              </div>

              <!-- Student ID Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Student ID <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <BookOpen class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    v-model="profileStudentId"
                    type="text"
                    placeholder="e.g., A20CS0001"
                    class="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    :class="errors.studentId ? 'border-red-300 bg-red-50' : 'border-gray-200'"
                  />
                </div>
                <p v-if="errors.studentId" class="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle class="w-3.5 h-3.5" /> {{ errors.studentId }}
                </p>
              </div>

              <!-- Department Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Department <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <BookOpen class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    v-model="profileDepartment"
                    type="text"
                    placeholder="e.g., Computer Science"
                    class="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    :class="errors.department ? 'border-red-300 bg-red-50' : 'border-gray-200'"
                  />
                </div>
                <p v-if="errors.department" class="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle class="w-3.5 h-3.5" /> {{ errors.department }}
                </p>
              </div>

              <!-- Phone Field (optional) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number <span class="text-gray-400 text-xs">(optional)</span>
                </label>
                <input
                  v-model="profilePhone"
                  type="tel"
                  placeholder="+60 12-345-6789"
                  class="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  :class="errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'"
                />
                <p v-if="errors.phone" class="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle class="w-3.5 h-3.5" /> {{ errors.phone }}
                </p>
              </div>

              <!-- Bio Field -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Bio <span class="text-gray-400 text-xs">(max 200 chars)</span>
                </label>
                <textarea
                  v-model="profileBio"
                  rows="3"
                  placeholder="Tell us about yourself..."
                  class="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  :class="errors.bio ? 'border-red-300 bg-red-50' : 'border-gray-200'"
                ></textarea>
                <p class="text-xs text-gray-400 mt-1">{{ profileBio.length }}/200 characters</p>
                <p v-if="errors.bio" class="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle class="w-3.5 h-3.5" /> {{ errors.bio }}
                </p>
              </div>

              <!-- Save Button -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  @click="errors = {}"
                  class="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-6 py-2.5 text-sm font-medium text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 cursor-pointer transition-colors border-none shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <!-- ========== MY REGISTRATIONS TAB ========== -->
          <div v-if="activeTab === 'registrations'" class="bg-white rounded-2xl shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-1">My Registrations</h2>
            <p class="text-sm text-gray-500 mb-6">Events you've registered for</p>

            <div v-if="registeredEventsList.length > 0" class="space-y-4">
              <div
                v-for="event in registeredEventsList"
                :key="event.id"
                class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <Calendar class="w-5 h-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900">{{ event.title }}</h4>
                  <div class="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span class="flex items-center gap-1"><MapPin class="w-3.5 h-3.5" /> {{ event.location }}</span>
                    <span>{{ event.date }}</span>
                  </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">{{ event.category }}</span>
                <CheckCircle class="w-5 h-5 text-emerald-500" />
              </div>
            </div>

            <div v-else class="text-center py-12">
              <Calendar class="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 class="text-lg font-medium text-gray-900 mb-1">No registrations yet</h3>
              <p class="text-gray-500 text-sm">Browse events and register to see them here</p>
              <router-link
                to="/gallery"
                class="inline-flex items-center gap-2 mt-4 bg-indigo-500 text-white font-medium px-5 py-2 rounded-xl no-underline hover:bg-indigo-600 transition-colors text-sm"
              >
                Browse Events
              </router-link>
            </div>
          </div>

          <!-- ========== ACCOUNT SETTINGS TAB ========== -->
          <div v-if="activeTab === 'settings'" class="bg-white rounded-2xl shadow-sm p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-1">Account Settings</h2>
            <p class="text-sm text-gray-500 mb-6">Manage your account security and preferences</p>

            <!-- Change Password Section -->
            <div class="border border-gray-200 rounded-xl p-5 mb-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lock class="w-4 h-4" /> Change Password
              </h3>

              <div v-if="passwordSuccess" class="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm">
                <CheckCircle class="w-4 h-4" /> {{ passwordSuccess }}
              </div>
              <div v-if="passwordError" class="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl text-sm">
                <AlertCircle class="w-4 h-4" /> {{ passwordError }}
              </div>

              <div class="space-y-3">
                <input
                  v-model="currentPassword"
                  type="password"
                  placeholder="Current password"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  v-model="newPassword"
                  type="password"
                  placeholder="New password (min 6 characters)"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  v-model="confirmNewPassword"
                  type="password"
                  placeholder="Confirm new password"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  @click="handleChangePassword"
                  class="bg-indigo-500 text-white text-sm font-medium px-5 py-2 rounded-xl border-none cursor-pointer hover:bg-indigo-600 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </div>

            <!-- Notification Preferences -->
            <div class="border border-gray-200 rounded-xl p-5">
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Settings class="w-4 h-4" /> Notification Preferences
              </h3>
              <div class="space-y-3">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input v-model="notifPrefs.newEvents" type="checkbox" class="w-4 h-4 text-indigo-500 rounded" />
                  <span class="text-sm text-gray-700">Email notifications for new events</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input v-model="notifPrefs.confirmations" type="checkbox" class="w-4 h-4 text-indigo-500 rounded" />
                  <span class="text-sm text-gray-700">Registration confirmations</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input v-model="notifPrefs.forumReplies" type="checkbox" class="w-4 h-4 text-indigo-500 rounded" />
                  <span class="text-sm text-gray-700">Forum reply notifications</span>
                </label>
              </div>
              <button
                type="button"
                @click="saveNotifPrefs"
                class="mt-4 bg-indigo-500 text-white text-sm font-medium px-5 py-2 rounded-xl border-none cursor-pointer hover:bg-indigo-600 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
