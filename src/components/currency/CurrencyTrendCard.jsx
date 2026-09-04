import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { LineChart, TrendingUp, TrendingDown, Minus } from "lucide"
import { getHistoricalRates } from "../../services/currencyService"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"

/**
 * CurrencyTrendCard — Historical Forex Trend Sparkline (7D / 30D)
 * Fetches time-series points from ECB-backed Frankfurter API and renders a
 * high-performance SVG bezier sparkline curve.
 */
export default function CurrencyTrendCard({ fromCurrency, toCurrency }) {
  const [timeframe, setTimeframe] = useState(30) // 7 | 30
  const [historyData, setHistoryData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function fetchTrend() {
      if (fromCurrency === toCurrency) {
        setHistoryData(null)
        return
      }

      setIsLoading(true)
      setHasError(false)

      try {
        const data = await getHistoricalRates(fromCurrency, toCurrency, timeframe)
        if (!isCancelled) {
          if (data?.isUnsupported) {
            setHistoryData(null)
            setHasError(false)
          } else {
            setHistoryData(data)
            setHasError(false)
          }
        }
      } catch {
        if (!isCancelled) {
          setHasError(true)
          setHistoryData(null)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchTrend()

    return () => {
      isCancelled = true
    }
  }, [fromCurrency, toCurrency, timeframe])

  // Generate SVG path for the sparkline
  const chartPath = useMemo(() => {
    if (!historyData || !historyData.points || historyData.points.length < 2) return null

    const points = historyData.points
    const width = 600
    const height = 140
    const paddingX = 12
    const paddingY = 20

    const min = historyData.minRate
    const max = historyData.maxRate
    const range = max - min || 1

    const coords = points.map((p, i) => {
      const x = paddingX + (i / (points.length - 1)) * (width - paddingX * 2)
      const y = height - paddingY - ((p.rate - min) / range) * (height - paddingY * 2)
      return { x, y }
    })

    // Construct SVG path string
    const d = coords.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x},${pt.y}`
      return `${acc} L ${pt.x},${pt.y}`
    }, "")

    // Area fill path
    const areaD = `${d} L ${coords[coords.length - 1].x},${height} L ${coords[0].x},${height} Z`

    return { d, areaD, width, height }
  }, [historyData])

  if (fromCurrency === toCurrency) return null

  const isUp = (historyData?.changePct || 0) >= 0

  return (
    <div
      className="p-4 sm:p-6 rounded-3xl"
      style={{
        background: NEU.bg,
        boxShadow: NEU.raisedSm,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-brand-600 shrink-0"
            style={{
              background: NEU.bg,
              boxShadow: NEU.insetSm,
            }}
          >
            <MorphIcon icon={LineChart} size={16} strokeWidth={2.4} className="text-brand-600" />
          </div>
          <div>
            <h3 className="text-xs sm:text-base font-extrabold text-neutral-800 tracking-tight leading-tight">
              {fromCurrency}/{toCurrency} Historical Trend
            </h3>
            <p className="text-[10px] sm:text-xs text-neutral-500 font-medium leading-tight mt-0.5">
              ECB market movements over the past {timeframe} days
            </p>
          </div>
        </div>

        {/* Timeframe selector: 7D vs 30D */}
        <div
          className="flex items-center p-1 rounded-xl gap-1 shrink-0"
          style={{
            background: NEU.bg,
            boxShadow: NEU.insetSm,
          }}
        >
          {[7, 30].map((days) => {
            const isSelected = timeframe === days
            return (
              <motion.button
                key={days}
                type="button"
                whileHover={isSelected ? {} : neuButtonHover}
                whileTap={isSelected ? {} : neuButtonTap}
                onClick={() => setTimeframe(days)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer select-none ${
                  isSelected ? "text-brand-600 font-extrabold" : "text-neutral-500 hover:text-neutral-700"
                }`}
                style={{
                  background: isSelected ? NEU.bg : "transparent",
                  boxShadow: isSelected ? NEU.raisedSm : "none",
                }}
              >
                {days}D
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div
          className="h-40 rounded-2xl flex items-center justify-center text-xs text-neutral-400 font-medium"
          style={{
            background: NEU.bg,
            boxShadow: NEU.insetSm,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span>Fetching ECB trend data...</span>
          </div>
        </div>
      ) : hasError || !historyData ? (
        <div
          className="h-28 rounded-2xl flex items-center justify-center text-xs text-neutral-400 font-medium text-center p-4"
          style={{
            background: NEU.bg,
            boxShadow: NEU.insetSm,
          }}
        >
          <span>Historical ECB time-series is unavailable for {fromCurrency}/{toCurrency}. Live rates remain active.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Key Stat Badges */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black ${
                  isUp ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                }`}
              >
                <MorphIcon
                  icon={isUp ? TrendingUp : TrendingDown}
                  size={13}
                  strokeWidth={2.6}
                  className={isUp ? "text-emerald-600" : "text-rose-600"}
                />
                {isUp ? "+" : ""}
                {historyData.changePct.toFixed(2)}%
              </span>
              <span className="text-[11px] font-semibold text-neutral-400">
                in the last {timeframe} days
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-bold text-neutral-500">
              <span>Low: <strong className="text-neutral-800">{historyData.minRate.toFixed(4)}</strong></span>
              <span className="text-neutral-300">•</span>
              <span>High: <strong className="text-neutral-800">{historyData.maxRate.toFixed(4)}</strong></span>
            </div>
          </div>

          {/* SVG Sparkline Curve */}
          {chartPath && (
            <div
              className="p-3 rounded-2xl overflow-hidden"
              style={{
                background: NEU.bg,
                boxShadow: NEU.insetSm,
              }}
            >
              <svg
                viewBox={`0 0 ${chartPath.width} ${chartPath.height}`}
                className="w-full h-28 sm:h-32 overflow-visible"
              >
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area Fill */}
                <path d={chartPath.areaD} fill="url(#trendGradient)" />

                {/* Stroke Line */}
                <path
                  d={chartPath.d}
                  fill="none"
                  stroke={isUp ? "#10b981" : "#f43f5e"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
