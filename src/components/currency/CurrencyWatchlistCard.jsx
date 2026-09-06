import { useState, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { ChevronDown, ChevronUp } from "lucide"
import { SUPPORTED_CURRENCIES, convertCurrency } from "../../services/currencyService"
import useCurrencyWatchlist from "../../hooks/useCurrencyWatchlist"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"
import WatchlistHeader from "./WatchlistHeader"
import WatchlistSearchBar from "./WatchlistSearchBar"
import WatchlistAddDrawer from "./WatchlistAddDrawer"
import WatchlistItemCard from "./WatchlistItemCard"

const INITIAL_VISIBLE_COUNT = 6

const SORT_OPTIONS = [
  { id: "default", label: "Default" },
  { id: "val-desc", label: "Value (High → Low)" },
  { id: "val-asc", label: "Value (Low → High)" },
  { id: "code", label: "Code (A → Z)" },
]

/**
 * CurrencyWatchlistCard — Real-Time Multi-Currency Watchlist Matrix
 * Simultaneously computes the value of the user's active convertAmount across
 * custom pinned world currencies. Responsive layout scales effortlessly from
 * 1 to 40+ currencies with search, sorting, and expand/collapse controls.
 */
export default function CurrencyWatchlistCard({
  convertAmount,
  fromCurrency,
  toCurrency,
  ratesData,
  onSelectCurrency,
}) {
  const {
    activePinnedCodes,
    availableToAdd,
    isAdding,
    setIsAdding,
    togglePin,
  } = useCurrencyWatchlist(fromCurrency)

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [addSearchQuery, setAddSearchQuery] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [sortBy, setSortBy] = useState("default")
  const [isSortOpen, setIsSortOpen] = useState(false)

  const searchInputRef = useRef(null)
  const addSearchInputRef = useRef(null)

  const numAmount = parseFloat(convertAmount) || 1

  // Precompute currency data & values for active pinned codes
  const computedList = useMemo(() => {
    return activePinnedCodes.map((code) => {
      const currObj = SUPPORTED_CURRENCIES.find((c) => c.code === code) || {
        code,
        name: code,
        symbol: code,
      }
      const val = ratesData ? convertCurrency(numAmount, fromCurrency, code, ratesData) : 0
      const rate1 = ratesData ? convertCurrency(1, fromCurrency, code, ratesData) : 0

      return {
        code,
        currObj,
        val,
        rate1,
      }
    })
  }, [activePinnedCodes, ratesData, numAmount, fromCurrency])

  // Filter pinned items by user search query
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return computedList
    return computedList.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.currObj.name.toLowerCase().includes(q)
    )
  }, [computedList, searchQuery])

  // Apply sorting
  const sortedList = useMemo(() => {
    const list = [...filteredList]
    if (sortBy === "val-desc") {
      list.sort((a, b) => b.val - a.val)
    } else if (sortBy === "val-asc") {
      list.sort((a, b) => a.val - b.val)
    } else if (sortBy === "code") {
      list.sort((a, b) => a.code.localeCompare(b.code))
    }
    return list
  }, [filteredList, sortBy])

  // Visible items (limit to INITIAL_VISIBLE_COUNT unless expanded)
  const isSearching = searchQuery.trim().length > 0
  const shouldLimit = !isExpanded && sortedList.length > INITIAL_VISIBLE_COUNT
  const visibleItems = shouldLimit ? sortedList.slice(0, INITIAL_VISIBLE_COUNT) : sortedList
  const remainingCount = sortedList.length - INITIAL_VISIBLE_COUNT

  // Filter available currencies in the Add drawer
  const filteredAvailableToAdd = useMemo(() => {
    const q = addSearchQuery.trim().toLowerCase()
    if (!q) return availableToAdd
    return availableToAdd.filter(
      (curr) =>
        curr.code.toLowerCase().includes(q) ||
        curr.name.toLowerCase().includes(q)
    )
  }, [availableToAdd, addSearchQuery])

  function handleToggleSearch() {
    setIsSearchOpen((prev) => {
      const next = !prev
      if (!next) setSearchQuery("")
      else setTimeout(() => searchInputRef.current?.focus(), 100)
      return next
    })
  }

  function handleToggleAdd() {
    setIsAdding((prev) => {
      const next = !prev
      if (next) {
        setAddSearchQuery("")
        setTimeout(() => addSearchInputRef.current?.focus(), 100)
      }
      return next
    })
  }

  return (
    <div
      className="p-4 sm:p-6 rounded-3xl"
      style={{
        background: NEU.bg,
        boxShadow: NEU.raisedSm,
      }}
    >
      {/* ── Header with Matching Controls ── */}
      <WatchlistHeader
        convertAmount={convertAmount}
        fromCurrency={fromCurrency}
        pinnedCount={activePinnedCodes.length}
        canSearch={activePinnedCodes.length > 4 || isSearchOpen}
        isSearchOpen={isSearchOpen}
        isSearching={isSearching}
        onToggleSearch={handleToggleSearch}
        canSort={activePinnedCodes.length > 4}
        sortBy={sortBy}
        onSelectSort={setSortBy}
        isSortOpen={isSortOpen}
        setIsSortOpen={setIsSortOpen}
        sortOptions={SORT_OPTIONS}
        isAdding={isAdding}
        onToggleAdd={handleToggleAdd}
      />

      {/* ── Active Watchlist Search Bar ── */}
      <WatchlistSearchBar
        isOpen={isSearchOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={() => setSearchQuery("")}
        inputRef={searchInputRef}
      />

      {/* ── Currency Adder Dropdown Drawer ── */}
      <WatchlistAddDrawer
        isOpen={isAdding}
        availableToAdd={availableToAdd}
        filteredAvailableToAdd={filteredAvailableToAdd}
        addSearchQuery={addSearchQuery}
        onAddSearchChange={setAddSearchQuery}
        onClearAddSearch={() => setAddSearchQuery("")}
        onTogglePin={togglePin}
        inputRef={addSearchInputRef}
      />

      {/* ── Empty Filtered State ── */}
      {sortedList.length === 0 && (
        <div
          className="py-8 px-4 text-center rounded-2xl"
          style={{
            background: NEU.bg,
            boxShadow: NEU.insetSm,
          }}
        >
          <p className="text-xs font-bold text-neutral-600">
            {isSearching ? `No pinned currencies match "${searchQuery}"` : "Your watchlist is empty"}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">
            {isSearching
              ? "Try searching another currency code or name."
              : "Click '+ Add' above to pin currencies."}
          </p>
          {isSearching && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-3 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
              style={{
                background: NEU.bg,
                boxShadow: NEU.raisedSm,
              }}
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* ── Watchlist Cards Grid ── */}
      {/* Responsive layout: 1 col on small phones (<420px), 2 cols on mobile/tablet (420px-768px), 3 cols on desktop */}
      <motion.div
        layout
        className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleItems.map(({ code, currObj, val, rate1 }) => (
            <WatchlistItemCard
              key={code}
              code={code}
              currObj={currObj}
              val={val}
              rate1={rate1}
              fromCurrency={fromCurrency}
              toCurrency={toCurrency}
              isSelected={toCurrency === code}
              onSelectCurrency={onSelectCurrency}
              onTogglePin={togglePin}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* ── Expand / Collapse Toggle (When there are many items) ── */}
      {sortedList.length > INITIAL_VISIBLE_COUNT && (
        <div className="mt-3.5 flex justify-center">
          <motion.button
            type="button"
            whileHover={neuButtonHover}
            whileTap={neuButtonTap}
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-neutral-600 hover:text-brand-600 transition-colors cursor-pointer select-none"
            style={{
              background: NEU.bg,
              boxShadow: NEU.raisedSm,
            }}
          >
            <span>
              {isExpanded
                ? "Show fewer"
                : isSearching
                ? `Show all ${sortedList.length} matches (${remainingCount} more)`
                : `Show all ${sortedList.length} currencies (${remainingCount} more)`}
            </span>
            <MorphIcon
              icon={isExpanded ? ChevronUp : ChevronDown}
              size={13}
              strokeWidth={2.4}
            />
          </motion.button>
        </div>
      )}
    </div>
  )
}
