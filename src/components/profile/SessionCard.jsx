import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { LogOut } from "lucide"

/**
 * SessionCard — Card for terminating user session with confirmation guard.
 */
export default function SessionCard({ onSignOut }) {
  return (
    <div
      className="rounded-2xl sm:rounded-3xl p-4 sm:p-6"
      style={{
        background: "var(--neu-bg)",
        boxShadow: "var(--neu-raised-sm)",
      }}
    >
      <h3 className="text-xs sm:text-sm font-extrabold text-neutral-800 mb-3 sm:mb-4 uppercase tracking-wider">
        Session Management
      </h3>

      <div className="flex items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-neutral-200/30">
        <div>
          <p className="text-xs sm:text-sm font-bold text-neutral-800">Sign Out</p>
          <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
            Safely terminate your current session on this device.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{
            scale: 0.96,
            boxShadow: "var(--neu-pressed)",
          }}
          onClick={onSignOut}
          className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 transition-all cursor-pointer shrink-0 select-none"
          style={{
            background: "var(--neu-bg)",
            boxShadow: "var(--neu-raised-sm)",
          }}
        >
          <MorphIcon icon={LogOut} size={15} strokeWidth={2} className="text-rose-600" />
          Sign Out
        </motion.button>
      </div>
    </div>
  )
}
