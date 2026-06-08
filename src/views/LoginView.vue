<script setup>
import { reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDemoAccounts, loginWithPassword, signUp } from '../service/auth'

const route = useRoute()
const router = useRouter()

const activeTab = ref('login')

const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({ name: '', email: '', password: '', confirmPassword: '' })

const busy = ref(false)
const error = ref('')
const successMsg = ref('')
const showPassword = ref(false)
const showRegPassword = ref(false)
const demoAccounts = getDemoAccounts()

const passwordMismatch = computed(() =>
  registerForm.confirmPassword.length > 0 && registerForm.password !== registerForm.confirmPassword
)

const fillDemo = (account) => {
  loginForm.email = account.email
  loginForm.password = account.password
  activeTab.value = 'login'
}

const onLogin = async () => {
  error.value = ''
  successMsg.value = ''

  if (!loginForm.email.trim()) { error.value = 'Please enter your email address.'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email.trim())) { error.value = 'Please enter a valid email address.'; return }
  if (!loginForm.password) { error.value = 'Please enter your password.'; return }
  if (loginForm.password.length < 4) { error.value = 'Password must be at least 4 characters.'; return }

  busy.value = true
  try {
    const user = await loginWithPassword(loginForm.email, loginForm.password)
    const defaultRedirect = user.role === 'organizer' ? '/manage-events' : '/gallery'
    const redirectTo = typeof route.query.redirect === 'string' ? route.query.redirect : defaultRedirect
    await router.replace(redirectTo)
  } catch (err) {
    error.value = err.message ?? 'Login failed. Please try again.'
  } finally {
    busy.value = false
  }
}

