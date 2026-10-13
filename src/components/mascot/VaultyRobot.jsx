import { useId } from "react"
import "./vaulty.css"

/**
 * VaultyRobot — Standalone 2D Safe-Robot Vector Component
 *
 * High-fidelity vector rendition of Vaulty (the robot only), crafted precisely
 * from the design sheet for clean reuse anywhere across the application:
 * - Rich royal-blue / indigo safe-robot body
 * - Glowing antenna with state-specific pulse waves
 * - Face visor with expressive digital cyber eyes (^ ^, • •, = =, etc.)
 * - Golden belly combination safe dial
 * - Articulated arms (idle, wave, celebrate)
 * - Optional floating 60fps physics animations
 *
 * @param {Object} props
 * @param {"idle"|"celebrate"|"thinking"|"alert"|"wave"} [props.mood="idle"] - Current emotional pose / expression
 * @param {number|string} [props.size=96] - Explicit width and height in px (e.g. 96, 64, 48)
 * @param {boolean} [props.animated=false] - When true, applies smooth floating/pulsing keyframe physics
 * @param {string} [props.className=""] - Additional CSS or Tailwind classes (e.g. "w-16 h-16 hover:scale-105")
 * @param {React.CSSProperties} [props.style] - Custom inline styles
 */
export default function VaultyRobot({
  mood = "idle",
  size = 96,
  animated = false,
  className = "",
  style,
  ...props
}) {
  const rawId = useId()
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "")

  const bodyGradId = `vaultyBodyGrad_${uid}`
  const visorGradId = `vaultyVisorGrad_${uid}`
  const goldGradId = `vaultyGoldGrad_${uid}`
  const cyanGlowId = `cyanGlow_${uid}`
  const alertGlowId = `alertGlow_${uid}`

  // Head tilt for cute lively poses
  const getTilt = () => {
    if (mood === "wave") return "rotate(-4 48 52)"
    if (mood === "thinking") return "rotate(5 48 52)"
    return "rotate(0 48 52)"
  }

  const physicsClass = animated ? `vaulty-physics-${mood}` : ""

  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      className={`select-none overflow-visible ${physicsClass} ${className}`.trim()}
      style={style}
      role="img"
      aria-label={`Kuri mascot (${mood})`}
      {...props}
    >
      <defs>
        {/* Robot Body Rich Indigo Gradient */}
        <linearGradient id={bodyGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3135a5" />
          <stop offset="60%" stopColor="#25278c" />
          <stop offset="100%" stopColor="#1c1d70" />
        </linearGradient>

        {/* Visor Deep Blue Gradient */}
        <linearGradient id={visorGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#101138" />
          <stop offset="100%" stopColor="#16184a" />
        </linearGradient>

        {/* Gold Dial Gradient */}
        <linearGradient id={goldGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Cyan Neon Glow Filter */}
        <filter id={cyanGlowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Amber Alert Glow Filter */}
        <filter id={alertGlowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── Soft Oval Floating Shadow ─────────────────────────────── */}
      <ellipse
        cx="48"
        cy="90"
        rx={mood === "celebrate" ? "18" : "22"}
        ry="4"
        fill="rgba(30, 27, 75, 0.14)"
      />

      {/* ── Main Character Group (with optional tilt & bob) ───────── */}
      <g
        transform={
          mood === "celebrate"
            ? "translate(0, -5)"
            : getTilt()
        }
        className="transition-transform duration-300 ease-out"
      >
        {/* ── Antenna Pulse Waves (Alert & Thinking states) ───────── */}
        {mood === "alert" && (
          <g filter={`url(#${alertGlowId})`}>
            <path
              d="M 40 8 A 9 9 0 0 1 56 8"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path
              d="M 36 4 A 14 14 0 0 1 60 4"
              fill="none"
              stroke="#f97316"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.75"
            />
          </g>
        )}

        {mood === "thinking" && (
          <g filter={`url(#${alertGlowId})`}>
            <path
              d="M 41 8 A 8 8 0 0 1 55 8"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.85"
            />
          </g>
        )}

        {/* ── Antenna Rod & Glowing Top Orb ────────────────────────── */}
        <line
          x1="48"
          y1="19"
          x2="48"
          y2="10"
          stroke="#474ba8"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle
          cx="48"
          cy="9"
          r="4.5"
          fill={mood === "alert" ? "#ef4444" : `url(#${goldGradId})`}
          stroke={mood === "alert" ? "#dc2626" : "#d97706"}
          strokeWidth="1"
        />
        <circle cx="46.5" cy="7.5" r="1.3" fill="#ffffff" opacity="0.8" />

        {/* 22.7.1 Floating 'Zzz' particles from antenna orb during Robotic Yawn */}
        {mood === "yawn" && (
          <g>
            <text x="56" y="7" fill="#67e8f9" fontSize="6" fontWeight="bold" fontFamily="sans-serif">
              z
            </text>
            <text x="62" y="1" fill="#67e8f9" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
              Z
            </text>
          </g>
        )}

        {/* ── Cute Periwinkle Nubby Arms (Positioned by Mood) ──────── */}
        {mood === "celebrate" ? (
          /* Joyful raised arms */
          <g>
            <ellipse
              cx="14"
              cy="34"
              rx="4.8"
              ry="7"
              fill="#bfdbfe"
              stroke="#93c5fd"
              strokeWidth="1"
              transform="rotate(-30 14 34)"
            />
            <ellipse
              cx="82"
              cy="34"
              rx="4.8"
              ry="7"
              fill="#bfdbfe"
              stroke="#93c5fd"
              strokeWidth="1"
              transform="rotate(30 82 34)"
            />
          </g>
        ) : mood === "wave" ? (
          /* Waving right arm */
          <g>
            <ellipse
              cx="15"
              cy="52"
              rx="4.2"
              ry="6.5"
              fill="#bfdbfe"
              stroke="#93c5fd"
              strokeWidth="1"
            />
            <ellipse
              cx="83"
              cy="38"
              rx="4.6"
              ry="7.5"
              fill="#bfdbfe"
              stroke="#93c5fd"
              strokeWidth="1"
              transform="rotate(35 83 38)"
            />
          </g>
        ) : mood === "dial_buff" ? (
          /* Left arm scrubbing gold belly dial */
          <g>
            <ellipse
              cx="40"
              cy="62"
              rx="4.8"
              ry="7"
              fill="#bfdbfe"
              stroke="#93c5fd"
              strokeWidth="1"
              transform="rotate(65 40 62)"
            />
            <ellipse
              cx="81"
              cy="52"
              rx="4.2"
              ry="6.5"
              fill="#bfdbfe"
              stroke="#93c5fd"
              strokeWidth="1"
            />
          </g>
        ) : (
          /* Resting side arms */
          <g>
            <ellipse
              cx="15"
              cy="52"
              rx="4.2"
              ry="6.5"
              fill="#bfdbfe"
              stroke="#93c5fd"
              strokeWidth="1"
            />
            <ellipse
              cx="81"
              cy="52"
              rx="4.2"
              ry="6.5"
              fill="#bfdbfe"
              stroke="#93c5fd"
              strokeWidth="1"
            />
          </g>
        )}

        {/* ── Chubby Safe-Robot Body ───────────────────────────────── */}
        <rect
          x="18"
          y="18"
          width="60"
          height="62"
          rx="18"
          fill={`url(#${bodyGradId})`}
          stroke="#4348c4"
          strokeWidth="3.2"
        />

        {/* Subtle top-left specular highlight curve */}
        <path
          d="M 28 22 Q 48 20 68 22"
          fill="none"
          stroke="#555bd8"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* ── Face Visor Screen ────────────────────────────────────── */}
        <rect
          x="25"
          y="25"
          width="46"
          height="23"
          rx="7.5"
          fill={`url(#${visorGradId})`}
          stroke="#1b1d55"
          strokeWidth="1.5"
        />

        {/* ── Digital Facial Expressions (Based on Reference Sheet) ── */}
        <g filter={`url(#${cyanGlowId})`}>
          {mood === "celebrate" ? (
            /* Joyful Squint Carets (^ ^) */
            <g stroke="#00f0ff" strokeWidth="2.8" strokeLinecap="round" fill="none">
              <path d="M 32 37 Q 37 30 42 37" />
              <path d="M 54 37 Q 59 30 64 37" />
            </g>
          ) : mood === "thinking" ? (
            /* Curious Round Pupils (• •) */
            <g fill="#38bdf8">
              <circle cx="37" cy="36" r="3.2" />
              <circle cx="59" cy="36" r="3.2" />
              {/* Highlight glimmer */}
              <circle cx="36" cy="35" r="1.1" fill="#ffffff" />
              <circle cx="58" cy="35" r="1.1" fill="#ffffff" />
            </g>
          ) : mood === "alert" ? (
            /* Warning / Angry Alert Eyes in Amber Red */
            <g filter={`url(#${alertGlowId})`}>
              <polygon points="32,32 42,37 32,38" fill="#f87171" />
              <polygon points="64,32 54,37 64,38" fill="#f87171" />
            </g>
          ) : mood === "wave" ? (
            /* Playful Wink (^ •) */
            <g>
              <path
                d="M 33 37 Q 37.5 31 42 37"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <circle cx="58" cy="36" r="3.2" fill="#00f0ff" />
              <circle cx="57" cy="35" r="1" fill="#ffffff" />
            </g>
          ) : mood === "yawn" ? (
            /* Sleepy eyelids with cute yawn mouth */
            <g>
              <path
                d="M 33 38 Q 37 42 41 38"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path
                d="M 55 38 Q 59 42 63 38"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <ellipse cx="48" cy="38" rx="2" ry="2.8" fill="#00f0ff" />
            </g>
          ) : (
            /* Idle Horizontal Pill Eyes (= =) */
            <g fill="#00f0ff">
              <rect x="33" y="34.5" width="8.5" height="4.2" rx="2.1" />
              <rect x="54.5" y="34.5" width="8.5" height="4.2" rx="2.1" />
            </g>
          )}
        </g>

        {/* ── Belly Safe Combination Dial ─────────────────────────── */}
        <g transform="translate(48, 62)">
          {/* Gold dial outer bevel */}
          <circle cx="0" cy="0" r="10" fill={`url(#${goldGradId})`} stroke="#b45309" strokeWidth="1" />

          {/* Dark inner dial circle */}
          <circle cx="0" cy="0" r="7.2" fill="#1b1c55" stroke="#252775" strokeWidth="0.8" />

          {/* White crosshairs (4 ticks: 12, 3, 6, 9) */}
          <line x1="0" y1="-7" x2="0" y2="-3.8" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="0" y1="3.8" x2="0" y2="7" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="-7" y1="0" x2="-3.8" y2="0" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="3.8" y1="0" x2="7" y2="0" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />

          {/* Center gold bolt */}
          <circle cx="0" cy="0" r="2.8" fill={`url(#${goldGradId})`} />
          <circle cx="-0.8" cy="-0.8" r="0.8" fill="#ffffff" opacity="0.9" />

          {/* Sparkle star glint during dial buffing */}
          {mood === "dial_buff" && (
            <g transform="translate(8, -8)">
              <polygon points="0,-4 1.2,-1.2 4,0 1.2,1.2 0,4 -1.2,1.2 -4,0 -1.2,-1.2" fill="#ffffff" />
              <circle cx="0" cy="0" r="1" fill="#fde68a" />
            </g>
          )}
        </g>

        {/* ── Floating Gold Coin in Celebrate State ────────────────── */}
        {mood === "celebrate" && (
          <g transform="translate(48, 1) scale(0.95)">
            <circle cx="0" cy="0" r="7.5" fill={`url(#${goldGradId})`} stroke="#b45309" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="5.6" fill="none" stroke="#fde68a" strokeWidth="0.7" opacity="0.8" />
            <text
              x="0"
              y="3.8"
              fill="#78350f"
              fontSize="8"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
            >
              ₱
            </text>
          </g>
        )}
      </g>
    </svg>
  )
}

// Named aliases for convenience and backwards compatibility
export { VaultyRobot as KuriRobot, VaultyRobot as VaultyCuteRobot }
