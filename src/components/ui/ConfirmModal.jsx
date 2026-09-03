import { useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Trash2, AlertTriangle, AlertCircle, HelpCircle, X } from "lucide-react"

/**
 * ConfirmModal — Tactile Neumorphic Confirmation Dialog.
 *
 * Features:
 * - Recessed icon cavity (boxShadow: var(--neu-inset-sm)).
 * - Floating Neumorphic surface (boxShadow: var(--neu-raised)).
 * - Tactile buttons with press depression (var(--neu-pressed)).
 * - Keyboard listeners: Escape to cancel, Enter to confirm.
 */
export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // 'danger' | 'warning' | 'info'
  onConfirm,
  onCancel,
}) {
  // Handle keyboard shortcuts (Escape to cancel, Enter to confirm)
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault()
        onCancel?.()
      } else if (e.key === "Enter") {
        e.preventDefault()
        onConfirm?.()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onConfirm, onCancel])

  const iconConfig = {
    danger: {
      icon: Trash2,
      color: "text-rose-600",
      confirmBtn:
        "bg-linear-to-br from-rose-500 to-rose-600 text-white shadow-sm hover:from-rose-600 hover:to-rose-700 active:shadow-inner",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-600",
      confirmBtn:
        "bg-linear-to-br from-amber-500 to-amber-600 text-white shadow-sm hover:from-amber-600 hover:to-amber-700 active:shadow-inner",
    },
    info: {
      icon: HelpCircle,
      color: "text-brand-600",
      confirmBtn:
        "bg-linear-to-br from-brand-500 to-indigo-600 text-white shadow-sm hover:from-brand-600 hover:to-indigo-700 active:shadow-inner",
    },
  }

  const current = iconConfig[variant] || iconConfig.danger
  const Icon = current.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* ── Pure Frosted Blur Backdrop with synchronized fade-out on exit ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={onCancel}
            className="fixed inset-0 backdrop-blur-md pointer-events-auto"
            aria-hidden="true"
          />

          {/* ── Neumorphic Dialog Card ── */}
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-description"
            initial={{ scale: 0.94, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 8 }}
            transition={{ type: "spring", stiffness: 440, damping: 28 }}
            className="relative w-full max-w-sm rounded-3xl p-6 sm:p-7 text-center pointer-events-auto z-10"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-raised)",
            }}
          >
            {/* Close 'X' button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            {/* Recessed Neumorphic Icon Dish (Pure Neumorphic Surface, No Glow) */}
            <div className="mx-auto mb-4 flex items-center justify-center">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${current.color}`}
                style={{
                  background: "var(--neu-bg)",
                  boxShadow: "var(--neu-inset-sm)",
                }}
              >
                <Icon size={26} strokeWidth={2.4} />
              </div>
            </div>

            {/* Title */}
            <h3
              id="confirm-modal-title"
              className="text-lg font-extrabold text-neutral-800 tracking-tight"
            >
              {title}
            </h3>

            {/* Description */}
            <p
              id="confirm-modal-description"
              className="text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed mt-2 mb-6"
            >
              {description}
            </p>

            {/* Tactile Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* Cancel Button (Raised Neumorphic) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{
                  scale: 0.96,
                  boxShadow: "var(--neu-pressed)",
                }}
                onClick={onCancel}
                className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-neutral-700 transition-all cursor-pointer select-none"
                style={{
                  background: "var(--neu-bg)",
                  boxShadow: "var(--neu-raised-sm)",
                }}
              >
                {cancelText}
              </motion.button>

              {/* Confirm Button (Gradient Accent) */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={onConfirm}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${current.confirmBtn}`}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
