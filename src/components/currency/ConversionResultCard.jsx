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

  const isSameCurrency = Boolean(fromCurrency && toCurrency && fromCurrency === toCurrency)

  const handleCopy = async (e) => {
    e?.stopPropagation?.()
    if (copied || isSameCurrency) return
    if (convertedValue === null || convertedValue === undefined) return

    const numVal =
      typeof convertedValue === "number" && !isNaN(convertedValue)
        ? convertedValue
        : 0
    const formattedVal = numVal.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
    const text = `${convertAmount || "0"} ${fromCurrency} = ${toCurrencyObj?.symbol || ""}${formattedVal} ${toCurrency} (1 ${fromCurrency} = ${singleUnitRate ? singleUnitRate.toFixed(4) : "..."} ${toCurrency})`

    let success = false

    // Method 1: Modern asynchronous Clipboard API (secure context HTTPS or localhost)
    if (navigator?.clipboard?.writeText && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text)
        success = true
      } catch (err) {
        console.warn("navigator.clipboard.writeText failed, attempting fallback:", err)
      }
    }

    // Method 2: Robust fallback for iOS Safari, Android Chrome, HTTP LAN, and webviews
    if (!success) {
      try {
        const textArea = document.createElement("textarea")
        textArea.value = text
        // Keep in viewport without visual disruption or keyboard popup
        textArea.style.position = "fixed"
        textArea.style.top = "0"
        textArea.style.left = "0"
        textArea.style.width = "2em"
        textArea.style.height = "2em"
        textArea.style.padding = "0"
        textArea.style.border = "none"
        textArea.style.outline = "none"
        textArea.style.boxShadow = "none"
        textArea.style.background = "transparent"
        textArea.style.fontSize = "16px" // Prevents iOS Safari auto-zoom
        document.body.appendChild(textArea)

        textArea.focus()
        textArea.select()
        textArea.setSelectionRange(0, text.length)

        // Mobile iOS selection range fallback
        const range = document.createRange()
        range.selectNodeContents(textArea)
        const selection = window.getSelection()
        if (selection) {
          selection.removeAllRanges()
          selection.addRange(range)
        }

        success = document.execCommand("copy")
        if (selection) {
          selection.removeAllRanges()
        }
        document.body.removeChild(textArea)
      } catch (err) {
        console.error("Copy fallback failed:", err)
      }
    }

    if (success) {
      setCopied(true)
      toast.success("Conversion copied to clipboard", {
        id: "copy-conversion-result",
      })
      setTimeout(() => setCopied(false), 1800)
    } else {
      toast.error("Failed to copy to clipboard", {
        id: "copy-conversion-result",
      })
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
        <div className="min-w-0">
          <p className="text-xs font-bold text-neutral-500">
            {convertAmount || "0"} {fromCurrency} =
          </p>
          {isSameCurrency ? (
            <p className="text-sm sm:text-base font-bold text-amber-600 mt-1">
              Select different currencies to convert
            </p>
          ) : (
            <p className="text-2xl sm:text-3xl font-black text-brand-600 tracking-tight mt-0.5 truncate">
              {toCurrencyObj?.symbol || ""}{" "}
              {convertedValue !== null && !isNaN(convertedValue)
                ? convertedValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })
                : "..."}
              <span className="text-sm font-bold text-neutral-400 ml-1.5 font-sans">
                {toCurrency}
              </span>
            </p>
          )}
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-neutral-200/50 shrink-0">
          <div className="sm:text-right min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Direct &amp; Inverse Rate
            </span>
            {isSameCurrency ? (
              <span className="text-xs font-semibold text-neutral-400 block">
                Identical currencies (1:1)
              </span>
            ) : (
              <>
                <span className="text-xs sm:text-sm font-extrabold text-neutral-800 block truncate">
                  1 {fromCurrency} = {singleUnitRate ? singleUnitRate.toFixed(4) : "..."} {toCurrency}
                </span>
                {inverseRate > 0 && fromCurrency !== toCurrency && (
                  <span className="text-[11px] font-semibold text-neutral-500 block mt-0.5 truncate">
                    1 {toCurrency} = {inverseRate.toFixed(4)} {fromCurrency}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Copy Result Button — disabled when already copied or same currency */}
          <motion.button
            type="button"
            disabled={copied || isSameCurrency}
            whileHover={copied || isSameCurrency ? {} : neuButtonHover}
            whileTap={copied || isSameCurrency ? {} : neuButtonTap}
            onClick={handleCopy}
            title={
              isSameCurrency
                ? "Cannot copy conversion of identical currencies"
                : copied
                ? "Copied to clipboard"
                : "Copy conversion summary"
            }
            aria-label={copied ? "Copied" : "Copy conversion summary"}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs sm:text-[11px] font-bold transition-all select-none shrink-0 touch-manipulation z-10 ${
              isSameCurrency
                ? "cursor-not-allowed opacity-50 text-neutral-400"
                : copied
                ? "cursor-default text-emerald-600 opacity-95 pointer-events-none"
                : "cursor-pointer text-neutral-600 hover:text-brand-600 active:scale-95"
            }`}
            style={{
              background: NEU.bg,
              boxShadow: copied ? NEU.insetSm : NEU.raisedSm,
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
