// Production server for Render deployment
// Serves both the Express API backend and Vue.js static frontend with SPA fallback

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './api/routes/auth.js';
import eventRoutes from './api/routes/events.js';
import bookingRoutes from './api/routes/bookings.js';
import paymentRoutes from './api/routes/payments.js';
import forumRoutes from './api/routes/forum.js';
import feedbackRoutes from './api/routes/feedback.js';
import notificationRoutes from './api/routes/notifications.js';
import calendarRoutes from './api/routes/calendar.js';
import dashboardRoutes from './api/routes/dashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'production' });
});

// ─── API 404 Handler ───────────────────────────────────────────────────────
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
});

// ─── Serve Static Frontend (Vue.js SPA) ────────────────────────────────────
const distPath = path.join(__dirname, 'dist');

// Serve static assets (JS, CSS, images, data, etc.)
app.use(express.static(distPath, {
  maxAge: '1d',          // Cache static assets for 1 day
  etag: true,
  lastModified: true,
}));

// SPA Fallback: For any non-API, non-file route, serve index.html
// This allows Vue Router to handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start Server ──────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  UniEvent Server running on http://0.0.0.0:${PORT}`);
  console.log(`  API Health: http://0.0.0.0:${PORT}/api/health`);
  console.log(`  Static files: ${distPath}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'production'}\n`);
});
