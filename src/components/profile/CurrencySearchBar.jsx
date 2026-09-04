import { motion, AnimatePresence } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Search, X } from "lucide"

/**
 * CurrencySearchBar — Inset Neumorphic Search Input with Clear Button
 */
export default function CurrencySearchBar({
  searchQuery,
  onSearchChange,
  onClear,
  isStale,
  inputRef,
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl mt-3.5 transition-opacity duration-150"
      style={{
        background: "var(--neu-bg)",
        boxShadow: "var(--neu-inset-sm)",
        opacity: isStale ? 0.7 : 1,
      }}
    >
      <MorphIcon
        icon={Search}
        size={16}
        className="text-neutral-400 shrink-0"
        strokeWidth={2.2}
      />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search currency name or code (e.g. USD, EUR, PHP)..."
        className="w-full bg-transparent text-xs font-semibold text-neutral-800 outline-none placeholder:text-neutral-400"
        autoFocus
      />
      {/* Clear button — only shows when there is text */}
      <AnimatePresence>
        {searchQuery && (
          <motion.button
            key="clear"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            onClick={onClear}
            className="shrink-0 text-neutral-400 hover:text-neutral-600 cursor-pointer transition-colors"
            aria-label="Clear search"
          >
            <MorphIcon icon={X} size={14} strokeWidth={2.4} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
