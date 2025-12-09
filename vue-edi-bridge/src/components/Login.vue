<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="header">
        <h1>Magic EDI Bridge Pro</h1>
        <p>Upload X12 files → Get perfect JSON instantly</p>
      </div>

      <!-- LOGIN -->
      <div v-if="!showRegister">
        <h2>Log In</h2>
        <form @submit.prevent="handleLogin">
          <input v-model="email" type="email" placeholder="you@company.com" required />
          <input v-model="password" type="password" placeholder="Password" required />
          <button type="submit" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Log In' }}
          </button>
        </form>
        <p class="switch">
          No account? 
          <router-link to="/register" class="link">Register here</router-link>
        </p>
      </div>

      <!-- REGISTER -->
      <div v-else>
        <h2>Create Account</h2>
        <form @submit.prevent="handleRegister">
          <input v-model="email" type="email" placeholder="you@company.com" required />
          <input v-model="password" type="password" placeholder="Choose password" required minlength="6" />
          <button type="submit" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Account' }}
          </button>
        </form>
        <p class="switch">
          Have an account? 
          <router-link to="/login" class="link">Log in</router-link>
        </p>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const showRegister = ref(route.path === '/register')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  // Mock login
  await new Promise(resolve => setTimeout(resolve, 800))

  if (email.value && password.value.length >= 6) {
    localStorage.setItem('edi_user', email.value)
    success.value = 'Welcome back!'
    
    // INSTANT SPA navigation — no reload!
    router.push('/dashboard')
  } else {
    error.value = 'Invalid email or password'
  }
  loading.value = false
}

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  if (password.value.length < 6) {
    error.value = 'Password must be 6+ characters'
    loading.value = false
    return
  }

  await new Promise(resolve => setTimeout(resolve, 800))
  localStorage.setItem('edi_user', email.value)
  success.value = 'Account created!'

  // INSTANT SPA navigation
  router.push('/dashboard')
}
</script>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23, #1a1a3a);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  background: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  border: 1px solid rgba(100,100,255,0.3);
  text-align: center;
}

.header h1 {
  font-size: 2.4rem;
  background: linear-gradient(90deg, #00d4ff, #ff8c00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px 0;
}

.header p {
  color: #aaa;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

h2 {
  color: #e0e0ff;
  margin: 30px 0 20px 0;
  font-size: 1.8rem;
}

input {
  width: 100%;
  padding: 14px 16px;
  margin: 10px 0;
  background: rgba(40, 40, 80, 0.8);
  border: 2px solid #4444aa;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 14px;
  margin: 15px 0;
  background: linear-gradient(90deg, #0066ff, #00d4ff);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  cursor: pointer;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 102, 255, 0.3);
}

.switch {
  margin-top: 25px;
  color: #aaa;
}

.link {
  color: #00d4ff;
  font-weight: 600;
}

.error {
  background: #440000;
  color: #ff6b6b;
  padding: 12px;
  border-radius: 8px;
  margin-top: 15px;
}

.success {
  background: #003300;
  color: #00ffaa;
  padding: 12px;
  border-radius: 8px;
  margin-top: 15px;
}
</style>