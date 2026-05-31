<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Eye, EyeOff, Mail, Lock, User } from 'lucide-vue-next'
import { authState, signUp, signIn } from '../../service/auth'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['close'])

const isLoggedIn = computed(() => !!authState.user)

const isSignUp = ref(false)
const showPassword = ref(false)
const email = ref('')
const password = ref('')
const name = ref('')
const confirmPassword = ref('')
const message = ref<{ text: string; type: 'success' | 'error' } | null>(null)
const isLoading = ref(false)

// Reset form when dialog opens/closes or when switching modes
watch(() => props.visible, (val) => {
  if (val) {
    message.value = null
  }
})

watch(isSignUp, () => {
  message.value = null
  password.value = ''
  confirmPassword.value = ''
})

const handleSubmit = async () => {
  isLoading.value = true
  message.value = null

  // Simulate a brief loading state for realism
  await new Promise(resolve => setTimeout(resolve, 500))

  if (isSignUp.value) {
    // Validate confirm password
    if (password.value !== confirmPassword.value) {
      message.value = { text: 'Passwords do not match.', type: 'error' }
      isLoading.value = false
      return
    }
    const result = signUp(name.value, email.value, password.value)
    message.value = { text: result.message, type: result.success ? 'success' : 'error' }
    if (result.success) {
      setTimeout(() => {
        emit('close')
        resetForm()
      }, 1500)
    }
  } else {
    const result = signIn(email.value, password.value)
    message.value = { text: result.message, type: result.success ? 'success' : 'error' }
    if (result.success) {
      setTimeout(() => {
        emit('close')
        resetForm()
      }, 1500)
    }
  }

  isLoading.value = false
}

const resetForm = () => {
  email.value = ''
  password.value = ''
  name.value = ''
  confirmPassword.value = ''
  message.value = null
  showPassword.value = false
}

const closeDialog = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <!-- Backdrop -->
  <div
    v-if="visible"
    class="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
    @click.self="closeDialog"
  >
    <!-- Dialog -->
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
      <!-- Close button -->
      <button
        @click="closeDialog"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer z-10"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Purple accent bar -->
      <div class="h-1.5 bg-gradient-to-r from-[#5E60CE] to-[#8B5CF6]"></div>

      <div class="p-8">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="w-14 h-14 bg-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <span class="text-white font-bold text-xl">U</span>
          </div>
          <h2 class="text-xl font-bold text-gray-900">
            {{ isSignUp ? 'Create Account' : 'Welcome Back' }}
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ isSignUp ? 'Join UniEvents today' : 'Sign in to your UniEvents account' }}
          </p>
        </div>

        <!-- Success/Error Message -->
        <div
          v-if="message"
          class="mb-4 text-sm px-4 py-3 rounded-xl flex items-center gap-2"
          :class="message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'"
        >
          <span v-if="message.type === 'success'" class="text-lg">&#10003;</span>
          <span v-else class="text-lg">&#9888;</span>
          {{ message.text }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Name (Sign Up only) -->
          <div v-if="isSignUp">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="name"
                type="text"
                placeholder="John Doe"
                required
                class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="email"
                type="email"
                placeholder="you@university.edu"
                required
                class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                required
                :minlength="isSignUp ? 6 : 1"
                class="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="isSignUp" class="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
          </div>

          <!-- Confirm Password (Sign Up only) -->
          <div v-if="isSignUp">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Confirm your password"
                required
                class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-xl transition-colors border-none cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="isLoading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In') }}
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-3 bg-white text-gray-400">or continue with</span>
          </div>
        </div>

        <!-- Google Button -->
        <button
          @click="message = { text: 'Google Sign-In requires a backend server. Use email/password for the demo.', type: 'error' }"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 bg-white cursor-pointer"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <!-- Toggle Sign In / Sign Up -->
        <p class="text-sm text-center text-gray-500 mt-6">
          {{ isSignUp ? 'Already have an account?' : "Don't have an account?" }}
          <button
            @click="isSignUp = !isSignUp"
            class="text-indigo-600 hover:underline font-medium bg-transparent border-none cursor-pointer"
          >
            {{ isSignUp ? 'Sign In' : 'Sign Up' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
