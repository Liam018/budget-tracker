import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { ArrowLeft, User } from "lucide"
import { useAuth } from "../hooks/useAuth"
import { useCurrencyConverter } from "../hooks/useCurrencyConverter"
import { SUPPORTED_CURRENCIES } from "../services/currencyService"
import { CurrencyConverterCard } from "../components/currency"
import { CountryFlag } from "../components/ui"

/**
 * CurrencyPage — Dedicated view for real-time forex conversions,
 * live market rates, and global currency reference slider.
 */
export default function CurrencyPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const currentCurrencyCode = profile?.currency || "PHP"
  const currentCurrencyObj =
    SUPPORTED_CURRENCIES.find((c) => c.code === currentCurrencyCode) ||
    SUPPORTED_CURRENCIES[0]

  // Custom hook for live conversion rates & state
  const converter = useCurrencyConverter(currentCurrencyCode)

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-2 sm:pb-2">
      {/* ── Base Currency Quick Badge ── */}
      <div className="flex items-center justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96, boxShadow: "var(--neu-pressed)" }}
          onClick={() => navigate("/profile")}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-all cursor-pointer select-none shrink-0"
          style={{
            background: "var(--neu-bg)",
            boxShadow: "var(--neu-raised-sm)",
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
        fromCurrency={converter.fromCurrency}
        setFromCurrency={converter.setFromCurrency}
        toCurrency={converter.toCurrency}
        setToCurrency={converter.setToCurrency}
        onRefresh={() => converter.loadRates(currentCurrencyCode)}
        onSwap={converter.handleSwapCurrencies}
        convertedValue={converter.convertedValue}
        singleUnitRate={converter.singleUnitRate}
        toCurrencyObj={converter.toCurrencyObj}
        currentCurrencyCode={currentCurrencyCode}
      />
    </div>
  )
}
