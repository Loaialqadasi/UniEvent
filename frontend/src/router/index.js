import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import EventManagementView from '../views/EventManagementView.vue'
import CalendarView from '../views/CalendarView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import EventDetailsView from '../views/EventDetailsView.vue'
import BookingReviewView from '../views/BookingReviewView.vue'
import PaymentView from '../views/PaymentView.vue'
import BookingSuccessView from '../views/BookingSuccessView.vue'
import { isAuthenticated, isRoleAllowed } from '../service/auth'

const routes = [
	{
		path: '/',
		redirect: '/login',
	},
	{
		path: '/login',
		name: 'login',
		component: LoginView,
	},
	{
		path: '/events',
		name: 'events',
		component: EventManagementView,
		meta: { requiresAuth: true, roles: ['student', 'organizer'] },
	},
	{
		path: '/events/:id',
		name: 'event-details',
		component: EventDetailsView,
		meta: { requiresAuth: true, roles: ['student'] },
	},
	{
		path: '/booking/review',
		name: 'booking-review',
		component: BookingReviewView,
		meta: { requiresAuth: true, roles: ['student'] },
	},
	{
		path: '/booking/payment',
		name: 'booking-payment',
		component: PaymentView,
		meta: { requiresAuth: true, roles: ['student'] },
	},
	{
		path: '/booking/success',
		name: 'booking-success',
		component: BookingSuccessView,
		meta: { requiresAuth: true, roles: ['student'] },
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
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

router.beforeEach((to) => {
	if (to.name === 'login') {
		if (isAuthenticated()) {
			return { name: 'events' }
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
		return { name: 'events' }
	}

	return true
})

export default router
