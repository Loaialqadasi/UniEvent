import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/forum/posts ──────────────────────────────────────────────────
router.get('/posts', async (req, res) => {
  try {
    const { eventId } = req.query;
    let query = 'SELECT * FROM forum_posts';
    const params = [];

    if (eventId) {
      query += ' WHERE event_id = ?';
      params.push(eventId);
    }
    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);

    // Get comment counts
    const posts = [];
    for (const p of rows) {
      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as count FROM comments WHERE post_id = ?',
        [p.post_id]
      );
      posts.push({
        postId: p.post_id,
        userId: p.user_id,
        eventId: p.event_id,
        title: p.title,
        content: p.content,
        author: p.author,
        createdAt: p.created_at,
        commentCount: countResult[0].count,
      });
    }

    res.json({ success: true, posts });
  } catch (err) {
    console.error('Fetch forum posts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch posts.' });
  }
});

// ─── GET /api/forum/posts/:id ──────────────────────────────────────────────
router.get('/posts/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM forum_posts WHERE post_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    const p = rows[0];
    res.json({
      success: true,
      post: {
        postId: p.post_id,
        userId: p.user_id,
        eventId: p.event_id,
        title: p.title,
        content: p.content,
        author: p.author,
        createdAt: p.created_at,
      },
    });
  } catch (err) {
    console.error('Fetch post error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch post.' });
  }
});

// ─── POST /api/forum/posts ─────────────────────────────────────────────────
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { eventId, title, content } = req.body;

    // Validation
    if (!title || title.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Title must be at least 5 characters.' });
    }
    if (!content || content.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Content must be at least 20 characters.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO forum_posts (user_id, event_id, title, content, author) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, eventId || null, title.trim(), content.trim(), req.user.name]
    );

    res.status(201).json({
      success: true,
      message: 'Post created successfully!',
      postId: result.insertId,
      post: {
        postId: result.insertId,
        userId: req.user.user_id,
        eventId: eventId || null,
        title: title.trim(),
        content: content.trim(),
        author: req.user.name,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ success: false, message: 'Failed to create post.' });
  }
});

// ─── DELETE /api/forum/posts/:id ───────────────────────────────────────────
router.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;

    const [existing] = await pool.execute('SELECT * FROM forum_posts WHERE post_id = ?', [postId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Only author or admin can delete
    if (existing[0].user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own posts.' });
    }

    await pool.execute('DELETE FROM forum_posts WHERE post_id = ?', [postId]);
    res.json({ success: true, message: 'Post deleted successfully!' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete post.' });
  }
});

// ─── GET /api/forum/posts/:id/comments ─────────────────────────────────────
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC',
      [req.params.id]
    );

    const comments = rows.map(c => ({
      commentId: c.comment_id,
      postId: c.post_id,
      userId: c.user_id,
      content: c.comment_text,
      author: c.author,
      createdAt: c.created_at,
    }));

    res.json({ success: true, comments });
  } catch (err) {
    console.error('Fetch comments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch comments.' });
  }
});

// ─── POST /api/forum/comments ──────────────────────────────────────────────
router.post('/comments', authenticateToken, async (req, res) => {
  try {
    const { postId, content } = req.body;

    if (!postId) {
      return res.status(400).json({ success: false, message: 'Post ID is required.' });
    }
    if (!content || content.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Comment must be at least 2 characters.' });
    }

    // Verify post exists
    const [posts] = await pool.execute('SELECT post_id FROM forum_posts WHERE post_id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO comments (post_id, user_id, comment_text, author) VALUES (?, ?, ?, ?)',
      [postId, req.user.user_id, content.trim(), req.user.name]
    );

    res.status(201).json({
      success: true,
      message: 'Comment added!',
      commentId: result.insertId,
      comment: {
        commentId: result.insertId,
        postId,
        userId: req.user.user_id,
        content: content.trim(),
        author: req.user.name,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ success: false, message: 'Failed to add comment.' });
  }
});

// ─── DELETE /api/forum/comments/:id ────────────────────────────────────────
router.delete('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;

    const [existing] = await pool.execute('SELECT * FROM comments WHERE comment_id = ?', [commentId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (existing[0].user_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own comments.' });
    }

    await pool.execute('DELETE FROM comments WHERE comment_id = ?', [commentId]);
    res.json({ success: true, message: 'Comment deleted!' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete comment.' });
  }
});

export default router;
