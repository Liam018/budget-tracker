import { useState } from "react"
import { MorphIcon } from "morphicons/react"
import { Eye, EyeOff } from "lucide"
import { formatCurrency } from "../../services/accountService"
import { triggerHaptic } from "../../lib/haptics"

/**
 * AccountBalance — Displays account balance with privacy peek toggle (show/hide),
 * credit card liability status, and currency formatting.
 */
export default function AccountBalance({
  balance = 0,
  currency = "PHP",
  isCredit = false,
}) {
  const [showBalance, setShowBalance] = useState(true)
  const numBalance = parseFloat(balance) || 0

  const toggleBalance = (e) => {
    e.stopPropagation()
    setShowBalance((prev) => !prev)
    triggerHaptic("light")
  }

  return (
    <div className="text-right shrink-0">
      <div className="flex items-center justify-end gap-1 mb-0.5">
        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
          {isCredit ? "Outstanding" : "Balance"}
        </span>
        <button
          type="button"
          onClick={toggleBalance}
          className="p-0.5 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          title={showBalance ? "Hide balance" : "Show balance"}
          aria-label={showBalance ? "Hide balance" : "Show balance"}
        >
          <MorphIcon
            icon={showBalance ? Eye : EyeOff}
            size={11}
            strokeWidth={2.4}
            spring="snappy"
          />
        </button>
      </div>

      <p
        className={`text-base sm:text-lg font-black tracking-tight font-mono tabular-nums ${
          isCredit
            ? "text-rose-600"
            : numBalance >= 0
            ? "text-neutral-800"
            : "text-rose-600"
        }`}
      >
        {showBalance ? formatCurrency(numBalance, currency) : "••••••••"}
      </p>
    </div>
  )
}
