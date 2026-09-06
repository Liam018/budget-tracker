import { useState, useMemo } from "react"
import { AnimatePresence } from "motion/react"
import {
  SUPPORTED_CURRENCIES,
  convertCurrency,
  CURRENCY_REGIONS,
} from "../../services/currencyService"
import useCarouselScroll from "../../hooks/useCarouselScroll"
import RatesCarouselControls from "./RatesCarouselControls"
import RatesCarouselFilterTabs from "./RatesCarouselFilterTabs"
import LiveRateCard from "./LiveRateCard"

/**
 * LiveRatesCarousel — Smooth horizontal scrolling (or 2-row grid) carousel
 * displaying real-time global exchange rates relative to the user's base currency.
 * Features mouse drag-to-glide, hold-to-scroll, and auto-disabling boundary arrows.
 */
export default function LiveRatesCarousel({ ratesData, currentCurrencyCode }) {
  // 2 rows by default, toggle to 3 rows
  const [isTripleRow, setIsTripleRow] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState("all")

  // Filter out current currency from reference list
  const referenceCurrencies = useMemo(
    () => SUPPORTED_CURRENCIES.filter((c) => c.code !== currentCurrencyCode),
    [currentCurrencyCode]
  )

  const regionCodes = CURRENCY_REGIONS[selectedRegion]?.codes
  const filteredCurrencies = useMemo(() => {
    return referenceCurrencies.filter((c) => {
      if (!regionCodes) return true
      return regionCodes.includes(c.code)
    })
  }, [referenceCurrencies, regionCodes])

  // Custom carousel scrolling, boundary detection, and drag gestures
  const {
    contentRef,
    canScrollLeft,
    canScrollRight,
    startContinuousScroll,
    stopContinuousScroll,
    sliderProps,
  } = useCarouselScroll([selectedRegion, isTripleRow, filteredCurrencies.length])

  return (
    <div className="mt-5 pt-4 border-t border-neutral-200/60">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Live Rates relative to 1 {currentCurrencyCode}
          </p>
          <p className="text-[10px] text-neutral-400 hidden sm:block">
            Swipe or use controls to browse world currencies
          </p>
        </div>

        {/* Controls: 2 Rows (default) / 3 Rows Toggle & Navigation Arrows */}
        <RatesCarouselControls
          isTripleRow={isTripleRow}
          onToggleTripleRow={() => setIsTripleRow((prev) => !prev)}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          onStartScroll={startContinuousScroll}
          onStopScroll={stopContinuousScroll}
        />
      </div>

      {/* Regional Filter Tabs */}
      <div className="mb-2">
        <RatesCarouselFilterTabs
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />
      </div>

      {/* Horizontal Sliding 2-Row or 3-Row Grid (Mouse & Touch Draggable) */}
      <div
        {...sliderProps}
        className="overflow-x-auto scrollbar-none py-3 px-2 overscroll-x-contain cursor-grab active:cursor-grabbing select-none relative"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div
          ref={contentRef}
          className={
            isTripleRow
              ? "grid grid-rows-3 grid-flow-col gap-3 w-max"
              : "grid grid-rows-2 grid-flow-col gap-3 w-max"
          }
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredCurrencies.map((curr, index) => {
              const r = ratesData
                ? convertCurrency(1, currentCurrencyCode, curr.code, ratesData)
                : 0
              return (
                <LiveRateCard
                  key={curr.code}
                  curr={curr}
                  rate={r}
                  isTripleRow={isTripleRow}
                  index={index}
                />
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
