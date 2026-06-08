import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/bookings/user/:userId ────────────────────────────────────────
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Users can only see their own bookings unless admin
    if (parseInt(userId) !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [rows] = await pool.execute(`
      SELECT b.*, e.title, e.event_date, e.start_time, e.end_time, e.venue, e.image_url, e.price, e.category
      FROM bookings b
      JOIN events e ON b.event_id = e.event_id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC
    `, [userId]);

    const bookings = rows.map(b => ({
      bookingId: b.booking_id,
      userId: b.user_id,
      eventId: b.event_id,
      ticketQuantity: b.ticket_quantity,
      bookingStatus: b.booking_status,
      bookingDate: b.booking_date,
      amount: parseFloat(b.amount),
      event: {
        id: b.event_id,
        title: b.title,
        date: b.event_date.toISOString().split('T')[0],
        time: b.start_time + (b.end_time ? ' - ' + b.end_time : ''),
        venue: b.venue,
        image: b.image_url,
        price: b.price,
        category: b.category,
      },
    }));

    res.json({ success: true, bookings });
  } catch (err) {
    console.error('Fetch bookings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
});

// ─── POST /api/bookings ────────────────────────────────────────────────────
router.post('/', authenticateToken, requireRole('student'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { eventId, ticketQuantity } = req.body;
    const userId = req.user.user_id;

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required.' });
    }

    const quantity = ticketQuantity || 1;
    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({ success: false, message: 'Ticket quantity must be between 1 and 10.' });
    }

    // Check event exists and has available seats
    const [events] = await connection.execute('SELECT * FROM events WHERE event_id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    const event = events[0];

    if (event.available_seats < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough available seats.' });
    }

    // Check if user already booked this event
    const [existing] = await connection.execute(
      'SELECT booking_id FROM bookings WHERE user_id = ? AND event_id = ? AND booking_status NOT IN ("cancelled", "payment_failed")',
      [userId, eventId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'You already have an active booking for this event.' });
    }

    // Calculate amount
    const priceStr = event.price;
    let amount = 0;
    if (priceStr && priceStr !== 'Free' && priceStr !== 'Free Entry') {
      const match = priceStr.match(/RM\s*(\d+)/);
      if (match) amount = parseFloat(match[1]) * quantity;
    }

    // Decrease available seats
    await connection.execute(
      'UPDATE events SET available_seats = available_seats - ? WHERE event_id = ? AND available_seats >= ?',
      [quantity, eventId, quantity]
    );

    // Create booking
    const [result] = await connection.execute(
      'INSERT INTO bookings (user_id, event_id, ticket_quantity, booking_status, amount) VALUES (?, ?, ?, ?, ?)',
      [userId, eventId, quantity, amount > 0 ? 'pending_payment' : 'confirmed', amount]
    );

    const bookingId = result.insertId;

    // For free events, create notification and calendar event
    if (amount === 0) {
      await connection.execute(
        'INSERT INTO notifications (user_id, title, message, notification_type) VALUES (?, ?, ?, ?)',
        [userId, 'Booking Confirmed', `You have successfully booked "${event.title}".`, 'success']
      );
      await connection.execute(
        'INSERT INTO calendar_events (user_id, event_id, title, calendar_date, start_time, end_time, venue) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, eventId, event.title, event.event_date, event.start_time, event.end_time || '', event.venue]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: amount > 0 ? 'Booking created. Payment pending.' : 'Booking confirmed!',
      bookingId,
      amount,
      bookingStatus: amount > 0 ? 'pending_payment' : 'confirmed',
    });
  } catch (err) {
    await connection.rollback();
    console.error('Create booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to create booking.' });
  } finally {
    connection.release();
  }
});

// ─── PUT /api/bookings/:id ─────────────────────────────────────────────────
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { ticketQuantity, bookingStatus } = req.body;

    const [existing] = await pool.execute('SELECT * FROM bookings WHERE booking_id = ?', [bookingId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = existing[0];
    if (booking.user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const updates = [];
    const values = [];

    if (ticketQuantity !== undefined) {
      if (ticketQuantity < 1 || ticketQuantity > 10) {
        return res.status(400).json({ success: false, message: 'Ticket quantity must be between 1 and 10.' });
      }
      updates.push('ticket_quantity = ?');
      values.push(ticketQuantity);
    }
    if (bookingStatus !== undefined) {
      updates.push('booking_status = ?');
      values.push(bookingStatus);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    values.push(bookingId);
    await pool.execute(`UPDATE bookings SET ${updates.join(', ')} WHERE booking_id = ?`, values);

    res.json({ success: true, message: 'Booking updated successfully!' });
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to update booking.' });
  }
});

// ─── DELETE /api/bookings/:id ──────────────────────────────────────────────
router.delete('/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const bookingId = req.params.id;

    const [existing] = await connection.execute('SELECT * FROM bookings WHERE booking_id = ?', [bookingId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = existing[0];
    if (booking.user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Restore available seats
    await connection.execute(
      'UPDATE events SET available_seats = available_seats + ? WHERE event_id = ?',
      [booking.ticket_quantity, booking.event_id]
    );

    // Cancel the booking
    await connection.execute('UPDATE bookings SET booking_status = ? WHERE booking_id = ?', ['cancelled', bookingId]);

    // Delete related calendar event
    await connection.execute(
      'DELETE FROM calendar_events WHERE user_id = ? AND event_id = ?',
      [booking.user_id, booking.event_id]
    );

    // Create notification
    await connection.execute(
      'INSERT INTO notifications (user_id, title, message, notification_type) VALUES (?, ?, ?, ?)',
      [booking.user_id, 'Booking Cancelled', 'Your booking has been cancelled.', 'warning']
    );

    await connection.commit();
    res.json({ success: true, message: 'Booking cancelled successfully!' });
  } catch (err) {
    await connection.rollback();
    console.error('Cancel booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
  } finally {
    connection.release();
  }
});

export default router;
