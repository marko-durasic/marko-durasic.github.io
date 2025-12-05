/**
 * Lightweight Page-View Tracker
 * 
 * A minimal, framework-agnostic tracking script that works with both
 * Multi-Page Applications (MPA) and Single-Page Applications (SPA).
 * 
 * Features:
 * - Fire-and-forget (non-blocking)
 * - Fails silently if API is down
 * - Session tracking via localStorage
 * - SPA route change detection
 * - Respects Do Not Track preference
 * 
 * Usage:
 * <script src="/tracker.js" data-api="https://your-api.com/api/track/page-view"></script>
 * 
 * Or inline configuration:
 * <script>
 *   window.PageTracker = { apiUrl: 'https://your-api.com/api/track/page-view' };
 * </script>
 * <script src="/tracker.js"></script>
 */
(function() {
  'use strict';

  // Configuration
  var config = {
    apiUrl: null,
    sessionDuration: 30 * 60 * 1000, // 30 minutes
    storageKey: '_pv_session',
    respectDNT: true,
    debug: false
  };

  // Merge user config
  if (typeof window.PageTracker === 'object') {
    for (var key in window.PageTracker) {
      if (window.PageTracker.hasOwnProperty(key)) {
        config[key] = window.PageTracker[key];
      }
    }
  }

  // Get API URL from script tag data attribute
  function getApiUrlFromScript() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || '';
      if (src.indexOf('tracker.js') !== -1 || src.indexOf('tracker.min.js') !== -1) {
        var apiUrl = scripts[i].getAttribute('data-api');
        if (apiUrl) return apiUrl;
      }
    }
    return null;
  }

  // Set API URL from script attribute if not already set
  if (!config.apiUrl) {
    config.apiUrl = getApiUrlFromScript();
  }

  // Exit if no API URL configured
  if (!config.apiUrl) {
    if (config.debug) console.warn('[PageTracker] No API URL configured');
    return;
  }

  // Check Do Not Track
  if (config.respectDNT && (navigator.doNotTrack === '1' || window.doNotTrack === '1')) {
    if (config.debug) console.log('[PageTracker] Respecting Do Not Track preference');
    return;
  }

  /**
   * Generate a unique session ID
   */
  function generateSessionId() {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return Date.now().toString(36) + '-' + result;
  }

  /**
   * Get or create session ID
   * Sessions expire after 30 minutes of inactivity
   */
  function getSessionId() {
    var session = null;
    
    try {
      var stored = localStorage.getItem(config.storageKey);
      if (stored) {
        session = JSON.parse(stored);
      }
    } catch (e) {
      // localStorage not available or parsing failed
    }

    var now = Date.now();
    
    // Check if session exists and hasn't expired
    if (session && session.id && session.lastActive) {
      if (now - session.lastActive < config.sessionDuration) {
        // Update last active time
        session.lastActive = now;
        try {
          localStorage.setItem(config.storageKey, JSON.stringify(session));
        } catch (e) {}
        return session.id;
      }
    }

    // Create new session
    var newSession = {
      id: generateSessionId(),
      lastActive: now
    };

    try {
      localStorage.setItem(config.storageKey, JSON.stringify(newSession));
    } catch (e) {}

    return newSession.id;
  }

  /**
   * Get current page path (normalized)
   */
  function getPath() {
    return window.location.pathname + window.location.search;
  }

  /**
   * Send page view event to API
   */
  function trackPageView(path) {
    var payload = {
      path: path || getPath(),
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    };

    if (config.debug) {
      console.log('[PageTracker] Tracking:', payload);
    }

    // Use sendBeacon for fire-and-forget if available
    if (navigator.sendBeacon) {
      try {
        var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        var sent = navigator.sendBeacon(config.apiUrl, blob);
        if (config.debug) console.log('[PageTracker] sendBeacon:', sent ? 'success' : 'failed');
        return;
      } catch (e) {
        // Fall through to fetch
      }
    }

    // Fallback to fetch with keepalive
    try {
      fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
        mode: 'cors',
        credentials: 'omit'
      }).catch(function() {
        // Fail silently
      });
    } catch (e) {
      // Fail silently
    }
  }

  /**
   * Track initial page view
   */
  var lastTrackedPath = null;

  function trackCurrentPage() {
    var currentPath = getPath();
    if (currentPath !== lastTrackedPath) {
      lastTrackedPath = currentPath;
      trackPageView(currentPath);
    }
  }

  // Track on page load
  if (document.readyState === 'complete') {
    trackCurrentPage();
  } else {
    window.addEventListener('load', trackCurrentPage);
  }

  /**
   * SPA Route Change Detection
   * Listens for History API changes and hashchange events
   */
  
  // Wrap history.pushState
  var originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(history, arguments);
    setTimeout(trackCurrentPage, 0);
  };

  // Wrap history.replaceState
  var originalReplaceState = history.replaceState;
  history.replaceState = function() {
    originalReplaceState.apply(history, arguments);
    setTimeout(trackCurrentPage, 0);
  };

  // Listen for popstate (back/forward navigation)
  window.addEventListener('popstate', function() {
    setTimeout(trackCurrentPage, 0);
  });

  // Listen for hash changes
  window.addEventListener('hashchange', function() {
    setTimeout(trackCurrentPage, 0);
  });

  /**
   * Track page unload for more accurate session data
   * Uses sendBeacon which works during page unload
   */
  window.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      // Update session last active time
      getSessionId();
    }
  });

  // Expose for manual tracking if needed
  window.PageTracker = window.PageTracker || {};
  window.PageTracker.track = trackPageView;
  window.PageTracker.config = config;

})();
