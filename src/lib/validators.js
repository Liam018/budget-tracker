/**
 * src/lib/validators.js
 * Reusable, composable field validators.
 *
 * Each validator is a function that receives a value and returns
 * an error string, or null if the value is valid.
 *
 * Usage:
 *   validateField(value, required('Email'), email())
 *   validateForm({ email: { value, rules: [required('Email'), email()] } })
 */

// ── Primitive validators ──────────────────────────────────────────

/** Field must not be empty or whitespace-only. */
export const required = (label = 'This field') =>
  (value) => !value?.toString().trim() ? `${label} is required.` : null

/** Value must be a valid email format. */
export const email = () =>
  (value) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value?.trim() ?? '')
    ? 'Please enter a valid email address.'
    : null

/** Minimum character length. */
export const minLength = (min, label = 'This field') =>
  (value) => (value?.trim().length ?? 0) < min
    ? `${label} must be at least ${min} characters.`
    : null

/** Maximum character length. */
export const maxLength = (max, label = 'This field') =>
  (value) => (value?.length ?? 0) > max
    ? `${label} must be no more than ${max} characters.`
    : null

/** Value must match another value (e.g. confirm password). */
export const matches = (getOtherValue, message = 'Fields do not match.') =>
  (value) => value !== getOtherValue() ? message : null

/** Only letters, spaces, hyphens, and apostrophes (for names). */
export const nameFormat = (label = 'Name') =>
  (value) => !/^[a-zA-Z\s'\-]+$/.test(value?.trim() ?? '')
    ? `${label} must contain letters only.`
    : null

/** Minimum password strength — at least one letter and one number. */
export const passwordStrength = () =>
  (value) => !/(?=.*[a-zA-Z])(?=.*\d)/.test(value ?? '')
    ? 'Password must include at least one letter and one number.'
    : null

// ── Runner ───────────────────────────────────────────────────────

/**
 * Run a list of validators against a single value.
 * Returns the first error string found, or null.
 *
 * @param {*} value
 * @param {...Function} rules
 * @returns {string|null}
 */
export function validateField(value, ...rules) {
  for (const rule of rules) {
    const error = rule(value)
    if (error) return error
  }
  return null
}

/**
 * Validate an entire form object.
 *
 * @param {{ [fieldName]: { value: *, rules: Function[] } }} fields
 * @returns {{ [fieldName]: string }} — only fields that have errors
 *
 * @example
 * const errors = validateForm({
 *   email:    { value: form.email,    rules: [required('Email'), email()] },
 *   password: { value: form.password, rules: [required('Password'), minLength(8, 'Password')] },
 * })
 * // errors === {} means the form is valid
 */
export function validateForm(fields) {
  const errors = {}
  for (const [name, { value, rules }] of Object.entries(fields)) {
    const error = validateField(value, ...(rules ?? []))
    if (error) errors[name] = error
  }
  return errors
}

// ── Auth-specific helpers ─────────────────────────────────────────

export const authValidators = {
  /** Login form validation. */
  login: (form) => validateForm({
    email: {
      value: form.email,
      rules: [required('Email'), email()],
    },
    password: {
      value: form.password,
      rules: [required('Password')],
    },
  }),

  /** Registration form validation. */
  register: (form) => validateForm({
    fullName: {
      value: form.fullName,
      rules: [required('Full name'), minLength(2, 'Full name'), maxLength(80, 'Full name')],
    },
    email: {
      value: form.email,
      rules: [required('Email'), email()],
    },
    password: {
      value: form.password,
      rules: [required('Password'), minLength(8, 'Password'), passwordStrength()],
    },
    confirmPassword: {
      value: form.confirmPassword,
      rules: [
        required('Confirm password'),
        matches(() => form.password, 'Passwords do not match.'),
      ],
    },
  }),

  /** Forgot password form validation. */
  forgotPassword: (form) => validateForm({
    email: {
      value: form.email,
      rules: [required('Email'), email()],
    },
  }),
}
