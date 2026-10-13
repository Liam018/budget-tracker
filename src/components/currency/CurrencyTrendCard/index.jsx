import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { TrendingUp, TrendingDown } from "lucide"
import { LineChart } from "lucide-react"
import useCurrencyHistory from "../../../hooks/useCurrencyHistory"
import { NEU } from "../../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../../lib/animations"
import { buildChartPaths } from "./chartUtils"
import { SparklineChart } from "./SparklineChart"

// Amicro design-system motion easing
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1]

/**
 * CurrencyTrendCard — Historical Forex Trend Sparkline (7D / 30D)
 *
 * Fetches ECB-backed time-series data via useCurrencyHistory and renders
 * a smooth monotone-cubic SVG sparkline with animated path drawing,
 * annotated min/max/latest dot markers, and Y/X axis labels.
 *
 * Design system: amicro-design-system
 *  - Motion physics [0.16, 1, 0.3, 1] throughout
 *  - Island-style rounded-full timeframe pill selector
 *  - AnimatePresence mode="wait" for loading ↔ data ↔ error transitions
 *  - Neumorphic inset/raised surfaces via NEU tokens
 */
export default function CurrencyTrendCard({ fromCurrency, toCurrency }) {
  const [timeframe, setTimeframe] = useState(30) // 7 | 30

  const { historyData, isLoading, hasError } = useCurrencyHistory(
    fromCurrency,
    toCurrency,
    timeframe
  )

  const chart = useMemo(() => buildChartPaths(historyData), [historyData])

  if (fromCurrency === toCurrency) return null

  const isUp = (historyData?.changePct || 0) >= 0
  // Unique key drives chart re-animation on every timeframe / pair change
  const animKey = `${fromCurrency}-${toCurrency}-${timeframe}-${historyData?.points?.length ?? 0}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
      className="p-4 sm:p-6 rounded-3xl"
      style={{ background: NEU.bg, boxShadow: NEU.raisedSm }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: NEU.bg, boxShadow: NEU.insetSm }}
          >
            <LineChart size={16} strokeWidth={2.4} className="text-brand-600" />
          </div>
          <div>
            <h3 className="text-xs sm:text-base font-extrabold text-neutral-800 tracking-tight leading-tight">
              {fromCurrency}/{toCurrency} Historical Trend
            </h3>
            <p className="text-[10px] sm:text-xs text-neutral-500 font-medium leading-tight mt-0.5">
              ECB market movements · past {timeframe} days
            </p>
          </div>
        </div>

        {/* ── Amicro Island Pill Timeframe Selector ── */}
        <div
          className="flex items-center p-1 rounded-full gap-0.5 shrink-0"
          style={{ background: NEU.bg, boxShadow: NEU.insetSm }}
        >
          {[7, 30].map((days) => {
            const isSelected = timeframe === days
            return (
              <motion.button
                key={days}
                type="button"
                whileHover={isSelected ? {} : neuButtonHover}
                whileTap={isSelected ? {} : neuButtonTap}
                onClick={() => setTimeframe(days)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors duration-200 cursor-pointer select-none ${
                  isSelected ? "text-neutral-800" : "text-neutral-400 hover:text-neutral-600"
                }`}
                style={{
                  background: isSelected ? NEU.bg : "transparent",
                  boxShadow: isSelected ? NEU.raisedSm : "none",
                }}
              >
                {days}D
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Content — AnimatePresence for smooth state transitions ── */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-44 rounded-2xl flex items-center justify-center text-xs text-neutral-400 font-medium"
            style={{ background: NEU.bg, boxShadow: NEU.insetSm }}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span>Fetching ECB trend data…</span>
            </div>
          </motion.div>
        ) : hasError || !historyData ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-28 rounded-2xl flex items-center justify-center text-xs text-neutral-400 font-medium text-center p-4"
            style={{ background: NEU.bg, boxShadow: NEU.insetSm }}
          >
            <span>
              Historical ECB time-series is unavailable for {fromCurrency}/{toCurrency}.
              Live rates remain active.
            </span>
          </motion.div>
        ) : (
          <motion.div
            key={`data-${timeframe}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.26, ease: EASE_OUT_EXPO }}
            className="space-y-3"
          >
            {/* ── Stat Badges ── */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Change % badge */}
              <motion.span
                key={`pct-${animKey}`}
                initial={{ opacity: 0, scale: 0.88, x: -6 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                  isUp ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                }`}
              >
                <MorphIcon
                  icon={isUp ? TrendingUp : TrendingDown}
                  size={13}
                  strokeWidth={2.6}
                  spring="snappy"
                  className={isUp ? "text-emerald-600" : "text-rose-600"}
                />
                {isUp ? "+" : ""}
                {historyData.changePct.toFixed(2)}%
              </motion.span>

              {/* Low / High inset badges */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold text-amber-600"
                  style={{ background: NEU.bg, boxShadow: NEU.insetSm }}
                >
                  <span className="text-neutral-400 font-medium">L</span>
                  {historyData.minRate.toFixed(4)}
                </span>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold text-neutral-700"
                  style={{ background: NEU.bg, boxShadow: NEU.insetSm }}
                >
                  <span className="text-neutral-400 font-medium">H</span>
                  {historyData.maxRate.toFixed(4)}
                </span>
              </div>
            </div>

            {/* ── Chart Stage ── */}
            {chart && (
              <motion.div
                key={`chart-${animKey}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
                className="px-3 pt-3 pb-1 rounded-2xl overflow-hidden"
                style={{ background: NEU.bg, boxShadow: NEU.insetSm }}
              >
                <SparklineChart chart={chart} isUp={isUp} animKey={animKey} />
              </motion.div>
            )}

            {/* ── Footer ── */}
            <p className="text-[10px] text-neutral-400 font-medium text-right px-1">
              Source: ECB via Frankfurter API
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
