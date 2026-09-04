import { useMemo } from "react"
import { MorphIcon } from "morphicons/react"
import { Calculator } from "lucide"
import { CountryFlag } from "../ui"
import { NEU } from "../../lib/neu"

const DENOMINATIONS = [1, 5, 10, 20, 50, 100, 500, 1000]

/**
 * DenominationColumn — Reusable column mapping standard bill denominations
 * from a source currency to a target currency with precise number formatting.
 */
function DenominationColumn({
  sourceCode,
  targetCode,
  rate,
  targetSymbol,
}) {
  const rows = useMemo(() => {
    if (!rate) return []
    return DENOMINATIONS.map((amt) => ({
      amount: amt,
      converted: amt * rate,
    }))
  }, [rate])

  return (
    <div
      className="p-3.5 rounded-2xl"
      style={{
        background: NEU.bg,
        boxShadow: NEU.insetSm,
      }}
    >
      {/* Column Direction Header */}
      <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-neutral-200/50">
        <CountryFlag code={sourceCode} size="sm" />
        <span className="text-xs font-bold text-neutral-700">{sourceCode}</span>
        <span className="text-xs text-neutral-400">➔</span>
        <CountryFlag code={targetCode} size="sm" />
        <span className="text-xs font-bold text-brand-600">{targetCode}</span>
      </div>

      {/* Row Values */}
      <div className="space-y-1.5">
        {rows.map(({ amount, converted }) => (
          <div
            key={amount}
            className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-black/2 transition-colors"
          >
            <span className="font-semibold text-neutral-600">
              {amount.toLocaleString()} {sourceCode}
            </span>
            <span className="font-extrabold text-neutral-800">
              {targetSymbol ? `${targetSymbol} ` : ""}
              {converted.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: converted < 1 ? 4 : 2,
              })}
              {!targetSymbol ? ` ${targetCode}` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * CurrencyCheatsheetCard — Two-Column Traveler's FX Denomination Matrix
 * Provides instant mental arithmetic for standard bill denominations in both directions.
 */
export default function CurrencyCheatsheetCard({
  fromCurrency,
  toCurrency,
  singleUnitRate,
  inverseRate,
  toCurrencyObj,
}) {
  if (!singleUnitRate || fromCurrency === toCurrency) return null

  return (
    <div
      className="p-4 sm:p-6 rounded-3xl"
      style={{
        background: NEU.bg,
        boxShadow: NEU.raisedSm,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-brand-600 shrink-0"
          style={{
            background: NEU.bg,
            boxShadow: NEU.insetSm,
          }}
        >
          <MorphIcon icon={Calculator} size={16} strokeWidth={2.4} className="text-brand-600" />
        </div>
        <div>
          <h3 className="text-xs sm:text-base font-extrabold text-neutral-800 tracking-tight leading-tight">
            Traveler&apos;s FX Cheatsheet
          </h3>
          <p className="text-[10px] sm:text-xs text-neutral-500 font-medium leading-tight mt-0.5">
            Quick reference values for standard pocket denominations
          </p>
        </div>
      </div>

      {/* Two-Column Comparative Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <DenominationColumn
          sourceCode={fromCurrency}
          targetCode={toCurrency}
          rate={singleUnitRate}
          targetSymbol={toCurrencyObj?.symbol}
        />
        <DenominationColumn
          sourceCode={toCurrency}
          targetCode={fromCurrency}
          rate={inverseRate}
        />
      </div>
    </div>
  )
}
