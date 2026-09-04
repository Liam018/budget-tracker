/**
 * Currency Service
 * Supports CurrencyApi.net (with VITE_CURRENCY_API_KEY) and
 * high-availability zero-key open exchange rate fallback (open.er-api.com).
 */

import {
  SUPPORTED_CURRENCIES,
  CURRENCY_REGIONS,
  FRANKFURTER_CURRENCIES,
} from "../constants/currencies"

export {
  SUPPORTED_CURRENCIES,
  CURRENCY_REGIONS,
  FRANKFURTER_CURRENCIES,
}

const CACHE_KEY_RATES = "budget_tracker_exchange_rates"
const CACHE_KEY_TIME = "budget_tracker_exchange_rates_time"
const CACHE_TTL_MS = 1000 * 60 * 30 // 30 minutes cache
const CACHE_KEY_HISTORICAL = "budget_tracker_fx_history"
const CACHE_HISTORICAL_TTL = 1000 * 60 * 60 * 6 // 6 hours cache

/**
 * Fetch latest exchange rates for a base currency.
 * Automatically falls back to open exchange API if CurrencyApi key is not set.
 */
export async function getExchangeRates(base = "PHP") {
  // Check local storage cache
  const cachedTime = localStorage.getItem(`${CACHE_KEY_TIME}_${base}`)
  const cachedData = localStorage.getItem(`${CACHE_KEY_RATES}_${base}`)

  if (cachedTime && cachedData) {
    const age = Date.now() - parseInt(cachedTime, 10)
    if (age < CACHE_TTL_MS) {
      try {
        return JSON.parse(cachedData)
      } catch {
        // cache corrupt, proceed to fetch
      }
    }
  }

  const apiKey = import.meta.env.VITE_CURRENCY_API_KEY

  try {
    let rates = null
    let timestamp = new Date().toISOString()
    let timeLastUpdateUtc = null
    let timeNextUpdateUtc = null

    // 1. If user supplied CurrencyApi.net key, use it
    if (apiKey) {
      const res = await fetch(`https://currencyapi.net/api/v2/rates?key=${apiKey}&base=${base}&output=JSON`)
      const data = await res.json()
      if (data.valid && data.rates) {
        rates = data.rates
        timestamp = new Date(data.updated * 1000).toISOString()
      }
    }

    // 2. High-availability zero-key fallback (open.er-api.com)
    if (!rates) {
      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`)
      const data = await res.json()
      if (data.result === "success" && data.rates) {
        rates = data.rates
        timestamp = data.time_last_update_utc || new Date().toISOString()
        timeLastUpdateUtc = data.time_last_update_utc
        timeNextUpdateUtc = data.time_next_update_utc
      }
    }

    if (!rates) {
      throw new Error("Unable to fetch exchange rates.")
    }

    const payload = {
      base,
      rates,
      updatedAt: timestamp,
      timeLastUpdateUtc,
      timeNextUpdateUtc,
    }

    // Cache locally
    localStorage.setItem(`${CACHE_KEY_RATES}_${base}`, JSON.stringify(payload))
    localStorage.setItem(`${CACHE_KEY_TIME}_${base}`, Date.now().toString())

    return payload
  } catch (err) {
    console.error("Currency fetch error:", err)
    // Return stale cache if available
    if (cachedData) {
      return JSON.parse(cachedData)
    }
    throw err
  }
}

/**
 * Fetch historical exchange rate time-series (7 to 30 days) from ECB (via Frankfurter API).
 */
export async function getHistoricalRates(fromCode = "USD", toCode = "PHP", days = 30) {
  if (fromCode === toCode) {
    return {
      from: fromCode,
      to: toCode,
      points: [],
      startRate: 1,
      endRate: 1,
      minRate: 1,
      maxRate: 1,
      changePct: 0,
      isIdentical: true,
    }
  }

  // If either currency is not tracked by the European Central Bank (e.g. crypto or unlisted fiat)
  if (!FRANKFURTER_CURRENCIES.has(fromCode) || !FRANKFURTER_CURRENCIES.has(toCode)) {
    return {
      from: fromCode,
      to: toCode,
      points: [],
      startRate: 0,
      endRate: 0,
      minRate: 0,
      maxRate: 0,
      changePct: 0,
      isUnsupported: true,
    }
  }

  const cacheKey = `${CACHE_KEY_HISTORICAL}_${fromCode}_${toCode}_${days}`
  const cached = localStorage.getItem(cacheKey)
  const cachedTime = localStorage.getItem(`${cacheKey}_time`)

  if (cached && cachedTime) {
    if (Date.now() - parseInt(cachedTime, 10) < CACHE_HISTORICAL_TTL) {
      try {
        return JSON.parse(cached)
      } catch {}
    }
  }

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const formatDate = (d) => d.toISOString().split("T")[0]
  const startStr = formatDate(startDate)
  const endStr = formatDate(endDate)

  const query = `${startStr}..${endStr}?from=${fromCode}&to=${toCode}`
  const isDev = typeof import.meta !== "undefined" && import.meta.env?.DEV

  try {
    let res
    if (isDev) {
      try {
        res = await fetch(`/api/frankfurter/${query}`)
      } catch {
        res = await fetch(`https://api.frankfurter.dev/v1/${query}`)
      }
    } else {
      res = await fetch(`https://api.frankfurter.dev/v1/${query}`)
    }

    if (!res.ok) throw new Error(`Frankfurter status: ${res.status}`)
    const data = await res.json()

    if (data && data.rates) {
      const points = Object.entries(data.rates)
        .map(([date, rateObj]) => ({
          date,
          rate: rateObj[toCode],
        }))
        .filter((p) => p.rate != null)
        .sort((a, b) => a.date.localeCompare(b.date))

      if (points.length > 0) {
        const startRate = points[0].rate
        const endRate = points[points.length - 1].rate
        const minRate = Math.min(...points.map((p) => p.rate))
        const maxRate = Math.max(...points.map((p) => p.rate))
        const changePct = startRate > 0 ? ((endRate - startRate) / startRate) * 100 : 0

        const payload = {
          from: fromCode,
          to: toCode,
          points,
          startRate,
          endRate,
          minRate,
          maxRate,
          changePct,
          isIdentical: false,
        }

        localStorage.setItem(cacheKey, JSON.stringify(payload))
        localStorage.setItem(`${cacheKey}_time`, Date.now().toString())
        return payload
      }
    }
    throw new Error("No rate points available")
  } catch (err) {
    if (cached) {
      return JSON.parse(cached)
    }
    throw err
  }
}

/**
 * Convert an amount from one currency to another using exchange rates.
 */
export function convertCurrency(amount, fromCode, toCode, ratesPayload) {
  if (!amount || isNaN(amount) || amount <= 0) return 0
  if (fromCode === toCode) return Number(amount)

  const { base, rates } = ratesPayload
  if (!rates) return 0

  // If base matches fromCode
  if (base === fromCode && rates[toCode]) {
    return Number(amount) * rates[toCode]
  }

  // If base matches toCode
  if (base === toCode && rates[fromCode]) {
    return Number(amount) / rates[fromCode]
  }

  // Cross conversion: from -> base -> to
  const rateFrom = rates[fromCode]
  const rateTo = rates[toCode]

  if (rateFrom && rateTo) {
    const inBase = Number(amount) / rateFrom
    return inBase * rateTo
  }

  return 0
}
