import { motion, AnimatePresence } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Search, X } from "lucide"
import { NEU } from "../../lib/neu"

/**
 * WatchlistSearchBar — Expandable Inset Neumorphic Search Filter for Active Watchlist
 */
export default function WatchlistSearchBar({
  isOpen,
  searchQuery,
  onSearchChange,
  onClear,
  inputRef,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="overflow-hidden"
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{
              background: NEU.bg,
              boxShadow: NEU.insetSm,
            }}
          >
            <MorphIcon icon={Search} size={14} className="text-neutral-400 shrink-0" strokeWidth={2.2} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter pinned currencies by code or name (e.g. USD, Yen)..."
              className="w-full bg-transparent text-xs font-semibold text-neutral-800 outline-none placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={onClear}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer p-0.5"
                aria-label="Clear filter"
              >
                <MorphIcon icon={X} size={13} strokeWidth={2.4} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
