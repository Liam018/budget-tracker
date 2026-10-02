import { useState } from "react"
import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Copy, Check } from "lucide"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"
import { toast } from "../ui"
import { triggerHaptic } from "../../lib/haptics"

/**
 * AccountNumberPill — Displays masked account number with interactive click-to-copy,
 * or "Not Set" fallback when no account number is configured.
 * Hides completely for Cash and Savings accounts.
 */
export default function AccountNumberPill({
  accountNumber,
  accountType = "bank",
}) {
  const [copied, setCopied] = useState(false)

  // Hide account number midfield row for Cash and Savings accounts
  if (accountType === "cash" || accountType === "savings") {
    return null
  }

  const formattedNumber = accountNumber
    ? accountNumber.length > 4
      ? `•••• •••• •••• ${accountNumber.slice(-4)}`
      : `•••• ${accountNumber}`
    : null

  const handleCopy = async (e) => {
    e.stopPropagation()
    if (copied || !accountNumber) return

    triggerHaptic("success")

    let success = false
    if (navigator?.clipboard?.writeText && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(accountNumber)
        success = true
      } catch {
        // fallback below
      }
    }

    if (!success) {
      try {
        const textarea = document.createElement("textarea")
        textarea.value = accountNumber
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
        success = true
      } catch {
        toast?.error?.("Unable to copy")
        return
      }
    }

    setCopied(true)
    toast?.success?.("Account number copied!")
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="relative z-10 my-3">
      {formattedNumber ? (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-400">
            Account Number
          </span>
          <motion.button
            type="button"
            whileHover={neuButtonHover}
            whileTap={neuButtonTap}
            onClick={handleCopy}
            title="Click to copy account number"
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            style={{
              background: NEU.bg,
              boxShadow: NEU.insetSm,
            }}
          >
            <span className="font-mono text-xs tracking-wider font-bold text-neutral-700 group-hover:text-brand-600">
              {formattedNumber}
            </span>
            <span className="text-neutral-400 group-hover:text-brand-600 transition-colors">
              <MorphIcon
                icon={copied ? Check : Copy}
                size={12}
                strokeWidth={2.4}
                spring="snappy"
                className={copied ? "text-emerald-600" : ""}
              />
            </span>
          </motion.button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 py-0.5">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-400">
            Account Number
          </span>
          <span
            className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-neutral-400 border border-neutral-300/30"
            style={{
              background: NEU.bg,
              boxShadow: NEU.insetSm,
            }}
          >
            Not Set
          </span>
        </div>
      )}
    </div>
  )
}
