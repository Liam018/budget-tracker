import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Mail, CheckCircle2, Coins, ChevronDown } from "lucide"
import { CountryFlag } from "../ui"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"

/**
 * ProfileCard — Displays user identity, active session status,
 * and current default app currency with modal trigger.
 */
export default function ProfileCard({
  displayName,
  email,
  initials,
  currentCurrency,
  onOpenCurrencyModal,
}) {
  return (
    <div
      className="rounded-2xl sm:rounded-3xl p-4 sm:p-7"
      style={{
        background: "var(--neu-bg)",
        boxShadow: "var(--neu-raised)",
      }}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
        {/* Avatar matching AppHeader design */}
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-sm sm:shadow-md shrink-0 select-none"
          style={{
            background: "linear-gradient(145deg, #6366f1, #4338ca)",
          }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-neutral-800 tracking-tight">
                {displayName}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5 truncate">
                <MorphIcon icon={Mail} size={13} className="text-neutral-400 shrink-0" strokeWidth={2} />
                <span className="truncate">{email}</span>
              </p>
            </div>

            {/* Status Badge */}
            <div className="self-center sm:self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20">
              <MorphIcon icon={CheckCircle2} size={12} className="text-emerald-600" strokeWidth={2.4} />
              Active Session
            </div>
          </div>

          {/* Default Currency Box */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-neutral-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Default App Currency
              </p>
              <div className="flex items-center gap-2 mt-1">
                <CountryFlag code={currentCurrency.code} size="md" />
                <p className="text-xs sm:text-base font-extrabold text-neutral-800 truncate">
                  {currentCurrency.name} ({currentCurrency.symbol} {currentCurrency.code})
                </p>
              </div>
            </div>

            {/* Change Currency Button (Tactile Pressed Neumorphism) */}
            <motion.button
              whileHover={neuButtonHover}
              whileTap={neuButtonTap}
              onClick={onOpenCurrencyModal}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-brand-600 hover:text-brand-700 transition-all cursor-pointer w-full sm:w-auto shrink-0 select-none"
              style={{
                background: NEU.bg,
                boxShadow: NEU.raisedSm,
              }}
            >
              <MorphIcon icon={Coins} size={14} strokeWidth={2} className="text-brand-600" />
              Change Currency
              {/* <MorphIcon icon={ChevronDown} size={13} strokeWidth={2} className="text-brand-600" /> */}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
