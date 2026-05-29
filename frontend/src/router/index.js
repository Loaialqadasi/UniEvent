import { createRouter, createWebHistory } from 'vue-router'

import EventManagementView from '../views/EventManagementView.vue'
import CalendarView from '../views/CalendarView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import EventDetailsView from '../views/EventDetailsView.vue'
import BookingReviewView from '../views/BookingReviewView.vue'
import PaymentView from '../views/PaymentView.vue'
import BookingSuccessView from '../views/BookingSuccessView.vue'
import BookingHistoryView from '../views/BookingHistoryView.vue'

const routes = [
	{
		path: '/',
		redirect: '/events',
	},
	{
		path: '/events',
		name: 'events',
		component: EventManagementView,
	},
	{
		path: '/events/:id',
		name: 'event-details',
		component: EventDetailsView,
	},
	{
		path: '/booking/review',
		name: 'booking-review',
		component: BookingReviewView,
	},
	{
		path: '/booking/payment',
		name: 'booking-payment',
		component: PaymentView,
	},
	{
		path: '/booking/success',
		name: 'booking-success',
		component: BookingSuccessView,
	},
	{
		path: '/bookings',
		name: 'booking-history',
		component: BookingHistoryView,
	},
	{
		path: '/calendar',
		name: 'calendar',
		component: CalendarView,
	},
	{
		path: '/notifications',
		name: 'notifications',
		component: NotificationsView,
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
