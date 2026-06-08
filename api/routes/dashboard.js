import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/dashboard/:userId ────────────────────────────────────────────
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (parseInt(userId) !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Get user info
    const [users] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const user = users[0];

    // Get booking stats
    const [bookingStats] = await pool.execute(
      'SELECT COUNT(*) as total, SUM(CASE WHEN booking_status = "confirmed" THEN 1 ELSE 0 END) as confirmed, SUM(CASE WHEN booking_status = "pending_payment" THEN 1 ELSE 0 END) as pending FROM bookings WHERE user_id = ?',
      [userId]
    );

    // Get upcoming events from bookings
    const [upcomingEvents] = await pool.execute(`
      SELECT e.event_id, e.title, e.event_date, e.start_time, e.venue, e.category, e.image_url
      FROM bookings b
      JOIN events e ON b.event_id = e.event_id
      WHERE b.user_id = ? AND b.booking_status IN ('confirmed', 'active') AND e.event_date >= CURDATE()
      ORDER BY e.event_date ASC
      LIMIT 5
    `, [userId]);

    // Get unread notifications count
    const [notifResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    // Get recent notifications
    const [recentNotifs] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );

    // Get calendar events count
    const [calResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM calendar_events WHERE user_id = ?',
      [userId]
    );

    // Get feedback count
    const [feedbackResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM feedback WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      dashboard: {
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          avatarColor: user.avatar_color,
          phone: user.phone || '',
          bio: user.bio || '',
          studentId: user.student_id || '',
          department: user.department || '',
          createdAt: user.created_at,
        },
        stats: {
          totalBookings: bookingStats[0].total || 0,
          confirmedBookings: bookingStats[0].confirmed || 0,
          pendingBookings: bookingStats[0].pending || 0,
          unreadNotifications: notifResult[0].count || 0,
          calendarEvents: calResult[0].count || 0,
          feedbackGiven: feedbackResult[0].count || 0,
        },
        upcomingEvents: upcomingEvents.map(e => ({
          id: e.event_id,
          title: e.title,
          date: e.event_date.toISOString().split('T')[0],
          time: e.start_time,
          venue: e.venue,
          category: e.category,
          image: e.image_url,
        })),
        recentNotifications: recentNotifs.map(n => ({
          id: n.notification_id,
          title: n.title,
          message: n.message,
          type: n.notification_type,
          read: Boolean(n.is_read),
          createdAt: n.created_at,
        })),
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
  }
});

export default router;
