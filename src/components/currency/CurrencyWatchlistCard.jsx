import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Star, Plus, X } from "lucide"
import { SUPPORTED_CURRENCIES, convertCurrency } from "../../services/currencyService"
import { CountryFlag } from "../ui"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"

const DEFAULT_WATCHLIST = ["USD", "EUR", "JPY", "GBP", "CAD", "AUD", "SGD", "CNY"]
const STORAGE_KEY = "budget_tracker_fx_watchlist"

/**
 * CurrencyWatchlistCard — Real-Time Multi-Currency Watchlist Matrix
 * Simultaneously computes the value of the user's active convertAmount across
 * custom pinned world currencies.
 */
export default function CurrencyWatchlistCard({
  convertAmount,
  fromCurrency,
  ratesData,
  onSelectCurrency,
}) {
  const [pinnedCodes, setPinnedCodes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEFAULT_WATCHLIST
  })

  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedCodes))
    } catch {}
  }, [pinnedCodes])

  const togglePin = (code) => {
    if (pinnedCodes.includes(code)) {
      if (pinnedCodes.length <= 1) return // keep at least 1
      setPinnedCodes((prev) => prev.filter((c) => c !== code))
    } else {
      setPinnedCodes((prev) => [...prev, code])
    }
  }

  // Filter out the active fromCurrency from the displayed list
  const activePinnedCodes = pinnedCodes.filter((c) => c !== fromCurrency)
  const numAmount = parseFloat(convertAmount) || 1

  const availableToAdd = SUPPORTED_CURRENCIES.filter(
    (c) => !pinnedCodes.includes(c.code) && c.code !== fromCurrency
  )

  return (
    <div
      className="p-4 sm:p-6 rounded-3xl"
      style={{
        background: NEU.bg,
        boxShadow: NEU.raisedSm,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-amber-500 shrink-0"
            style={{
              background: NEU.bg,
              boxShadow: NEU.insetSm,
            }}
          >
            <MorphIcon icon={Star} size={16} strokeWidth={2.4} className="text-amber-500 fill-amber-500/20" />
          </div>
          <div>
            <h3 className="text-xs sm:text-base font-extrabold text-neutral-800 tracking-tight leading-tight">
              Multi-Currency Watchlist
            </h3>
            <p className="text-[10px] sm:text-xs text-neutral-500 font-medium leading-tight mt-0.5">
              Live value of {convertAmount || "1"} {fromCurrency} across key markets
            </p>
          </div>
        </div>

        {/* Add Currency Toggle */}
        <motion.button
          type="button"
          whileHover={neuButtonHover}
          whileTap={neuButtonTap}
          onClick={() => setIsAdding((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer select-none shrink-0 ${
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

      {/* Optional Currency Adder Dropdown / Pills */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div
              className="p-3 sm:p-4 rounded-2xl"
              style={{
                background: NEU.bg,
                boxShadow: NEU.insetSm,
              }}
            >
              <p className="text-[11px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">
                Click to pin to watchlist:
              </p>
              <div className="flex items-center gap-2 flex-wrap p-1 pb-2">
                <AnimatePresence mode="popLayout" initial={false}>
                  {availableToAdd.map((curr) => (
                    <motion.button
                      layout
                      key={curr.code}
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                      whileHover={neuButtonHover}
                      whileTap={neuButtonTap}
                      onClick={() => togglePin(curr.code)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-brand-600 transition-colors cursor-pointer select-none"
                      style={{
                        background: NEU.bg,
                        boxShadow: NEU.raisedSm,
                      }}
                    >
                      <CountryFlag code={curr.code} size="xs" />
                      <span>{curr.code}</span>
                    </motion.button>
                  ))}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watchlist Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {activePinnedCodes.map((code) => {
            const currObj = SUPPORTED_CURRENCIES.find((c) => c.code === code) || {
              code,
              name: code,
              symbol: code,
            }

            const val = ratesData ? convertCurrency(numAmount, fromCurrency, code, ratesData) : 0
            const rate1 = ratesData ? convertCurrency(1, fromCurrency, code, ratesData) : 0

            return (
              <motion.div
                layout
                key={code}
                initial={{ opacity: 0, scale: 0.82, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  y: -8,
                  transition: { duration: 0.2 },
                }}
                transition={{
                  layout: { type: "spring", stiffness: 420, damping: 32 },
                  opacity: { duration: 0.2 },
                  scale: { type: "spring", stiffness: 420, damping: 32 },
                  y: { type: "spring", stiffness: 420, damping: 32 },
                }}
                whileHover={{ y: -2 }}
                className="p-3.5 rounded-2xl flex flex-col justify-between group relative select-none"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.insetSm,
                }}
              >
                {/* Unpin button (hover / tap) */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => togglePin(code)}
                  title={`Remove ${code} from watchlist`}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-neutral-400 hover:text-rose-500 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <MorphIcon icon={X} size={12} strokeWidth={2.4} />
                </motion.button>

                <div className="flex items-center gap-2 mb-2 min-w-0 pr-4">
                  <CountryFlag code={code} size="md" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-800 truncate leading-tight">
                      {code}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate leading-tight mt-0.5">
                      {currObj.name}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-lg font-black text-brand-600 tracking-tight leading-tight truncate">
                    {currObj.symbol || ""}{" "}
                    {val.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: val < 1 ? 4 : 2,
                    })}
                  </p>
                  <p className="text-[10px] font-semibold text-neutral-400 mt-0.5">
                    1 {fromCurrency} = {rate1.toFixed(3)} {code}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
