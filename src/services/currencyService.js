/**
 * Currency Service
 * Supports CurrencyApi.net (with VITE_CURRENCY_API_KEY) and
 * high-availability zero-key open exchange rate fallback (open.er-api.com).
 */

// Comprehensive dictionary of major and supported world currencies
export const SUPPORTED_CURRENCIES = [
  { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭" },
  { code: "USD", name: "United States Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳" },
  { code: "AED", name: "UAE Dirham", symbol: "AED", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR", flag: "🇸🇦" },
  { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$", flag: "🇹🇼" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", flag: "🇵🇱" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$", flag: "🇲🇽" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { code: "ILS", name: "Israeli New Shekel", symbol: "₪", flag: "🇮🇱" },
  { code: "QAR", name: "Qatari Riyal", symbol: "QR", flag: "🇶🇦" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "KD", flag: "🇰🇼" },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BD", flag: "🇧🇭" },
  { code: "OMR", name: "Omani Rial", symbol: "OMR", flag: "🇴🇲" },
  { code: "CLP", name: "Chilean Peso", symbol: "CLP$", flag: "🇨🇱" },
  { code: "COP", name: "Colombian Peso", symbol: "COL$", flag: "🇨🇴" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", flag: "🇨🇿" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", flag: "🇭🇺" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£", flag: "🇪🇬" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", flag: "🇧🇩" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪" },
  { code: "ARS", name: "Argentine Peso", symbol: "ARS$", flag: "🇦🇷" },
]

const CACHE_KEY_RATES = "budget_tracker_exchange_rates"
const CACHE_KEY_TIME = "budget_tracker_exchange_rates_time"
const CACHE_TTL_MS = 1000 * 60 * 30 // 30 minutes cache

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
      }
    }

    if (!rates) {
      throw new Error("Unable to fetch exchange rates.")
    }

    const payload = {
      base,
      rates,
      updatedAt: timestamp,
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
