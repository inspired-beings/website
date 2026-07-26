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

function clearErrors(form) {
  form.querySelectorAll('.form-field--invalid, .form-fieldset--invalid').forEach(el => {
    el.classList.remove('form-field--invalid', 'form-fieldset--invalid')
  })
  form.querySelectorAll('[data-contact-injected-error]').forEach(el => el.remove())
  form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'))
}

function messageFor(form, field) {
  if (field.validity.valueMissing) return form.dataset.errorRequired
  if (field.validity.typeMismatch) return form.dataset.errorEmail
  return form.dataset.errorRequired
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

export function initContactForm() {
  const form = document.querySelector('[data-contact-form]')
  if (!form) return

  const status = form.querySelector('[data-contact-status]')
  const submitButton = form.querySelector('[data-contact-submit]')

  // Clear the previous attempt's errors before the native "submit the
  // form" algorithm's interactive constraint validation runs (that
  // algorithm is the submit button's activation behavior, which runs
  // AFTER this click listener returns — not a race). Also resets the
  // per-attempt focus flag below.
  let focusedThisAttempt = false
  submitButton?.addEventListener('click', () => {
    clearErrors(form)
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

  form.addEventListener('submit', event => {
    event.preventDefault()
    clearErrors(form) // stale errors from an earlier failed attempt, now fixed

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
      })
  })
}
