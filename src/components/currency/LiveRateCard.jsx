import { memo } from "react"
import { motion } from "motion/react"
import { CountryFlag } from "../ui"

/**
 * LiveRateCard — Individual Neumorphic reference card showing
 * live exchange rate for a single foreign currency.
 *
 * Memoized for high performance while staying reactive to row layout changes.
 */
function LiveRateCard({ curr, rate, isTripleRow, index = 0 }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -6 }}
      transition={{
        layout: { type: "spring", stiffness: 420, damping: 32 },
        opacity: { duration: 0.2 },
        scale: { type: "spring", stiffness: 420, damping: 32 },
        y: { type: "spring", stiffness: 420, damping: 32, delay: Math.min(index * 0.015, 0.12) },
      }}
      whileHover={{ y: -2, scale: 1.02 }}
      className="shrink-0 min-w-33 sm:min-w-35"
    >
      <div
        className="w-full h-full p-2.5 rounded-xl text-left select-none"
        style={{
          background: "var(--neu-bg)",
          boxShadow: "var(--neu-raised-sm)",
        }}
      >
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-bold text-neutral-700 flex items-center gap-1.5">
            <CountryFlag code={curr.code} size="sm" />
            <span>{curr.code}</span>
          </span>
          <span className="text-[10px] font-bold text-neutral-400">
            {curr.symbol}
          </span>
        </div>
        <p className="text-xs font-black text-neutral-800 tracking-tight">
          {rate > 100
            ? rate.toFixed(2)
            : rate > 1
            ? rate.toFixed(3)
            : rate.toFixed(4)}{" "}
          <span className="text-[10px] font-bold text-neutral-500">
            {curr.code}
          </span>
        </p>
        <p
          className="text-[10px] text-neutral-400 truncate mt-0.5"
          title={curr.name}
        >
          {curr.name}
        </p>
      </div>
    </motion.div>
  )
}

export default memo(LiveRateCard)
