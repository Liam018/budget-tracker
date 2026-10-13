/**
 * chartUtils.js — Pure SVG chart math for CurrencyTrendCard.
 *
 * Contains:
 *  - SVG layout constants (W, H, PAD_X, PAD_Y, CHART_W, CHART_H)
 *  - buildChartPaths() — monotone cubic interpolation (Fritsch-Carlson),
 *    Y-axis tick generation with auto-precision, X-axis date labels,
 *    and min/max/latest index annotations.
 *
 * No React imports — this module is pure JS and safe to unit-test in isolation.
 */

// ─── SVG Layout Constants ─────────────────────────────────────────────────────
export const W = 600
export const H = 148
export const PAD_X = 52  // left room for Y-axis labels
export const PAD_Y = 22
export const CHART_W = W - PAD_X - 16
export const CHART_H = H - PAD_Y * 2

// ─── Monotone Cubic Path Builder ──────────────────────────────────────────────
/**
 * Fritsch-Carlson monotone cubic interpolation.
 *
 * Unlike catmull-rom, this guarantees the interpolated curve never overshoots
 * between adjacent data points — the visual peak/trough always coincides with
 * the actual data min/max, so dot markers remain accurate.
 *
 * @param {Array<{x: number, y: number}>} pts - SVG coordinate points
 * @returns {string} SVG path string with cubic bezier segments
 */
function monotoneCubicPath(pts) {
  const n = pts.length
  if (n < 2) return ""

  // Secant slopes between consecutive points
  const dx = [], dy = [], slope = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1].x - pts[i].x
    dy[i] = pts[i + 1].y - pts[i].y
    slope[i] = dy[i] / dx[i]
  }

  // Initialize tangents: average of adjacent secants at interior points
  const tan = new Array(n)
  tan[0] = slope[0]
  tan[n - 1] = slope[n - 2]
  for (let i = 1; i < n - 1; i++) {
    // Sign change at local extremum → force flat tangent to prevent overshoot
    tan[i] = slope[i - 1] * slope[i] <= 0
      ? 0
      : (slope[i - 1] + slope[i]) / 2
  }

  // Fritsch-Carlson monotonicity constraint
  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(slope[i]) < 1e-12) {
      tan[i] = 0
      tan[i + 1] = 0
      continue
    }
    const a = tan[i] / slope[i]
    const b = tan[i + 1] / slope[i]
    const s = a * a + b * b
    if (s > 9) {
      const tau = 3 / Math.sqrt(s)
      tan[i] = tau * a * slope[i]
      tan[i + 1] = tau * b * slope[i]
    }
  }

  // Emit SVG cubic bezier segments from the monotone tangents
  let d = `M ${pts[0].x},${pts[0].y}`
  for (let i = 0; i < n - 1; i++) {
    const cp1x = pts[i].x + dx[i] / 3
    const cp1y = pts[i].y + (tan[i] * dx[i]) / 3
    const cp2x = pts[i + 1].x - dx[i] / 3
    const cp2y = pts[i + 1].y - (tan[i + 1] * dx[i]) / 3
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pts[i + 1].x},${pts[i + 1].y}`
  }
  return d
}

// ─── Main Chart Path Builder ──────────────────────────────────────────────────
/**
 * buildChartPaths — Converts raw useCurrencyHistory data into everything the
 * SparklineChart SVG needs:
 *
 *  - `linePath`  : monotone cubic SVG path for the stroke line
 *  - `areaPath`  : closed path for the gradient fill
 *  - `coords`    : pixel-mapped point array (x, y, rate, date)
 *  - `minIdx`    : index of the lowest-rate data point
 *  - `maxIdx`    : index of the highest-rate data point
 *  - `latestIdx` : index of the most-recent data point (for the live dot)
 *  - `yLabels`   : 3 Y-axis tick objects { value, y } with auto-precision
 *  - `xLabels`   : 3 X-axis date objects { label, x }
 *
 * @param {object|null} historyData - output from useCurrencyHistory hook
 * @returns {object|null} chart data object, or null if data is insufficient
 */
export function buildChartPaths(historyData) {
  if (!historyData?.points || historyData.points.length < 2) return null

  const points = historyData.points
  const min = historyData.minRate
  const max = historyData.maxRate
  const range = max - min || 1

  // Map raw data points to SVG pixel coordinates
  const coords = points.map((p, i) => ({
    x: PAD_X + (i / (points.length - 1)) * CHART_W,
    y: PAD_Y + CHART_H - ((p.rate - min) / range) * CHART_H,
    rate: p.rate,
    date: p.date,
  }))

  const linePath = monotoneCubicPath(coords)
  const last = coords[coords.length - 1]
  const first = coords[0]
  const areaPath = `${linePath} L ${last.x},${H - PAD_Y + 6} L ${first.x},${H - PAD_Y + 6} Z`

  // Annotate min / max indices for dot markers
  let minIdx = 0, maxIdx = 0
  coords.forEach((c, i) => {
    if (c.rate < coords[minIdx].rate) minIdx = i
    if (c.rate > coords[maxIdx].rate) maxIdx = i
  })

  // Y-axis labels: auto-increase precision until all 3 ticks are distinct
  // (prevents duplicate labels on tight ranges like 0.0159–0.0160)
  let yPrecision = 4
  while (yPrecision < 10) {
    const ticks = [0, 0.5, 1].map((t) => (min + t * range).toFixed(yPrecision))
    if (new Set(ticks).size === ticks.length) break
    yPrecision++
  }
  const seenY = new Set()
  const yLabels = [0, 0.5, 1]
    .map((t) => ({
      value: (min + t * range).toFixed(yPrecision),
      y: PAD_Y + CHART_H - t * CHART_H,
    }))
    .filter(({ value }) => {
      if (seenY.has(value)) return false
      seenY.add(value)
      return true
    })

  // X-axis date labels: first, mid, last data points
  const xLabels = [0, Math.floor((points.length - 1) / 2), points.length - 1].map((i) => ({
    label: points[i]?.date
      ? new Date(points[i].date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "",
    x: coords[i].x,
  }))

  return {
    linePath,
    areaPath,
    coords,
    minIdx,
    maxIdx,
    latestIdx: coords.length - 1,
    yLabels,
    xLabels,
  }
}
