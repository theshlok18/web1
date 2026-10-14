// Theme management
(function() {
  const saved = localStorage.getItem('finora_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  
  function updateIcon() {
    const theme = document.documentElement.getAttribute('data-theme');
    const icons = document.querySelectorAll('#themeIcon');
    icons.forEach(icon => {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) darkToggle.checked = theme === 'dark';
  }

  window.toggleTheme = function() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('finora_theme', next);
    updateIcon();
    if (window.redrawCharts) window.redrawCharts();
  };

  document.addEventListener('DOMContentLoaded', function() {
    updateIcon();
    document.querySelectorAll('#themeToggle, .theme-toggle').forEach(btn => {
      btn.addEventListener('click', window.toggleTheme);
    });
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
      darkToggle.addEventListener('change', window.toggleTheme);
    }
  });
})();
