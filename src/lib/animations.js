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
 * Soft Elevation (modalVariants) — Primary Neumorphic Modal Variant
 * Feels like a tactile surface lifting gently off the desk towards the eye.
 *
 * - Modest Y-rise: 12px → 0px
 * - Subtle Optical Expansion: 96% → 100%
 * - Critically Damped: No harsh bouncy wobble; smooth hydraulic lift.
 */
export const softElevationVariants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 12,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 360,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 6,
    transition: {
      duration: 0.16,
      ease: [0.32, 0, 0.67, 0],
    },
  },
}

// Canonical alias for desktop modals
export const modalVariants = softElevationVariants

/**
 * Soft Float — For transaction details, inspector sheets, and report summaries
 * Smooth vertical glide without scale distortion.
 */
export const softFloatVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.24,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.98,
    transition: {
      duration: 0.16,
      ease: [0.7, 0, 0.84, 0],
    },
  },
}

/**
 * Mobile Bottom Sheet Variants — Slides up from screen bottom with spring physics
 */
export const mobileSheetVariants = {
  hidden: {
    y: "100%",
  },
  visible: {
    y: 0,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 32,
      mass: 0.8,
    },
  },
  exit: {
    y: "100%",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 32,
      mass: 0.8,
    },
  },
}

/**
 * Frosted Blur Backdrop Variants — Synchronized backdrop fade-in and fade-out
 */
export const backdropVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.18,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.16,
      ease: "easeIn",
    },
  },
}

/**
 * Drawer / Accordion Variants — Expands & collapses height smoothly
 */
export const drawerVariants = {
  hidden: {
    opacity: 0,
    height: 0,
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.16,
      ease: "easeIn",
    },
  },
}

/**
 * MorphIcon Vector Animation Springs
 */
export const MORPH_CONFIG = {
  snappy: "snappy", // fast, crisp response (tabs, toggles, eye, swap, expand)
  bouncy: "bouncy", // playful response
  smooth: "smooth", // gentle, subtle
  strokeWidth: 2.2, // standard stroke width
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
 * Card Item Reveal — For interactive grid items and dashboard cards
 */
export const cardItemVariants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 12,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 30,
      mass: 0.6,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: -8,
    transition: {
      duration: 0.14,
      ease: "easeOut",
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
