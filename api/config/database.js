import mysql from 'mysql2/promise';

// Database connection pool for TiDB Cloud (MySQL-compatible)
// Uses environment variables for security
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
  port: parseInt(process.env.DB_PORT || '4000'),
  user: process.env.DB_USER || '3rR9wiedWBDKNT2.root',
  password: process.env.DB_PASSWORD || 'SZEe9q3pxIRGm6j1',
  database: process.env.DB_NAME || 'unievent_db',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
  });

export default pool;
