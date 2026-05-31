# UniEvents — Merged Full-Stack SPA

> FreshDev Group Project · Vue.js 3 + Tailwind CSS 4 + Vite

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Demo Accounts

| Role       | Email                        | Password      |
|------------|------------------------------|---------------|
| Organizer  | organizer@unievents.test     | organizer123  |
| Student    | student@unievents.test       | student123    |

---

## Module Routes

| Module                | Route(s)                                           | Auth Required |
|-----------------------|----------------------------------------------------|---------------|
| **Landing Page** (C)  | `/`                                                | No            |
| **Event Gallery** (C) | `/gallery`, `/gallery/calendar`                    | No            |
| **User Dashboard** (C)| `/dashboard`                                       | No            |
| **Event Manager** (A) | `/manage-events`, `/manage-events/:id`             | Yes           |
| **Calendar** (A)      | `/calendar`                                        | Yes           |
| **Notifications** (A) | `/notifications`                                   | Yes           |
| **Forum** (A)         | `/forum`, `/forum/:id`                             | Yes           |
| **Feedback** (A)      | `/feedback`                                        | Yes           |
| **Booking Flow** (B)  | `/booking/review`, `/checkout`, `/booking/success` | Yes (Student) |
| **Booking History**(B)| `/bookings`                                        | Yes (Student) |
| **Login**             | `/login`                                           | No            |

---

## Project Structure

```
frontend/
├── public/
│   ├── data/
│   │   └── mockData.json          ← Unified event/user mock data
│   └── images/                    ← Event images from Module C
├── src/
│   ├── App.vue                    ← Root shell (handles both layouts)
│   ├── main.js                    ← Entry point with Pinia + Router
│   ├── style.css                  ← Merged CSS (A+B globals + C Tailwind tokens)
│   ├── router/
│   │   └── index.js               ← Unified router (all 4 modules)
│   ├── views/
│   │   ├── LandingView.vue        ← Module C: Public home (was HomePage.vue)
│   │   ├── GalleryView.vue        ← Module C: Event gallery (was EventsPage.vue)
│   │   ├── GalleryCalendarView.vue← Module C: Public calendar (was CalendarPage.vue)
│   │   ├── DashboardView.vue      ← Module C: User dashboard (was DashboardPage.vue)
│   │   ├── EventManagementView.vue← Module A: Manage/browse events
│   │   ├── EventDetailsView.vue   ← Module A: Single event detail
│   │   ├── CalendarView.vue       ← Module A: Auth calendar
│   │   ├── NotificationsView.vue  ← Module A: Notifications
│   │   ├── ForumView.vue          ← Module A: Forum list
│   │   ├── ForumDetailView.vue    ← Module A: Forum thread
│   │   ├── FeedbackView.vue       ← Module A: Event feedback/ratings
│   │   ├── LoginView.vue          ← Auth login
│   │   ├── BookingReviewView.vue  ← Module B: Booking review step
│   │   ├── PaymentView.vue        ← Module B: Checkout (/checkout)
│   │   ├── BookingSuccessView.vue ← Module B: Success confirmation
│   │   └── BookingHistoryView.vue ← Module B: Booking history
│   ├── components/
│   │   ├── AppHeader.vue          ← Auth navbar (Modules A & B)
│   │   ├── EventCard.vue          ← Event card component
│   │   ├── EventDetailModal.vue   ← Event detail modal
│   │   ├── EventForm.vue          ← Create/edit event form
│   │   ├── booking/               ← Module B booking flow sub-components
│   │   ├── dashboard/             ← Module C: Navbar + SignInDialog
│   │   ├── gallery/               ← Module C: Hero, FeaturedEvents, etc.
│   │   └── shared/                ← Footer, CookieBanner (shared across layouts)
│   ├── service/
│   │   ├── api.js                 ← Mock API (events, forum, feedback, bookings)
│   │   └── auth.js                ← Auth state + login/logout helpers
│   ├── services/
│   │   ├── bookingService.js      ← Module B booking logic
│   │   └── paymentSimulator.js    ← Module B payment simulation
│   ├── stores/
│   │   └── bookingStore.js        ← Pinia booking store
│   └── composables/
│       ├── useBooking.js          ← Booking composable
│       └── useAuth.ts             ← Module C auth composable (sign up/in/out)
```

---

## Conflict Resolution Log

See `CONFLICT_REPORT.md` for full details.
