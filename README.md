# UniEvents - University Event Management & Ticketing System

**FreshDev Team 9 | SECJ3483 Web Technology | Phase 3 Demo**

## 🎯 Overview

UniEvents is a full-stack Single Page Application (SPA) for managing university campus events, ticket bookings, forum discussions, and community feedback. Built with Vue.js frontend and Node.js Express REST API backend with JWT authentication and MySQL database.

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Vue.js 3 + Vue Router | SPA with routing, components, forms, and validation |
| Styling | Tailwind CSS 4 | Responsive design with utility-first CSS |
| HTTP Client | Axios | Asynchronous API communication (AJAX) |
| State Management | Pinia | Centralized state for booking/payment flow |
| Backend | Node.js + Express | RESTful API with JSON request/response handling |
| Database | MySQL (TiDB Cloud) | Persistent data storage with PDO-equivalent prepared statements |
| Authentication | JWT (JSON Web Tokens) | Token-based authentication and protected routes |
| Password Security | bcryptjs | Secure password hashing |
| Deployment | Vercel | Full-stack deployment with serverless API |

## 📁 Project Structure

```
unievent/
├── api/                          # Backend API (Vercel Serverless)
│   ├── index.js                  # Express app + serverless-http handler
│   ├── local-server.js           # Local development server
│   ├── config/
│   │   └── database.js           # MySQL connection pool (TiDB Cloud)
│   ├── middleware/
│   │   └── auth.js               # JWT generation & verification middleware
│   └── routes/
│       ├── auth.js               # Authentication routes (register, login, profile)
│       ├── events.js             # Event CRUD routes
│       ├── bookings.js           # Booking CRUD routes
│       ├── payments.js           # Payment simulation routes
│       ├── forum.js              # Forum posts & comments routes
│       ├── feedback.js           # Feedback/ratings routes
│       ├── notifications.js      # Notification routes
│       ├── calendar.js           # Calendar events routes
│       └── dashboard.js          # Dashboard aggregation route
├── src/                          # Vue.js Frontend
│   ├── main.js                   # App entry point
│   ├── App.vue                   # Root component
│   ├── router/index.js           # Vue Router configuration
│   ├── service/
│   │   ├── api.js                # API client with Axios (REST API calls)
│   │   └── auth.js               # JWT-based authentication service
│   ├── stores/                   # Pinia stores
│   ├── composables/              # Vue composables
│   ├── components/               # Reusable components
│   └── views/                    # Page-level views
├── public/                       # Static assets
├── vercel.json                   # Vercel deployment configuration
├── package.json                  # Dependencies
├── vite.config.js                # Vite build config
├── .env                          # Environment variables
└── README.md                     # This file
```

## 🔌 REST API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive JWT token | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |

### Events
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/events` | Get all events (with filters) | No |
| GET | `/api/events/:id` | Get single event | No |
| POST | `/api/events` | Create event | Organizer/Admin |
| PUT | `/api/events/:id` | Update event | Organizer/Admin |
| DELETE | `/api/events/:id` | Delete event | Organizer/Admin |

### Bookings
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/bookings/user/:userId` | Get user bookings | Yes |
| POST | `/api/bookings` | Create booking | Student |
| PUT | `/api/bookings/:id` | Update booking | Yes |
| DELETE | `/api/bookings/:id` | Cancel booking | Yes |

### Payments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments` | Simulate payment | Student |
| GET | `/api/payments/user/:userId` | Get payment history | Yes |

### Forum
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/forum/posts` | Get forum posts | No |
| POST | `/api/forum/posts` | Create post | Yes |
| DELETE | `/api/forum/posts/:id` | Delete post | Author/Admin |
| GET | `/api/forum/posts/:id/comments` | Get comments | No |
| POST | `/api/forum/comments` | Add comment | Yes |
| DELETE | `/api/forum/comments/:id` | Delete comment | Author/Admin |

### Feedback
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/feedback` | Get all feedback | No |
| GET | `/api/feedback/event/:eventId` | Get event feedback | No |
| POST | `/api/feedback` | Submit feedback | Yes |
| DELETE | `/api/feedback/:id` | Delete feedback | Author/Admin |

### Notifications
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications/user/:userId` | Get notifications | Yes |
| POST | `/api/notifications` | Create notification | Yes |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes |
| PUT | `/api/notifications/read-all/:userId` | Mark all read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |

### Calendar
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/calendar/user/:userId` | Get calendar events | Yes |
| POST | `/api/calendar` | Add calendar event | Yes |
| PUT | `/api/calendar/:id` | Update calendar event | Yes |
| DELETE | `/api/calendar/:id` | Remove calendar event | Yes |

### Dashboard
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard/:userId` | Get dashboard summary | Yes |

## 🔐 Security Features

1. **JWT Token Authentication**: Bearer tokens with 24-hour expiry
2. **Role-Based Access Control (RBAC)**: Student, Organizer, Admin roles
3. **Password Hashing**: bcrypt with salt rounds of 10
4. **SQL Injection Protection**: Parameterized queries (prepared statements)
5. **Input Validation**: Server-side validation on all endpoints
6. **CORS Protection**: Configured for allowed origins
7. **HTTP Status Codes**: Proper 200, 201, 400, 401, 403, 404, 409, 500 responses

## 🗄️ Database Schema

9 related tables with foreign key constraints:
- **users** → events, bookings, forum_posts, comments, feedback, notifications, calendar_events
- **events** → bookings, forum_posts, feedback, notifications, calendar_events
- **bookings** → payments
- **forum_posts** → comments

## 🚀 Deployment on Vercel

### Step 1: Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```
DB_HOST=gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com
DB_PORT=4000
DB_USER=3rR9wiedWBDKNT2.root
DB_PASSWORD=SZEe9q3pxIRGm6j1
DB_NAME=unievent_db
JWT_SECRET=unievent_secret_key_2026_freshdev
```

### Step 2: Deploy
1. Upload the zip file to Vercel
2. Or connect your GitHub repository
3. Vercel will auto-detect the build configuration

### Step 3: Verify
- Visit your deployed URL
- Test login with demo accounts

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start API server (port 3001)
node api/local-server.js

# Start frontend dev server (port 5173 with API proxy)
npm run dev
```

## 🧪 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Organizer | organizer@unievents.test | organizer123 |
| Student | student@unievents.test | student123 |
| Student | loai@unievents.test | loai123 |
| Admin | admin@unievents.test | admin123 |

## 🧪 Testing Guide

1. **Login**: Use demo accounts to sign in
2. **Browse Events**: Visit Gallery page to see events from database
3. **Book Tickets**: As a student, book tickets for events
4. **Simulate Payment**: Complete the payment flow
5. **Manage Events**: As organizer, create/edit/delete events
6. **Forum Discussion**: Create posts and comments
7. **Submit Feedback**: Rate and review events
8. **Calendar Sync**: View booked events in calendar
9. **Notifications**: Receive booking/payment confirmations
10. **JWT Verification**: Try accessing protected routes without token

## 👥 Team - FreshDev (Section 02)

| No | Name | Matrics | Role |
|----|------|---------|------|
| 1 | Siti Nur Fathiyyah binti Marzukee | A23CS0269 | Team Lead |
| 2 | Muhammad Amir Zafri Bin Mohd Adhar | A23CS0120 | Backend Lead |
| 3 | Fatema Junaed | A23CS0016 | Frontend Lead |
| 4 | Loai Rafaat Hameed AlQadasi | A23EC9010 | UI/UX & Testing |
