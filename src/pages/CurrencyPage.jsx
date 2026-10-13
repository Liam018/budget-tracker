import { useAuth } from "../hooks/useAuth"
import { useCurrencyConverter } from "../hooks/useCurrencyConverter"
import {
  CurrencyConverterCard,
  CurrencyWatchlistCard,
  CurrencyCheatsheetCard,
  CurrencyTrendCard,
} from "../components/currency"

/**
 * CurrencyPage — Dedicated view for real-time forex conversions,
 * live market rates, multi-currency watchlist, traveler's cheatsheet,
 * and 7D/30D historical market trend sparklines.
 */
export default function CurrencyPage() {
  const { profile } = useAuth()

  const currentCurrencyCode = profile?.currency || "PHP"

  // Custom hook for live conversion rates & state
  const converter = useCurrencyConverter(currentCurrencyCode)

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 md:pb-20 pb-6">
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
        toCurrency={converter.toCurrency}
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
