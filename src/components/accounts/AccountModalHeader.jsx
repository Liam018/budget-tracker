import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { X } from "lucide"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"
import { getMorphAccountIcon } from "../../constants/accountConstants"

/**
 * AccountModalHeader — Pinned header for the account creation/editing modal.
 */
export default function AccountModalHeader({
  color,
  icon,
  isEditing,
  activeTab,
  onClose,
}) {
  return (
    <div className="px-5 py-3.5 flex items-center justify-between border-b border-neutral-200/60 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs transition-colors"
          style={{ background: color }}
        >
          <MorphIcon
            icon={getMorphAccountIcon(icon)}
            size={18}
            strokeWidth={2.4}
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-neutral-800 tracking-tight leading-tight truncate">
            {isEditing ? "Edit Account" : "Add New Account"}
          </h3>
          <p className="text-xs text-neutral-400 truncate">
            {isEditing
              ? "Update balance or account details"
              : activeTab === "presets"
              ? "Pick a Philippine institution or customize"
              : "Create a custom account"}
          </p>
        </div>
      </div>

      <motion.button
        whileHover={neuButtonHover}
        whileTap={neuButtonTap}
        onClick={onClose}
        type="button"
        className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer shrink-0 ml-2"
        style={{
          background: NEU.bg,
          boxShadow: NEU.raisedSm,
        }}
        aria-label="Close"
      >
        <MorphIcon icon={X} size={15} strokeWidth={2.4} />
      </motion.button>
    </div>
  )
}
