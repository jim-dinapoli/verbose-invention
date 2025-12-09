<template>
  <div class="app-container">
    <!-- Show login screen if not logged in -->
    <Login v-if="!isLoggedIn" @login-success="onLoginSuccess" />

    <!-- Main app when logged in -->
    <div v-else class="main-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="logo">
          <h2>Magic EDI Bridge Pro</h2>
        </div>

        <nav class="nav">
          <button 
            @click="activeTab = 'upload'" 
            :class="{ active: activeTab === 'upload' }"
          >
            Upload & Convert
          </button>
          <button 
            @click="activeTab = 'mappings'" 
            :class="{ active: activeTab === 'mappings' }"
          >
            Saved Mappings
          </button>
          <button 
            @click="activeTab = 'billing'" 
            :class="{ active: activeTab === 'billing' }"
          >
            Billing
          </button>
          <button 
            @click="activeTab = 'activity'" 
            :class="{ active: activeTab === 'activity' }"
          >
            Activity
          </button>
        </nav>

        <div class="user-info">
          <p>Logged in as<br><strong>{{ userEmail }}</strong></p>
          <button @click="logout" class="logout-btn">Log Out</button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="top-bar">
          <h1>
            {{ tabTitles[activeTab] }}
          </h1>
        </header>

        <div class="content">
          <UploadTab v-if="activeTab === 'upload'" />
          <MappingsTab v-if="activeTab === 'mappings'" />
          <BillingTab v-if="activeTab === 'billing'" />
          <ActivityTab v-if="activeTab === 'activity'" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Login from './components/Login.vue'
import UploadTab from './components/UploadTab.vue'
import MappingsTab from './components/MappingsTab.vue'
import BillingTab from './components/BillingTab.vue'
import ActivityTab from './components/ActivityTab.vue'

const isLoggedIn = ref(false)
const userEmail = ref('')
const activeTab = ref<'upload' | 'mappings' | 'billing' | 'activity'>('upload')

const tabTitles = {
  upload: 'Upload & Convert',
  mappings: 'Saved Mappings',
  billing: 'Billing',
  activity: 'Activity Log'
} as const

const onLoginSuccess = (email: string) => {
  isLoggedIn.value = true
  userEmail.value = email
  localStorage.setItem('edi_user', email)
}

const logout = () => {
  localStorage.removeItem('edi_user')
  isLoggedIn.value = false
  userEmail.value = ''
  activeTab.value = 'upload'
  // Force full reload to clear all state
  window.location.href = '/'
}

onMounted(() => {
  const saved = localStorage.getItem('edi_user')
  if (saved) {
    isLoggedIn.value = true
    userEmail.value = saved
  }
})
</script>

<style scoped>
/* Your beautiful dark theme stays exactly the same */
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23, #1a1a3a);
  color: #e0e0ff;
}

.main-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  background: rgba(15, 15, 35, 0.95);
  padding: 2rem 1rem;
  border-right: 1px solid #333366;
  display: flex;
  flex-direction: column;
}

.logo h2 {
  color: #00d4ff;
  text-align: center;
  margin-bottom: 3rem;
  font-size: 1.8rem;
}

.nav button {
  width: 100%;
  padding: 14px 20px;
  margin: 8px 0;
  background: rgba(255,255,255,0.05);
  border: 1px solid #4444aa;
  color: #e0e0ff;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.nav button:hover, .nav button.active {
  background: #0066ff;
  transform: translateX(8px);
}

.user-info {
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid #444;
  text-align: center;
}

.logout-btn {
  margin-top: 1rem;
  width: 100%;
  padding: 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.main-content {
  flex: 1;
  padding: 2rem;
}

.top-bar h1 {
  font-size: 2.5rem;
  text-align: center;
  background: linear-gradient(90deg, #00d4ff, #ff8c00);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
}

.content {
  max-width: 1100px;
  margin: 0 auto;
}
</style>