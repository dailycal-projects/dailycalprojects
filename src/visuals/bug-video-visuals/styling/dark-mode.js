/**
 * Sets dark mode for the article background. Only run this in the client.
 */
export function setBackgroundDarkMode(darkMode) {
  const topBar = document.getElementById('topBar');
  topBar.style.backgroundColor = darkMode ? '#080808' : '';
  topBar.style.borderBottom = darkMode ? '1px solid #2b2b2b' : '';

  const logo = document.getElementById('logo');
  logo.style.filter = darkMode ? 'invert(1)' : '';

  document.body.style.transition = '.2s background ease';
  document.body.style.background = darkMode ? '#0a0a0a' : '';
}
