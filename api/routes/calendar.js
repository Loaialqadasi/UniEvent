import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/calendar/user/:userId ────────────────────────────────────────
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (parseInt(userId) !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM calendar_events WHERE user_id = ? ORDER BY calendar_date ASC',
      [userId]
    );

    const events = rows.map(e => ({
      calendarId: e.calendar_id,
      userId: e.user_id,
      eventId: e.event_id,
      title: e.title,
      date: e.calendar_date.toISOString().split('T')[0],
      startTime: e.start_time,
      endTime: e.end_time,
      venue: e.venue,
    }));

    res.json({ success: true, events });
  } catch (err) {
    console.error('Fetch calendar error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch calendar events.' });
  }
});

// ─── POST /api/calendar ────────────────────────────────────────────────────
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { eventId, title, date, startTime, endTime, venue } = req.body;

    if (!eventId || !title || !date) {
      return res.status(400).json({ success: false, message: 'Event ID, title, and date are required.' });
    }

    // Check if already in calendar
    const [existing] = await pool.execute(
      'SELECT calendar_id FROM calendar_events WHERE user_id = ? AND event_id = ?',
      [req.user.user_id, eventId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Event already in calendar.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO calendar_events (user_id, event_id, title, calendar_date, start_time, end_time, venue) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.user_id, eventId, title, date, startTime || '', endTime || '', venue || '']
    );

    res.status(201).json({
      success: true,
      message: 'Event added to calendar!',
      calendarId: result.insertId,
    });
  } catch (err) {
    console.error('Add calendar event error:', err);
    res.status(500).json({ success: false, message: 'Failed to add calendar event.' });
  }
});

// ─── PUT /api/calendar/:id ─────────────────────────────────────────────────
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const calendarId = req.params.id;
    const { title, date, startTime, endTime, venue } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (date !== undefined) { updates.push('calendar_date = ?'); values.push(date); }
    if (startTime !== undefined) { updates.push('start_time = ?'); values.push(startTime); }
    if (endTime !== undefined) { updates.push('end_time = ?'); values.push(endTime); }
    if (venue !== undefined) { updates.push('venue = ?'); values.push(venue); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    values.push(calendarId);
    await pool.execute(`UPDATE calendar_events SET ${updates.join(', ')} WHERE calendar_id = ?`, values);

    res.json({ success: true, message: 'Calendar event updated!' });
  } catch (err) {
    console.error('Update calendar error:', err);
    res.status(500).json({ success: false, message: 'Failed to update calendar event.' });
  }
});

// ─── DELETE /api/calendar/:id ──────────────────────────────────────────────
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM calendar_events WHERE calendar_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Calendar event removed.' });
  } catch (err) {
    console.error('Delete calendar error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete calendar event.' });
  }
});

export default router;