const onRegister = async () => {
  error.value = ''
  successMsg.value = ''

  if (!registerForm.name.trim()) { error.value = 'Please enter your full name.'; return }
  if (!registerForm.email.trim()) { error.value = 'Please enter your email address.'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email.trim())) { error.value = 'Please enter a valid email address.'; return }
  if (!registerForm.password) { error.value = 'Please create a password.'; return }
  if (registerForm.password.length < 6) { error.value = 'Password must be at least 6 characters.'; return }
  if (passwordMismatch.value) { error.value = 'Passwords do not match.'; return }

  busy.value = true
  try {
    const result = await signUp(registerForm.name, registerForm.email, registerForm.password)
    if (result.success) {
      const defaultRedirect = '/gallery'
      const redirectTo = typeof route.query.redirect === 'string' ? route.query.redirect : defaultRedirect
      await router.replace(redirectTo)
    } else {
      error.value = result.message
    }
  } catch (err) {
    error.value = err.message ?? 'Registration failed. Please try again.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <!-- Left: Branding Panel -->
    <div class="auth-brand">
      <div class="brand-decor brand-decor--1"></div>
      <div class="brand-decor brand-decor--2"></div>
      <div class="brand-decor brand-decor--3"></div>

      <div class="brand-content">
        <div class="brand-logo">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="10" fill="white" fill-opacity="0.2"/>
            <path d="M12 28V16L20 10L28 16V28H22V22H18V28H12Z" fill="white" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
          <span>UniEvents</span>
        </div>

        <h1>Discover &amp; Manage<br/>Campus Events</h1>
        <p>Join thousands of students in exciting campus activities, workshops, and social events. Your campus life starts here.</p>

        <div class="brand-stats">
          <div class="brand-stat">
            <strong>500+</strong>
            <span>Events</span>
          </div>
          <div class="brand-stat">
            <strong>2,000+</strong>
            <span>Students</span>
          </div>
          <div class="brand-stat">
            <strong>50+</strong>
            <span>Organizers</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Form Panel -->
    <div class="auth-form-panel">
      <div class="auth-form-container">
        <!-- Mobile logo -->
        <div class="auth-mobile-logo">
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="8" fill="#4f39f6"/>
            <path d="M10 26V14L18 8L26 14V26H20V20H16V26H10Z" fill="white" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
          <span>UniEvents</span>
        </div>

        <!-- Tabs -->
        <div class="auth-tabs">
          <button
            :class="['auth-tab', { 'auth-tab--active': activeTab === 'login' }]"
            type="button"
            @click="activeTab = 'login'; error = ''; successMsg = ''"
          >
            Sign In
          </button>
          <button
            :class="['auth-tab', { 'auth-tab--active': activeTab === 'register' }]"
            type="button"
            @click="activeTab = 'register'; error = ''; successMsg = ''"
          >
            Create Account
          </button>
        </div>

        <!-- Login Form -->
        <form v-if="activeTab === 'login'" class="auth-form" @submit.prevent="onLogin">
          <div class="auth-field">
            <label for="login-email">Email Address</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
              <input id="login-email" v-model="loginForm.email" type="email" placeholder="name@unievents.test" required />
            </div>
          </div>

          <div class="auth-field">
            <label for="login-password">Password</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
              <input id="login-password" v-model="loginForm.password" :type="showPassword ? 'text' : 'password'" placeholder="Enter your password" required />
              <button class="auth-eye-btn" type="button" @click="showPassword = !showPassword" tabindex="-1">
                <svg v-if="!showPassword" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
                <svg v-else viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
              </button>
            </div>
          </div>

          <p v-if="error" class="auth-error">{{ error }}</p>

          <button class="auth-submit" type="submit" :disabled="busy">
            <svg v-if="busy" class="auth-spinner" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4" /></svg>
            {{ busy ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <!-- Register Form -->
        <form v-if="activeTab === 'register'" class="auth-form" @submit.prevent="onRegister">
          <div class="auth-field">
            <label for="reg-name">Full Name</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
              <input id="reg-name" v-model="registerForm.name" type="text" placeholder="Your full name" required />
            </div>
          </div>

          <div class="auth-field">
            <label for="reg-email">Email Address</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
              <input id="reg-email" v-model="registerForm.email" type="email" placeholder="name@unievents.test" required />
            </div>
          </div>

          <div class="auth-field">
            <label for="reg-password">Password</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
              <input id="reg-password" v-model="registerForm.password" :type="showRegPassword ? 'text' : 'password'" placeholder="Min. 6 characters" required />
              <button class="auth-eye-btn" type="button" @click="showRegPassword = !showRegPassword" tabindex="-1">
                <svg v-if="!showRegPassword" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
                <svg v-else viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
              </button>
            </div>
          </div>

          <div class="auth-field">
            <label for="reg-confirm">Confirm Password</label>
            <div class="auth-input-wrap" :class="{ 'auth-input-wrap--error': passwordMismatch }">
              <svg class="auth-input-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              <input id="reg-confirm" v-model="registerForm.confirmPassword" :type="showRegPassword ? 'text' : 'password'" placeholder="Re-enter password" required />
            </div>
            <p v-if="passwordMismatch" class="auth-field-error">Passwords do not match</p>
          </div>

          <p v-if="error" class="auth-error">{{ error }}</p>
          <p v-if="successMsg" class="auth-success">{{ successMsg }}</p>

          <button class="auth-submit" type="submit" :disabled="busy">
            <svg v-if="busy" class="auth-spinner" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4" /></svg>
            {{ busy ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <!-- Demo Accounts -->
        <div class="auth-demo">
          <div class="auth-demo-label">
            <span></span>
            <p>Quick Demo Access</p>
            <span></span>
          </div>
          <div class="auth-demo-list">
            <button
              v-for="account in demoAccounts"
              :key="account.email"
              class="auth-demo-card"
              type="button"
              @click="fillDemo(account)"
            >
              <div class="auth-demo-avatar" :class="account.role === 'organizer' ? 'auth-demo-avatar--org' : 'auth-demo-avatar--stu'">
                {{ account.role === 'organizer' ? 'O' : 'S' }}
              </div>
              <div class="auth-demo-info">
                <strong>{{ account.role === 'organizer' ? 'Organizer' : 'Student' }}</strong>
                <span>{{ account.email }}</span>
              </div>
              <svg class="auth-demo-arrow" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ─── Layout ────────────────────────────────────────────────────────────── */
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
}

/* ─── Branding Panel (Left) ─────────────────────────────────────────────── */
.auth-brand {
  position: relative;
  background: linear-gradient(145deg, #4f39f6 0%, #5E60CE 35%, #8B5CF6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  overflow: hidden;
}

.brand-decor {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.brand-decor--1 {
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.06);
  top: -120px;
  left: -120px;
}
.brand-decor--2 {
  width: 400px;
  height: 400px;
  background: rgba(139, 92, 246, 0.15);
  bottom: -100px;
  right: -100px;
}
.brand-decor--3 {
  width: 250px;
  height: 250px;
  background: rgba(255, 255, 255, 0.04);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.brand-content {
  position: relative;
  z-index: 1;
  max-width: 420px;
  color: #fff;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}
.brand-logo svg {
  width: 42px;
  height: 42px;
}
.brand-logo span {
  font-family: 'Sora', sans-serif;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.brand-content h1 {
  font-family: 'Sora', sans-serif;
  font-size: 36px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 16px;
}

.brand-content p {
  font-size: 16px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.82);
  margin: 0 0 40px;
}

.brand-stats {
  display: flex;
  gap: 32px;
}
.brand-stat {
  display: flex;
  flex-direction: column;
}
.brand-stat strong {
  font-family: 'Sora', sans-serif;
  font-size: 28px;
  font-weight: 800;
}
.brand-stat span {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

/* ─── Form Panel (Right) ────────────────────────────────────────────────── */
.auth-form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 48px;
  background: #fff;
}

.auth-form-container {
  width: 100%;
  max-width: 400px;
}

/* Mobile logo */
.auth-mobile-logo {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}
.auth-mobile-logo svg {
  width: 36px;
  height: 36px;
}
.auth-mobile-logo span {
  font-family: 'Sora', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #4f39f6;
}

/* ─── Tabs ──────────────────────────────────────────────────────────────── */
.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 28px;
}

.auth-tab {
  border: none;
  background: none;
  border-radius: 8px;
  padding: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 200ms ease;
}

.auth-tab--active {
  background: #fff;
  color: #1f2937;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* ─── Form ──────────────────────────────────────────────────────────────── */
.auth-form {
  display: grid;
  gap: 18px;
}

.auth-field {
  display: grid;
  gap: 6px;
}

.auth-field label {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.auth-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.auth-input-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  color: #94a3b8;
  pointer-events: none;
}

.auth-input-wrap input {
  width: 100%;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 11px 12px 11px 38px;
  font-family: inherit;
  font-size: 14px;
  color: #1f2937;
  background: #f8fafc;
  transition: all 160ms ease;
}

.auth-input-wrap input::placeholder {
  color: #94a3b8;
}

.auth-input-wrap input:focus {
  outline: none;
  border-color: #4f39f6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(79, 57, 246, 0.1);
}

.auth-input-wrap--error input {
  border-color: #ef4444;
}
.auth-input-wrap--error input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.auth-field-error {
  margin: 0;
  font-size: 12px;
  color: #ef4444;
  font-weight: 600;
}

.auth-eye-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  transition: color 150ms;
}
.auth-eye-btn:hover {
  color: #64748b;
}
.auth-eye-btn svg {
  width: 18px;
  height: 18px;
}

/* ─── Error / Success ──────────────────────────────────────────────────── */
.auth-error {
  margin: 0;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #b91c1c;
  font-size: 13px;
  font-weight: 600;
}

.auth-success {
  margin: 0;
  padding: 10px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #15803d;
  font-size: 13px;
  font-weight: 600;
}

/* ─── Submit Button ─────────────────────────────────────────────────────── */
.auth-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(145deg, #4f39f6 0%, #312e81 100%);
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: 0 2px 8px rgba(79, 57, 246, 0.35);
}

.auth-submit:hover:not(:disabled) {
  background: linear-gradient(145deg, #432dd7 0%, #312e81 100%);
  box-shadow: 0 4px 14px rgba(79, 57, 246, 0.45);
  transform: translateY(-1px);
}

.auth-submit:active:not(:disabled) {
  transform: translateY(0);
}

.auth-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-spinner {
  width: 20px;
  height: 20px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ─── Demo Accounts ─────────────────────────────────────────────────────── */
.auth-demo {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.auth-demo-label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.auth-demo-label span {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}
.auth-demo-label p {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.auth-demo-list {
  display: grid;
  gap: 8px;
}

.auth-demo-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  border: 1.5px solid #f1f5f9;
  border-radius: 10px;
  background: #fafbfc;
  padding: 10px 14px;
  cursor: pointer;
  transition: all 180ms ease;
  text-align: left;
  font-family: inherit;
}

.auth-demo-card:hover {
  border-color: #c7d2fe;
  background: #eef2ff;
}

.auth-demo-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: #fff;
  flex-shrink: 0;
}
.auth-demo-avatar--org {
  background: linear-gradient(145deg, #f59e0b, #d97706);
}
.auth-demo-avatar--stu {
  background: linear-gradient(145deg, #3b82f6, #2563eb);
}

.auth-demo-info {
  flex: 1;
  display: grid;
  gap: 1px;
}
.auth-demo-info strong {
  font-size: 13px;
  color: #1f2937;
}
.auth-demo-info span {
  font-size: 12px;
  color: #64748b;
}

.auth-demo-arrow {
  width: 16px;
  height: 16px;
  color: #cbd5e1;
  flex-shrink: 0;
  transition: color 150ms;
}
.auth-demo-card:hover .auth-demo-arrow {
  color: #4f39f6;
}

/* ─── Responsive ────────────────────────────────────────────────────────── */
@media (max-width: 960px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-brand {
    display: none;
  }

  .auth-mobile-logo {
    display: flex;
  }

  .auth-form-panel {
    padding: 32px 24px;
    min-height: 100vh;
  }
}

@media (max-width: 480px) {
  .auth-form-panel {
    padding: 24px 16px;
  }

  .brand-content h1 {
    font-size: 28px;
  }

  .brand-stats {
    gap: 20px;
  }

  .brand-stat strong {
    font-size: 22px;
  }
}
</style>
