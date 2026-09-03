import { useRef, useState, useEffect, useCallback } from "react"
import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import {
  ChevronLeft,
  ChevronRight,
  Rows2,
  StretchHorizontal,
} from "lucide"
import {
  SUPPORTED_CURRENCIES,
  convertCurrency,
} from "../../services/currencyService"
import { CountryFlag } from "../ui"

/**
 * LiveRatesCarousel — Smooth horizontal scrolling (or 2-row grid) carousel
 * displaying real-time global exchange rates relative to the user's base currency.
 * Features mouse drag-to-glide, hold-to-scroll, and auto-disabling boundary arrows.
 */
export default function LiveRatesCarousel({ ratesData, currentCurrencyCode }) {
  const sliderRef = useRef(null)
  const [isDoubleRow, setIsDoubleRow] = useState(false)

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
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollIntervalRef = useRef(null)
  const scrollTimeoutRef = useRef(null)

  const updateScrollBounds = useCallback(() => {
    if (!sliderRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
    setCanScrollLeft(scrollLeft > 6)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6)
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
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current

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
    if (!el) return
    updateScrollBounds()

    const handleScroll = () => updateScrollBounds()
    el.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)

    return () => {
      stopContinuousScroll()
      el.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [updateScrollBounds, isDoubleRow])

  // Filter out current currency from reference list
  const referenceCurrencies = SUPPORTED_CURRENCIES.filter(
    (c) => c.code !== currentCurrencyCode
  )

  return (
    <div className="mt-5 pt-4 border-t border-neutral-200/60">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Live Rates relative to 1 {currentCurrencyCode}
          </p>
          <p className="text-[10px] text-neutral-400 hidden sm:block">
            Swipe or use controls to view all global currencies
          </p>
        </div>

        {/* Controls: 1 Row / 2 Rows Toggle & Navigation Arrows */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Double Row Layout Toggle */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.88, boxShadow: "var(--neu-pressed)" }}
            onClick={() => setIsDoubleRow((prev) => !prev)}
            title={isDoubleRow ? "Switch to 1 row" : "Switch to 2 rows"}
            className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center cursor-pointer select-none touch-manipulation transition-all active:scale-90 ${
              isDoubleRow
                ? "text-brand-600"
                : "text-neutral-500 hover:text-brand-600 active:text-brand-600"
            }`}
            style={{
              background: "var(--neu-bg)",
              boxShadow: isDoubleRow ? "var(--neu-inset-sm)" : "var(--neu-raised-sm)",
            }}
            aria-label={isDoubleRow ? "Switch to 1 row" : "Switch to 2 rows"}
          >
            <MorphIcon
              icon={isDoubleRow ? Rows2 : StretchHorizontal}
              size={15}
              strokeWidth={2.4}
              spring="bouncy"
              className={isDoubleRow ? "text-brand-600" : "text-neutral-500"}
            />
          </motion.button>

          {/* Left Arrow (Click for step, hold to scroll continuously) */}
          <motion.button
            whileHover={canScrollLeft ? { scale: 1.06 } : {}}
            whileTap={canScrollLeft ? { scale: 0.88, boxShadow: "var(--neu-pressed)" } : {}}
            onPointerDown={() => canScrollLeft && startContinuousScroll("left")}
            onPointerUp={stopContinuousScroll}
            onPointerLeave={stopContinuousScroll}
            disabled={!canScrollLeft}
            className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all ${
              canScrollLeft
                ? "text-neutral-500 hover:text-brand-600 active:text-brand-600 cursor-pointer select-none touch-manipulation active:scale-90"
                : "text-neutral-400/70 cursor-not-allowed"
            }`}
            style={{
              background: "var(--neu-bg)",
              boxShadow: canScrollLeft ? "var(--neu-raised-sm)" : "var(--neu-inset-sm)",
            }}
            aria-label="Scroll left"
          >
            <MorphIcon
              icon={ChevronLeft}
              size={15}
              strokeWidth={canScrollLeft ? 2.4 : 1.8}
              className={canScrollLeft ? "text-neutral-500" : "text-neutral-400/70"}
            />
          </motion.button>

          {/* Right Arrow (Click for step, hold to scroll continuously) */}
          <motion.button
            whileHover={canScrollRight ? { scale: 1.06 } : {}}
            whileTap={canScrollRight ? { scale: 0.88, boxShadow: "var(--neu-pressed)" } : {}}
            onPointerDown={() => canScrollRight && startContinuousScroll("right")}
            onPointerUp={stopContinuousScroll}
            onPointerLeave={stopContinuousScroll}
            disabled={!canScrollRight}
            className={`w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all ${
              canScrollRight
                ? "text-neutral-500 hover:text-brand-600 active:text-brand-600 cursor-pointer select-none touch-manipulation active:scale-90"
                : "text-neutral-400/70 cursor-not-allowed"
            }`}
            style={{
              background: "var(--neu-bg)",
              boxShadow: canScrollRight ? "var(--neu-raised-sm)" : "var(--neu-inset-sm)",
            }}
            aria-label="Scroll right"
          >
            <MorphIcon
              icon={ChevronRight}
              size={15}
              strokeWidth={canScrollRight ? 2.4 : 1.8}
              className={canScrollRight ? "text-neutral-500" : "text-neutral-400/70"}
            />
          </motion.button>
        </div>
      </div>

      {/* Horizontal Sliding Row or Double Row Grid (Mouse & Touch Draggable) */}
      <motion.div
        layout="position"
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`overflow-x-auto scrollbar-none py-2.5 px-1 overscroll-x-contain cursor-grab active:cursor-grabbing select-none transition-all ${
          isDraggingMouse ? "" : "scroll-smooth"
        } ${
          isDoubleRow
            ? "grid grid-rows-2 grid-flow-col gap-3"
            : "flex gap-3"
        }`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {referenceCurrencies.map((curr) => {
          const r = ratesData
            ? convertCurrency(1, currentCurrencyCode, curr.code, ratesData)
            : 0
          return (
            <motion.div
              layout
              key={curr.code}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 30,
              }}
              className="shrink-0 min-w-33 sm:min-w-35 p-2.5 rounded-xl text-left select-none"
              style={{
                background: "var(--neu-bg)",
                boxShadow: "var(--neu-raised-sm)",
              }}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-bold text-neutral-700 flex items-center gap-1.5">
                  <CountryFlag code={curr.code} size="sm" />
                  <span>{curr.code}</span>
                </span>
                <span className="text-[10px] font-bold text-neutral-400">
                  {curr.symbol}
                </span>
              </div>
              <p className="text-xs font-black text-neutral-800 tracking-tight">
                {r > 100
                  ? r.toFixed(2)
                  : r > 1
                  ? r.toFixed(3)
                  : r.toFixed(4)}{" "}
                <span className="text-[10px] font-bold text-neutral-500">
                  {curr.code}
                </span>
              </p>
              <p
                className="text-[10px] text-neutral-400 truncate mt-0.5"
                title={curr.name}
              >
                {curr.name}
              </p>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
