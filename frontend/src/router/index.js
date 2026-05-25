import { createRouter, createWebHistory } from 'vue-router'

import EventManagementView from '../views/EventManagementView.vue'
import CalendarView from '../views/CalendarView.vue'
import NotificationsView from '../views/NotificationsView.vue'

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
