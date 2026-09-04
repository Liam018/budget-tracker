import { useMemo } from "react"
import { MorphIcon } from "morphicons/react"
import { Calculator } from "lucide"
import { CountryFlag } from "../ui"
import { NEU } from "../../lib/neu"

const DENOMINATIONS = [1, 5, 10, 20, 50, 100, 500, 1000]

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
  const fromToTable = useMemo(() => {
    if (!singleUnitRate) return []
    return DENOMINATIONS.map((amt) => ({
      amount: amt,
      converted: amt * singleUnitRate,
    }))
  }, [singleUnitRate])

  const toFromTable = useMemo(() => {
    if (!inverseRate) return []
    return DENOMINATIONS.map((amt) => ({
      amount: amt,
      converted: amt * inverseRate,
    }))
  }, [inverseRate])

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

      {/* Two Column Comparative Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Column 1: FROM -> TO */}
        <div
          className="p-3.5 rounded-2xl"
          style={{
            background: NEU.bg,
            boxShadow: NEU.insetSm,
          }}
        >
          <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-neutral-200/50">
            <CountryFlag code={fromCurrency} size="sm" />
            <span className="text-xs font-bold text-neutral-700">{fromCurrency}</span>
            <span className="text-xs text-neutral-400">➔</span>
            <CountryFlag code={toCurrency} size="sm" />
            <span className="text-xs font-bold text-brand-600">{toCurrency}</span>
          </div>

          <div className="space-y-1.5">
            {fromToTable.map(({ amount, converted }) => (
              <div
                key={amount}
                className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-black/[0.02] transition-colors"
              >
                <span className="font-semibold text-neutral-600">
                  {amount.toLocaleString()} {fromCurrency}
                </span>
                <span className="font-extrabold text-brand-600">
                  {toCurrencyObj?.symbol || ""}
                  {converted.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: converted < 1 ? 4 : 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: TO -> FROM (Inverse) */}
        <div
          className="p-3.5 rounded-2xl"
          style={{
            background: NEU.bg,
            boxShadow: NEU.insetSm,
          }}
        >
          <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-neutral-200/50">
            <CountryFlag code={toCurrency} size="sm" />
            <span className="text-xs font-bold text-neutral-700">{toCurrency}</span>
            <span className="text-xs text-neutral-400">➔</span>
            <CountryFlag code={fromCurrency} size="sm" />
            <span className="text-xs font-bold text-brand-600">{fromCurrency}</span>
          </div>

          <div className="space-y-1.5">
            {toFromTable.map(({ amount, converted }) => (
              <div
                key={amount}
                className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-black/[0.02] transition-colors"
              >
                <span className="font-semibold text-neutral-600">
                  {amount.toLocaleString()} {toCurrency}
                </span>
                <span className="font-extrabold text-neutral-800">
                  {converted.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: converted < 1 ? 4 : 2,
                  })}{" "}
                  {fromCurrency}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
