import { createRouter, createWebHistory } from 'vue-router'
import EventGallery from '../views/EventGallery.vue'
import UserDashboard from '../views/UserDashboard.vue'

const routes = [
  { path: '/', redirect: '/gallery' },
  { path: '/gallery', name: 'EventGallery', component: EventGallery },
  { path: '/dashboard', name: 'UserDashboard', component: UserDashboard },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
