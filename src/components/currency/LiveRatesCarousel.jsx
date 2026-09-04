import { useRef, useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  SUPPORTED_CURRENCIES,
  convertCurrency,
  CURRENCY_REGIONS,
} from "../../services/currencyService"
import RatesCarouselControls from "./RatesCarouselControls"
import RatesCarouselFilterTabs from "./RatesCarouselFilterTabs"
import LiveRateCard from "./LiveRateCard"

/**
 * LiveRatesCarousel — Smooth horizontal scrolling (or 2-row grid) carousel
 * displaying real-time global exchange rates relative to the user's base currency.
 * Features mouse drag-to-glide, hold-to-scroll, and auto-disabling boundary arrows.
 */
export default function LiveRatesCarousel({ ratesData, currentCurrencyCode }) {
  const sliderRef = useRef(null)
  const contentRef = useRef(null)
  const [isDoubleRow, setIsDoubleRow] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState("all")

  // Filter out current currency from reference list
  const referenceCurrencies = SUPPORTED_CURRENCIES.filter(
    (c) => c.code !== currentCurrencyCode
  )

  const regionCodes = CURRENCY_REGIONS[selectedRegion]?.codes
  const filteredCurrencies = referenceCurrencies.filter((c) => {
    if (!regionCodes) return true
    return regionCodes.includes(c.code)
  })

  // Mouse drag-to-scroll state
  const isMouseDown = useRef(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)
  const [isDraggingMouse, setIsDraggingMouse] = useState(false)

  function handleMouseDown(e) {
    if (e.button !== 0 || !sliderRef.current) return
    isMouseDown.current = true
    startX.current = e.pageX - sliderRef.current.offsetLeft
    scrollLeftStart.current = sliderRef.current.scrollLeft
  }

  function handleMouseLeave() {
    isMouseDown.current = false
    setIsDraggingMouse(false)
  }

  function handleMouseUp() {
    isMouseDown.current = false
    setIsDraggingMouse(false)
  }

  function handleMouseMove(e) {
    if (!isMouseDown.current || !sliderRef.current) return
    e.preventDefault()
    setIsDraggingMouse(true)
    const x = e.pageX - sliderRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    sliderRef.current.scrollLeft = scrollLeftStart.current - walk
  }

  // Scroll boundary & continuous scroll states
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollIntervalRef = useRef(null)
  const scrollTimeoutRef = useRef(null)

  const updateScrollBounds = useCallback(() => {
    if (!sliderRef.current) return
    const { scrollLeft, clientWidth } = sliderRef.current
    const scrollWidth = contentRef.current
      ? contentRef.current.offsetWidth
      : sliderRef.current.scrollWidth

    const maxScroll = scrollWidth - clientWidth

    // If all cards fit completely within the visible container, disable both arrows
    if (maxScroll <= 4) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }

    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft < maxScroll - 4)
  }, [])

  function stopContinuousScroll() {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = null
    }
    if (scrollIntervalRef.current) {
      cancelAnimationFrame(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }

  function startContinuousScroll(direction) {
    stopContinuousScroll()
    if (!sliderRef.current) return

    if (direction === "left" && !canScrollLeft) return
    if (direction === "right" && !canScrollRight) return

    // 1. Immediate step scroll on initial press
    const step = direction === "left" ? -240 : 240
    sliderRef.current.scrollBy({ left: step, behavior: "smooth" })

    // 2. After 250ms of holding, smoothly glide continuously
    scrollTimeoutRef.current = setTimeout(() => {
      const scrollSpeed = direction === "left" ? -12 : 12

      function stepFrame() {
        if (!sliderRef.current) return
        const { scrollLeft, clientWidth } = sliderRef.current
        const scrollWidth = contentRef.current
          ? contentRef.current.offsetWidth
          : sliderRef.current.scrollWidth

        if (direction === "left" && scrollLeft <= 0) {
          stopContinuousScroll()
          updateScrollBounds()
          return
        }
        if (direction === "right" && scrollLeft >= scrollWidth - clientWidth - 2) {
          stopContinuousScroll()
          updateScrollBounds()
          return
        }

        sliderRef.current.scrollLeft += scrollSpeed
        updateScrollBounds()
        scrollIntervalRef.current = requestAnimationFrame(stepFrame)
      }

      scrollIntervalRef.current = requestAnimationFrame(stepFrame)
    }, 250)
  }

  useEffect(() => {
    const el = sliderRef.current
    const content = contentRef.current
    if (!el) return
    updateScrollBounds()

    const handleScroll = () => updateScrollBounds()
    el.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)

    let ro = null
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        updateScrollBounds()
      })
      ro.observe(el)
      if (content) ro.observe(content)
    }

    return () => {
      stopContinuousScroll()
      el.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
      if (ro) ro.disconnect()
    }
  }, [updateScrollBounds, isDoubleRow, selectedRegion])

  // Recalculate bounds and reset scroll when region, double row, or currencies change
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollLeft = 0
      updateScrollBounds()
      const raf = requestAnimationFrame(updateScrollBounds)
      const t1 = setTimeout(updateScrollBounds, 60)
      const t2 = setTimeout(updateScrollBounds, 250)
      const t3 = setTimeout(updateScrollBounds, 450)
      return () => {
        cancelAnimationFrame(raf)
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    }
  }, [selectedRegion, isDoubleRow, filteredCurrencies.length, updateScrollBounds])

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

        {/* Controls: 1 Row / 2 Rows Toggle & Navigation Arrows */}
        <RatesCarouselControls
          isDoubleRow={isDoubleRow}
          onToggleDoubleRow={() => setIsDoubleRow((prev) => !prev)}
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

      {/* Horizontal Sliding Row or Double Row Grid (Mouse & Touch Draggable) */}
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="overflow-x-auto scrollbar-none py-3 px-2 overscroll-x-contain cursor-grab active:cursor-grabbing select-none relative"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div
          ref={contentRef}
          className={
            isDoubleRow
              ? "grid grid-rows-2 grid-flow-col gap-3 w-max"
              : "flex gap-3 w-max"
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
                  isDoubleRow={isDoubleRow}
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
