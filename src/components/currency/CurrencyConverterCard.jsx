import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import {
  TrendingUp,
  RefreshCw,
  Check,
  ArrowRightLeft,
  ArrowLeftRight,
} from "lucide"
import { SUPPORTED_CURRENCIES } from "../../services/currencyService"
import LiveRatesCarousel from "./LiveRatesCarousel"

/**
 * CurrencyConverterCard — Real-time interactive forex converter with
 * vector-morphing swap & refresh controls, and embedded global rates carousel.
 */
export default function CurrencyConverterCard({
  ratesData,
  isLoadingRates,
  isRefreshed,
  isSwapped,
  convertAmount,
  setConvertAmount,
  fromCurrency,
  setFromCurrency,
  toCurrency,
  setToCurrency,
  onRefresh,
  onSwap,
  convertedValue,
  singleUnitRate,
  toCurrencyObj,
  currentCurrencyCode,
}) {
  return (
    <div
      className="rounded-2xl sm:rounded-3xl p-4 sm:p-7"
      style={{
        background: "var(--neu-bg)",
        boxShadow: "var(--neu-raised)",
      }}
    >
      {/* ── Card Header ── */}
      <div className="flex items-center justify-between gap-2.5 mb-4 sm:mb-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-brand-600 shrink-0"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-inset-sm)",
            }}
          >
            <MorphIcon
              icon={TrendingUp}
              size={18}
              strokeWidth={2.4}
              className="text-brand-600"
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-base font-extrabold text-neutral-800 tracking-tight leading-tight truncate sm:whitespace-normal">
              Currency Converter & Live Rates
            </h3>
            <p className="text-[10px] sm:text-xs text-neutral-500 font-medium leading-tight truncate sm:whitespace-normal mt-0.5">
              Live exchange rates via Currency API
            </p>
          </div>
        </div>

        {/* Refresh Button (Morphs from RefreshCw into Check on success) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{
            scale: 0.94,
            boxShadow: "var(--neu-pressed)",
          }}
          onClick={onRefresh}
          disabled={isLoadingRates}
          title="Refresh exchange rates"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-500 hover:text-brand-600 transition-all cursor-pointer select-none shrink-0"
          style={{
            background: "var(--neu-bg)",
            boxShadow: isRefreshed ? "var(--neu-inset-sm)" : "var(--neu-raised-sm)",
          }}
        >
          <MorphIcon
            icon={isRefreshed ? Check : RefreshCw}
            size={15}
            strokeWidth={2.4}
            spring="bouncy"
            className={
              isRefreshed
                ? "text-emerald-600"
                : isLoadingRates
                ? "animate-spin text-brand-600"
                : "text-neutral-500"
            }
          />
        </motion.button>
      </div>

      {/* ── Converter Calculator Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
        {/* Amount Input */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
            Amount to Convert
          </label>
          <div
            className="flex items-center px-3.5 py-2.5 rounded-2xl gap-2"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-inset-sm)",
            }}
          >
            <input
              type="number"
              min="0"
              step="any"
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value)}
              className="w-full bg-transparent text-sm font-extrabold text-neutral-800 outline-none"
              placeholder="0.00"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="bg-transparent text-xs font-bold text-neutral-600 outline-none cursor-pointer pr-1"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="text-neutral-800">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button (Morphs between ArrowRightLeft and ArrowLeftRight, vertical on smaller screens) */}
        <div className="flex justify-center md:col-span-1 pt-1 md:pt-5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{
              scale: 0.94,
              boxShadow: "var(--neu-pressed)",
            }}
            onClick={onSwap}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-600 cursor-pointer transition-all select-none"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-raised-sm)",
            }}
            aria-label="Swap currencies"
          >
            <div className="flex items-center justify-center rotate-90 md:rotate-0 transition-transform duration-300">
              <MorphIcon
                icon={isSwapped ? ArrowLeftRight : ArrowRightLeft}
                size={16}
                strokeWidth={2.4}
                spring="bouncy"
                className="text-brand-600"
              />
            </div>
          </motion.button>
        </div>

        {/* Target Currency Selector */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
            Target Currency
          </label>
          <div
            className="flex items-center px-3.5 py-2.5 rounded-2xl"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-inset-sm)",
            }}
          >
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full bg-transparent text-sm font-extrabold text-neutral-800 outline-none cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="text-neutral-800">
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Conversion Result Display Card ── */}
      <div className="mt-4 pt-4 border-t border-neutral-200/60">
        <div
          className="p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{
            background: "var(--neu-bg)",
            boxShadow: "var(--neu-inset-sm)",
          }}
        >
          <div>
            <p className="text-xs font-bold text-neutral-500">
              {convertAmount || "0"} {fromCurrency} =
            </p>
            <p className="text-2xl sm:text-3xl font-black text-brand-600 tracking-tight mt-0.5">
              {toCurrencyObj.symbol}{" "}
              {convertedValue !== null ? convertedValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              }) : "..."}
              <span className="text-sm font-bold text-neutral-400 ml-1.5 font-sans">
                {toCurrency}
              </span>
            </p>
          </div>

          {singleUnitRate && (
            <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-200/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Exchange Rate
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-neutral-800">
                1 {fromCurrency} = {singleUnitRate} {toCurrency}
              </span>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                Updated: {ratesData?.date || "Live"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Global Market Reference Rates Sliding Carousel ── */}
      <LiveRatesCarousel
        ratesData={ratesData}
        currentCurrencyCode={currentCurrencyCode}
      />
    </div>
  )
}
