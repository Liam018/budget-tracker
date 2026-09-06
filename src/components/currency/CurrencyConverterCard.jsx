import { useState } from "react"
import { CurrencyPickerSheet } from "../profile"
import ConverterHeader from "./ConverterHeader"
import ConverterInputs from "./ConverterInputs"
import ConversionResultCard from "./ConversionResultCard"
import LiveRatesCarousel from "./LiveRatesCarousel"

/**
 * CurrencyConverterCard — Real-time interactive forex converter with
 * vector-morphing swap & refresh controls, neumorphic currency pill selectors,
 * and an embedded global rates carousel.
 */
export default function CurrencyConverterCard({
  ratesData,
  isLoadingRates,
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

  return (
    <div
      className="rounded-2xl sm:rounded-3xl p-4 sm:p-7"
      style={{
        background: "var(--neu-bg)",
        boxShadow: "var(--neu-raised)",
      }}
    >
      {/* ── Card Header (Live Status & Refresh Button) ── */}
      <ConverterHeader
        marketStatus={marketStatus}
        isLoadingRates={isLoadingRates}
        onRefresh={onRefresh}
      />

      {/* ── Converter Calculator Grid (From Amount, Swap, Target) ── */}
      <ConverterInputs
        convertAmount={convertAmount}
        setConvertAmount={setConvertAmount}
        clearAmount={clearAmount}
        addAmount={addAmount}
        fromCurrency={fromCurrency}
        toCurrency={toCurrency}
        toCurrencyObj={toCurrencyObj}
        isSwapped={isSwapped}
        onSwap={onSwap}
        onOpenPicker={setOpenPicker}
      />

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
        disabledCurrencyCode={toCurrency}
        disabledReason="Target"
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
        disabledCurrencyCode={fromCurrency}
        disabledReason="Source"
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
