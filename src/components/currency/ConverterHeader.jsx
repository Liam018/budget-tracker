import { useState } from "react"
import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { TrendingUp, RefreshCw, Check } from "lucide"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"

/**
 * ConverterHeader — Header block for the currency converter card.
 * Features live status indicator and an animated refresh button that
 * performs a full 360° spin before morphing into a success checkmark.
 */
export default function ConverterHeader({ marketStatus, isLoadingRates, onRefresh }) {
  const [refreshState, setRefreshState] = useState("idle") // "idle" | "spinning" | "checked"

  const handleRefreshClick = async () => {
    if (refreshState !== "idle" || isLoadingRates) return
    setRefreshState("spinning")

    try {
      const minSpin = new Promise((resolve) => setTimeout(resolve, 700))
      const refreshCall = Promise.resolve(onRefresh?.())
      await Promise.all([minSpin, refreshCall])
      setRefreshState("checked")
      setTimeout(() => {
        setRefreshState("idle")
      }, 1500)
    } catch {
      setRefreshState("idle")
    }
  }

  const isChecked = refreshState === "checked"
  const isSpinning = refreshState === "spinning"

  return (
    <div className="flex items-center justify-between gap-2.5 mb-4 sm:mb-5">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-brand-600 shrink-0"
          style={{
            background: "var(--neu-bg)",
            boxShadow: "var(--neu-inset-sm)",
          }}
        >
          <MorphIcon
            icon={TrendingUp}
            size={18}
            strokeWidth={2.4}
            className="text-brand-600"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-base font-extrabold text-neutral-800 tracking-tight leading-tight truncate sm:whitespace-normal">
              Currency Converter &amp; Live Rates
            </h3>
            {marketStatus?.isLive && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-neutral-500 font-medium leading-tight truncate sm:whitespace-normal mt-0.5">
            Live exchange rates via Currency API
          </p>
        </div>
      </div>

      {/* Refresh Button (Rotates first, then morphs into Check on success) */}
      <motion.button
        whileHover={isChecked ? {} : neuButtonHover}
        whileTap={isChecked ? {} : neuButtonTap}
        onClick={handleRefreshClick}
        disabled={isSpinning || isLoadingRates}
        title={isChecked ? "Exchange rates updated" : "Refresh exchange rates"}
        aria-label={isChecked ? "Exchange rates updated" : "Refresh exchange rates"}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all select-none shrink-0 ${
          isChecked
            ? "cursor-default text-emerald-600"
            : isSpinning
            ? "cursor-wait text-brand-600"
            : "cursor-pointer text-neutral-500 hover:text-brand-600"
        }`}
        style={{
          background: NEU.bg,
          boxShadow: isChecked ? NEU.insetSm : NEU.raisedSm,
        }}
      >
        <motion.div
          animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
          transition={
            isSpinning
              ? { repeat: Infinity, duration: 0.7, ease: "linear" }
              : { duration: 0 }
          }
          className="flex items-center justify-center"
        >
          <MorphIcon
            icon={isChecked ? Check : RefreshCw}
            size={15}
            strokeWidth={2.4}
            spring="bouncy"
            className={
              isChecked
                ? "text-emerald-600"
                : isSpinning
                ? "text-brand-600"
                : "text-neutral-500"
            }
          />
        </motion.div>
      </motion.button>
    </div>
  )
}
