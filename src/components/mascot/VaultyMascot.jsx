import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Sparkles } from "lucide-react"
import { MOOD_DEFAULT_MESSAGES } from "../../constants/vaultyTips"
import VaultyRobot, { VaultyCuteRobot } from "./VaultyRobot"
import "./vaulty.css"

/**
 * VaultyMascot — Interactive 2D Safe-Robot Mascot Widget
 *
 * Full interactive mascot widget featuring:
 * - Dynamic speech bubble with mood indicator and close button
 * - Sprite animation support with fallback to vector VaultyRobot
 * - Floating or inline positioning
 */
export default function VaultyMascot({
  mood = "idle",
  message = null,
  isSpeechOpen = true,
  onCloseSpeech = null,
  onClickMascot = null,
  spriteSrc = "/vaulty-spritesheet.png",
  isFixed = false, // false = inline, true = fixed at bottom: 28px, right: 28px
  className = "",
}) {
  const [loadedSrc, setLoadedSrc] = useState(null)
  const [failedSrc, setFailedSrc] = useState(null)

  const hasImageLoaded = Boolean(spriteSrc && loadedSrc === spriteSrc)
  const hasImageError = Boolean(!spriteSrc || failedSrc === spriteSrc)

  // Verify if spritesheet image exists and loads
  useEffect(() => {
    if (!spriteSrc) return

    let isSubscribed = true
    const img = new Image()
    img.src = spriteSrc
    img.onload = () => {
      if (isSubscribed) setLoadedSrc(spriteSrc)
    }
    img.onerror = () => {
      if (isSubscribed) setFailedSrc(spriteSrc)
    }

    return () => {
      isSubscribed = false
    }
  }, [spriteSrc])

  const activeMessage = message || MOOD_DEFAULT_MESSAGES[mood] || MOOD_DEFAULT_MESSAGES.idle

  return (
    <div
      className={`vaulty-container ${!isFixed ? "vaulty-inline" : ""} ${className}`}
      data-state={mood}
    >
      {/* ── Dynamic Speech Bubble ─────────────────────────────────── */}
      <AnimatePresence>
        {isSpeechOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.92 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="vaulty-bubble"
            role="status"
            aria-live="polite"
          >
            {/* Top row with mood badge and optional close button */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase text-indigo-600">
                <Sparkles className="w-2.5 h-2.5" />
                {mood}
              </span>
              {onCloseSpeech && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseSpeech()
                  }}
                  className="text-neutral-400 hover:text-neutral-700 cursor-pointer p-0.5 rounded transition-colors"
                  aria-label="Close speech bubble"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Bubble message */}
            <p className="m-0 text-left">{activeMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2D Sprite Character Element ───────────────────────────── */}
      <div
        className="vaulty-avatar"
        onClick={onClickMascot}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClickMascot?.()
          }
        }}
        aria-label={`Vaulty the mascot (${mood} mood)`}
        style={{
          backgroundImage: hasImageLoaded && !hasImageError ? `url(${spriteSrc})` : "none",
        }}
      >
        {/* Crisp vector fallback modeled directly from the reference sheet */}
        {(!hasImageLoaded || hasImageError) && (
          <VaultyRobot mood={mood} className="w-full h-full" />
        )}
      </div>
    </div>
  )
}

// Re-export robot component for convenience
export { VaultyRobot, VaultyCuteRobot }

