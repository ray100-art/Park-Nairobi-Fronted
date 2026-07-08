// Override before loading: <script>window.__API_BASE__ = 'https://api.example.com';</script>
// Local dev → backend on :8080. Production (same host / nginx proxy) → same origin ('').
window.__API_BASE__ = window.__API_BASE__ || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : ''
);
