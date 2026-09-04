import { useState } from "react"
import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import {
  TrendingUp,
  RefreshCw,
  Check,
  ArrowRightLeft,
  ArrowLeftRight,
  ChevronDown,
} from "lucide"
import { SUPPORTED_CURRENCIES } from "../../services/currencyService"
import { CountryFlag } from "../ui"
import { CurrencyPickerSheet } from "../profile"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"
import LiveRatesCarousel from "./LiveRatesCarousel"
import ConversionResultCard from "./ConversionResultCard"
import CurrencyQuickAmounts from "./CurrencyQuickAmounts"

/**
 * CurrencyConverterCard — Real-time interactive forex converter with
 * vector-morphing swap & refresh controls, neumorphic currency pill selectors,
 * and an embedded global rates carousel.
 */
export default function CurrencyConverterCard({
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
  onRefresh,
  onSwap,
  convertedValue,
  singleUnitRate,
  inverseRate,
  marketStatus,
  toCurrencyObj,
  currentCurrencyCode,
}) {
  // Which picker sheet is open: "from" | "to" | null
  const [openPicker, setOpenPicker] = useState(null)

  const fromCurrencyObj =
    SUPPORTED_CURRENCIES.find((c) => c.code === fromCurrency) ||
    SUPPORTED_CURRENCIES[0]

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
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-base font-extrabold text-neutral-800 tracking-tight leading-tight truncate sm:whitespace-normal">
                Currency Converter &amp; Live Rates
              </h3>
              {marketStatus?.isLive && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-neutral-500 font-medium leading-tight truncate sm:whitespace-normal mt-0.5">
              Live exchange rates via Currency API
            </p>
          </div>
        </div>

        {/* Refresh Button (Morphs from RefreshCw into Check on success) */}
        <motion.button
          whileHover={isRefreshed ? {} : neuButtonHover}
          whileTap={neuButtonTap}
          onClick={onRefresh}
          disabled={isLoadingRates}
          title="Refresh exchange rates"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-500 hover:text-brand-600 transition-[transform,color] cursor-pointer select-none shrink-0"
          style={{
            background: NEU.bg,
            boxShadow: isRefreshed ? NEU.insetSm : NEU.raisedSm,
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
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-start">

        {/* ── From: Amount Input + Currency Pill ── */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
            Amount to Convert
          </label>
          <div
            className="flex items-center px-3.5 h-13 rounded-2xl gap-2"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-inset-sm)",
            }}
          >
            {/* Numeric amount input */}
            <input
              type="number"
              min="0"
              step="any"
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value)}
              className="w-full bg-transparent text-sm font-extrabold text-neutral-800 outline-none min-w-0"
              placeholder="0.00"
            />

            {/* From Currency Pill — opens picker sheet */}
            <motion.button
              whileHover={neuButtonHover}
              whileTap={neuButtonTap}
              onClick={() => setOpenPicker("from")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shrink-0 cursor-pointer select-none transition-[transform]"
              style={{
                background: NEU.bg,
                boxShadow: NEU.raisedSm,
              }}
              aria-label={`From currency: ${fromCurrency}`}
            >
              <CountryFlag code={fromCurrency} size="sm" />
              <span className="text-xs font-bold text-neutral-700">{fromCurrency}</span>
              <MorphIcon
                icon={ChevronDown}
                size={11}
                strokeWidth={2.6}
                className="text-neutral-400"
              />
            </motion.button>
          </div>

          {/* Quick Amount Presets */}
          {addAmount && clearAmount && (
            <CurrencyQuickAmounts
              onAddAmount={addAmount}
              onClearAmount={clearAmount}
              currentAmount={convertAmount}
            />
          )}
        </div>

        {/* Swap Button (Morphs between ArrowRightLeft and ArrowLeftRight) */}
        <div className="flex flex-col items-center justify-start md:col-span-1">
          <div
            className="hidden md:block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-0 select-none pointer-events-none"
            aria-hidden="true"
          >
            &nbsp;
          </div>
          <div className="h-13 flex items-center justify-center">
            <motion.button
              whileHover={neuButtonHover}
              whileTap={neuButtonTap}
              onClick={onSwap}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-brand-600 cursor-pointer transition-[transform] select-none"
              style={{
                background: NEU.bg,
                boxShadow: NEU.raisedSm,
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
        </div>

        {/* ── Target Currency Selector Pill ── */}
        <div className="md:col-span-3">
          <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
            Target Currency
          </label>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 1, boxShadow: NEU.pressed }}
            onClick={() => setOpenPicker("to")}
            className="w-full flex items-center gap-3 px-3.5 h-13 rounded-2xl cursor-pointer select-none transition-[transform]"
            style={{
              background: NEU.bg,
              boxShadow: NEU.insetSm,
            }}
            aria-label={`To currency: ${toCurrency}`}
          >
            <CountryFlag code={toCurrency} size="md" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-extrabold text-neutral-800 leading-tight">{toCurrency}</p>
              <p className="text-[10px] text-neutral-400 leading-tight truncate">{toCurrencyObj?.name}</p>
            </div>
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0"
              style={{
                background: "var(--neu-bg)",
                boxShadow: "var(--neu-raised-sm)",
              }}
            >
              <span className="text-xs font-bold text-neutral-500">{toCurrencyObj?.symbol}</span>
              <MorphIcon
                icon={ChevronDown}
                size={11}
                strokeWidth={2.6}
                className="text-neutral-400"
              />
            </div>
          </motion.button>
        </div>
      </div>

      {/* ── Conversion Result Display Card ── */}
      <ConversionResultCard
        convertAmount={convertAmount}
        fromCurrency={fromCurrency}
        toCurrency={toCurrency}
        toCurrencyObj={toCurrencyObj}
        convertedValue={convertedValue}
        singleUnitRate={singleUnitRate}
        inverseRate={inverseRate}
        ratesData={ratesData}
      />

      {/* ── Global Market Reference Rates Sliding Carousel ── */}
      <LiveRatesCarousel
        ratesData={ratesData}
        currentCurrencyCode={currentCurrencyCode}
      />

      {/* ── From Currency Picker Sheet ── */}
      <CurrencyPickerSheet
        isOpen={openPicker === "from"}
        onClose={() => setOpenPicker(null)}
        currentCurrencyCode={fromCurrency}
        onSelectCurrency={(code) => {
          setFromCurrency(code)
          setOpenPicker(null)
        }}
        isUpdating={false}
        title="From Currency"
        subtitle="Select the currency you want to convert from"
        closeOnSelect={false}
      />

      {/* ── To Currency Picker Sheet ── */}
      <CurrencyPickerSheet
        isOpen={openPicker === "to"}
        onClose={() => setOpenPicker(null)}
        currentCurrencyCode={toCurrency}
        onSelectCurrency={(code) => {
          setToCurrency(code)
          setOpenPicker(null)
        }}
        isUpdating={false}
        title="Target Currency"
        subtitle="Select the currency you want to convert to"
        closeOnSelect={false}
      />
    </div>
  )
}
