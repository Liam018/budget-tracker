import { motion } from "motion/react"
import { Search, X, RefreshCw, Plus } from "lucide-react"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"

/**
 * AccountToolbar — Action toolbar containing the search input, accounts counter,
 * refresh button, and 'Add Account' button.
 */
export default function AccountToolbar({
  searchQuery,
  onSearchChange,
  count = 0,
  isRefreshing = false,
  onRefresh,
  onAddAccount,
  selectedType = "all",
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div
          className="flex items-center gap-2.5 px-3.5 h-10 rounded-xl w-full transition-shadow focus-within:ring-2 focus-within:ring-brand-500/20"
          style={{
            background: NEU.bg,
            boxShadow: NEU.insetSm,
          }}
        >
          <Search
            size={14}
            strokeWidth={2.4}
            className="text-neutral-400 shrink-0"
          />
          <input
            type="text"
            placeholder={
              selectedType === "archived"
                ? "Search archived accounts..."
                : "Search accounts by name or institution..."
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm font-semibold text-neutral-800 outline-none placeholder:text-neutral-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer rounded-md transition-colors"
              title="Clear search"
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>

      {/* Action Controls & Match Counter */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
        <span className="text-xs font-bold text-neutral-500 hidden sm:inline-block">
          {count} {count === 1 ? "account" : "accounts"}
        </span>

        {/* Refresh Button */}
        <motion.button
          whileHover={neuButtonHover}
          whileTap={neuButtonTap}
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh accounts"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-500 hover:text-brand-600 transition-colors cursor-pointer shrink-0"
          style={{
            background: NEU.bg,
            boxShadow: isRefreshing ? NEU.insetSm : NEU.raisedSm,
          }}
        >
          <RefreshCw
            size={15}
            strokeWidth={2.4}
            className={isRefreshing ? "animate-spin text-brand-600" : "text-neutral-500"}
          />
        </motion.button>

        {/* Add Account Button */}
        <motion.button
          whileHover={neuButtonHover}
          whileTap={neuButtonTap}
          onClick={onAddAccount}
          className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm cursor-pointer transition-all shrink-0"
        >
          <Plus size={16} strokeWidth={2.6} />
          <span>Add Account</span>
        </motion.button>
      </div>
    </div>
  )
}
