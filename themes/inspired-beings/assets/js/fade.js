// Scroll fade-ins: elements opt in via `data-fade` in layouts (see
// `partials/card.html`, `home`, `services/list.html`, `products/list.html`).
// The initial hidden state lives entirely in CSS (`_motion.scss`, gated on
// `[data-js] … prefers-reduced-motion: no-preference`) — this module only
// ever ADDS `data-visible`, never removes it, so a no-JS page (that CSS
// rule can't match without `[data-js]`) or a reduced-motion page (the CSS
// rule is walled off by the same media query) already renders everything
// visible before this file even runs.

export function initFade() {
  const targets = document.querySelectorAll('[data-fade]')
  if (!targets.length) return

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.setAttribute('data-visible', ''))
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.setAttribute('data-visible', '')
        observer.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  )

  targets.forEach((el) => observer.observe(el))
}
