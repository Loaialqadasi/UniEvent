import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/notifications/user/:userId ───────────────────────────────────
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (parseInt(userId) !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const notifications = rows.map(n => ({
      id: n.notification_id,
      title: n.title,
      message: n.message,
      type: n.notification_type,
      read: Boolean(n.is_read),
      createdAt: n.created_at,
    }));

    const unreadCount = rows.filter(n => !n.is_read).length;

    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

// ─── POST /api/notifications ───────────────────────────────────────────────
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ success: false, message: 'User ID, title, and message are required.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO notifications (user_id, title, message, notification_type) VALUES (?, ?, ?, ?)',
      [userId, title, message, type || 'info']
    );

    res.status(201).json({
      success: true,
      message: 'Notification created!',
      notificationId: result.insertId,
    });
  } catch (err) {
    console.error('Create notification error:', err);
    res.status(500).json({ success: false, message: 'Failed to create notification.' });
  }
});

// ─── PUT /api/notifications/:id/read ───────────────────────────────────────
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE notification_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
});

// ─── PUT /api/notifications/read-all/:userId ───────────────────────────────
router.put('/read-all/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
});

// ─── DELETE /api/notifications/:id ─────────────────────────────────────────
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM notifications WHERE notification_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete notification.' });
  }
});

export default router;
