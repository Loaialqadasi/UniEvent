import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = Router();

// ─── POST /api/auth/register ───────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Input validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check if email already exists
    const [existing] = await pool.execute('SELECT user_id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate avatar initials
    const avatar = name.trim().split(' ').filter(w => w.length > 0).map(w => w[0]).join('').toUpperCase().slice(0, 2);

    // Random avatar color
    const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-teal-500'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const userRole = role === 'organizer' ? 'organizer' : 'student';

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, avatar, avatar_color) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, userRole, avatar, avatarColor]
    );

    const userId = result.insertId;

    // Generate JWT token
    const token = generateToken({
      user_id: userId,
      email: email.trim().toLowerCase(),
      role: userRole,
      name: name.trim(),
    });

    // Fetch the created user
    const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
    const user = rows[0];

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
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
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
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
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ─── GET /api/auth/profile ─────────────────────────────────────────────────
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [req.user.user_id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const user = rows[0];
    res.json({
      success: true,
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
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/auth/profile ─────────────────────────────────────────────────
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, bio, studentId, department } = req.body;
    const userId = req.user.user_id;

    // Validate inputs
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }

    // Check email uniqueness if changing
    if (email && email.trim().toLowerCase() !== req.user.email) {
      const [existing] = await pool.execute('SELECT user_id FROM users WHERE email = ? AND user_id != ?', [email.trim().toLowerCase(), userId]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already in use.' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name.trim()); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email.trim().toLowerCase()); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone.trim()); }
    if (bio !== undefined) { updates.push('bio = ?'); values.push(bio.trim()); }
    if (studentId !== undefined) { updates.push('student_id = ?'); values.push(studentId.trim()); }
    if (department !== undefined) { updates.push('department = ?'); values.push(department.trim()); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    // Update avatar if name changed
    if (name !== undefined) {
      const avatar = name.trim().split(' ').filter(w => w.length > 0).map(w => w[0]).join('').toUpperCase().slice(0, 2);
      updates.push('avatar = ?');
      values.push(avatar);
    }

    values.push(userId);
    await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, values);

    // Fetch updated user
    const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
    const user = rows[0];

    // Generate new token with updated info
    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      token,
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
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/auth/change-password ────────────────────────────────────────
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const [rows] = await pool.execute('SELECT password FROM users WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, userId]);

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

export default router;
