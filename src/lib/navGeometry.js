/**
 * navGeometry.js — Mathematical SVG Path Generators & Dimensions for Bottom Navigation
 */

export const NAV_BAR_HEIGHT = 60
export const NAV_NOTCH_RADIUS = 32
export const NAV_FILLET_WIDTH = 14
export const NAV_CORNER_RADIUS = 30

/**
 * Generates an SVG path string for a stadium-shaped capsule with a smooth circular center notch.
 *
 * @param {number} barWidth - Total width of the container in px
 * @param {object} [options]
 * @param {number} [options.height=NAV_BAR_HEIGHT] - Height of the capsule
 * @param {number} [options.radius=NAV_CORNER_RADIUS] - Corner pill radius (height / 2 for full stadium)
 * @param {number} [options.notchRadius=NAV_NOTCH_RADIUS] - Radius of the center circular cutout
 * @param {number} [options.filletWidth=NAV_FILLET_WIDTH] - Smooth shoulder fillet width entering the notch
 * @returns {string} SVG path d attribute string
 */
export function generateNotchedStadiumPath(barWidth, options = {}) {
  const {
    height: h = NAV_BAR_HEIGHT,
    radius: r = NAV_CORNER_RADIUS,
    notchRadius: notchR = NAV_NOTCH_RADIUS,
    filletWidth: filletW = NAV_FILLET_WIDTH,
  } = options

  const w = barWidth || 360
  const cx = w / 2

  return `
    M ${r} 0
    L ${cx - (notchR + filletW)} 0
    C ${cx - (notchR + filletW) + 7} 0, ${cx - notchR} 5, ${cx - notchR} 13
    A ${notchR} ${notchR} 0 0 0 ${cx + notchR} 13
    C ${cx + notchR} 5, ${cx + (notchR + filletW) - 7} 0, ${cx + (notchR + filletW)} 0
    L ${w - r} 0
    A ${r} ${r} 0 0 1 ${w - r} ${h}
    L ${r} ${h}
    A ${r} ${r} 0 0 1 ${r} 0
    Z
  `.trim()
}
