// Top-bar burger (mobile nav collapse) + services dropdown (APG Disclosure
// pattern: real button + aria-expanded, Esc closes and returns focus,
// click-outside closes). CSS already makes both reachable without JS
// (see layout/_top-bar.scss) — this only adds the collapsed/click/Esc
// behavior on top.

export function initMenu() {
  const burger = document.querySelector('[data-menu="burger"]')
  const nav = document.querySelector('[data-menu="nav"]')
  if (burger && nav) {
    burger.setAttribute('aria-expanded', 'false')
    burger.addEventListener('click', () => {
      const isOpen = burger.getAttribute('aria-expanded') === 'true'
      burger.setAttribute('aria-expanded', String(!isOpen))
    })
  }

  document.querySelectorAll('[data-menu="dropdown-toggle"]').forEach(toggle => {
    const panel = document.getElementById(toggle.getAttribute('aria-controls') ?? '')
    if (!panel) return

    const close = () => toggle.setAttribute('aria-expanded', 'false')
    const open = () => toggle.setAttribute('aria-expanded', 'true')

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true'
      isOpen ? close() : open()
    })

    toggle.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown') return
      event.preventDefault()
      open()
      panel.querySelector('a')?.focus()
    })

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || toggle.getAttribute('aria-expanded') !== 'true') return
      close()
      toggle.focus()
    })

    document.addEventListener('click', event => {
      if (toggle.contains(event.target) || panel.contains(event.target)) return
      close()
    })
  })
}
