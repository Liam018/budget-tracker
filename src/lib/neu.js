/**
 * neu.js — Resolved Neumorphic Shadow Constants
 *
 * Mirrors the CSS variables in index.css with their actual computed values.
 * Use these in Framer Motion `whileTap`, `whileHover`, or `animate` props
 * so Motion can properly interpolate between shadow states.
 *
 * CSS variables like `var(--neu-raised-sm)` are fine for static `style` props
 * and plain CSS classes, but Framer Motion cannot parse/interpolate them.
 * Pass these resolved constants to Motion instead.
 *
 * Keep in sync with:
 *   --neu-dark:  rgba(200, 204, 216, 0.4)
 *   --neu-light: rgba(255, 255, 255, 0.8)
 */

const dark = "rgba(200, 204, 216, 0.4)"
const light = "rgba(255, 255, 255, 0.8)"

export const NEU = {
  /** Background surface color */
  bg: "#edf0f7",

  /** Raised — large element (cards) */
  raised: `5px 5px 10px ${dark}, -5px -5px 10px ${light}`,

  /** Raised — small/compact elements (buttons, pills) */
  raisedSm: `3px 3px 7px ${dark}, -3px -3px 7px ${light}`,

  /** Raised Hover — elevated soft floating state for interactive buttons */
  raisedHover: `4px 4px 10px ${dark}, -4px -4px 10px ${light}`,

  /** Inset — sunken element (inputs, disabled state) */
  inset: `inset 3px 3px 7px ${dark}, inset -3px -3px 7px ${light}`,

  /** Inset subtle — small sunken elements */
  insetSm: `inset 2px 2px 5px ${dark}, inset -2px -2px 5px ${light}`,

  /** Pressed — active/tap depression state for buttons */
  pressed: `inset 4px 4px 8px ${dark}, inset -2px -2px 5px ${light}`,
}
