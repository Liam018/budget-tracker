import { useState, useEffect } from "react"
import { getHistoricalRates } from "../services/currencyService"

/**
 * useCurrencyHistory — Custom hook managing historical exchange rate time-series data,
 * asynchronous loading lifecycle, cancellation tokens, and error handling.
 *
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {number} timeframe - Days of history (e.g. 7 or 30)
 */
export default function useCurrencyHistory(fromCurrency, toCurrency, timeframe = 30) {
  const [historyData, setHistoryData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function fetchTrend() {
      if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) {
        setHistoryData(null)
        setIsLoading(false)
        setHasError(false)
        return
      }

      setIsLoading(true)
      setHasError(false)

      try {
        const data = await getHistoricalRates(fromCurrency, toCurrency, timeframe)
        if (!isCancelled) {
          if (data?.isUnsupported) {
            setHistoryData(null)
            setHasError(false)
          } else {
            setHistoryData(data)
            setHasError(false)
          }
        }
      } catch {
        if (!isCancelled) {
          setHasError(true)
          setHistoryData(null)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchTrend()

    return () => {
      isCancelled = true
    }
  }, [fromCurrency, toCurrency, timeframe])

  return {
    historyData,
    isLoading,
    hasError,
  }
}
