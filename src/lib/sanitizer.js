/**
 * src/lib/sanitizer.js
 * Client-side input sanitization helpers.
 *
 * Sanitizes and normalizes user input prior to validation and API dispatch
 * to prevent XSS payloads, whitespace exploits, and malformed characters.
 */

/**
 * Sanitizes and normalizes an email address.
 * Trims whitespace, removes control characters, and converts to lowercase.
 *
 * @param {string} email
 * @returns {string}
 */
export function sanitizeEmail(email) {
  if (typeof email !== "string") return ""
  // Remove control characters, null bytes, and non-printable characters
  return email
    .replace(/[\u0000-\u001F\u007F-\u009F\s]+/g, "")
    .trim()
    .toLowerCase()
}

/**
 * Sanitizes a person's full name.
 * Strips HTML tags, trims leading/trailing whitespace, and collapses multiple spaces.
 *
 * @param {string} name
 * @returns {string}
 */
export function sanitizeName(name) {
  if (typeof name !== "string") return ""
  return name
    .replace(/<[^>]*>?/gm, "") // Strip HTML tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim()
}

/**
 * Sanitizes general plain text (descriptions, notes).
 * Strips dangerous HTML tags and control characters while preserving valid unicode.
 *
 * @param {string} text
 * @returns {string}
 */
export function sanitizeText(text) {
  if (typeof text !== "string") return ""
  return text
    .replace(/<[^>]*>?/gm, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    .trim()
}
