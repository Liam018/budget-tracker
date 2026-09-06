import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import {
  ChevronLeft,
  ChevronRight,
  Rows2,
  Rows3,
} from "lucide"
import { NEU } from "../../lib/neu"
import { neuButtonHover } from "../../lib/animations"

/**
 * RatesCarouselControls — Control cluster for row layout toggling
 * (2-row default vs 3-row toggle) and continuous glide navigation buttons.
 *
 * Employs robust explicit pointer tracking with window release fallbacks
 * to ensure long-press and swipe gestures never leave arrow buttons stuck
 * in a pressed state.
 */
export default function RatesCarouselControls({
  isTripleRow = false,
  onToggleTripleRow,
  canScrollLeft,
  canScrollRight,
  onStartScroll,
  onStopScroll,
}) {
  const [activeButton, setActiveButton] = useState(null)

  const isLeftPressed = activeButton === "left"
  const isRightPressed = activeButton === "right"

  // Automatically release press if carousel hits boundary during scroll
  useEffect(() => {
    if (activeButton === "left" && !canScrollLeft) {
      setActiveButton(null)
      onStopScroll()
    } else if (activeButton === "right" && !canScrollRight) {
      setActiveButton(null)
      onStopScroll()
    }
  }, [activeButton, canScrollLeft, canScrollRight, onStopScroll])

  // Stop any ongoing scroll on unmount
  useEffect(() => {
    return () => {
      onStopScroll()
    }
  }, [onStopScroll])

  const handlePointerDown = (direction) => (e) => {
    // Only respond to primary click/tap
    if (e.button !== undefined && e.button !== 0) return
    const canScroll = direction === "left" ? canScrollLeft : canScrollRight
    if (!canScroll) return

    setActiveButton(direction)
    onStartScroll(direction)

    function handleGlobalRelease() {
      setActiveButton(null)
      onStopScroll()
      window.removeEventListener("pointerup", handleGlobalRelease)
      window.removeEventListener("pointercancel", handleGlobalRelease)
    }

    window.addEventListener("pointerup", handleGlobalRelease)
    window.addEventListener("pointercancel", handleGlobalRelease)
  }

  const handlePointerLeave = () => {
    if (activeButton) {
      setActiveButton(null)
      onStopScroll()
    }
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {/* 2-Row vs 3-Row Layout Toggle */}
      <motion.button
        whileHover={isTripleRow ? {} : neuButtonHover}
        whileTap={{ y: 1, boxShadow: isTripleRow ? NEU.insetSm : NEU.pressed }}
        onClick={onToggleTripleRow}
        title={isTripleRow ? "Switch to 2 rows" : "Switch to 3 rows"}
        className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center cursor-pointer select-none touch-manipulation transition-[transform,color] ${
          isTripleRow
            ? "text-brand-600"
            : "text-neutral-500 hover:text-brand-600 active:text-brand-600"
        }`}
        style={{
          background: NEU.bg,
          boxShadow: isTripleRow ? NEU.insetSm : NEU.raisedSm,
        }}
        aria-label={isTripleRow ? "Switch to 2 rows" : "Switch to 3 rows"}
      >
        <MorphIcon
          icon={isTripleRow ? Rows3 : Rows2}
          size={15}
          strokeWidth={2.4}
          spring="bouncy"
          className={isTripleRow ? "text-brand-600" : "text-neutral-500"}
        />
      </motion.button>

      {/* Left Arrow (Click for step, hold to scroll continuously) */}
      <motion.button
        whileHover={canScrollLeft && !isLeftPressed ? neuButtonHover : {}}
        animate={{
          y: isLeftPressed ? 1 : 0,
          boxShadow: isLeftPressed
            ? NEU.pressed
            : canScrollLeft
            ? NEU.raisedSm
            : NEU.insetSm,
        }}
        transition={{ duration: 0.08 }}
        onPointerDown={handlePointerDown("left")}
        onPointerLeave={handlePointerLeave}
        onContextMenu={(e) => e.preventDefault()}
        disabled={!canScrollLeft}
        className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-[color,opacity] ${
          canScrollLeft
            ? "text-neutral-500 hover:text-brand-600 active:text-brand-600 cursor-pointer select-none touch-manipulation"
            : "text-neutral-400/70 cursor-not-allowed"
        }`}
        style={{
          background: NEU.bg,
        }}
        aria-label="Scroll left"
      >
        <MorphIcon
          icon={ChevronLeft}
          size={15}
          strokeWidth={canScrollLeft ? 2.4 : 1.8}
          className={canScrollLeft ? "text-neutral-500" : "text-neutral-400/70"}
        />
      </motion.button>

      {/* Right Arrow (Click for step, hold to scroll continuously) */}
      <motion.button
        whileHover={canScrollRight && !isRightPressed ? neuButtonHover : {}}
        animate={{
          y: isRightPressed ? 1 : 0,
          boxShadow: isRightPressed
            ? NEU.pressed
            : canScrollRight
            ? NEU.raisedSm
            : NEU.insetSm,
        }}
        transition={{ duration: 0.08 }}
        onPointerDown={handlePointerDown("right")}
        onPointerLeave={handlePointerLeave}
        onContextMenu={(e) => e.preventDefault()}
        disabled={!canScrollRight}
        className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-[color,opacity] ${
          canScrollRight
            ? "text-neutral-500 hover:text-brand-600 active:text-brand-600 cursor-pointer select-none touch-manipulation"
            : "text-neutral-400/70 cursor-not-allowed"
        }`}
        style={{
          background: NEU.bg,
        }}
        aria-label="Scroll right"
      >
        <MorphIcon
          icon={ChevronRight}
          size={15}
          strokeWidth={canScrollRight ? 2.4 : 1.8}
          className={canScrollRight ? "text-neutral-500" : "text-neutral-400/70"}
        />
      </motion.button>
    </div>
  )
}
