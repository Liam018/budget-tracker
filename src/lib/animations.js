import { NEU } from "./neu"

/**
 * Neumorphic Button Physical Elevation Gestures
 *
 * Hover: Floats upward slightly (-1.5px) and casts a softer, wider shadow.
 * Tap: Depresses into the surface (+1px) and inverts into a sunken inner shadow.
 */
export const neuButtonHover = {
  y: -1.5,
  boxShadow: NEU.raisedHover,
  transition: { duration: 0.15, ease: "easeOut" },
}

export const neuButtonTap = {
  y: 1,
  boxShadow: NEU.pressed,
  transition: { duration: 0.08, ease: "easeIn" },
}

/**
 * Neumorphic Chip / Pill Elevation Gestures (without white specular glow)
 */
export const neuChipShadow = "2px 2px 5px rgba(200, 204, 216, 0.5)"

export const neuChipHover = {
  y: -1.5,
  boxShadow: "3px 3px 8px rgba(200, 204, 216, 0.65)",
  transition: { duration: 0.15, ease: "easeOut" },
}

export const neuChipTap = {
  y: 1,
  boxShadow: "inset 2px 2px 4px rgba(200, 204, 216, 0.5)",
  transition: { duration: 0.08, ease: "easeIn" },
}


/**
 * Bottom Sheet Variants — Container rises from the bottom with spring momentum
 * and ripples down on exit.
 */
export const sheetVariants = {
  hidden: {
    opacity: 0,
    scale: 0.97,
    y: 36,
    transformOrigin: "bottom center",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transformOrigin: "bottom center",
    transition: {
      type: "spring",
      stiffness: 340,
      damping: 28,
      mass: 0.85,
      staggerChildren: 0.025,
      delayChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 28,
    transformOrigin: "bottom center",
    transition: {
      duration: 0.18,
      ease: [0.32, 0, 0.67, 0],
    },
  },
}

/**
 * Centered Modal Variants — Dialog scales up with soft spring physics
 */
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 16,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 28,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 12,
    transition: {
      duration: 0.16,
      ease: "easeIn",
    },
  },
}

/**
 * Child Item Reveal — Staggered child elements ride upward with soft spring
 */
export const childItemVariants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 26,
      mass: 0.7,
    },
  },
}

/**
 * Subtle Fade & Y-Drift — For headings, badges, and labels
 */
export const fadeVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
}
