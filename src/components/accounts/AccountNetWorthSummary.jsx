import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { TrendingUp, ArrowUpRight, ArrowDownRight, ShieldCheck } from "lucide"
import { formatCurrency } from "../../services/accountService"
import { NEU } from "../../lib/neu"

/**
 * AccountNetWorthSummary — Neumorphic hero card summarizing
 * total net worth, assets, and liabilities.
 */
export default function AccountNetWorthSummary({
  metrics,
  currency = "PHP",
  onAddAccount,
}) {
  const { netWorth, totalAssets, totalLiabilities, activeCount } = metrics

  return (
    <div
      className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative overflow-hidden"
      style={{
        background: "var(--neu-bg)",
        boxShadow: "var(--neu-raised)",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            
            <span className="text-[11px] font-medium text-neutral-400">
              {activeCount} {activeCount === 1 ? "Active Account" : "Active Accounts"}
            </span>
          </div>

          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500">
            Total Net Worth
          </h2>

          <div className="flex items-baseline gap-2 mt-0.5">
            <h1 className="text-3xl sm:text-4xl font-black text-neutral-800 tracking-tight">
              {formatCurrency(netWorth, currency)}
            </h1>
            <span className="text-xs font-bold text-neutral-400 font-sans">
              {currency}
            </span>
          </div>
        </div>

        {/* Breakdown Pills (Assets vs Liabilities) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full md:w-auto">
          {/* Total Assets */}
          <div
            className="p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 min-w-36 sm:min-w-44"
            style={{
              background: NEU.bg,
              boxShadow: NEU.insetSm,
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <MorphIcon icon={ArrowUpRight} size={16} strokeWidth={2.6} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Total Assets
              </p>
              <p className="text-sm sm:text-base font-extrabold text-emerald-600 tracking-tight truncate">
                {formatCurrency(totalAssets, currency)}
              </p>
            </div>
          </div>

          {/* Total Liabilities */}
          <div
            className="p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 min-w-36 sm:min-w-44"
            style={{
              background: NEU.bg,
              boxShadow: NEU.insetSm,
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
              <MorphIcon icon={ArrowDownRight} size={16} strokeWidth={2.6} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Liabilities
              </p>
              <p className="text-sm sm:text-base font-extrabold text-rose-600 tracking-tight truncate">
                {formatCurrency(totalLiabilities, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
