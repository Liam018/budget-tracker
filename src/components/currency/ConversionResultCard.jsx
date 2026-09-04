import { useState } from "react"
import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Copy, Check } from "lucide"
import { toast } from "../ui"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"

/**
 * ConversionResultCard.jsx — Neumorphic Conversion Output Display
 *
 * Displays:
 * - Computed converted value with formatted decimal places and target currency symbol
 * - Current single-unit conversion rate (e.g. 1 USD = 58.42 PHP)
 * - Inverse exchange rate (e.g. 1 PHP = 0.0171 USD)
 * - One-tap copy conversion summary to clipboard with checkmark feedback
 */
export default function ConversionResultCard({
  convertAmount,
  fromCurrency,
  toCurrency,
  toCurrencyObj,
  convertedValue,
  singleUnitRate,
  inverseRate,
  ratesData,
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!convertedValue) return
    const formattedVal = convertedValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
    const text = `${convertAmount || "0"} ${fromCurrency} = ${toCurrencyObj?.symbol || ""}${formattedVal} ${toCurrency} (1 ${fromCurrency} = ${singleUnitRate} ${toCurrency})`

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Conversion copied to clipboard")
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-neutral-200/60">
      <div
        className="p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative"
        style={{
          background: NEU.bg,
          boxShadow: NEU.insetSm,
        }}
      >
        <div className="min-w-0 pr-8 sm:pr-0">
          <p className="text-xs font-bold text-neutral-500">
            {convertAmount || "0"} {fromCurrency} =
          </p>
          <p className="text-2xl sm:text-3xl font-black text-brand-600 tracking-tight mt-0.5 truncate">
            {toCurrencyObj?.symbol || ""}{" "}
            {convertedValue !== null
              ? convertedValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })
              : "..."}
            <span className="text-sm font-bold text-neutral-400 ml-1.5 font-sans">
              {toCurrency}
            </span>
          </p>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-neutral-200/50 shrink-0">
          <div className="sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Direct &amp; Inverse Rate
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-neutral-800 block">
              1 {fromCurrency} = {singleUnitRate ? singleUnitRate.toFixed(4) : "..."} {toCurrency}
            </span>
            {inverseRate > 0 && fromCurrency !== toCurrency && (
              <span className="text-[11px] font-semibold text-neutral-500 block mt-0.5">
                1 {toCurrency} = {inverseRate.toFixed(4)} {fromCurrency}
              </span>
            )}
          </div>

          {/* Copy Result Button */}
          <motion.button
            type="button"
            whileHover={neuButtonHover}
            whileTap={neuButtonTap}
            onClick={handleCopy}
            title="Copy conversion summary"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-neutral-600 hover:text-brand-600 transition-colors cursor-pointer select-none shrink-0"
            style={{
              background: NEU.bg,
              boxShadow: NEU.raisedSm,
            }}
          >
            <MorphIcon
              icon={copied ? Check : Copy}
              size={13}
              strokeWidth={2.4}
              spring="snappy"
              className={copied ? "text-emerald-600" : "text-neutral-500"}
            />
            <span>{copied ? "Copied" : "Copy"}</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
