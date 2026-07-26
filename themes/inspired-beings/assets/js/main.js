import { initContactForm } from './form.js'
import { initFade } from './fade.js'
import { initMenu } from './menu.js'
import { initTheme } from './theme.js'

// Each init runs isolated: a throw in one module (e.g. `initMenu`) must
// never stop the others from running — in particular `initFade` (run
// first below), whose CSS counterpart (`_motion.scss`) hides `[data-fade]`
// content until JS flips `data-visible`. Without this isolation, one bad
// module could leave that content invisible forever (see `_motion.scss`'s
// own CSS failsafe for the belt-and-suspenders half of this fix).
function safeInit(name, fn) {
  try {
    fn()
  } catch (error) {
    console.error(`main.js: ${name} failed to initialize`, error)
  }
}

safeInit('fade', initFade)
safeInit('menu', initMenu)
safeInit('theme', initTheme)
safeInit('contact form', initContactForm)
