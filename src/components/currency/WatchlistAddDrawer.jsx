import { motion, AnimatePresence } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Search, X } from "lucide"
import { CountryFlag } from "../ui"
import { NEU } from "../../lib/neu"
import { neuChipShadow, neuChipHover, neuChipTap } from "../../lib/animations"

/**
 * WatchlistAddDrawer — Collapsible Neumorphic Drawer for Adding Supported Currencies
 */
export default function WatchlistAddDrawer({
  isOpen,
  availableToAdd,
  filteredAvailableToAdd,
  addSearchQuery,
  onAddSearchChange,
  onClearAddSearch,
  onTogglePin,
  inputRef,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden mb-4"
        >
          <div
            className="p-3 sm:p-4 rounded-2xl space-y-3"
            style={{
              background: NEU.bg,
              boxShadow: NEU.insetSm,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Available to pin ({availableToAdd.length}):
              </p>
              {availableToAdd.length > 0 && (
                <span className="text-[10px] text-neutral-400">
                  Click to add to watchlist
                </span>
              )}
            </div>

            {/* Quick Search inside Add Drawer for 40+ currencies */}
            {availableToAdd.length > 6 && (
              <div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.insetSm,
                }}
              >
                <MorphIcon icon={Search} size={13} className="text-neutral-400 shrink-0" strokeWidth={2.2} />
                <input
                  ref={inputRef}
                  type="text"
                  value={addSearchQuery}
                  onChange={(e) => onAddSearchChange(e.target.value)}
                  placeholder="Search currencies to add (e.g. KRW, CAD, Swiss)..."
                  className="w-full bg-transparent text-xs font-semibold text-neutral-800 outline-none placeholder:text-neutral-400"
                />
                {addSearchQuery && (
                  <button
                    type="button"
                    onClick={onClearAddSearch}
                    className="text-neutral-400 hover:text-neutral-600 cursor-pointer p-0.5"
                    aria-label="Clear add search"
                  >
                    <MorphIcon icon={X} size={12} strokeWidth={2.4} />
                  </button>
                )}
              </div>
            )}

            {/* Available Currencies Scrollable Grid/Wrap */}
            <div className="max-h-48 overflow-y-auto pr-1 no-scrollbar sm:custom-scrollbar">
              <div className="flex items-center gap-2 flex-wrap p-1 pb-2">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredAvailableToAdd.map((curr) => (
                    <motion.button
                      layout
                      key={curr.code}
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                      whileHover={neuChipHover}
                      whileTap={neuChipTap}
                      onClick={() => onTogglePin(curr.code)}
                      title={`Pin ${curr.name} (${curr.code})`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-brand-600 transition-colors cursor-pointer select-none"
                      style={{
                        background: NEU.bg,
                        boxShadow: neuChipShadow,
                      }}
                    >
                      <CountryFlag code={curr.code} size="xs" />
                      <span>{curr.code}</span>
                    </motion.button>
                  ))}
                  {filteredAvailableToAdd.length === 0 && availableToAdd.length > 0 && (
                    <p className="text-xs text-neutral-400 font-medium py-2">
                      No currencies match &ldquo;{addSearchQuery}&rdquo;
                    </p>
                  )}
                  {availableToAdd.length === 0 && (
                    <motion.p
                      key="empty-available"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-neutral-400 font-medium py-2"
                    >
                      All supported currencies are currently pinned.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
