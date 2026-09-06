import { motion, AnimatePresence } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Star, Plus, X, Search, ArrowUpDown } from "lucide"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"

/**
 * WatchlistHeader — Card Header with Pinned Badge & Scalable Action Controls
 */
export default function WatchlistHeader({
  convertAmount,
  fromCurrency,
  pinnedCount,
  canSearch,
  isSearchOpen,
  isSearching,
  onToggleSearch,
  canSort,
  sortBy,
  onSelectSort,
  isSortOpen,
  setIsSortOpen,
  sortOptions,
  isAdding,
  onToggleAdd,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
      {/* Title & Metadata */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-amber-500 shrink-0"
          style={{
            background: NEU.bg,
            boxShadow: NEU.insetSm,
          }}
        >
          <MorphIcon icon={Star} size={16} strokeWidth={2.4} className="text-amber-500 fill-amber-500/20" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-base font-extrabold text-neutral-800 tracking-tight leading-tight truncate">
              Multi-Currency Watchlist
            </h3>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-black shrink-0"
              style={{
                background: NEU.bg,
                boxShadow: NEU.insetSm,
                color: "#4f46e5",
              }}
            >
              {pinnedCount}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-neutral-500 font-medium leading-tight mt-0.5 truncate">
            Live value of {convertAmount || "1"} {fromCurrency} across key markets
          </p>
        </div>
      </div>

      {/* Action Controls: Search, Filter/Sort, and Add */}
      <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto shrink-0">
        {/* Search Toggle (identical h-8 w-8 dimensions on mobile) */}
        {canSearch && (
          <motion.button
            type="button"
            whileHover={neuButtonHover}
            whileTap={neuButtonTap}
            onClick={onToggleSearch}
            title={isSearchOpen ? "Close search" : "Search watchlist"}
            aria-label="Search watchlist"
            className={`h-8 w-8 sm:w-auto sm:px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer select-none flex items-center justify-center gap-1.5 shrink-0 ${
              isSearchOpen || isSearching ? "text-brand-600" : "text-neutral-500 hover:text-brand-600"
            }`}
            style={{
              background: NEU.bg,
              boxShadow: isSearchOpen || isSearching ? NEU.insetSm : NEU.raisedSm,
            }}
          >
            <MorphIcon icon={Search} size={14} strokeWidth={2.4} />
            <span className="text-[11px] font-bold hidden sm:inline">Search</span>
          </motion.button>
        )}

        {/* Sort / Filter Dropdown Toggle (identical h-8 w-8 dimensions on mobile) */}
        {canSort && (
          <div className="relative shrink-0">
            <motion.button
              type="button"
              whileHover={neuButtonHover}
              whileTap={neuButtonTap}
              onClick={() => setIsSortOpen((prev) => !prev)}
              title="Sort and filter watchlist"
              aria-label="Sort and filter watchlist"
              className={`h-8 w-8 sm:w-auto sm:px-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer select-none flex items-center justify-center gap-1.5 ${
                sortBy !== "default" ? "text-brand-600 font-extrabold" : "text-neutral-500 hover:text-neutral-800"
              }`}
              style={{
                background: NEU.bg,
                boxShadow: isSortOpen ? NEU.insetSm : NEU.raisedSm,
              }}
            >
              <MorphIcon icon={ArrowUpDown} size={14} strokeWidth={2.4} />
              <span className="text-[11px] font-bold hidden sm:inline">
                {sortBy !== "default"
                  ? sortOptions.find((s) => s.id === sortBy)?.label.split(" ")[0]
                  : "Filter"}
              </span>
            </motion.button>

            {/* Sort Popover Menu */}
            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 z-30 min-w-[160px] p-1.5 rounded-2xl"
                  style={{
                    background: NEU.bg,
                    boxShadow: NEU.raised,
                  }}
                >
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-2 py-1">
                    Sort by
                  </p>
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onSelectSort(opt.id)
                        setIsSortOpen(false)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                        sortBy === opt.id
                          ? "text-brand-600 font-black"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                      style={{
                        background: sortBy === opt.id ? "rgba(99, 102, 241, 0.08)" : "transparent",
                      }}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Add Currency Toggle */}
        <motion.button
          type="button"
          whileHover={neuButtonHover}
          whileTap={neuButtonTap}
          onClick={onToggleAdd}
          className={`h-8 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer select-none flex items-center justify-center gap-1.5 shrink-0 ${
            isAdding ? "text-brand-600 font-extrabold" : "text-neutral-600 hover:text-brand-600"
          }`}
          style={{
            background: NEU.bg,
            boxShadow: isAdding ? NEU.insetSm : NEU.raisedSm,
          }}
        >
          <MorphIcon icon={isAdding ? X : Plus} size={13} strokeWidth={2.6} />
          <span>{isAdding ? "Close" : "Add"}</span>
        </motion.button>
      </div>
    </div>
  )
}
