import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// ─── POST /api/payments ────────────────────────────────────────────────────
router.post('/', authenticateToken, requireRole('student'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { bookingId, paymentMethod } = req.body;
    const userId = req.user.user_id;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required.' });
    }

    // Verify booking belongs to user
    const [bookings] = await connection.execute('SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?', [bookingId, userId]);
    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];
    if (booking.booking_status !== 'pending_payment') {
      return res.status(400).json({ success: false, message: 'Booking is not pending payment.' });
    }

    // Simulate payment (90% success rate for demo)
    const paymentSuccess = Math.random() > 0.1;
    const paymentStatus = paymentSuccess ? 'successful' : 'failed';

    // Create payment record
    const [result] = await connection.execute(
      'INSERT INTO payments (booking_id, user_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?, ?)',
      [bookingId, userId, booking.amount, paymentMethod || 'card', paymentStatus]
    );

    if (paymentSuccess) {
      // Update booking status to confirmed
      await connection.execute('UPDATE bookings SET booking_status = ? WHERE booking_id = ?', ['confirmed', bookingId]);

      // Get event details
      const [events] = await connection.execute('SELECT * FROM events WHERE event_id = ?', [booking.event_id]);
      const event = events[0];

      // Create notification
      await connection.execute(
        'INSERT INTO notifications (user_id, title, message, notification_type) VALUES (?, ?, ?, ?)',
        [userId, 'Payment Successful', `Payment for "${event.title}" was successful. Your booking is confirmed!`, 'success']
      );

      // Add to calendar
      await connection.execute(
        'INSERT INTO calendar_events (user_id, event_id, title, calendar_date, start_time, end_time, venue) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, booking.event_id, event.title, event.event_date, event.start_time, event.end_time || '', event.venue]
      );
    } else {
      // Update booking status to payment_failed
      await connection.execute('UPDATE bookings SET booking_status = ? WHERE booking_id = ?', ['payment_failed', bookingId]);

      // Create notification
      await connection.execute(
        'INSERT INTO notifications (user_id, title, message, notification_type) VALUES (?, ?, ?, ?)',
        [userId, 'Payment Failed', 'Your payment could not be processed. Please try again.', 'warning']
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      paymentId: result.insertId,
      paymentStatus,
      message: paymentSuccess ? 'Payment successful! Booking confirmed.' : 'Payment failed. Please try again.',
    });
  } catch (err) {
    await connection.rollback();
    console.error('Payment error:', err);
    res.status(500).json({ success: false, message: 'Payment processing failed.' });
  } finally {
    connection.release();
  }
});

// ─── GET /api/payments/user/:userId ────────────────────────────────────────
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (parseInt(userId) !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [rows] = await pool.execute(
      'SELECT p.*, e.title as event_title FROM payments p JOIN bookings b ON p.booking_id = b.booking_id JOIN events e ON b.event_id = e.event_id WHERE p.user_id = ? ORDER BY p.payment_date DESC',
      [userId]
    );

    const payments = rows.map(p => ({
      paymentId: p.payment_id,
      bookingId: p.booking_id,
      userId: p.user_id,
      amount: parseFloat(p.amount),
      paymentMethod: p.payment_method,
      paymentStatus: p.payment_status,
      paymentDate: p.payment_date,
      eventTitle: p.event_title,
    }));

    res.json({ success: true, payments });
  } catch (err) {
    console.error('Fetch payments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
});

export default router;
