import { useState, useEffect, useCallback, useMemo } from "react"
import {
  SUPPORTED_CURRENCIES,
  getExchangeRates,
  convertCurrency,
} from "../services/currencyService"
import { toast } from "../components/ui"

/**
 * useCurrencyConverter — Encapsulates live rate fetching, currency conversion state,
 * and swap animation triggers.
 */
export function useCurrencyConverter(defaultBase = "PHP") {
  const [ratesData, setRatesData] = useState(null)
  const [isLoadingRates, setIsLoadingRates] = useState(true)
  const [convertAmount, setConvertAmount] = useState("1")
  const [fromCurrency, setFromCurrency] = useState(defaultBase)
  const [toCurrency, setToCurrency] = useState("USD")
  const [isSwapped, setIsSwapped] = useState(false)
  const [isRefreshed, setIsRefreshed] = useState(false)

  // Keep fromCurrency synchronized if defaultBase changes
  useEffect(() => {
    setFromCurrency(defaultBase)
  }, [defaultBase])

  // Load exchange rates for base currency
  const loadRates = useCallback(async (base = defaultBase) => {
    setIsLoadingRates(true)
    try {
      const data = await getExchangeRates(base)
      setRatesData(data)
      setIsRefreshed(true)
      setTimeout(() => setIsRefreshed(false), 1400)
    } catch {
      toast.error("Failed to load real-time exchange rates")
    } finally {
      setIsLoadingRates(false)
    }
  }, [defaultBase])

  useEffect(() => {
    loadRates(defaultBase)
  }, [defaultBase, loadRates])

  // Swap currencies with icon morphing trigger
  const handleSwapCurrencies = useCallback(() => {
    setIsSwapped((prev) => !prev)
    setFromCurrency((prevFrom) => {
      setToCurrency(prevFrom)
      return toCurrency
    })
  }, [toCurrency])

  // Computed values
  const convertedValue = useMemo(() => {
    if (!ratesData) return 0
    return convertCurrency(Number(convertAmount), fromCurrency, toCurrency, ratesData)
  }, [ratesData, convertAmount, fromCurrency, toCurrency])

  const singleUnitRate = useMemo(() => {
    if (!ratesData) return 0
    return convertCurrency(1, fromCurrency, toCurrency, ratesData)
  }, [ratesData, fromCurrency, toCurrency])

  const inverseRate = useMemo(() => {
    if (!ratesData) return 0
    return convertCurrency(1, toCurrency, fromCurrency, ratesData)
  }, [ratesData, fromCurrency, toCurrency])

  const addAmount = useCallback((delta) => {
    setConvertAmount((prev) => {
      const current = parseFloat(prev) || 0
      const next = Math.max(0, current + delta)
      return next.toString()
    })
  }, [])

  const clearAmount = useCallback(() => {
    setConvertAmount("")
  }, [])

  const marketStatus = useMemo(() => {
    return {
      updatedAt: ratesData?.updatedAt,
      timeLastUpdateUtc: ratesData?.timeLastUpdateUtc,
      timeNextUpdateUtc: ratesData?.timeNextUpdateUtc,
      isLive: !isLoadingRates && !!ratesData,
    }
  }, [ratesData, isLoadingRates])

  const toCurrencyObj = useMemo(() => {
    return (
      SUPPORTED_CURRENCIES.find((c) => c.code === toCurrency) || {
        symbol: toCurrency,
        flag: "",
        name: toCurrency,
      }
    )
  }, [toCurrency])

  return {
    ratesData,
    isLoadingRates,
    isRefreshed,
    isSwapped,
    convertAmount,
    setConvertAmount,
    addAmount,
    clearAmount,
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    loadRates,
    handleSwapCurrencies,
    convertedValue,
    singleUnitRate,
    inverseRate,
    marketStatus,
    toCurrencyObj,
  }
}
