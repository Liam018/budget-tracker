import { useRef, useEffect } from "react"
import { W, H, PAD_X, CHART_W } from "./chartUtils"

// ─── Dot Marker ───────────────────────────────────────────────────────────────
/**
 * DotMarker — Small circle + text label placed at a specific SVG coordinate.
 * Used to annotate the period Low (amber) and High (trend color) data points.
 */
export function DotMarker({ cx, cy, color, label, labelAnchor = "middle", labelDy = 14 }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={3.5} fill={color} opacity={0.9} />
      <text
        x={cx}
        y={cy + labelDy}
        textAnchor={labelAnchor}
        fontSize="9.5"
        fill={color}
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="700"
        opacity={0.85}
      >
        {label}
      </text>
    </g>
  )
}

// ─── Pulsing Live Dot ─────────────────────────────────────────────────────────
/**
 * LiveDot — Pulsing animated ring + solid inner dot placed at the latest
 * (most-recent) data point to indicate the current live rate position.
 */
export function LiveDot({ cx, cy, color }) {
  return (
    <g>
      {/* Outer pulsing ring — pure SVG SMIL animation */}
      <circle cx={cx} cy={cy} r={7} fill={color} opacity={0}>
        <animate attributeName="r" values="5;10;5" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0;0.35" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={4.5} fill="white" />
      <circle cx={cx} cy={cy} r={3} fill={color} />
    </g>
  )
}

// ─── SparklineChart ───────────────────────────────────────────────────────────
/**
 * SparklineChart — Full SVG chart rendering the monotone cubic line, gradient
 * area fill, Y-axis grid + labels, X-axis date labels, and dot markers.
 *
 * The stroke line animates via CSS stroke-dashoffset transition whenever
 * `animKey` changes (timeframe switch or currency pair change).
 *
 * @param {object} chart   - Output of buildChartPaths()
 * @param {boolean} isUp   - Whether the period change % is positive
 * @param {string} animKey - Unique key that triggers re-animation on change
 */
export function SparklineChart({ chart, isUp, animKey }) {
  const pathRef = useRef(null)

  // Re-trigger stroke drawing animation on every animKey change.
  //
  // Uses double-rAF instead of getBoundingClientRect() force-reflow:
  //   rAF 1 → browser flushes transition:none + style reset
  //   rAF 2 → browser has completed a full paint frame; safe to start transition
  //
  // This is necessary because SparklineChart mounts inside a Framer Motion
  // wrapper that is simultaneously animating (scale/opacity). During that
  // animation, getBoundingClientRect() may not reliably flush the style engine,
  // causing getTotalLength() to return a stale value and the line to appear cut.
  useEffect(() => {
    const el = pathRef.current
    if (!el) return

    // Reset any in-progress animation
    el.style.transition = "none"
    el.style.strokeDasharray = ""
    el.style.strokeDashoffset = ""

    let raf2
    const raf1 = requestAnimationFrame(() => {
      // By now the browser has processed transition:none + cleared the styles.
      // Measure the actual path length and set the initial hidden state.
      const len = el.getTotalLength()
      el.style.strokeDasharray = len
      el.style.strokeDashoffset = len

      raf2 = requestAnimationFrame(() => {
        // Full paint frame has occurred — the hidden state is committed.
        // Now apply the transition and animate the line into view.
        el.style.transition = "stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1)"
        el.style.strokeDashoffset = 0
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [animKey])

  const strokeColor = isUp ? "#10b981" : "#f43f5e"
  // Sanitise animKey for valid SVG id usage
  const gradientId = `tg-${animKey.replace(/[^a-z0-9]/gi, "")}`
  const clipId = `tc-${animKey.replace(/[^a-z0-9]/gi, "")}`

  const { minIdx, maxIdx, latestIdx, coords, yLabels, xLabels } = chart

  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full" style={{ display: "block" }}>
      <defs>
        {/* Vertical gradient for area fill */}
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={strokeColor} stopOpacity="0.2" />
          <stop offset="80%"  stopColor={strokeColor} stopOpacity="0.04" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
        {/* Clip path to keep area/line within chart bounds */}
        <clipPath id={clipId}>
          <rect x={PAD_X} y={0} width={CHART_W + 16} height={H + 22} />
        </clipPath>
      </defs>

      {/* Y-axis grid lines + rate labels */}
      {yLabels.map((tick, i) => (
        <g key={i}>
          <line
            x1={PAD_X - 4}
            y1={tick.y}
            x2={W - 8}
            y2={tick.y}
            stroke="rgba(180,185,200,0.3)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text
            x={PAD_X - 8}
            y={tick.y + 4}
            textAnchor="end"
            fontSize="10"
            fill="rgba(100,110,130,0.65)"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="500"
          >
            {tick.value}
          </text>
        </g>
      ))}

      {/* X-axis date labels */}
      {xLabels.map((lbl, i) => (
        <text
          key={i}
          x={lbl.x}
          y={H + 18}
          textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"}
          fontSize="10"
          fill="rgba(100,110,130,0.55)"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="500"
        >
          {lbl.label}
        </text>
      ))}

      {/* Gradient area fill */}
      <path
        d={chart.areaPath}
        fill={`url(#${gradientId})`}
        clipPath={`url(#${clipId})`}
      />

      {/* Animated stroke line */}
      <path
        ref={pathRef}
        d={chart.linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        clipPath={`url(#${clipId})`}
      />

      {/* Period Low marker (amber dot) */}
      <DotMarker
        cx={coords[minIdx].x}
        cy={coords[minIdx].y}
        color="#f59e0b"
        label={`L ${coords[minIdx].rate.toFixed(4)}`}
        labelAnchor={minIdx < coords.length / 2 ? "start" : "end"}
        labelDy={14}
      />

      {/* Period High marker (trend color dot) */}
      <DotMarker
        cx={coords[maxIdx].x}
        cy={coords[maxIdx].y}
        color={strokeColor}
        label={`H ${coords[maxIdx].rate.toFixed(4)}`}
        labelAnchor={maxIdx < coords.length / 2 ? "start" : "end"}
        labelDy={-8}
      />

      {/* Latest rate live dot */}
      <LiveDot
        cx={coords[latestIdx].x}
        cy={coords[latestIdx].y}
        color={strokeColor}
      />
    </svg>
  )
}
