# Lightweight Page-View Tracker

A minimal, self-contained analytics system for tracking page views on your personal site.

## Features

- 🚀 **Lightweight** - Small client script (~2KB minified)
- 🔥 **Fire-and-forget** - Non-blocking, fails silently
- 📦 **Self-contained** - Uses SQLite, no external database needed
- 🌐 **Framework-agnostic** - Works with any frontend (MPA or SPA)
- 🔒 **Privacy-respecting** - Honors Do Not Track preference
- 📊 **Simple analytics** - Built-in stats endpoint

## Quick Start

### 1. Install Dependencies

```bash
cd analytics-tracker
npm install
```

### 2. Start the Server

```bash
npm start
```

The server runs on port 3001 by default.

### 3. Add Tracking Script to Your Site

Add one of these snippets to your site's layout (before `</body>`):

**Option A: External script with data attribute**
```html
<script src="https://your-tracker-domain.com/tracker.min.js" 
        data-api="https://your-tracker-domain.com/api/track/page-view" 
        defer></script>
```

**Option B: Inline configuration**
```html
<script>
  window.PageTracker = { 
    apiUrl: 'https://your-tracker-domain.com/api/track/page-view' 
  };
</script>
<script src="https://your-tracker-domain.com/tracker.min.js" defer></script>
```

**Option C: Self-host the script**
Copy `public/tracker.min.js` to your site's assets folder:
```html
<script>
  window.PageTracker = { 
    apiUrl: 'https://your-tracker-domain.com/api/track/page-view' 
  };
</script>
<script src="/assets/js/tracker.min.js" defer></script>
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `DB_PATH` | `./data/pageviews.db` | SQLite database file path |
| `ALLOWED_ORIGINS` | `http://localhost:4000,...` | Comma-separated list of allowed CORS origins |
| `TRUST_PROXY` | (not set) | Configure trusted proxies for IP extraction (see below) |

### Configuring TRUST_PROXY

When running behind a reverse proxy (nginx, Cloudflare, etc.), you must configure `TRUST_PROXY` to correctly extract client IP addresses. **Without this setting, only the direct connection IP is used and proxy headers are ignored for security.**

| Value | Description |
|-------|-------------|
| `loopback` | Trust loopback addresses (127.0.0.1, ::1) |
| `loopback,linklocal,uniquelocal` | Trust all private network ranges |
| `10.0.0.1` | Trust a specific proxy IP |
| `10.0.0.0/8` | Trust an IP range (CIDR notation) |
| `1` or `2` | Trust the first N hops |
| `true` | Trust all proxies (**not recommended** - use only in fully controlled environments) |

Example with nginx on localhost:
```bash
PORT=3001 \
TRUST_PROXY="loopback" \
ALLOWED_ORIGINS="https://www.markodurasic.com,https://markodurasic.com" \
npm start
```

Example with Cloudflare (trust their IP ranges):
```bash
TRUST_PROXY="173.245.48.0/20,103.21.244.0/22,103.22.200.0/22" \
npm start
```

## API Endpoints

### POST `/api/track/page-view`

Track a page view event.

**Request Body:**
```json
{
  "path": "/blog/my-post",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "sessionId": "abc123",
  "viewportWidth": 1920,
  "viewportHeight": 1080
}
```

**Response:** `204 No Content`

### GET `/api/stats/summary`

Get analytics summary (protect this in production!).

**Response:**
```json
{
  "totalPageViews": 1234,
  "uniqueSessions": 567,
  "todayPageViews": 45,
  "topPages": [
    { "path": "/", "views": 500 },
    { "path": "/blog", "views": 200 }
  ],
  "recentActivity": [...]
}
```

### GET `/api/health`

Health check endpoint.

## Database Schema

The `page_views` table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Auto-increment primary key |
| `path` | TEXT | Page path (e.g., `/blog/post`) |
| `referrer` | TEXT | Referring URL |
| `user_agent` | TEXT | Browser user agent |
| `timestamp` | TEXT | Client timestamp (ISO format) |
| `session_id` | TEXT | Client-generated session ID |
| `viewport_width` | INTEGER | Browser viewport width |
| `viewport_height` | INTEGER | Browser viewport height |
| `ip_address` | TEXT | Client IP (for geo later) |
| `country` | TEXT | Reserved for geo enrichment |
| `created_at` | TEXT | Server timestamp |

## Deployment Options

### Option 1: Docker

Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p data
EXPOSE 3001
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t page-tracker .
docker run -d -p 3001:3001 -v ./data:/app/data page-tracker
```

### Option 2: systemd Service

Create `/etc/systemd/system/page-tracker.service`:
```ini
[Unit]
Description=Page View Tracker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/page-tracker
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=PORT=3001
Environment=ALLOWED_ORIGINS=https://www.markodurasic.com,https://markodurasic.com
Environment=TRUST_PROXY=loopback

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable page-tracker
sudo systemctl start page-tracker
```

### Option 3: PM2

```bash
npm install -g pm2
pm2 start server.js --name page-tracker
pm2 save
pm2 startup
```

### Option 4: Reverse Proxy (nginx)

```nginx
server {
    listen 443 ssl;
    server_name analytics.markodurasic.com;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /tracker.min.js {
        proxy_pass http://127.0.0.1:3001/tracker.min.js;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }
}
```

## Client Script Options

Configure the tracker by setting `window.PageTracker` before loading the script:

```javascript
window.PageTracker = {
  apiUrl: 'https://your-api.com/api/track/page-view',  // Required
  sessionDuration: 30 * 60 * 1000,  // Session timeout (default: 30 min)
  respectDNT: true,                  // Honor Do Not Track (default: true)
  debug: false                       // Console logging (default: false)
};
```

## Manual Tracking (SPA)

The tracker automatically detects route changes via History API. For manual tracking:

```javascript
// Track a custom event
PageTracker.track('/custom/path');
```

## Security Considerations

1. **Rate Limiting**: Add rate limiting in production (nginx or express-rate-limit)
2. **Stats Endpoint**: Protect `/api/stats/summary` with authentication
3. **CORS**: Configure `ALLOWED_ORIGINS` to only allow your domain
4. **Data Retention**: Consider adding a cleanup job for old data
5. **IP Spoofing Prevention**: When behind a reverse proxy, configure `TRUST_PROXY` to specify which proxies are trusted. This prevents clients from spoofing their IP address via `X-Forwarded-For` headers.

Example rate limiting with nginx:
```nginx
limit_req_zone $binary_remote_addr zone=tracker:10m rate=10r/s;

location /api/track/ {
    limit_req zone=tracker burst=20 nodelay;
    proxy_pass http://127.0.0.1:3001;
}
```

## Adding Geo-IP Later

To enrich page views with country data, you can:

1. Use a MaxMind GeoLite2 database
2. Add a cron job to enrich IP addresses
3. Or use a service like ip-api.com (with rate limits)

The `country` column is already in the schema for this purpose.

## License

MIT
