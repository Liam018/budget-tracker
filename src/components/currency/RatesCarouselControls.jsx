import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import {
  ChevronLeft,
  ChevronRight,
  Rows2,
  StretchHorizontal,
} from "lucide"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"

/**
 * RatesCarouselControls — Control cluster for row layout toggling
 * (1-row vs 2-row) and continuous glide navigation buttons.
 */
export default function RatesCarouselControls({
  isDoubleRow,
  onToggleDoubleRow,
  canScrollLeft,
  canScrollRight,
  onStartScroll,
  onStopScroll,
}) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {/* Double Row Layout Toggle */}
      <motion.button
        whileHover={isDoubleRow ? {} : neuButtonHover}
        whileTap={{ y: 1, boxShadow: isDoubleRow ? NEU.insetSm : NEU.pressed }}
        onClick={onToggleDoubleRow}
        title={isDoubleRow ? "Switch to 1 row" : "Switch to 2 rows"}
        className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center cursor-pointer select-none touch-manipulation transition-[transform,color] ${
          isDoubleRow
            ? "text-brand-600"
            : "text-neutral-500 hover:text-brand-600 active:text-brand-600"
        }`}
        style={{
          background: NEU.bg,
          boxShadow: isDoubleRow ? NEU.insetSm : NEU.raisedSm,
        }}
        aria-label={isDoubleRow ? "Switch to 1 row" : "Switch to 2 rows"}
      >
        <MorphIcon
          icon={isDoubleRow ? Rows2 : StretchHorizontal}
          size={15}
          strokeWidth={2.4}
          spring="bouncy"
          className={isDoubleRow ? "text-brand-600" : "text-neutral-500"}
        />
      </motion.button>

      {/* Left Arrow (Click for step, hold to scroll continuously) */}
      <motion.button
        whileHover={canScrollLeft ? neuButtonHover : {}}
        whileTap={canScrollLeft ? neuButtonTap : {}}
        onPointerDown={() => canScrollLeft && onStartScroll("left")}
        onPointerUp={onStopScroll}
        onPointerLeave={onStopScroll}
        disabled={!canScrollLeft}
        className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-[transform,color,opacity] ${
          canScrollLeft
            ? "text-neutral-500 hover:text-brand-600 active:text-brand-600 cursor-pointer select-none touch-manipulation"
            : "text-neutral-400/70 cursor-not-allowed"
        }`}
        style={{
          background: NEU.bg,
          boxShadow: canScrollLeft ? NEU.raisedSm : NEU.insetSm,
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
        whileHover={canScrollRight ? neuButtonHover : {}}
        whileTap={canScrollRight ? neuButtonTap : {}}
        onPointerDown={() => canScrollRight && onStartScroll("right")}
        onPointerUp={onStopScroll}
        onPointerLeave={onStopScroll}
        disabled={!canScrollRight}
        className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-[transform,color,opacity] ${
          canScrollRight
            ? "text-neutral-500 hover:text-brand-600 active:text-brand-600 cursor-pointer select-none touch-manipulation"
            : "text-neutral-400/70 cursor-not-allowed"
        }`}
        style={{
          background: NEU.bg,
          boxShadow: canScrollRight ? NEU.raisedSm : NEU.insetSm,
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
