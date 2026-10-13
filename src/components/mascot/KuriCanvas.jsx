import { useEffect, useRef } from "react"
import {
  FRAME_SIZE,
  FRAMES_PER_ANIMATION,
  ANIM_CONFIGS,
  renderVaultyFrame,
} from "./vaultyEngine"
import "./vaulty.css"

/**
 * KuriCanvas — Pixel-perfect Procedural 2D Animated Mascot Display
 *
 * Renders the exact procedural canvas animation engine featured in MascotPreviewPage:
 * - 4-frame procedural micro-animations from vaultyEngine.js
 * - Solid indigo steel body, soft lilac safe corner rivets, gold combination dial
 * - Visor with glowing digital cyber eyes & antenna with inertia physics
 * - Standalone 60 FPS CSS keyframe physics (vaulty-physics-{mood})
 * - Optional radial aura ambient glow (.mascot-ambient)
 *
 * @param {Object} props
 * @param {"idle"|"celebrate"|"thinking"|"alert"|"wave"|"yawn"|"dial_buff"} [props.mood="idle"]
 * @param {number} [props.size=96] - Render size in px (canvas is 128x128 internally and scales crisply)
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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")

    let isMounted = true

    // Static frame if animation is disabled
    if (!animated) {
      ctx.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE)
      const rIdx = (ANIM_CONFIGS[moodRef.current] || ANIM_CONFIGS.idle).rowIndex
      renderVaultyFrame(ctx, 0, rIdx, 0, 0, renderOptionsRef.current || {})
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

        ctx.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE)
        renderVaultyFrame(
          ctx,
          frameIdxRef.current,
          rIdx,
          0,
          0,
          renderOptionsRef.current || {}
        )
      }

      animFrameIdRef.current = requestAnimationFrame(loop)
    }

    // Initial first frame draw immediately
    const rIdx = (ANIM_CONFIGS[moodRef.current] || ANIM_CONFIGS.idle).rowIndex
    ctx.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE)
    renderVaultyFrame(ctx, 0, rIdx, 0, 0, renderOptionsRef.current || {})

    animFrameIdRef.current = requestAnimationFrame(loop)

    return () => {
      isMounted = false
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current)
      }
    }
  }, [mood, fps, animated])

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

      {/* Procedural 128x128 Canvas with 60 FPS physics */}
      <canvas
        ref={canvasRef}
        width={FRAME_SIZE}
        height={FRAME_SIZE}
        style={{
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
        }}
        className={`w-full h-full vaulty-physics-${mood} transition-transform duration-300 pointer-events-none`}
      />
    </div>
  )
}
