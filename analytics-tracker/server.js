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

const isOriginAllowed = origin => {
  if (ALLOWED_ORIGINS.includes('*')) return true;
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
};

// Trusted proxy configuration
// Set TRUST_PROXY to configure which proxies to trust for IP extraction
// Values: 'loopback', 'linklocal', 'uniquelocal', comma-separated IPs/CIDRs, or 'true' for all (not recommended)
// When not set (default), only the direct connection IP is used (no headers trusted)
const TRUST_PROXY = process.env.TRUST_PROXY || false;

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

// Configure trusted proxies for secure IP extraction
// This ensures X-Forwarded-For and similar headers are only trusted from known proxies
if (TRUST_PROXY && TRUST_PROXY !== 'false') {
  // Parse comma-separated values for multiple trusted proxies
  if (typeof TRUST_PROXY === 'string' && TRUST_PROXY.includes(',')) {
    app.set('trust proxy', TRUST_PROXY.split(',').map(p => p.trim()));
  } else if (TRUST_PROXY === 'true') {
    // Trust all proxies (use with caution, only in fully controlled environments)
    app.set('trust proxy', true);
  } else {
    // Single value: 'loopback', 'linklocal', 'uniquelocal', specific IP, or number of hops
    app.set('trust proxy', TRUST_PROXY);
  }
}

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
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
 * Extract client IP from request
 * 
 * Uses Express's req.ip which respects the 'trust proxy' setting.
 * When trust proxy is configured, Express will securely parse X-Forwarded-For
 * and similar headers only from trusted proxies.
 * When trust proxy is not configured, only the direct connection IP is returned.
 * 
 * To enable proxy header parsing, set the TRUST_PROXY environment variable:
 * - 'loopback' - Trust loopback addresses (127.0.0.1, ::1)
 * - 'loopback,linklocal,uniquelocal' - Trust private networks
 * - '10.0.0.1,10.0.0.2' - Trust specific proxy IPs
 * - '10.0.0.0/8' - Trust IP range (CIDR notation)
 * - '1' or '2' - Trust the first N hops
 */
function getClientIP(req) {
  // req.ip respects the 'trust proxy' setting configured on the Express app
  // It will only use forwarded headers when the request comes from a trusted proxy
  return req.ip || req.socket?.remoteAddress || null;
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
    if (!isOriginAllowed(req.headers.origin)) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }

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
  const status = err.status || err.statusCode || 500;
  const message = status >= 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
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
