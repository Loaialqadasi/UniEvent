-- ============================================
-- UniEvent Database Initialization Script
-- For TiDB Cloud (MySQL-compatible)
-- Run this ONCE to set up the database and seed data
-- ============================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS unievent_db;
USE unievent_db;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'organizer', 'admin') NOT NULL DEFAULT 'student',
  avatar VARCHAR(10) DEFAULT '',
  avatar_color VARCHAR(30) DEFAULT 'bg-indigo-500',
  phone VARCHAR(20) DEFAULT '',
  bio TEXT DEFAULT '',
  student_id VARCHAR(30) DEFAULT '',
  department VARCHAR(100) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  organizer_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('Technology', 'Career', 'Academic', 'Sports', 'Arts', 'Entertainment') NOT NULL,
  event_date DATE NOT NULL,
  start_time VARCHAR(20) DEFAULT '9:00 AM',
  end_time VARCHAR(20) DEFAULT '5:00 PM',
  venue VARCHAR(200) NOT NULL,
  capacity INT NOT NULL DEFAULT 100,
  available_seats INT NOT NULL DEFAULT 100,
  price VARCHAR(50) DEFAULT 'Free',
  image_url VARCHAR(500) DEFAULT '',
  status ENUM('open', 'closed', 'cancelled') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  ticket_quantity INT NOT NULL DEFAULT 1,
  booking_status ENUM('confirmed', 'pending_payment', 'cancelled', 'payment_failed') DEFAULT 'confirmed',
  amount DECIMAL(10,2) DEFAULT 0.00,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'card',
  payment_status ENUM('successful', 'failed', 'refunded') DEFAULT 'successful',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. FORUM POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS forum_posts (
  post_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT DEFAULT NULL,
  title VARCHAR(250) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  comment_text TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES forum_posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
  feedback_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 8. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  notification_type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 9. CALENDAR EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_events (
  calendar_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  calendar_date DATE NOT NULL,
  start_time VARCHAR(20) DEFAULT '',
  end_time VARCHAR(20) DEFAULT '',
  venue VARCHAR(200) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- SEED DATA: Demo Users (passwords are hashed with bcryptjs)
-- ============================================

-- Password: organizer123
INSERT INTO users (name, email, password, role, avatar, avatar_color, student_id, department) VALUES
('Campus Organizer', 'organizer@unievents.test', '$2a$10$rQZ3V8K5x2YmJ6L4W9N0HePqFvRtXbCsDiGkUlMnOpQrStUvWxYz', 'organizer', 'CO', 'bg-purple-500', '', 'Student Affairs');

-- Password: student123
INSERT INTO users (name, email, password, role, avatar, avatar_color, student_id, department) VALUES
('Demo Student', 'student@unievents.test', '$2a$10$rQZ3V8K5x2YmJ6L4W9N0HePqFvRtXbCsDiGkUlMnOpQrStUvWxYz', 'student', 'DS', 'bg-blue-500', 'A23CS0001', 'Computer Science');

-- Password: loai123
INSERT INTO users (name, email, password, role, avatar, avatar_color, student_id, department) VALUES
('Loai AlQadasi', 'loai@unievents.test', '$2a$10$rQZ3V8K5x2YmJ6L4W9N0HePqFvRtXbCsDiGkUlMnOpQrStUvWxYz', 'student', 'LA', 'bg-emerald-500', 'A23EC9010', 'Computer Engineering');

-- Password: admin123
INSERT INTO users (name, email, password, role, avatar, avatar_color, student_id, department) VALUES
('Admin User', 'admin@unievents.test', '$2a$10$rQZ3V8K5x2YmJ6L4W9N0HePqFvRtXbCsDiGkUlMnOpQrStUvWxYz', 'admin', 'AU', 'bg-rose-500', '', 'Administration');

-- ============================================
-- SEED DATA: Events
-- ============================================
INSERT INTO events (organizer_id, title, description, category, event_date, start_time, end_time, venue, capacity, available_seats, price, image_url, status) VALUES
(1, 'UTM Tech Innovation Summit 2026', 'A full-day summit showcasing the latest innovations in AI, cloud computing, and cybersecurity. Industry leaders from top tech companies will share insights on emerging trends and career opportunities.', 'Technology', '2026-07-15', '9:00 AM', '5:00 PM', 'UTM Main Hall', 500, 478, 'RM 25', '', 'open'),
(1, 'Career Fair 2026', 'Connect with over 50 top employers from various industries. Bring your resume and prepare for on-the-spot interviews. Professional headshot service available.', 'Career', '2026-07-20', '10:00 AM', '4:00 PM', 'UTM Sports Complex', 800, 765, 'Free', '', 'open'),
(1, 'AI & Machine Learning Workshop', 'Hands-on workshop covering neural networks, deep learning, and practical ML applications. Laptops required. Certificate of participation provided.', 'Academic', '2026-07-25', '2:00 PM', '6:00 PM', 'Computer Lab B2-305', 50, 32, 'RM 15', '', 'open'),
(1, 'Inter-Faculty Sports Tournament', 'Annual sports competition featuring football, basketball, badminton, and volleyball. All faculties welcome to participate.', 'Sports', '2026-08-01', '8:00 AM', '6:00 PM', 'UTM Sports Arena', 300, 280, 'Free', '', 'open'),
(1, 'Digital Art Exhibition', 'Showcasing student artwork in digital painting, 3D modeling, and interactive media. Live art demonstrations and creative workshops.', 'Arts', '2026-08-05', '11:00 AM', '7:00 PM', 'UTM Art Gallery', 200, 185, 'Free Entry', '', 'open'),
(1, 'Campus Music Festival', 'Live performances by student bands, solo artists, and special guest performers. Food trucks and merchandise stalls available.', 'Entertainment', '2026-08-10', '6:00 PM', '11:00 PM', 'UTM Open Stage', 600, 540, 'RM 30', '', 'open');

-- ============================================
-- SEED DATA: Forum Posts
-- ============================================
INSERT INTO forum_posts (user_id, event_id, title, content, author) VALUES
(2, 1, 'What to expect at the Tech Summit?', 'I am planning to attend the UTM Tech Innovation Summit this July. Has anyone been to previous editions? What topics are usually covered and should I prepare anything specific before attending?', 'Demo Student'),
(3, 2, 'Career Fair tips and resume advice', 'The Career Fair is coming up soon. I wanted to start a thread where we can share tips on how to prepare, what to bring, and how to make a great impression with recruiters. Please share your experiences!', 'Loai AlQadasi'),
(4, 3, 'ML Workshop prerequisites question', 'For those who have taken the AI and Machine Learning Workshop before, what level of programming knowledge is expected? I have basic Python skills but want to make sure I can follow along with the hands-on exercises.', 'Admin User'),
(2, 5, 'Sharing my digital art portfolio', 'I am really excited about the Digital Art Exhibition. I have been working on some 3D modeling projects using Blender and would love to get feedback from fellow students before the exhibition.', 'Demo Student'),
(3, 4, 'Sports Tournament team registration', 'Is anyone interested in forming a badminton team for the Inter-Faculty Sports Tournament? We need at least 3 more players. Drop a comment if you are interested!', 'Loai AlQadasi');

-- ============================================
-- SEED DATA: Comments
-- ============================================
INSERT INTO comments (post_id, user_id, comment_text, author) VALUES
(1, 3, 'I went last year and it was amazing! The keynote on cloud computing was particularly insightful. I recommend bringing a notebook for the breakout sessions.', 'Loai AlQadasi'),
(1, 4, 'Make sure to attend the networking session after the main talks. That is where you can really connect with industry professionals.', 'Admin User'),
(2, 2, 'Great initiative! I would add that you should research the companies attending beforehand and prepare questions specific to each one.', 'Demo Student'),
(2, 4, 'Bring multiple copies of your resume, dress professionally, and practice your elevator pitch. Good luck everyone!', 'Admin User'),
(3, 2, 'Basic Python should be sufficient. They usually start from fundamentals and build up. The instructors are very helpful.', 'Demo Student'),
(5, 3, 'I would love to join! I play doubles. Count me in!', 'Loai AlQadasi');

-- ============================================
-- SEED DATA: Feedback
-- ============================================
INSERT INTO feedback (user_id, event_id, rating, review, author) VALUES
(2, 1, 5, 'The Tech Summit last year was incredibly well-organized. Looking forward to this year even more!', 'Demo Student'),
(3, 2, 4, 'The Career Fair was very helpful. I got two interview callbacks from the companies I spoke with.', 'Loai AlQadasi');

-- ============================================
-- SEED DATA: Notifications
-- ============================================
INSERT INTO notifications (user_id, title, message, notification_type, is_read) VALUES
(2, 'Registration Confirmed', 'Your registration for the Tech Innovation Summit has been confirmed!', 'success', FALSE),
(2, 'Event Reminder', 'The Career Fair starts in 3 days. Remember to bring your resume!', 'warning', FALSE),
(3, 'Welcome to UniEvents', 'Your account has been created successfully. Explore upcoming events and book your tickets!', 'info', TRUE);

-- ============================================
-- SEED DATA: Calendar Events
-- ============================================
INSERT INTO calendar_events (user_id, event_id, title, calendar_date, start_time, end_time, venue) VALUES
(2, 1, 'UTM Tech Innovation Summit 2026', '2026-07-15', '9:00 AM', '5:00 PM', 'UTM Main Hall'),
(2, 2, 'Career Fair 2026', '2026-07-20', '10:00 AM', '4:00 PM', 'UTM Sports Complex');

-- ============================================
-- DONE! Database initialized successfully.
-- ============================================
