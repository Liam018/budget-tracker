import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Wallet, Plus, Sparkles } from "lucide"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"

/**
 * AccountEmptyState — Shown when user has no accounts created yet.
 */
export default function AccountEmptyState({ onAddAccount, onSelectQuickPreset }) {
  const quickPicks = [
    { name: "GCash", color: "#007dfe", type: "e_wallet", icon: "Smartphone" },
    { name: "Maya", color: "#16a34a", type: "e_wallet", icon: "Smartphone" },
    { name: "Cash on Hand", color: "#10b981", type: "cash", icon: "Banknote" },
    { name: "BDO", color: "#0033a0", type: "bank", icon: "Building2" },
  ]

  return (
    <div
      className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl text-center flex flex-col items-center justify-center select-none"
      style={{
        background: "var(--neu-bg)",
        boxShadow: "var(--neu-raised)",
      }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-brand-600 mb-4"
        style={{
          background: NEU.bg,
          boxShadow: NEU.insetSm,
        }}
      >
        <MorphIcon icon={Wallet} size={30} strokeWidth={2.2} />
      </div>

      <h3 className="text-base sm:text-lg font-black text-neutral-800 tracking-tight">
        No Accounts Added Yet
      </h3>
      <p className="text-xs text-neutral-400 max-w-sm mt-1 mb-6">
        Add your cash on hand, bank accounts, or Philippine e-wallets to start tracking your net worth and balances.
      </p>

      {/* Primary CTA */}
      <motion.button
        whileHover={neuButtonHover}
        whileTap={neuButtonTap}
        onClick={onAddAccount}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-brand-600 hover:bg-brand-700 shadow-xs cursor-pointer transition-all mb-6"
      >
        <MorphIcon icon={Plus} size={15} strokeWidth={2.6} />
        <span>Add Your First Account</span>
      </motion.button>

      {/* Quick Picks */}
      <div className="pt-4 border-t border-neutral-200/60 w-full max-w-md">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-3">
          Popular Philippine Wallets &amp; Banks
        </span>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {quickPicks.map((pick) => (
            <motion.button
              key={pick.name}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
              onClick={() => onSelectQuickPreset?.(pick)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-700 hover:text-brand-600 transition-colors cursor-pointer"
              style={{
                background: NEU.bg,
                boxShadow: NEU.raisedSm,
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: pick.color }}
              />
              <span>{pick.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
