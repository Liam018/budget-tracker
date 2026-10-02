import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Eye, EyeOff } from "lucide"
import {
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
} from "lucide-react"
import { formatCurrency } from "../../services/accountService"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"
import { triggerHaptic } from "../../lib/haptics"

const STORAGE_KEY_MINIMIZED = "bt_accounts_networth_minimized"
const STORAGE_KEY_PRIVACY = "bt_accounts_networth_show"

/**
 * AccountNetWorthSummary — Neumorphic hero card summarizing
 * total net worth, assets, and liabilities.
 *
 * Supports collapsible minimize state and privacy peek toggle.
 */
export default function AccountNetWorthSummary({
  metrics = {},
  currency = "PHP",
}) {
  const {
    netWorth = 0,
    totalAssets = 0,
    totalLiabilities = 0,
    activeCount = 0,
  } = metrics

  // Minimized state with localStorage persistence
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(STORAGE_KEY_MINIMIZED) === "true"
  })

  // Privacy peek state with localStorage persistence
  const [showBalance, setShowBalance] = useState(() => {
    if (typeof window === "undefined") return true
    return localStorage.getItem(STORAGE_KEY_PRIVACY) !== "false"
  })

  const toggleMinimized = () => {
    setIsMinimized((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY_MINIMIZED, String(next))
      return next
    })
    triggerHaptic("light")
  }

  const toggleShowBalance = () => {
    setShowBalance((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY_PRIVACY, String(next))
      return next
    })
    triggerHaptic("light")
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isMinimized ? (
        /* ── MINIMIZED STRIP PILL (~52px) ── */
        <motion.div
          key="minimized-strip"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={toggleMinimized}
          className="rounded-2xl sm:rounded-3xl p-2.5 sm:px-5 sm:py-3 flex items-center justify-between gap-3 cursor-pointer group select-none transform-gpu"
          style={{
            background: NEU.bg,
            boxShadow: NEU.insetSm,
            willChange: "transform, opacity",
          }}
          title="Click to expand details"
        >
          {/* Net Worth Teaser with Brand Icon */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-brand-600 shrink-0 shadow-xs"
              style={{
                background: NEU.bg,
                boxShadow: NEU.raisedSm,
              }}
            >
              <TrendingUp size={15} strokeWidth={2.6} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 block leading-tight">
                Net Worth
              </span>
              <p className="text-sm sm:text-base font-black text-neutral-800 tracking-tight font-mono tabular-nums truncate group-hover:text-brand-600 transition-colors">
                {showBalance ? formatCurrency(netWorth, currency) : "₱ ••••••••"}
              </p>
            </div>
          </div>

          {/* Quick Badges & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mini Assets Badge */}
            <div
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-600 font-mono"
              style={{
                background: NEU.bg,
                boxShadow: NEU.raisedSm,
              }}
            >
              <ArrowUpRight size={12} strokeWidth={2.6} />
              <span>{showBalance ? formatCurrency(totalAssets, currency) : "••••"}</span>
            </div>

            {/* Mini Liabilities Badge */}
            {totalLiabilities > 0 && (
              <div
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-rose-600 font-mono"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.raisedSm,
                }}
              >
                <ArrowDownRight size={12} strokeWidth={2.6} />
                <span>
                  {showBalance ? formatCurrency(totalLiabilities, currency) : "••••"}
                </span>
              </div>
            )}

            {/* Privacy Peek Button */}
            <motion.button
              whileHover={neuButtonHover}
              whileTap={neuButtonTap}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggleShowBalance()
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              style={{
                background: NEU.bg,
                boxShadow: NEU.raisedSm,
              }}
              title={showBalance ? "Hide balance" : "Show balance"}
              aria-label={showBalance ? "Hide balance" : "Show balance"}
            >
              <MorphIcon
                icon={showBalance ? Eye : EyeOff}
                size={14}
                strokeWidth={2.4}
                spring="snappy"
              />
            </motion.button>

            {/* Expand Button */}
            <motion.button
              whileHover={neuButtonHover}
              whileTap={neuButtonTap}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggleMinimized()
              }}
              className="inline-flex items-center gap-1 px-3 h-8 rounded-xl text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
              style={{
                background: NEU.bg,
                boxShadow: NEU.raisedSm,
              }}
              title="Expand Net Worth Summary"
              aria-label="Expand Net Worth Summary"
            >
              <span className="hidden xs:inline">Details</span>
              <ChevronDown size={14} strokeWidth={2.6} />
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* ── EXPANDED FULL HERO CARD ── */
        <motion.div
          key="expanded-card"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative select-none space-y-5 transform-gpu"
          style={{
            background: NEU.bg,
            boxShadow: NEU.raised,
            willChange: "transform, opacity",
          }}
        >
          {/* Top Row: Meta Badge, Title, and Action Controls */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-brand-600 shrink-0 shadow-xs"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.insetSm,
                }}
              >
                <TrendingUp size={18} strokeWidth={2.6} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-medium text-neutral-400">
                    {activeCount} {activeCount === 1 ? "Active Account" : "Active Accounts"}
                  </span>
                </div>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500">
                  Total Net Worth
                </h2>
              </div>
            </div>

            {/* Action Buttons: Privacy Peek & Minimize */}
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={neuButtonHover}
                whileTap={neuButtonTap}
                type="button"
                onClick={toggleShowBalance}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.raisedSm,
                }}
                title={showBalance ? "Hide balance" : "Show balance"}
                aria-label={showBalance ? "Hide balance" : "Show balance"}
              >
                <MorphIcon
                  icon={showBalance ? Eye : EyeOff}
                  size={14}
                  strokeWidth={2.4}
                  spring="snappy"
                />
              </motion.button>

              <motion.button
                whileHover={neuButtonHover}
                whileTap={neuButtonTap}
                type="button"
                onClick={toggleMinimized}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.raisedSm,
                }}
                title="Minimize Summary"
                aria-label="Minimize Summary"
              >
                <ChevronUp size={15} strokeWidth={2.6} />
              </motion.button>
            </div>
          </div>

          {/* Middle: Net Worth Typography & Breakdown Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <h1 className="text-3xl sm:text-4xl font-black text-neutral-800 tracking-tight font-mono tabular-nums">
                {showBalance ? formatCurrency(netWorth, currency) : "₱ ••••••••••"}
              </h1>
              <span className="text-xs font-bold text-neutral-400 font-sans">
                {currency}
              </span>
            </div>

            {/* Breakdown Pills (Assets vs Liabilities) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full md:w-auto">
              {/* Total Assets */}
              <div
                className="p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 min-w-36 sm:min-w-44"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.insetSm,
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                  <ArrowUpRight size={16} strokeWidth={2.6} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Total Assets
                  </p>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-600 tracking-tight truncate font-mono tabular-nums">
                    {showBalance ? formatCurrency(totalAssets, currency) : "••••••••"}
                  </p>
                </div>
              </div>

              {/* Total Liabilities */}
              <div
                className="p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 min-w-36 sm:min-w-44"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.insetSm,
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
                  <ArrowDownRight size={16} strokeWidth={2.6} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Liabilities
                  </p>
                  <p className="text-sm sm:text-base font-extrabold text-rose-600 tracking-tight truncate font-mono tabular-nums">
                    {showBalance ? formatCurrency(totalLiabilities, currency) : "••••••••"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
