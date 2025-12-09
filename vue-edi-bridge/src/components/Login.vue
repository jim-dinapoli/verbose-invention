<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="header">
        <h1>Magic EDI Bridge Pro</h1>
        <p class="subtitle">Upload X12 files → Get perfect JSON instantly</p>
      </div>

      <!-- LOGIN FORM -->
      <div v-if="!showRegister">
        <h2>Log In</h2>
        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <input
              v-model="loginEmail"
              type="email"
              placeholder="you@company.com"
              required
              :disabled="loading"
              autocomplete="email"
            />
          </div>
          <div class="input-group">
            <input
              v-model="loginPassword"
              type="password"
              placeholder="Password"
              required
              :disabled="loading"
              autocomplete="current-password"
            />
          </div>

          <button type="submit" :disabled="loading" class="primary-btn">
            {{ loading ? 'Logging in...' : 'Log In' }}
          </button>
        </form>

        <p class="switch-text">
          No account? 
          <a href="#" @click.prevent="showRegister = true" class="link">
            Register here
          </a>
        </p>
      </div>

      <!-- REGISTER FORM -->
      <div v-else>
        <h2>Create Account</h2>
        <form @submit.prevent="handleRegister">
          <div class="input-group">
            <input
              v-model="regEmail"
              type="email"
              placeholder="you@company.com"
              required
              :disabled="loading"
            />
          </div>
          <div class="input-group">
            <input
              v-model="regPassword"
              type="password"
              placeholder="Choose a strong password"
              required
              minlength="6"
              :disabled="loading"
            />
          </div>

          <div class="button-row">
            <button type="submit" :disabled="loading" class="primary-btn">
              {{ loading ? 'Creating...' : 'Create Account' }}
            </button>
            <button 
              type="button" 
              @click="showRegister = false" 
              class="secondary-btn"
              :disabled="loading"
            >
              Cancel
            </button>
          </div>
        </form>

        <p class="switch-text">
          Already have an account? 
          <a href="#" @click.prevent="showRegister = false" class="link">
            Log in
          </a>
        </p>
      </div>

      <!-- Messages -->
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="success" class="success-message">{{ success }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth'

// === FIREBASE CONFIG & INIT ===
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// === Reactive State ===
const showRegister = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

// Login
const loginEmail = ref('')
const loginPassword = ref('')

// Register
const regEmail = ref('')
const regPassword = ref('')

// === Login Handler ===
const handleLogin = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
    success.value = 'Welcome back! Redirecting...'
    localStorage.setItem('edi_user', loginEmail.value)
    setTimeout(() => location.reload(), 1000)
  } catch (e: any) {
    error.value = e.code === 'auth/wrong-password' 
      ? 'Wrong password' 
      : e.code === 'auth/user-not-found'
      ? 'No account with this email'
      : 'Login failed — try again'
  } finally {
    loading.value = false
  }
}

// === Register Handler ===
const handleRegister = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  if (regPassword.value.length < 6) {
    error.value = 'Password must be 6+ characters'
    loading.value = false
    return
  }

  try {
    await createUserWithEmailAndPassword(auth, regEmail.value, regPassword.value)
    success.value = 'Account created! Welcome!'
    localStorage.setItem('edi_user', regEmail.value)
    setTimeout(() => location.reload(), 1500)
  } catch (e: any) {
    error.value = e.code === 'auth/email-already-in-use'
      ? 'Email already registered'
      : e.code === 'auth/weak-password'
      ? 'Password too weak'
      : 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
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
  max-width: 440px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  border: 1px solid rgba(100,100,255,0.3);
  text-align: center;
}

.header h1 {
  font-size: 2.4rem;
  background: linear-gradient(90deg, #00d4ff, #ff8c00);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #aaa;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

h2 {
  color: #e0e0ff;
  margin: 30px 0 20px 0;
  font-size: 1.8rem;
}

.input-group {
  margin: 15px 0;
}

input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(40, 40, 80, 0.8);
  border: 2px solid #4444aa;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #00d4ff;
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.2);
}

.primary-btn, .secondary-btn {
  width: 100%;
  padding: 14px;
  margin: 10px 0;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.primary-btn {
  background: linear-gradient(90deg, #0066ff, #00d4ff);
  color: white;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 102, 255, 0.3);
}

.secondary-btn {
  background: rgba(255,255,255,0.1);
  color: #e0e0ff;
  border: 1px solid #4444aa;
}

.switch-text {
  margin-top: 25px;
  color: #aaa;
}

.link {
  color: #00d4ff;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

.error-message {
  background: #440000;
  color: #ff6b6b;
  padding: 12px;
  border-radius: 8px;
  margin-top: 15px;
}

.success-message {
  background: #003300;
  color: #00ffaa;
  padding: 12px;
  border-radius: 8px;
  margin-top: 15px;
}
</style>