(() => {
  'use strict';
  const root = document.documentElement;
  const app = document.getElementById('app');
  const status = document.getElementById('load-status');
  const title = document.getElementById('load-title');
  const help = document.getElementById('load-help');
  const retry = document.getElementById('retry');
  const bootstrapUrl = document.currentScript.src;
  let timer;
  root.dataset.bootState = 'loading';
  status.textContent = 'Preparing your welcome…';
  help.textContent = 'If the app doesn’t open, you can try again or visit the church’s current website.';

  function fail(code, message) {
    if (root.dataset.bootState === 'ready') return;
    clearTimeout(timer);
    root.dataset.bootState = 'error';
    root.dataset.bootError = code;
    app.setAttribute('aria-busy', 'false');
    title.textContent = 'We couldn’t open the app';
    status.textContent = message;
    help.textContent = 'Please try again, or use the church’s current website.';
    retry.hidden = false;
    console.error('[Mission Church startup]', code);
  }

  retry.addEventListener('click', () => window.location.reload());
  document.addEventListener('mission-app-ready', () => {
    clearTimeout(timer);
    root.dataset.bootState = 'ready';
    delete root.dataset.bootError;
    app.setAttribute('aria-busy', 'false');
    document.getElementById('loading')?.remove();
  }, { once: true });

  window.addEventListener('unhandledrejection', () => {
    fail('runtime-rejection', 'The app could not finish starting.');
  });
  window.addEventListener('error', event => {
    if (event.error) fail('runtime-error', 'The app could not finish starting.');
  });

  if (window.location.protocol === 'file:') {
    fail('local-file', 'Open this app through a web server. From the project folder, run npm start, then use the server address.');
    return;
  }

  const supportsWasmGc = (() => {
    try {
      return 'WebAssembly' in window && WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,95,1,120,0]));
    } catch (_) { return false; }
  })();
  if (!supportsWasmGc) {
    fail('unsupported-browser', 'This app needs a browser with WebAssembly GC support. Please update your browser.');
    return;
  }

  timer = setTimeout(() => {
    root.dataset.bootState = 'slow';
    status.textContent = 'This is taking longer than expected.';
    help.textContent = 'You can wait a little longer, try again, or use the church’s current website.';
    retry.hidden = false;
  }, 30000);

  const script = document.createElement('script');
  script.src = new URL('kompose-mission.js', bootstrapUrl).href;
  script.addEventListener('error', () => {
    fail('bundle-unavailable', 'The app’s files could not be downloaded.');
  });
  document.body.appendChild(script);
})();
