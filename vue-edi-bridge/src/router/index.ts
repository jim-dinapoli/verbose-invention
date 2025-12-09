import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import UploadTab from '../components/UploadTab.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/upload', component: UploadTab },
]

export default createRouter({
  history: createWebHistory(),
  routes
})