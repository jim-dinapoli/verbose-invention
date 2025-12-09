<template>
  <div class="dashboard">
    <aside class="sidebar">
      <h2>Magic EDI Bridge</h2>
      <nav>
        <router-link to="/dashboard" :class="{ active: $route.path === '/dashboard' }">Upload & Convert</router-link>
        <router-link to="/dashboard/mappings">Saved Mappings</router-link>
        <router-link to="/dashboard/billing">Billing</router-link>
        <router-link to="/dashboard/activity">Activity</router-link>
      </nav>
      <div class="user">
        <p><strong>{{ userEmail }}</strong></p>
        <button @click="logout">Log Out</button>
      </div>
    </aside>

    <main>
      <h1>Dashboard → {{ currentTitle }}</h1>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const userEmail = localStorage.getItem('edi_user') || ''

const currentTitle = computed(() => {
  const map: Record<string, string> = {
    '/dashboard': 'Upload & Convert',
    '/dashboard/mappings': 'Saved Mappings',
    '/dashboard/billing': 'Billing',
    '/dashboard/activity': 'Activity'
  }
  return map[route.path] || 'Dashboard'
})

const logout = () => {
  localStorage.removeItem('edi_user')
  router.push('/login')
}
</script>

<style scoped>
.dashboard { display: flex; min-height: 100vh; background: #0f172a; color: #e0e0ff; }
.sidebar { width: 280px; background: #1e293b; padding: 2rem; }
.sidebar h2 { color: #60a5fa; text-align: center; margin-bottom: 3rem; }
.sidebar a { display: block; padding: 14px; margin: 8px;  margin: 8px 0; background: #334155; border-radius: 8px; color: white; text-decoration: none; }
.sidebar a:hover, .sidebar a.active { background: #3b82f6; }
.user { margin-top: auto; padding-top: 2rem; border-top: 1px solid #475569; text-align: center; }
.user button { background: #ef4444; margin-top: 1rem; width: 100%; padding: 12px; border: none; border-radius: 8px; color: white; cursor: pointer; }
main { flex: 1; padding: 3rem; }
h1 { font-size: 2.5rem; text-align: center; margin-bottom: 2rem; background: linear-gradient(90deg,#60a5fa,#f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
</style>