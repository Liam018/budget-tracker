import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"

const KURI_QUOTES = [
  "I've got an eye on your budget!",
  "Peek-a-boo! No leaks detected.",
  "Smart, not kuripot.",
  "I see you! Let's build your savings.",
  "Safe locked and choices protected.",
  "Guarding cash flow across all your wallets.",
  "Tracking every peso with intention.",
]

export function PeekingKuri({ onPoke, pokePulse = false }) {
  const containerRef = useRef(null)
  const visorRef = useRef(null)

  const [lookOffset, setLookOffset] = useState({ x: 0, y: 0 })
  const [headTilt, setHeadTilt] = useState(0)
  const [antennaWiggle, setAntennaWiggle] = useState(0)
  const [eyeState, setEyeState] = useState("normal") // "normal" | "blink" | "happy"
  const [isDucking, setIsDucking] = useState(false)
  const [bubbleText, setBubbleText] = useState(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const idleTimerRef = useRef(null)
  const blinkTimerRef = useRef(null)
  const bubbleTimerRef = useRef(null)
  const quoteIndexRef = useRef(0)

  // Detect mobile
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // ── 1. Pointer & Touch Tracking ──────────────────────────────────────────
  const handlePointer = useCallback((clientX, clientY) => {
    if (isDucking) return

    setIsInteracting(true)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)

    const rect = visorRef.current?.getBoundingClientRect() || containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = clientX - centerX
    const dy = clientY - centerY

    const dist = Math.hypot(dx, dy)
    const angle = Math.atan2(dy, dx)

    // Clamped eye range inside the canonical visor
    const maxHorizontal = 6.5
    const maxVertical = 4.2

    const norm = Math.min(1, dist / 260)
    const targetX = Math.cos(angle) * maxHorizontal * norm
    const targetY = Math.sin(angle) * maxVertical * norm

    // Subtle head tilt towards cursor
    const targetTilt = Math.max(-3.5, Math.min(3.5, (dx / 320) * 3))

    setLookOffset({ x: targetX, y: targetY })
    setHeadTilt(targetTilt)
    setAntennaWiggle(Math.max(-5, Math.min(5, (dx / 300) * -4)))

    // Reset to idle glance after 2.6s
    idleTimerRef.current = setTimeout(() => {
      setIsInteracting(false)
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        // On mobile, CTAs are directly above Kuri: look up attentively!
        setLookOffset({ x: 0, y: -4 })
        setHeadTilt(0)
        setAntennaWiggle(0)
      } else {
        // On desktop, look towards CTA "Start Tracking Free" on the left
        setLookOffset({ x: -4.8, y: 2.8 })
        setHeadTilt(-2)
        setAntennaWiggle(2)
      }
    }, 2600)
  }, [isDucking])

  useEffect(() => {
    function onMouseMove(e) {
      handlePointer(e.clientX, e.clientY)
    }

    function onTouchMove(e) {
      if (e.touches && e.touches.length > 0) {
        handlePointer(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    function onTouchStart(e) {
      if (e.touches && e.touches.length > 0) {
        handlePointer(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("touchstart", onTouchStart, { passive: true })

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchstart", onTouchStart)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [handlePointer])

  // ── 2. Natural Organic Blinking ──────────────────────────────────────────
  useEffect(() => {
    let timeoutId = null

    function scheduleBlink() {
      const delay = Math.random() * 3200 + 2600
      timeoutId = setTimeout(() => {
        setEyeState("blink")
        setTimeout(() => {
          setEyeState("normal")
          if (Math.random() < 0.25) {
            setTimeout(() => {
              setEyeState("blink")
              setTimeout(() => {
                setEyeState("normal")
                scheduleBlink()
              }, 110)
            }, 120)
          } else {
            scheduleBlink()
          }
        }, 120)
      }, delay)
    }

    scheduleBlink()
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current)
    }
  }, [])

  // ── 3. Tap / Poke Interaction ────────────────────────────────────────────
  function handlePokeKuri() {
    if (onPoke) onPoke()

    setIsDucking(true)
    setEyeState("happy")

    const quote = KURI_QUOTES[quoteIndexRef.current % KURI_QUOTES.length]
    quoteIndexRef.current += 1
    setBubbleText(quote)

    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
    bubbleTimerRef.current = setTimeout(() => {
      setBubbleText(null)
    }, 4200)

    setTimeout(() => {
      setIsDucking(false)
      setTimeout(() => {
        setEyeState("normal")
      }, 1400)
    }, 240)
  }

  useEffect(() => {
    if (pokePulse) {
      handlePokeKuri()
    }
  }, [pokePulse])

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-140 flex flex-col items-center select-none"
    >
      {/* ── Top Floating Speech Bubble (Appears on click/tap) ──────────────── */}
      <div className="min-h-11 flex items-center justify-center w-full px-2 mb-2 z-30 pointer-events-none">
        <AnimatePresence mode="wait">
          {bubbleText && (
            <motion.div
              key="bubble"
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto relative bg-white/95 backdrop-blur-md text-neutral-800 border border-slate-200/90 shadow-[0_12px_32px_rgba(45,46,126,0.14),0_2px_8px_rgba(0,0,0,0.04)] rounded-2xl px-4 py-2 sm:px-5 sm:py-2.5 max-w-xs sm:max-w-sm text-center"
            >
              <p className="text-xs sm:text-[13px] font-semibold tracking-tight text-neutral-800 leading-snug">
                {bubbleText}
              </p>
              {/* Organic curved speech tail */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                <svg
                  width="16"
                  height="8"
                  viewBox="0 0 16 8"
                  fill="none"
                  className="text-white/95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                >
                  <path
                    d="M0 0 C4 0 6 7 8 8 C10 7 12 0 16 0 Z"
                    fill="currentColor"
                  />
                  <path
                    d="M0 0 C4 0 6 7 8 8 C10 7 12 0 16 0"
                    stroke="rgba(226, 232, 240, 0.9)"
                    strokeWidth="0.8"
                    fill="none"
                  />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mascot Stage (Clean floating shelf, no card box) ── */}
      <div
        className="relative w-full max-w-70 xs:max-w-[320px] sm:max-w-95 lg:max-w-115 xl:max-w-120 h-45 xs:h-[205px] sm:h-62.5 lg:h-75 xl:h-80 flex items-end justify-center cursor-pointer group"
        onClick={handlePokeKuri}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handlePokeKuri()
          }
        }}
        title="Click Kuri to play peek-a-boo!"
        aria-label="Interactive Kuri Ro-Vault mascot. Click to play peek-a-boo."
      >
        {/* Soft ambient glow behind Kuri */}
        <div
          className="absolute inset-x-2 bottom-2 h-52 rounded-full pointer-events-none opacity-45 blur-3xl transition-colors duration-500"
          style={{
            background: isInteracting
              ? "radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(192,132,252,0.2) 60%, transparent 80%)"
              : "radial-gradient(circle, rgba(79,70,229,0.22) 0%, transparent 70%)",
          }}
        />

        {/* ── Peeking Mascot Vector (EXACT CANONICAL CANVAS DESIGN) ─────────── */}
        <svg
          viewBox="0 0 260 178"
          className="w-full h-full overflow-visible select-none pointer-events-none"
        >
          <defs>
            {/* Ledge Steel Gradient */}
            <linearGradient id="vaultLedgeSteel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="20%" stopColor="#f1f5f9" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Drop shadow for floating shelf */}
            <filter id="ledgeDropShadow" x="-15%" y="-20%" width="130%" height="200%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.12" />
            </filter>

            {/* Clip path: anything below shelf top line y=150 is hidden */}
            <clipPath id="kuriDividerClip">
              <rect x="-40" y="-60" width="340" height="210" />
            </clipPath>

            {/* Cyan Digital Eyes Glow */}
            <filter id="cyanGlowExact" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Lavender Antenna Orb Glow */}
            <filter id="lavenderGlowExact" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ════════════════════════════════════════════════════════════════
              KURI CHARACTER (EXACT SHAPES & COLORS FROM vaultyEngine.js)
              Clipped at divider line y=150 so he ducks behind it!
          ════════════════════════════════════════════════════════════════ */}
          <g clipPath="url(#kuriDividerClip)">
            <g
              style={{
                transform: `translateY(${isDucking ? 68 : 0}px) rotate(${headTilt}deg)`,
                transformOrigin: "130px 150px",
                transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Antenna Ping Wave */}
              <circle
                cx="130"
                cy="12"
                r="13"
                fill="none"
                stroke="rgba(192, 132, 252, 0.35)"
                strokeWidth="1.5"
                className="animate-ping"
                style={{ transformOrigin: "130px 12px", animationDuration: "2.4s" }}
              />

              {/* Antenna Stalk & Lavender Tip Orb (from vaultyEngine lines 380-410) */}
              <g
                style={{
                  transform: `rotate(${antennaWiggle}deg)`,
                  transformOrigin: "130px 38px",
                  transition: "transform 0.12s ease-out",
                }}
              >
                <line
                  x1="130"
                  y1="38"
                  x2="130"
                  y2="15"
                  stroke="#1d1f70"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />
                {/* Lavender / Purple Antenna Tip Orb */}
                <circle
                  cx="130"
                  cy="12"
                  r="9.5"
                  fill="#c084fc"
                  stroke="#7e22ce"
                  strokeWidth="1.2"
                  filter="url(#lavenderGlowExact)"
                />
                <circle cx="127.5" cy="9.5" r="2.5" fill="#ffffff" opacity="0.85" />
              </g>

              {/* ── 1. Main Safe Body (vaultyEngine lines 277-290: bW:68, bH:64, radius:18) ── */}
              <rect
                x="48.4"
                y="38.2"
                width="163.2"
                height="153.6"
                rx="43.2"
                fill="#2e329d"
                stroke="#1d1f70"
                strokeWidth="7"
              />

              {/* ── 2. Inner Safe Door Panel (vaultyEngine lines 292-296: innerSafeBg: #242784) ── */}
              <rect
                x="60.4"
                y="50.2"
                width="139.2"
                height="129.6"
                rx="28.8"
                fill="#242784"
              />

              {/* ── 3. Four Soft Lilac Rivets (vaultyEngine lines 298-309: softLilac: #bfdbfe) ── */}
              {/* Top-Left Rivet */}
              <circle cx="70" cy="59.8" r="6" fill="#bfdbfe" />
              {/* Top-Right Rivet */}
              <circle cx="190" cy="59.8" r="6" fill="#bfdbfe" />
              {/* Bottom-Left Rivet */}
              <circle cx="70" cy="170.2" r="6" fill="#bfdbfe" />
              {/* Bottom-Right Rivet */}
              <circle cx="190" cy="170.2" r="6" fill="#bfdbfe" />

              {/* ── 4. LED Screen Visor (vaultyEngine lines 366-378: 46x18, rx:7) ── */}
              <g ref={visorRef}>
                <rect
                  x="74.8"
                  y="59.8"
                  width="110.4"
                  height="43.2"
                  rx="16.8"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="3.6"
                />

                {/* ── 5. Cyan Eyes (vaultyEngine lines 437-446: eyeCyan: #00f0ff) ── */}
                <g filter="url(#cyanGlowExact)">
                  {eyeState === "happy" ? (
                    /* Joyful Upward Curved Carets (^ ^) */
                    <g stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" fill="none">
                      <path d="M 96.4 86.8 L 106 72.4 L 115.6 86.8" />
                      <path d="M 144.4 86.8 L 154 72.4 L 163.6 86.8" />
                    </g>
                  ) : eyeState === "blink" ? (
                    /* Closed Happy Arc Blink (vaultyEngine lines 458-468) */
                    <g stroke="#00f0ff" strokeWidth="4.2" strokeLinecap="round" fill="none">
                      <path d="M 96 83 Q 106 91 116 83" />
                      <path d="M 144 83 Q 154 91 164 83" />
                    </g>
                  ) : (
                    /* Dynamic Eye Pupils Tracking Cursor/Touch */
                    <g
                      style={{
                        transform: `translate(${lookOffset.x}px, ${lookOffset.y}px)`,
                        transition: "transform 0.08s ease-out",
                      }}
                    >
                      {/* Left Eye */}
                      <ellipse
                        cx="106"
                        cy="81.4"
                        rx="9.6"
                        ry="12"
                        fill="#00f0ff"
                      />
                      {/* Right Eye */}
                      <ellipse
                        cx="154"
                        cy="81.4"
                        rx="9.6"
                        ry="12"
                        fill="#00f0ff"
                      />

                      {/* Specular White Glints (vaultyEngine lines 480-486) */}
                      <circle cx="102.4" cy="77" r="2.8" fill="#ffffff" />
                      <circle cx="150.4" cy="77" r="2.8" fill="#ffffff" />
                    </g>
                  )}
                </g>
              </g>
https://127.0.0.1:51190/static/artifacts/080768f0-4f78-47b7-bdb6-4f0acc76b318/.user_uploaded/media_1792113877336.png?csrf=497ab5c5-b6f4-43e3-90a1-02d64ab9091c
              {/* ── 6. Safe Center Dial (vaultyEngine lines 312-342: goldAccent: #fbbf24) ── */}
              <g transform="translate(130, 139)">
                {/* Outer dial circle */}
                <circle
                  cx="0"
                  cy="0"
                  r="26.4"
                  fill="#17184a"
                  stroke="#f59e0b"
                  strokeWidth="4.8"
                />

                {/* Gold dial center handle */}
                <circle
                  cx="0"
                  cy="0"
                  r="9.6"
                  fill="#fbbf24"
                />

                {/* 4 White dial spokes */}
                <line x1="0" y1="-26.4" x2="0" y2="-16.8" stroke="#ffffff" strokeWidth="3.8" strokeLinecap="round" />
                <line x1="0" y1="16.8" x2="0" y2="26.4" stroke="#ffffff" strokeWidth="3.8" strokeLinecap="round" />
                <line x1="-26.4" y1="0" x2="-16.8" y2="0" stroke="#ffffff" strokeWidth="3.8" strokeLinecap="round" />
                <line x1="16.8" y1="0" x2="26.4" y2="0" stroke="#ffffff" strokeWidth="3.8" strokeLinecap="round" />
              </g>
            </g>
          </g>

          {/* ════════════════════════════════════════════════════════════════
              FLOATING VAULT LEDGE (Brushed steel shelf Kuri grips and peeks over)
          ════════════════════════════════════════════════════════════════ */}
          <g filter="url(#ledgeDropShadow)">
            {/* Shelf Body */}
            <rect
              x="18"
              y="148"
              width="224"
              height="22"
              rx="11"
              fill="url(#vaultLedgeSteel)"
              stroke="#94a3b8"
              strokeWidth="1.6"
            />
            {/* Top Bevel Highlight Rim */}
            <path
              d="M 28 150 L 232 150"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Brushed Accent Line */}
            <line
              x1="32"
              y1="160"
              x2="228"
              y2="160"
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="5 3"
            />
            {/* Left & Right Hex Safe Bolts */}
            <circle cx="36" cy="159" r="3.4" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
            <circle cx="36" cy="159" r="1.3" fill="#e2e8f0" />
            <circle cx="224" cy="159" r="3.4" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
            <circle cx="224" cy="159" r="1.3" fill="#e2e8f0" />
          </g>

          {/* ════════════════════════════════════════════════════════════════
              CANONICAL SOFT LILAC PAWS (vaultyEngine softLilac: #bfdbfe)
              Gripping firmly over the section divider line!
          ════════════════════════════════════════════════════════════════ */}
          <g
            style={{
              transform: `translateY(${isDucking ? 20 : 0}px)`,
              transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Left Paw (Soft Lilac Pill) */}
            <ellipse
              cx="86"
              cy="146"
              rx="14"
              ry="9.6"
              fill="#bfdbfe"
              stroke="#1d1f70"
              strokeWidth="2.2"
            />
            <ellipse
              cx="84.5"
              cy="144"
              rx="8"
              ry="4"
              fill="#ffffff"
              opacity="0.6"
            />

            {/* Right Paw (Soft Lilac Pill) */}
            <ellipse
              cx="174"
              cy="146"
              rx="14"
              ry="9.6"
              fill="#bfdbfe"
              stroke="#1d1f70"
              strokeWidth="2.2"
            />
            <ellipse
              cx="172.5"
              cy="144"
              rx="8"
              ry="4"
              fill="#ffffff"
              opacity="0.6"
            />
          </g>
        </svg>
      </div>
    </div>
  )
}
export default PeekingKuri
