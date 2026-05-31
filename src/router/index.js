import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated, isRoleAllowed, authState } from '../service/auth'

// ─── Core / Auth Views ────────────────────────────────────────────────────────
import LoginView from '../views/LoginView.vue'

// ─── Module A: Event Manager ──────────────────────────────────────────────────
import EventManagementView from '../views/EventManagementView.vue'
import EventDetailsView from '../views/EventDetailsView.vue'
import CalendarView from '../views/CalendarView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import FeedbackView from '../views/FeedbackView.vue'
import ForumView from '../views/ForumView.vue'
import ForumDetailView from '../views/ForumDetailView.vue'

// ─── Module B: Booking & Payment ──────────────────────────────────────────────
import BookingReviewView from '../views/BookingReviewView.vue'
import PaymentView from '../views/PaymentView.vue'
import BookingSuccessView from '../views/BookingSuccessView.vue'
import BookingHistoryView from '../views/BookingHistoryView.vue'

// ─── Module C: Dashboard & Gallery ───────────────────────────────────────────
// NOTE: Renamed from HomePage.vue → LandingView.vue (conflict with SPA root)
import LandingView from '../views/LandingView.vue'
// NOTE: Renamed from EventsPage.vue → GalleryView.vue (conflict with /events)
import GalleryView from '../views/GalleryView.vue'
// NOTE: Renamed from DashboardPage.vue → DashboardView.vue
import DashboardView from '../views/DashboardView.vue'
// NOTE: Renamed from CalendarPage.vue → GalleryCalendarView.vue (richer public calendar)
import GalleryCalendarView from '../views/GalleryCalendarView.vue'

// ─── Routes ───────────────────────────────────────────────────────────────────
const routes = [
  // ── Root: Public landing page (Module C) ──
  {
    path: '/',
    name: 'landing',
    component: LandingView,
  },

  // ── Auth ──
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },

  // ── Module C: Event Gallery (public, no auth required) ──
  {
    path: '/gallery',
    name: 'gallery',
    component: GalleryView,
  },
  {
    path: '/gallery/calendar',
    name: 'gallery-calendar',
    component: GalleryCalendarView,
  },

  // ── Module C: User Dashboard ──
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, roles: ['student', 'organizer'] },
  },

  // ── Module A: Event Management ──
  {
    path: '/manage-events',
    name: 'manage-events',
    component: EventManagementView,
    meta: { requiresAuth: true, roles: ['student', 'organizer'] },
  },
  {
    path: '/manage-events/:id',
    name: 'event-details',
    component: EventDetailsView,
    meta: { requiresAuth: true, roles: ['student', 'organizer'] },
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: CalendarView,
    meta: { requiresAuth: true, roles: ['student', 'organizer'] },
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: NotificationsView,
    meta: { requiresAuth: true, roles: ['student', 'organizer'] },
  },
  {
    path: '/forum',
    name: 'forum',
    component: ForumView,
    meta: { requiresAuth: true, roles: ['student', 'organizer'] },
  },
  {
    path: '/forum/:id',
    name: 'forum-detail',
    component: ForumDetailView,
    meta: { requiresAuth: true, roles: ['student', 'organizer'] },
  },
  {
    path: '/feedback',
    name: 'feedback',
    component: FeedbackView,
    meta: { requiresAuth: true, roles: ['student', 'organizer'] },
  },

  // ── Module B: Booking & Payment ──
  {
    path: '/booking/review',
    name: 'booking-review',
    component: BookingReviewView,
    meta: { requiresAuth: true, roles: ['student'] },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: PaymentView,
    meta: { requiresAuth: true, roles: ['student'] },
  },
  // Legacy alias so internal links using /booking/payment still work
  {
    path: '/booking/payment',
    redirect: '/checkout',
  },
  {
    path: '/booking/success',
    name: 'booking-success',
    component: BookingSuccessView,
    meta: { requiresAuth: true, roles: ['student'] },
  },
  {
    path: '/bookings',
    name: 'booking-history',
    component: BookingHistoryView,
    meta: { requiresAuth: true, roles: ['student'] },
  },


  // ── Legacy path redirects (backward compatibility) ──
  { path: '/events', redirect: '/manage-events' },
  { path: '/events/:id', redirect: to => `/manage-events/${to.params.id}` },

  // ── Catch-all 404 ──
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// ─── Navigation Guard ─────────────────────────────────────────────────────────
router.beforeEach((to) => {
  if (to.name === 'login') {
    if (isAuthenticated()) {
      // Redirect based on role: organizer → manage-events, student → gallery
      const role = authState.user?.role
      return { name: role === 'organizer' ? 'manage-events' : 'gallery' }
    }
    return true
  }

  if (to.meta?.requiresAuth && !isAuthenticated()) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta?.roles && !isRoleAllowed(to.meta.roles)) {
    return { name: 'gallery' }
  }

  return true
})

export default router
