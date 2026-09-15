import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Lock, Shield, KeyRound } from "lucide"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"

/**
 * SecurityCard — Card for managing password and account security settings.
 */
export default function SecurityCard({ onOpenChangePassword }) {
  return (
    <div
      className="rounded-2xl sm:rounded-3xl p-4 sm:p-6"
      style={{
        background: "var(--neu-bg)",
        boxShadow: "var(--neu-raised-sm)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-brand-600 shrink-0"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-inset-sm)",
            }}
          >
            <MorphIcon icon={Shield} size={18} strokeWidth={2.4} className="text-brand-600" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-neutral-800 tracking-tight">
                Account Security & Password
              </h3>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                Protected
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 truncate sm:whitespace-normal">
              Keep your financial transactions and sensitive account data safe.
            </p>
          </div>
        </div>

        <motion.button
          whileHover={neuButtonHover}
          whileTap={neuButtonTap}
          type="button"
          onClick={onOpenChangePassword}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-700 hover:text-brand-600 transition-all cursor-pointer shrink-0 select-none w-full sm:w-auto"
          style={{
            background: NEU.bg,
            boxShadow: NEU.raisedSm,
          }}
        >
          <MorphIcon icon={KeyRound} size={14} strokeWidth={2.2} />
          <span>Change Password</span>
        </motion.button>
      </div>
    </div>
  )
}
