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

  // Trade-off: this reads the OS preference once, at page load, for a
  // visitor who never manually toggled (no stored `data-theme` yet). If
  // the OS scheme changes while the page stays open, `data-theme`/
  // `aria-pressed` do NOT live-update — only `themes/_dark.scss`'s
  // `@media (prefers-color-scheme: dark)` block (unaffected by this JS)
  // keeps tracking the OS live. A future task could add a
  // `matchMedia(...).addEventListener('change', …)` listener if that
  // matters; not done here since nothing in the brief calls for it.
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
