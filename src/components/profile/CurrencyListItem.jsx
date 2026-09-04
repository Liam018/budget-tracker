import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Check } from "lucide"
import { CountryFlag } from "../ui"
import { NEU } from "../../lib/neu"
import { neuButtonHover } from "../../lib/animations"

/**
 * CurrencyListItem — Neumorphic Selectable Currency Option Row
 */
export default function CurrencyListItem({
  currency,
  isSelected,
  onSelect,
  disabled,
  index,
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        layout: { type: "spring", stiffness: 400, damping: 32 },
        opacity: { duration: 0.15 },
        y: { duration: 0.18, delay: Math.min(index * 0.018, 0.12) },
      }}
      whileHover={isSelected ? {} : neuButtonHover}
      whileTap={{
        y: 1,
        boxShadow: isSelected ? NEU.insetSm : NEU.pressed,
      }}
      onClick={onSelect}
      disabled={disabled}
      className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-colors cursor-pointer text-left select-none ${
        isSelected
          ? "text-brand-600 font-bold"
          : "text-neutral-700 hover:text-neutral-900"
      }`}
      style={{
        background: NEU.bg,
        boxShadow: isSelected ? NEU.insetSm : NEU.raisedSm,
      }}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <CountryFlag code={currency.code} size="lg" />
        <div className="min-w-0">
          <p className="text-xs font-bold leading-tight truncate">
            {currency.code} — {currency.name}
          </p>
          <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
            Symbol: {currency.symbol}
          </p>
        </div>
      </div>

      {isSelected ? (
        <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <MorphIcon
            icon={Check}
            size={14}
            strokeWidth={2.8}
            className="text-white"
          />
        </div>
      ) : (
        <span className="text-xs font-bold text-neutral-400 pr-1 shrink-0">
          {currency.symbol}
        </span>
      )}
    </motion.button>
  )
}
