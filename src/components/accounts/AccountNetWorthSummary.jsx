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
    <motion.div
      layout
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl sm:rounded-3xl relative select-none transform-gpu overflow-hidden ${
        isMinimized ? "group" : ""
      }`}
      style={{
        background: NEU.bg,
        boxShadow: isMinimized ? NEU.insetSm : NEU.raised,
        willChange: "box-shadow, transform",
      }}
    >
      {/* ── Top Header Row (Always Mounted) ── */}
      <div
        onClick={isMinimized ? toggleMinimized : undefined}
        className={`flex items-center justify-between gap-3 p-3 sm:px-6 sm:py-4.5 ${
          isMinimized ? "cursor-pointer" : ""
        }`}
        title={isMinimized ? "Click to expand details" : undefined}
      >
        {/* Brand Icon & Net Worth Title/Preview */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div
            className={`rounded-xl flex items-center justify-center text-brand-600 shrink-0 shadow-xs transition-all duration-200 ${
              isMinimized ? "w-8 h-8" : "w-10 h-10 rounded-2xl"
            }`}
            style={{
              background: NEU.bg,
              boxShadow: isMinimized ? NEU.raisedSm : NEU.insetSm,
            }}
          >
            <TrendingUp size={isMinimized ? 15 : 18} strokeWidth={2.6} />
          </div>

          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 block leading-tight">
              {isMinimized
                ? "Net Worth"
                : `${activeCount} ${activeCount === 1 ? "Active Account" : "Active Accounts"}`}
            </span>
            {isMinimized ? (
              <p className="text-sm sm:text-base font-black text-neutral-800 tracking-tight font-mono tabular-nums truncate group-hover:text-brand-600 transition-colors">
                {showBalance ? formatCurrency(netWorth, currency) : "₱ ••••••••"}
              </p>
            ) : (
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500">
                Total Net Worth
              </h2>
            )}
          </div>
        </div>

        {/* Quick Badges & Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mini Badges shown when minimized */}
          {isMinimized && (
            <>
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
            </>
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

          {/* Minimize / Expand Toggle Button */}
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
            title={isMinimized ? "Expand Net Worth Summary" : "Minimize Summary"}
            aria-label={isMinimized ? "Expand Net Worth Summary" : "Minimize Summary"}
          >
            {isMinimized ? (
              <>
                <span className="hidden xs:inline">Details</span>
                <ChevronDown size={14} strokeWidth={2.6} />
              </>
            ) : (
              <>
                <span className="hidden xs:inline">Minimize</span>
                <ChevronUp size={14} strokeWidth={2.6} />
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* ── Collapsible Body (Smooth Accordion Height & Opacity) ── */}
      <AnimatePresence initial={false}>
        {!isMinimized && (
          <motion.div
            key="expanded-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 sm:px-7 sm:pb-7 pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Middle: Net Worth Large Typography */}
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
    </motion.div>
  )
}
