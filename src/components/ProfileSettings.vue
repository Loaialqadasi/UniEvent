<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-gray-100">
      <h2 class="text-sm font-bold text-gray-900">Profile Settings</h2>
      <p class="text-[11px] text-gray-500 mt-0.5">Update your personal information</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="p-5 space-y-4" novalidate>
      <!-- Name -->
      <div>
        <label for="name" class="block text-xs font-medium text-gray-700 mb-1">Full Name <span class="text-red-500">*</span></label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </div>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Enter your full name"
            class="w-full pl-9 pr-3 py-2 rounded-md border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors"
            :class="errors.name ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-primary-100 focus:border-primary-400'"
          />
        </div>
        <p v-if="errors.name" class="mt-1 text-[11px] text-red-500 flex items-center gap-1">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          {{ errors.name }}
        </p>
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-xs font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="you@university.edu"
            class="w-full pl-9 pr-3 py-2 rounded-md border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors"
            :class="errors.email ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-primary-100 focus:border-primary-400'"
          />
        </div>
        <p v-if="errors.email" class="mt-1 text-[11px] text-red-500 flex items-center gap-1">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          {{ errors.email }}
        </p>
      </div>

      <!-- Phone -->
      <div>
        <label for="phone" class="block text-xs font-medium text-gray-700 mb-1">Phone <span class="text-red-500">*</span></label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          </div>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            placeholder="+60 12-345 6789"
            class="w-full pl-9 pr-3 py-2 rounded-md border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors"
            :class="errors.phone ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-primary-100 focus:border-primary-400'"
          />
        </div>
        <p v-if="errors.phone" class="mt-1 text-[11px] text-red-500 flex items-center gap-1">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          {{ errors.phone }}
        </p>
      </div>

      <!-- Student ID -->
      <div>
        <label for="studentId" class="block text-xs font-medium text-gray-700 mb-1">Student ID <span class="text-red-500">*</span></label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/></svg>
          </div>
          <input
            id="studentId"
            v-model="form.studentId"
            type="text"
            placeholder="A23EC9010"
            class="w-full pl-9 pr-3 py-2 rounded-md border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors"
            :class="errors.studentId ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-primary-100 focus:border-primary-400'"
          />
        </div>
        <p v-if="errors.studentId" class="mt-1 text-[11px] text-red-500 flex items-center gap-1">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          {{ errors.studentId }}
        </p>
      </div>

      <!-- Success -->
      <div v-if="submitSuccess" class="p-3 rounded-md bg-green-50 border border-green-200 flex items-center gap-2">
        <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        <p class="text-xs font-medium text-green-700">Profile updated successfully!</p>
      </div>

      <!-- Buttons -->
      <div class="flex items-center justify-end gap-2 pt-2">
        <button type="button" @click="resetForm" class="px-4 py-2 rounded-md border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
        <button type="submit" :disabled="isSubmitting" class="px-5 py-2 rounded-md bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-colors disabled:opacity-50">
          <span v-if="isSubmitting">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const form = reactive({
  name: 'Loai AlQadasi',
  email: 'loai@university.edu',
  phone: '+60 12-345 6789',
  studentId: 'A23EC9010',
})

const errors = reactive({ name: '', email: '', phone: '', studentId: '' })
const isSubmitting = ref(false)
const submitSuccess = ref(false)

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const phoneRegex = /^[\+]?[0-9\s\-]{7,15}$/
const studentIdRegex = /^[A-Za-z]{1,2}\d{2}[A-Za-z]{0,2}\d{4,5}$/

function validateForm() {
  let valid = true
  errors.name = ''
  errors.email = ''
  errors.phone = ''
  errors.studentId = ''

  if (!form.name.trim()) {
    errors.name = 'Full name is required.'
    valid = false
  } else if (form.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters.'
    valid = false
  } else if (!/^[a-zA-Z\s]+$/.test(form.name.trim())) {
    errors.name = 'Name can only contain letters and spaces.'
    valid = false
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.'
    valid = false
  } else if (!emailRegex.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.'
    valid = false
  }

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required.'
    valid = false
  } else if (!phoneRegex.test(form.phone.trim())) {
    errors.phone = 'Please enter a valid phone number.'
    valid = false
  }

  if (!form.studentId.trim()) {
    errors.studentId = 'Student ID is required.'
    valid = false
  } else if (!studentIdRegex.test(form.studentId.trim())) {
    errors.studentId = 'Please enter a valid Student ID (e.g. A23EC9010).'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  submitSuccess.value = false
  if (!validateForm()) return
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 800))
  isSubmitting.value = false
  submitSuccess.value = true
  setTimeout(() => { submitSuccess.value = false }, 3000)
}

function resetForm() {
  form.name = 'Loai AlQadasi'
  form.email = 'loai@university.edu'
  form.phone = '+60 12-345 6789'
  form.studentId = 'A23EC9010'
  errors.name = ''
  errors.email = ''
  errors.phone = ''
  errors.studentId = ''
  submitSuccess.value = false
}
</script>
