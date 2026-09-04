import { motion } from "motion/react"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"

const QUICK_DELTAS = [10, 50, 100, 500, 1000]

/**
 * CurrencyQuickAmounts — Tactile Neumorphic Quick Amount Pills
 * Allows one-tap incrementing and reset of the conversion amount.
 */
export default function CurrencyQuickAmounts({ onAddAmount, onClearAmount, currentAmount }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-2 select-none">
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mr-0.5">
        Quick:
      </span>
      {QUICK_DELTAS.map((delta) => (
        <motion.button
          key={delta}
          type="button"
          whileHover={neuButtonHover}
          whileTap={neuButtonTap}
          onClick={() => onAddAmount(delta)}
          className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-neutral-600 hover:text-brand-600 transition-colors cursor-pointer shrink-0"
          style={{
            background: NEU.bg,
            boxShadow: NEU.raisedSm,
          }}
        >
          +{delta >= 1000 ? `${delta / 1000}k` : delta}
        </motion.button>
      ))}

      {parseFloat(currentAmount) > 0 && (
        <motion.button
          type="button"
          whileHover={neuButtonHover}
          whileTap={neuButtonTap}
          onClick={onClearAmount}
          className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer shrink-0 ml-1"
          style={{
            background: NEU.bg,
            boxShadow: NEU.raisedSm,
          }}
        >
          Clear
        </motion.button>
      )}
    </div>
  )
}
