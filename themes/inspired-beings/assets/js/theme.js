// Theme toggle: click flips `data-theme` on <html> between light/dark and
// persists the choice to localStorage (read back by the inline anti-flash
// script in head.html on the next page load).

const STORAGE_KEY = 'theme'

function applyTheme(theme, button) {
  document.documentElement.setAttribute('data-theme', theme)
  button.setAttribute('aria-pressed', String(theme === 'dark'))
}

export function initTheme() {
  const button = document.querySelector('[data-theme-toggle]')
  if (!button) return

  const current =
    document.documentElement.getAttribute('data-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  applyTheme(current, button)
  button.hidden = false // nothing to toggle without JS — see theme-toggle.html

  button.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch (e) {}
    applyTheme(next, button)
  })
}
