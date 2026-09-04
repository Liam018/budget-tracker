import { useState, useEffect, useCallback, useMemo } from "react"
import { SUPPORTED_CURRENCIES } from "../constants/currencies"

const DEFAULT_WATCHLIST = ["USD", "EUR", "JPY", "GBP", "CAD", "AUD", "SGD", "CNY"]
const STORAGE_KEY = "budget_tracker_fx_watchlist"

/**
 * useCurrencyWatchlist — Custom hook managing multi-currency watchlist state,
 * local storage persistence, toggle actions, and available currency filters.
 *
 * @param {string} fromCurrency - The active source currency to exclude from target comparisons.
 */
export default function useCurrencyWatchlist(fromCurrency = "PHP") {
  const [pinnedCodes, setPinnedCodes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEFAULT_WATCHLIST
  })

  const [isAdding, setIsAdding] = useState(false)

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedCodes))
    } catch {}
  }, [pinnedCodes])

  const togglePin = useCallback((code) => {
    setPinnedCodes((prev) => {
      if (prev.includes(code)) {
        if (prev.length <= 1) return prev // Keep at least 1 pinned
        return prev.filter((c) => c !== code)
      }
      return [...prev, code]
    })
  }, [])

  // Pinned currencies excluding the active base
  const activePinnedCodes = useMemo(() => {
    return pinnedCodes.filter((c) => c !== fromCurrency)
  }, [pinnedCodes, fromCurrency])

  // Currencies available to add to watchlist
  const availableToAdd = useMemo(() => {
    return SUPPORTED_CURRENCIES.filter(
      (c) => !pinnedCodes.includes(c.code) && c.code !== fromCurrency
    )
  }, [pinnedCodes, fromCurrency])

  return {
    pinnedCodes,
    activePinnedCodes,
    availableToAdd,
    isAdding,
    setIsAdding,
    togglePin,
  }
}
