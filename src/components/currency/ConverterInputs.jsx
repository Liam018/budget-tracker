import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import {
  ArrowRightLeft,
  ArrowLeftRight,
  ChevronDown,
  X,
} from "lucide"
import { CountryFlag } from "../ui"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"
import CurrencyQuickAmounts from "./CurrencyQuickAmounts"

/**
 * ConverterInputs — Responsive grid containing the amount input with inline clear,
 * source currency pill, vector-morphing swap button, and target currency selector.
 */
export default function ConverterInputs({
  convertAmount,
  setConvertAmount,
  clearAmount,
  addAmount,
  fromCurrency,
  toCurrency,
  toCurrencyObj,
  isSwapped,
  onSwap,
  onOpenPicker,
}) {
  const isSameCurrency = fromCurrency === toCurrency

  return (
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

          {/* In-Input Quick Clear Button */}
          {Boolean(convertAmount) && clearAmount && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearAmount}
              title="Clear amount"
              aria-label="Clear amount"
              className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
            >
              <MorphIcon icon={X} size={13} strokeWidth={2.5} />
            </motion.button>
          )}

          {/* From Currency Pill — opens picker sheet */}
          <motion.button
            whileHover={neuButtonHover}
            whileTap={neuButtonTap}
            onClick={() => onOpenPicker("from")}
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
        {addAmount && (
          <CurrencyQuickAmounts onAddAmount={addAmount} />
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
            whileHover={isSameCurrency ? {} : neuButtonHover}
            whileTap={isSameCurrency ? {} : neuButtonTap}
            onClick={onSwap}
            disabled={isSameCurrency}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-[transform] select-none ${
              isSameCurrency
                ? "opacity-50 cursor-not-allowed text-neutral-400"
                : "text-brand-600 cursor-pointer"
            }`}
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
                className={isSameCurrency ? "text-neutral-400" : "text-brand-600"}
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
          onClick={() => onOpenPicker("to")}
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
  )
}
