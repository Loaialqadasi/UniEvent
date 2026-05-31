<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getDemoAccounts, loginWithPassword } from '../service/auth'

const route = useRoute()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const busy = ref(false)
const error = ref('')
const demoAccounts = getDemoAccounts()

const fillDemo = (account) => {
  form.email = account.email
  form.password = account.password
}

const onSubmit = async () => {
  error.value = ''

  // Client-side validation
  if (!form.email.trim()) {
    error.value = 'Please enter your email address.'
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email.trim())) {
    error.value = 'Please enter a valid email address.'
    return
  }
  if (!form.password) {
    error.value = 'Please enter your password.'
    return
  }
  if (form.password.length < 4) {
    error.value = 'Password must be at least 4 characters.'
    return
  }

  busy.value = true

  try {
    const user = loginWithPassword(form.email, form.password)
    const defaultRedirect = user.role === 'organizer' ? '/manage-events' : '/gallery'
    const redirectTo = typeof route.query.redirect === 'string' ? route.query.redirect : defaultRedirect
    await router.replace(redirectTo)
  } catch (err) {
    error.value = err.message ?? 'Login failed. Please try again.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="login-page">
    <div class="login-card panel">
      <div class="login-head">
        <h1>Sign In</h1>
        <p>Choose a demo account to explore the student or organizer interface.</p>
      </div>

      <form class="login-form" @submit.prevent="onSubmit">
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" class="input" placeholder="name@unievents.test" required />
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input id="password" v-model="form.password" type="password" class="input" placeholder="Enter password" required />
        </div>

        <p v-if="error" class="status status--warn">{{ error }}</p>

        <button class="button button--primary login-submit" type="submit" :disabled="busy">
          {{ busy ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="demo-box">
        <h2>Demo Accounts</h2>
        <div class="demo-list">
          <button
            v-for="account in demoAccounts"
            :key="account.email"
            class="demo-item"
            type="button"
            @click="fillDemo(account)"
          >
            <strong>{{ account.role === 'organizer' ? 'Organizer' : 'Student' }}</strong>
            <span>{{ account.email }}</span>
            <small>Password: {{ account.password }}</small>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-page {
  min-height: calc(100svh - 140px);
  display: grid;
  place-items: center;
}

.login-card {
  width: min(100%, 520px);
  padding: 26px;
}

.login-head h1 {
  margin: 0;
}

.login-head p {
  margin: 8px 0 0;
  color: #64748b;
}

.login-form {
  margin-top: 20px;
  display: grid;
  gap: 14px;
}

.login-submit {
  width: 100%;
  justify-content: center;
}

.demo-box {
  margin-top: 22px;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.demo-box h2 {
  margin: 0;
  font-size: 0.95rem;
}

.demo-list {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.demo-item {
  border: 1px solid #d6deea;
  border-radius: 10px;
  background: #f8fafc;
  padding: 10px 12px;
  text-align: left;
  display: grid;
  gap: 2px;
  cursor: pointer;
}

.demo-item:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.demo-item span {
  font-size: 0.84rem;
  color: #334155;
}

.demo-item small {
  font-size: 0.75rem;
  color: #64748b;
}
</style>
