/**
 * Light / Dark / System segmented control for the personal site masthead.
 * Depends on theme-init.js having set data-theme already (FOUC boot).
 */
(function () {
  var KEY = 'marko-theme-mode';
  var MODES = { light: true, dark: true, system: true };

  function readMode() {
    try {
      var stored = window.localStorage.getItem(KEY);
      if (MODES[stored]) return stored;
    } catch (_) {
      /* ignore */
    }
    return 'system';
  }

  function writeMode(mode) {
    try {
      window.localStorage.setItem(KEY, mode);
    } catch (_) {
      /* ignore */
    }
  }

  function systemPrefersDark() {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (_) {
      return false;
    }
  }

  function resolve(mode) {
    if (mode === 'light' || mode === 'dark') return mode;
    return systemPrefersDark() ? 'dark' : 'light';
  }

  function applyResolved(resolved) {
    var root = document.documentElement;
    root.setAttribute('data-theme', resolved);
    root.style.colorScheme = resolved;
  }

  function init() {
    var group = document.querySelector('.theme-switcher');
    if (!group) return;

    var buttons = Array.prototype.slice.call(
      group.querySelectorAll('button[data-theme-mode]'),
    );
    var media = window.matchMedia('(prefers-color-scheme: dark)');
    var mode = readMode();

    function syncPressed() {
      buttons.forEach(function (btn) {
        var value = btn.getAttribute('data-theme-mode');
        btn.setAttribute('aria-pressed', value === mode ? 'true' : 'false');
      });
    }

    function apply() {
      applyResolved(resolve(mode));
      syncPressed();
    }

    function setMode(next) {
      if (!MODES[next]) return;
      mode = next;
      writeMode(mode);
      apply();
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setMode(btn.getAttribute('data-theme-mode'));
      });
    });

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', function () {
        if (mode === 'system') apply();
      });
    } else if (typeof media.addListener === 'function') {
      media.addListener(function () {
        if (mode === 'system') apply();
      });
    }

    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
