/**
 * Blocking FOUC boot for Light / Dark / System on the personal site.
 * Classic script only (no module / defer / async). Keep in sync with
 * assets/js/theme-switcher.js resolve rules.
 */
(function () {
  var KEY = 'marko-theme-mode';
  var mode = 'system';
  try {
    var stored = window.localStorage.getItem(KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      mode = stored;
    }
  } catch (_) {
    /* private mode / blocked storage → system */
  }

  var resolved = mode;
  if (mode === 'system') {
    try {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (_) {
      resolved = 'light';
    }
  }

  var root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.style.colorScheme = resolved;
})();
