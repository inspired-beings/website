// Contact form progressive enhancement (Task 10). The server-rendered form
// already works with JS disabled: real `action`/`method="post"`, native
// HTML5 `required`/`type="email"` constraint validation. This module only
// intercepts submit to (1) POST via fetch instead of a full-page navigation
// and (2) render the same DOM shape the Task 4 partials render server-side
// for an invalid field (`form-field__error`/`form-fieldset__error` +
// `aria-describedby`) — built client-side here since a first client-side
// attempt has no server round-trip to render it from.
//
// Body encoding: `application/x-www-form-urlencoded` via
// `new URLSearchParams(new FormData(form))` — matches exactly what the
// browser's own native POST would send with JS off, so a real endpoint
// only needs to handle one encoding for both code paths.
//
// i18n stays out of this bundle (same idiom as menu.js/theme.js): every
// user-facing string is read from `data-*` attributes the template fills
// with `i18n` calls, not hardcoded here.

function fieldContainer(field) {
  return field.closest('.form-field, .form-fieldset')
}

// Strips only the *error* id from `aria-describedby` (preserving a help
// id, exactly like the server-rendered valid state would) before removing
// the injected `<p>`s themselves — otherwise a corrected field keeps
// `aria-describedby` pointing at an id that no longer exists in the DOM.
function clearErrors(form) {
  const errorIds = new Set([...form.querySelectorAll('[data-contact-injected-error]')].map(el => el.id))

  form.querySelectorAll('.form-field--invalid, .form-fieldset--invalid').forEach(el => {
    el.classList.remove('form-field--invalid', 'form-fieldset--invalid')
  })
  form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'))
  form.querySelectorAll('[aria-describedby]').forEach(el => {
    const remaining = el
      .getAttribute('aria-describedby')
      .split(' ')
      .filter(id => id && !errorIds.has(id))
    if (remaining.length) el.setAttribute('aria-describedby', remaining.join(' '))
    else el.removeAttribute('aria-describedby')
  })
  form.querySelectorAll('[data-contact-injected-error]').forEach(el => el.remove())
}

function messageFor(form, field) {
  if (field.validity.valueMissing) return form.dataset.errorRequired
  if (field.validity.typeMismatch) return form.dataset.errorEmail
  return form.dataset.errorInvalid
}

// Idempotent: the browser fires one native `invalid` event per invalid
// control, so a required radio group (every unchecked radio is :invalid)
// fires it once per radio — skip re-marking a container already flagged
// this validation pass (cleared per-pass, see `initContactForm`).
function markInvalid(form, container, field) {
  const isFieldset = container.classList.contains('form-fieldset')
  const invalidModifier = isFieldset ? 'form-fieldset--invalid' : 'form-field--invalid'
  if (container.classList.contains(invalidModifier)) return
  container.classList.add(invalidModifier)

  const name = field.name
  const errorId = `${name}-error`
  const controls = isFieldset ? container.querySelectorAll(`[name="${name}"]`) : [field]
  controls.forEach(control => {
    control.setAttribute('aria-invalid', 'true')
    const describedBy = (control.getAttribute('aria-describedby') || '').split(' ').filter(Boolean)
    if (!describedBy.includes(errorId)) describedBy.push(errorId)
    control.setAttribute('aria-describedby', describedBy.join(' '))
  })

  const error = document.createElement('p')
  error.className = isFieldset ? 'form-fieldset__error' : 'form-field__error'
  error.id = errorId
  error.setAttribute('data-contact-injected-error', '')
  error.textContent = messageFor(form, field)
  container.append(error)
}

function showStatus(status, message, isError) {
  if (!status || !message) return
  status.hidden = false
  status.textContent = message
  status.classList.toggle('contact-form__status--error', isError)
  status.classList.toggle('contact-form__status--success', !isError)
}

// Hides and empties the status region — called at the start of a new
// submit attempt so a stale success/error message from a previous attempt
// doesn't linger on screen while the next one is still in flight or being
// corrected.
function resetStatus(status) {
  if (!status) return
  status.hidden = true
  status.textContent = ''
  status.classList.remove('contact-form__status--error', 'contact-form__status--success')
}

function initOneContactForm(form) {
  const status = form.querySelector('[data-contact-status]')
  const submitButton = form.querySelector('[data-contact-submit]')

  // Clear the previous attempt's errors before the native "submit the
  // form" algorithm's interactive constraint validation runs (that
  // algorithm is the submit button's activation behavior, which runs
  // AFTER this click listener returns — not a race). Also resets the
  // per-attempt focus flag below and the status region.
  let focusedThisAttempt = false
  submitButton?.addEventListener('click', () => {
    clearErrors(form)
    resetStatus(status)
    focusedThisAttempt = false
  })

  // The native "submit the form" algorithm runs interactive constraint
  // validation BEFORE ever dispatching `submit` — if any control is
  // invalid, `submit` never fires at all; the UA instead fires `invalid`
  // on each failing control, in tree order (a required radio group fires
  // it once per radio, since every unchecked radio is :invalid). So
  // `invalid` (capture phase — it does not bubble) is where the accessible
  // inline errors get injected; `submit` only ever runs once native
  // validation has already passed. `preventDefault()` suppresses the
  // native validation-message bubble, but per spec that ALSO cancels the
  // UA's own auto-focus-first-invalid-control behavior — so focus is
  // re-implemented here manually: `invalid` fires in tree order, so the
  // first call each attempt is guaranteed to be the first invalid control.
  form.addEventListener(
    'invalid',
    event => {
      event.preventDefault()
      const container = fieldContainer(event.target)
      if (container) markInvalid(form, container, event.target)
      if (!focusedThisAttempt) {
        event.target.focus()
        focusedThisAttempt = true
      }
    },
    true,
  )

  // `aria-disabled` + `pointer-events: none` (CSS) blocks a second mouse
  // click while a submit is in flight, but NOT keyboard re-activation
  // (Enter/Space on a focused button still fires `click` regardless of
  // `aria-disabled` — it's not the native `disabled` attribute). This flag
  // is the real guard against overlapping POSTs from repeated Enter.
  let submitInFlight = false

  form.addEventListener('submit', event => {
    event.preventDefault()
    if (submitInFlight) return
    submitInFlight = true
    // No `clearErrors(form)` here: the submit button's `click` listener
    // above already cleared this attempt's stale state, and `submit` only
    // fires after native validation passed, so nothing re-added errors
    // since — a second call here was a redundant no-op.

    submitButton?.setAttribute('aria-disabled', 'true')
    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)),
    })
      .then(response => {
        if (!response.ok) throw new Error(`contact form submit failed: ${response.status}`)
        form.reset()
        showStatus(status, form.dataset.successMessage, false)
      })
      .catch(() => {
        showStatus(status, form.dataset.errorMessage, true)
      })
      .finally(() => {
        submitButton?.removeAttribute('aria-disabled')
        submitInFlight = false
      })
  })
}

// Looped rather than a single `querySelector` — a page can render more than
// one `[data-contact-form]` instance (the styleguide's permanent demo
// instance is a second, independent form on its own page; a future page
// could render two on the same page), and each needs its own closure state
// (`focusedThisAttempt`/`submitInFlight`), not one shared across instances.
export function initContactForm() {
  document.querySelectorAll('[data-contact-form]').forEach(initOneContactForm)
}
