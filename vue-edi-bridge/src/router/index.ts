import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import DashboardLayout from '../components/DashboardLayout.vue'
import UploadTab from '../components/UploadTab.vue'

const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Login },
  
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      { path: '', component: UploadTab },  // /dashboard → UploadTab
      { path: 'mappings', component: () => import('../components/MappingsTab.vue') },
      { path: 'billing', component: () => import('../components/BillingTab.vue') },
      { path: 'activity', component: () => import('../components/ActivityTab.vue') }
    ]
  },
  
  { path: '/', redirect: '/login' },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const isLoggedIn = !!localStorage.getItem('edi_user')
  
  if (to.path.startsWith('/dashboard') && !isLoggedIn) next('/login')
  else if (isLoggedIn && (to.path === '/login' || to.path === '/register')) next('/dashboard')
  else next()
})

export default router