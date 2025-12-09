<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const user = localStorage.getItem('edi_user')
  
  // If logged in but on login/register → go to dashboard
  if (user && (router.currentRoute.value.path === '/login' || router.currentRoute.value.path === '/register')) {
    router.replace('/dashboard')
  }
  
  // If not logged in but on dashboard → go to login
  if (!user && router.currentRoute.value.path.startsWith('/dashboard')) {
    router.replace('/login')
  }
})
</script>

<style>
body {
  margin: 0;
  background: #0f172a;
}
</style>