/**
 * Lightweight Page-View Tracking Server
 * 
 * A simple, self-contained analytics backend using SQLite for storage.
 */

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'pageviews.db');
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:4000', 'http://127.0.0.1:4000', 'https://www.markodurasic.com', 'https://markodurasic.com'];

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize SQLite database
const db = new Database(DB_PATH);

// Create page_views table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    timestamp TEXT NOT NULL,
    session_id TEXT,
    viewport_width INTEGER,
    viewport_height INTEGER,
    ip_address TEXT,
    country TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  
  CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
  CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);
  CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
`);

// Prepare insert statement for better performance
const insertPageView = db.prepare(`
  INSERT INTO page_views (path, referrer, user_agent, timestamp, session_id, viewport_width, viewport_height, ip_address)
  VALUES (@path, @referrer, @userAgent, @timestamp, @sessionId, @viewportWidth, @viewportHeight, @ipAddress)
`);

// Initialize Express app
const app = express();

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}));

// Parse JSON bodies
// Limit accounts for max field sizes: path(2KB) + referrer(2KB) + userAgent(512B) + overhead
app.use(express.json({ limit: '8kb' }));

// Serve static files (dashboard, tracker script)
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Extract client IP from request headers
 * Handles common proxy headers (X-Forwarded-For, X-Real-IP, CF-Connecting-IP)
 */
function getClientIP(req) {
  // Cloudflare
  if (req.headers['cf-connecting-ip']) {
    return req.headers['cf-connecting-ip'];
  }
  
  // Standard proxy header
  if (req.headers['x-forwarded-for']) {
    // X-Forwarded-For can contain multiple IPs; the first is the client
    return req.headers['x-forwarded-for'].split(',')[0].trim();
  }
  
  // Nginx proxy
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }
  
  // Direct connection
  return req.socket?.remoteAddress || req.ip || null;
}

/**
 * Validate and sanitize page view data
 */
function validatePageView(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a valid JSON object'] };
  }

  const errors = [];
  
  if (!data.path || typeof data.path !== 'string') {
    errors.push('path is required and must be a string');
  }
  
  if (!data.timestamp || typeof data.timestamp !== 'string') {
    errors.push('timestamp is required and must be a string');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // Sanitize and truncate fields
  return {
    valid: true,
    data: {
      path: String(data.path).slice(0, 2048),
      referrer: data.referrer ? String(data.referrer).slice(0, 2048) : null,
      userAgent: data.userAgent ? String(data.userAgent).slice(0, 512) : null,
      timestamp: String(data.timestamp).slice(0, 30),
      sessionId: data.sessionId ? String(data.sessionId).slice(0, 64) : null,
      viewportWidth: typeof data.viewportWidth === 'number' ? Math.floor(data.viewportWidth) : null,
      viewportHeight: typeof data.viewportHeight === 'number' ? Math.floor(data.viewportHeight) : null
    }
  };
}

/**
 * POST /api/track/page-view
 * 
 * Accepts page view events and stores them in the database.
 * 
 * Request body:
 * {
 *   path: string (required) - The page path
 *   referrer: string (optional) - The referring URL
 *   userAgent: string (optional) - Browser user agent
 *   timestamp: string (required) - ISO timestamp of the event
 *   sessionId: string (optional) - Client-generated session ID
 *   viewportWidth: number (optional) - Browser viewport width
 *   viewportHeight: number (optional) - Browser viewport height
 * }
 */
app.post('/api/track/page-view', (req, res) => {
  try {
    const validation = validatePageView(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: validation.errors 
      });
    }
    
    const { data } = validation;
    const ipAddress = getClientIP(req);
    
    // Insert into database
    insertPageView.run({
      path: data.path,
      referrer: data.referrer,
      userAgent: data.userAgent,
      timestamp: data.timestamp,
      sessionId: data.sessionId,
      viewportWidth: data.viewportWidth,
      viewportHeight: data.viewportHeight,
      ipAddress: ipAddress
    });
    
    // Return minimal response (fire-and-forget friendly)
    res.status(204).send();
    
  } catch (error) {
    console.error('Error tracking page view:', error.message);
    // Still return success to client (fire-and-forget)
    res.status(204).send();
  }
});

/**
 * GET /api/stats/summary
 * 
 * Returns basic analytics summary (for admin dashboard).
 * In production, protect this endpoint with authentication.
 */
app.get('/api/stats/summary', (req, res) => {
  try {
    const stats = {
      totalPageViews: db.prepare('SELECT COUNT(*) as count FROM page_views').get().count,
      uniqueSessions: db.prepare('SELECT COUNT(DISTINCT session_id) as count FROM page_views WHERE session_id IS NOT NULL').get().count,
      todayPageViews: db.prepare(`
        SELECT COUNT(*) as count FROM page_views 
        WHERE date(created_at) = date('now')
      `).get().count,
      topPages: db.prepare(`
        SELECT path, COUNT(*) as views 
        FROM page_views 
        GROUP BY path 
        ORDER BY views DESC 
        LIMIT 10
      `).all(),
      recentActivity: db.prepare(`
        SELECT path, timestamp, referrer 
        FROM page_views 
        ORDER BY created_at DESC 
        LIMIT 20
      `).all()
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  db.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`📊 Page-View Tracker running on port ${PORT}`);
  console.log(`   Database: ${DB_PATH}`);
  console.log(`   Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});
