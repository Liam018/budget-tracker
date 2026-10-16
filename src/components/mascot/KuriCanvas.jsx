import { useEffect, useRef } from "react"
import {
  FRAME_SIZE,
  FRAMES_PER_ANIMATION,
  ANIM_CONFIGS,
  renderVaultyFrame,
} from "./vaultyEngine"
import "./vaulty.css"

/**
 * KuriCanvas — High-DPI Retina-Ready Procedural 2D Animated Mascot Display
 *
 * Renders the procedural canvas animation engine with full anti-aliasing & Retina support:
 * - High-DPI scaling via window.devicePixelRatio (at least 2x resolution buffer)
 * - Anti-aliased vector rendering (no pixelation or blurriness)
 * - 4-frame procedural micro-animations from vaultyEngine.js
 * - Standalone 60 FPS CSS keyframe physics (vaulty-physics-{mood})
 * - Optional radial aura ambient glow (.mascot-ambient)
 *
 * @param {Object} props
 * @param {"idle"|"celebrate"|"thinking"|"alert"|"wave"|"yawn"|"dial_buff"} [props.mood="idle"]
 * @param {number} [props.size=96] - Render size in CSS px
 * @param {boolean} [props.animated=true]
 * @param {boolean} [props.showAura=false]
 * @param {Object} [props.renderOptions=null] - Dynamic idle enhancements (eyeOverride, tilt, etc.)
 * @param {string} [props.className=""]
 * @param {React.CSSProperties} [props.style]
 */
export default function KuriCanvas({
  mood = "idle",
  size = 96,
  animated = true,
  showAura = false,
  renderOptions = null,
  className = "",
  style,
  ...props
}) {
  const canvasRef = useRef(null)
  const animFrameIdRef = useRef(null)
  const lastTimeRef = useRef(0)
  const frameIdxRef = useRef(0)
  const moodRef = useRef(mood)
  const renderOptionsRef = useRef(renderOptions)

  useEffect(() => {
    moodRef.current = mood
    frameIdxRef.current = 0
  }, [mood])

  useEffect(() => {
    renderOptionsRef.current = renderOptions
  }, [renderOptions])

  const config = ANIM_CONFIGS[mood] || ANIM_CONFIGS.idle
  const fps = config.speed || 4

  // Calculate High-DPI pixel dimensions (at least 2x for Retina screens)
  const dpr = typeof window !== "undefined" ? Math.max(window.devicePixelRatio || 1, 2) : 2
  const pixelWidth = Math.round(size * dpr)
  const pixelHeight = Math.round(size * dpr)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let isMounted = true

    // Scaling ratio from 128 virtual units to full physical pixel buffer
    const scale = (size * dpr) / FRAME_SIZE

    const drawFrame = (colIdx, rIdx) => {
      ctx.save()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.scale(scale, scale)
      renderVaultyFrame(ctx, colIdx, rIdx, 0, 0, renderOptionsRef.current || {})
      ctx.restore()
    }

    // Static frame if animation is disabled
    if (!animated) {
      const rIdx = (ANIM_CONFIGS[moodRef.current] || ANIM_CONFIGS.idle).rowIndex
      drawFrame(0, rIdx)
      return
    }

    const frameInterval = 1000 / fps
    lastTimeRef.current = performance.now()

    const loop = (timestamp) => {
      if (!isMounted) return

      const elapsed = timestamp - lastTimeRef.current
      if (elapsed >= frameInterval) {
        lastTimeRef.current = timestamp - (elapsed % frameInterval)
        frameIdxRef.current = (frameIdxRef.current + 1) % FRAMES_PER_ANIMATION

        const currentMood = moodRef.current
        const rIdx = (ANIM_CONFIGS[currentMood] || ANIM_CONFIGS.idle).rowIndex
        drawFrame(frameIdxRef.current, rIdx)
      }

      animFrameIdRef.current = requestAnimationFrame(loop)
    }

    // Initial first frame draw immediately
    const rIdx = (ANIM_CONFIGS[moodRef.current] || ANIM_CONFIGS.idle).rowIndex
    drawFrame(0, rIdx)

    animFrameIdRef.current = requestAnimationFrame(loop)

    return () => {
      isMounted = false
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current)
      }
    }
  }, [mood, fps, animated, size, dpr])

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{
        width: size,
        height: size,
        ...style,
      }}
      role="img"
      aria-label={`Kuri the Ro-Vault mascot (${mood})`}
      {...props}
    >
      {/* Optional ambient glowing radial aura */}
      {showAura && (
        <div className={`mascot-ambient ${config.aura || "idle"}`} />
      )}

      {/* High-DPI Anti-Aliased Canvas with 60 FPS CSS physics */}
      <canvas
        ref={canvasRef}
        width={pixelWidth}
        height={pixelHeight}
        style={{
          width: "100%",
          height: "100%",
        }}
        className={`w-full h-full vaulty-physics-${mood} transition-transform duration-300 pointer-events-none`}
      />
    </div>
  )
}
