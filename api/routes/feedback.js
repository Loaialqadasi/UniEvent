import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/feedback ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM feedback ORDER BY created_at DESC');
    const feedback = rows.map(f => ({
      feedbackId: f.feedback_id,
      userId: f.user_id,
      eventId: f.event_id,
      rating: f.rating,
      review: f.review,
      user: f.author,
      createdAt: f.created_at,
    }));
    res.json({ success: true, feedback });
  } catch (err) {
    console.error('Fetch feedback error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch feedback.' });
  }
});

// ─── GET /api/feedback/event/:eventId ──────────────────────────────────────
router.get('/event/:eventId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM feedback WHERE event_id = ? ORDER BY created_at DESC',
      [req.params.eventId]
    );
    const feedback = rows.map(f => ({
      feedbackId: f.feedback_id,
      userId: f.user_id,
      eventId: f.event_id,
      rating: f.rating,
      review: f.review,
      user: f.author,
      createdAt: f.created_at,
    }));
    res.json({ success: true, feedback });
  } catch (err) {
    console.error('Fetch event feedback error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch feedback.' });
  }
});

// ─── POST /api/feedback ────────────────────────────────────────────────────
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { eventId, rating, review } = req.body;

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Please select an event.' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }
    if (!review || review.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Review must be at least 10 characters.' });
    }

    // Verify event exists
    const [events] = await pool.execute('SELECT event_id FROM events WHERE event_id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO feedback (user_id, event_id, rating, review, author) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, eventId, rating, review.trim(), req.user.name]
    );

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully!',
      feedbackId: result.insertId,
      feedback: {
        feedbackId: result.insertId,
        userId: req.user.user_id,
        eventId,
        rating,
        review: review.trim(),
        user: req.user.name,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit feedback.' });
  }
});

// ─── DELETE /api/feedback/:id ──────────────────────────────────────────────
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const feedbackId = req.params.id;

    const [existing] = await pool.execute('SELECT * FROM feedback WHERE feedback_id = ?', [feedbackId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    if (existing[0].user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own feedback.' });
    }

    await pool.execute('DELETE FROM feedback WHERE feedback_id = ?', [feedbackId]);
    res.json({ success: true, message: 'Feedback deleted!' });
  } catch (err) {
    console.error('Delete feedback error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete feedback.' });
  }
});

export default router;
