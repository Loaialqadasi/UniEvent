import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/events ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR venue LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY event_date ASC';
    const [rows] = await pool.execute(query, params);

    // Fetch average ratings for all events
    const [ratings] = await pool.execute(
      'SELECT event_id, AVG(rating) as avg_rating, COUNT(*) as review_count FROM feedback GROUP BY event_id'
    );
    const ratingMap = {};
    ratings.forEach(r => {
      ratingMap[r.event_id] = { avgRating: parseFloat(Number(r.avg_rating).toFixed(1)), reviewCount: r.review_count };
    });

    const events = rows.map(e => ({
      id: e.event_id,
      organizerId: e.organizer_id,
      title: e.title,
      description: e.description,
      category: e.category,
      date: e.event_date.toISOString().split('T')[0],
      time: e.start_time + (e.end_time ? ' - ' + e.end_time : ''),
      venue: e.venue,
      capacity: e.capacity,
      availableSeats: e.available_seats,
      price: e.price,
      image: e.image_url,
      status: e.status,
      createdAt: e.created_at,
      attendees: e.capacity - e.available_seats,
      avgRating: ratingMap[e.event_id]?.avgRating || 0,
      reviewCount: ratingMap[e.event_id]?.reviewCount || 0,
    }));

    res.json({ success: true, events });
  } catch (err) {
    console.error('Fetch events error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
});

// ─── GET /api/events/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM events WHERE event_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    const e = rows[0];

    // Fetch average rating for this event
    const [ratings] = await pool.execute(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM feedback WHERE event_id = ?',
      [req.params.id]
    );
    const avgRating = ratings[0]?.avg_rating ? parseFloat(Number(ratings[0].avg_rating).toFixed(1)) : 0;
    const reviewCount = ratings[0]?.review_count || 0;

    const event = {
      id: e.event_id,
      organizerId: e.organizer_id,
      title: e.title,
      description: e.description,
      category: e.category,
      date: e.event_date.toISOString().split('T')[0],
      time: e.start_time + (e.end_time ? ' - ' + e.end_time : ''),
      venue: e.venue,
      capacity: e.capacity,
      availableSeats: e.available_seats,
      price: e.price,
      image: e.image_url,
      status: e.status,
      createdAt: e.created_at,
      attendees: e.capacity - e.available_seats,
      avgRating,
      reviewCount,
    };
    res.json({ success: true, event });
  } catch (err) {
    console.error('Fetch event error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch event.' });
  }
});

// ─── POST /api/events ──────────────────────────────────────────────────────
router.post('/', authenticateToken, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const { title, description, category, date, startTime, endTime, venue, capacity, price, imageUrl } = req.body;

    // Validation
    if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Title is required.' });
    if (!description || !description.trim()) return res.status(400).json({ success: false, message: 'Description is required.' });
    if (!category) return res.status(400).json({ success: false, message: 'Category is required.' });
    if (!date) return res.status(400).json({ success: false, message: 'Date is required.' });
    if (!venue || !venue.trim()) return res.status(400).json({ success: false, message: 'Venue is required.' });
    if (!capacity || capacity < 1) return res.status(400).json({ success: false, message: 'Capacity must be at least 1.' });

    const [result] = await pool.execute(
      'INSERT INTO events (organizer_id, title, description, category, event_date, start_time, end_time, venue, capacity, available_seats, price, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.user_id, title.trim(), description.trim(), category, date, startTime || '9:00 AM', endTime || '5:00 PM', venue.trim(), capacity, capacity, price || 'Free', imageUrl || '']
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      eventId: result.insertId,
    });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
});

// ─── PUT /api/events/:id ───────────────────────────────────────────────────
router.put('/:id', authenticateToken, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const eventId = req.params.id;

    // Check event exists and user owns it (or is admin)
    const [existing] = await pool.execute('SELECT * FROM events WHERE event_id = ?', [eventId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    if (existing[0].organizer_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only edit your own events.' });
    }

    const { title, description, category, date, startTime, endTime, venue, capacity, price, imageUrl, status } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title.trim()); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description.trim()); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (date !== undefined) { updates.push('event_date = ?'); values.push(date); }
    if (startTime !== undefined) { updates.push('start_time = ?'); values.push(startTime); }
    if (endTime !== undefined) { updates.push('end_time = ?'); values.push(endTime); }
    if (venue !== undefined) { updates.push('venue = ?'); values.push(venue.trim()); }
    if (capacity !== undefined) { updates.push('capacity = ?'); values.push(capacity); }
    if (price !== undefined) { updates.push('price = ?'); values.push(price); }
    if (imageUrl !== undefined) { updates.push('image_url = ?'); values.push(imageUrl); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    values.push(eventId);
    await pool.execute(`UPDATE events SET ${updates.join(', ')} WHERE event_id = ?`, values);

    // If event date/time changed, update related calendar events
    if (date || startTime || endTime || venue) {
      const calUpdates = [];
      const calValues = [];
      if (title !== undefined) { calUpdates.push('title = ?'); calValues.push(title.trim()); }
      if (date !== undefined) { calUpdates.push('calendar_date = ?'); calValues.push(date); }
      if (startTime !== undefined) { calUpdates.push('start_time = ?'); calValues.push(startTime); }
      if (endTime !== undefined) { calUpdates.push('end_time = ?'); calValues.push(endTime); }
      if (venue !== undefined) { calUpdates.push('venue = ?'); calValues.push(venue.trim()); }
      if (calUpdates.length > 0) {
        calValues.push(eventId);
        await pool.execute(`UPDATE calendar_events SET ${calUpdates.join(', ')} WHERE event_id = ?`, calValues);
      }
    }

    res.json({ success: true, message: 'Event updated successfully!' });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
});

// ─── DELETE /api/events/:id ────────────────────────────────────────────────
router.delete('/:id', authenticateToken, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const eventId = req.params.id;

    const [existing] = await pool.execute('SELECT * FROM events WHERE event_id = ?', [eventId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    if (existing[0].organizer_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own events.' });
    }

    await pool.execute('DELETE FROM events WHERE event_id = ?', [eventId]);
    res.json({ success: true, message: 'Event deleted successfully!' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
});

// ─── GET /api/events/categories/list ───────────────────────────────────────
router.get('/categories/list', async (req, res) => {
  res.json({
    success: true,
    categories: ['All', 'Technology', 'Career', 'Academic', 'Sports', 'Arts', 'Entertainment'],
  });
});

export default router;
