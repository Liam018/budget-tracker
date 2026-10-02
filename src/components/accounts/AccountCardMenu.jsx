import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  MoreVertical,
  Edit3,
  Archive,
  RotateCcw,
  Trash2,
} from "lucide-react"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"

/**
 * AccountCardMenu — Floating popover action menu for account cards.
 *
 * Provides Edit, Archive/Restore, and Delete actions with tactile Neumorphic styling.
 */
export default function AccountCardMenu({
  isOpen,
  onOpenChange,
  account,
  onEdit,
  onArchive,
  onDelete,
}) {
  const menuRef = useRef(null)
  const isArchived = Boolean(account?.is_archived)

  // Close menu on outside pointerdown
  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onOpenChange?.(false)
      }
    }
    document.addEventListener("pointerdown", handleClickOutside)
    return () => document.removeEventListener("pointerdown", handleClickOutside)
  }, [isOpen, onOpenChange])

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <motion.button
        whileHover={neuButtonHover}
        whileTap={neuButtonTap}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onOpenChange?.(!isOpen)
        }}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
        style={{
          background: NEU.bg,
          boxShadow: isOpen ? NEU.insetSm : NEU.raisedSm,
        }}
        aria-label="Account options"
        aria-expanded={isOpen}
      >
        <MoreVertical size={15} strokeWidth={2.4} />
      </motion.button>

      {/* Floating Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 4 }}
            transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 z-50 min-w-44 p-1.5 rounded-2xl border border-neutral-200/80 text-left"
            style={{
              background: "#edf0f7",
              boxShadow:
                "0 14px 32px -4px rgba(0, 0, 0, 0.2), 0 4px 12px -2px rgba(0, 0, 0, 0.1), -3px -3px 8px rgba(255, 255, 255, 0.85)",
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenChange?.(false)
                onEdit?.(account)
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-neutral-700 hover:text-brand-600 hover:bg-neutral-200/50 transition-colors cursor-pointer"
            >
              <Edit3 size={13} strokeWidth={2.4} />
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenChange?.(false)
                onArchive?.(account.id, !isArchived)
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-neutral-700 hover:text-amber-600 hover:bg-amber-50/60 transition-colors cursor-pointer"
            >
              {isArchived ? (
                <RotateCcw size={13} strokeWidth={2.4} />
              ) : (
                <Archive size={13} strokeWidth={2.4} />
              )}
              <span>{isArchived ? "Restore Card" : "Archive Card"}</span>
            </button>

            <div className="my-1 border-t border-neutral-300/40" />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenChange?.(false)
                onDelete?.(account)
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50/60 transition-colors cursor-pointer"
            >
              <Trash2 size={13} strokeWidth={2.4} />
              <span>Delete Card</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
