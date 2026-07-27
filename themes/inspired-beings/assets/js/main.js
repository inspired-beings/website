import { initContactForm } from './form.js'
import { initMenu } from './menu.js'
import { initTheme } from './theme.js'

// Each init runs isolated: a throw in one module (e.g. `initMenu`) must
// never stop the others from running.
function safeInit(name, fn) {
  try {
    fn()
  } catch (error) {
    console.error(`main.js: ${name} failed to initialize`, error)
  }
}

safeInit('menu', initMenu)
safeInit('theme', initTheme)
safeInit('contact form', initContactForm)
