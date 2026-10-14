// Auth utilities
(function() {
  // Guard: redirect to login if not authenticated (for dashboard)
  if (window.location.pathname.includes('dashboard.html')) {
    const user = localStorage.getItem('finora_current_user');
    if (!user) {
      window.location.href = 'login.html';
    }
  }
  // Guard: redirect to dashboard if already logged in (for auth pages)
  if (window.location.pathname.match(/(login|register|forgot-password)\.html/)) {
    const user = localStorage.getItem('finora_current_user');
    if (user) {
      window.location.href = 'dashboard.html';
    }
  }
})();
