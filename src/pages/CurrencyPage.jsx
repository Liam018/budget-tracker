import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { useAuth } from "../hooks/useAuth"
import { useCurrencyConverter } from "../hooks/useCurrencyConverter"
import { SUPPORTED_CURRENCIES } from "../services/currencyService"
import {
  CurrencyConverterCard,
  CurrencyWatchlistCard,
  CurrencyCheatsheetCard,
  CurrencyTrendCard,
} from "../components/currency"
import { CountryFlag } from "../components/ui"
import { NEU } from "../lib/neu"
import { neuButtonHover, neuButtonTap } from "../lib/animations"

/**
 * CurrencyPage — Dedicated view for real-time forex conversions,
 * live market rates, multi-currency watchlist, traveler's cheatsheet,
 * and 7D/30D historical market trend sparklines.
 */
export default function CurrencyPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const currentCurrencyCode = profile?.currency || "PHP"

  // Custom hook for live conversion rates & state
  const converter = useCurrencyConverter(currentCurrencyCode)

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-6">
      {/* ── Base Currency Quick Badge ── */}
      <div className="flex items-center justify-end">
        <motion.button
          whileHover={neuButtonHover}
          whileTap={neuButtonTap}
          onClick={() => navigate("/profile")}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-all cursor-pointer select-none shrink-0"
          style={{
            background: NEU.bg,
            boxShadow: NEU.raisedSm,
          }}
        >
          <CountryFlag code={currentCurrencyCode} size="sm" />
          <span>Base: {currentCurrencyCode}</span>
          <span className="text-neutral-300">|</span>
          <span className="text-brand-600">Change in Profile</span>
        </motion.button>
      </div>

      {/* ── Real-Time Currency Converter & Sliding Global Rates ── */}
      <CurrencyConverterCard
        ratesData={converter.ratesData}
        isLoadingRates={converter.isLoadingRates}
        isRefreshed={converter.isRefreshed}
        isSwapped={converter.isSwapped}
        convertAmount={converter.convertAmount}
        setConvertAmount={converter.setConvertAmount}
        addAmount={converter.addAmount}
        clearAmount={converter.clearAmount}
        fromCurrency={converter.fromCurrency}
        setFromCurrency={converter.setFromCurrency}
        toCurrency={converter.toCurrency}
        setToCurrency={converter.setToCurrency}
        onRefresh={() => converter.loadRates(currentCurrencyCode)}
        onSwap={converter.handleSwapCurrencies}
        convertedValue={converter.convertedValue}
        singleUnitRate={converter.singleUnitRate}
        inverseRate={converter.inverseRate}
        marketStatus={converter.marketStatus}
        toCurrencyObj={converter.toCurrencyObj}
        currentCurrencyCode={currentCurrencyCode}
      />

      {/* ── Historical 7D/30D Trend Sparkline ── */}
      <CurrencyTrendCard
        fromCurrency={converter.fromCurrency}
        toCurrency={converter.toCurrency}
      />

      {/* ── Multi-Currency Live Watchlist Matrix ── */}
      <CurrencyWatchlistCard
        convertAmount={converter.convertAmount}
        fromCurrency={converter.fromCurrency}
        ratesData={converter.ratesData}
        onSelectCurrency={(code) => converter.setToCurrency(code)}
      />

      {/* ── Traveler's FX Denomination Cheatsheet ── */}
      <CurrencyCheatsheetCard
        fromCurrency={converter.fromCurrency}
        toCurrency={converter.toCurrency}
        singleUnitRate={converter.singleUnitRate}
        inverseRate={converter.inverseRate}
        toCurrencyObj={converter.toCurrencyObj}
      />
    </div>
  )
}
