import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"
import { triggerHaptic } from "../../lib/haptics"
import { FILTER_TABS } from "../../constants/accountConstants"

/**
 * AccountFilterTabs — Horizontally scrollable category filter tabs track
 * with dynamic scroll boundaries, gradient fades, active morphing pill, and item counters.
 */
export default function AccountFilterTabs({
  selectedType = "all",
  onSelectType,
  getTabCount,
  archivedCount = 0,
}) {
  const activeTabRef = useRef(null)
  const tabsContainerRef = useRef(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Measure whether categories are scrollable left or right
  const checkScrollBounds = useCallback(() => {
    const el = tabsContainerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const maxScroll = scrollWidth - clientWidth
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(maxScroll > 4 && scrollLeft < maxScroll - 4)
  }, [])

  // Monitor scroll events and container resize for responsive scroll indication
  useEffect(() => {
    const el = tabsContainerRef.current
    if (!el) return

    const rafId = requestAnimationFrame(checkScrollBounds)
    el.addEventListener("scroll", checkScrollBounds, { passive: true })

    const resizeObserver = new ResizeObserver(() => {
      checkScrollBounds()
    })
    resizeObserver.observe(el)

    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener("scroll", checkScrollBounds)
      resizeObserver.disconnect()
    }
  }, [checkScrollBounds, archivedCount])

  // Re-check scroll bounds after tab change or programmatic scroll
  useEffect(() => {
    const timer = setTimeout(checkScrollBounds, 350)
    return () => clearTimeout(timer)
  }, [selectedType, checkScrollBounds])

  const handleScrollCategories = (direction) => {
    if (!tabsContainerRef.current) return
    const scrollAmount = direction === "left" ? -180 : 180
    tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    triggerHaptic("light")
  }

  // Smoothly center active filter tab into view only when the container is overflowing and the tab is out of view
  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      const container = tabsContainerRef.current
      const tab = activeTabRef.current
      if (container.scrollWidth > container.clientWidth) {
        const containerLeft = container.scrollLeft
        const containerRight = containerLeft + container.clientWidth
        const tabLeft = tab.offsetLeft
        const tabRight = tabLeft + tab.offsetWidth

        if (tabLeft < containerLeft || tabRight > containerRight) {
          tab.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          })
        }
      }
    }
  }, [selectedType])

  return (
    <div className="relative w-full">
      {/* Left Scroll Indicator & Gradient Fade */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 inset-y-0 z-10 flex items-center pl-1 sm:pl-1.5 pointer-events-none"
          >
            {/* Gradient mask */}
            <div
              className="absolute inset-y-0.5 left-0 w-12 sm:w-16 rounded-l-2xl pointer-events-none"
              style={{
                background: `linear-gradient(to right, ${NEU.bg} 40%, rgba(237, 240, 247, 0) 100%)`,
              }}
            />
            {/* Scroll button */}
            <motion.button
              type="button"
              onClick={() => handleScrollCategories("left")}
              className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-neutral-600 hover:text-neutral-900 active:text-brand-600 transition-colors pointer-events-auto cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
              style={{
                background: NEU.bg,
                boxShadow: NEU.raisedSm,
              }}
              whileHover={neuButtonHover}
              whileTap={neuButtonTap}
              aria-label="Scroll categories left"
            >
              <ChevronLeft size={14} strokeWidth={2.6} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Scroll Indicator & Gradient Fade */}
      <AnimatePresence>
        {canScrollRight && (
          <motion.div
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 inset-y-0 z-20 flex items-center justify-end pr-1 sm:pr-1.5 pointer-events-none"
          >
            {/* Gradient mask */}
            <div
              className="absolute inset-y-0.5 right-0 w-12 sm:w-16 rounded-r-2xl pointer-events-none"
              style={{
                background: `linear-gradient(to left, ${NEU.bg} 40%, rgba(237, 240, 247, 0) 100%)`,
              }}
            />
            {/* Scroll button */}
            <motion.button
              type="button"
              onClick={() => handleScrollCategories("right")}
              className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-neutral-600 hover:text-neutral-900 active:text-brand-600 transition-colors pointer-events-auto cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
              style={{
                background: NEU.bg,
                boxShadow: NEU.raisedSm,
              }}
              whileHover={neuButtonHover}
              whileTap={neuButtonTap}
              aria-label="Scroll categories right"
            >
              <motion.span
                animate={{ x: [0, 2, 0] }}
                transition={{
                  repeat: Infinity,
                  repeatDelay: 2.5,
                  duration: 1.2,
                  ease: "easeInOut",
                }}
                className="flex items-center justify-center"
              >
                <ChevronRight size={14} strokeWidth={2.6} />
              </motion.span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={tabsContainerRef}
        className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl overflow-x-auto scrollbar-none scroll-smooth touch-pan-x"
        style={{
          background: NEU.bg,
          boxShadow: NEU.insetSm,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {FILTER_TABS.map((tab) => {
          const isSelected = selectedType === tab.id
          const count = getTabCount ? getTabCount(tab.id) : 0
          const TabIcon = tab.icon
          const isArchived = tab.id === "archived"

          // Hide archived tab if user has no archived accounts
          if (isArchived && count === 0) return null

          return (
            <button
              key={tab.id}
              ref={isSelected ? activeTabRef : null}
              type="button"
              onClick={() => {
                onSelectType?.(tab.id)
                triggerHaptic("light")
              }}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 select-none ${
                isSelected
                  ? isArchived
                    ? "text-amber-700 font-extrabold"
                    : "text-brand-600 font-extrabold"
                  : "text-neutral-500 hover:text-neutral-800 active:text-neutral-900"
              }`}
            >
              {/* Morphing Active Pill Background */}
              {isSelected && (
                <motion.div
                  layoutId="activeAccountTabPill"
                  className="absolute inset-0 rounded-xl pointer-events-none transform-gpu"
                  transition={{
                    type: "spring",
                    stiffness: 460,
                    damping: 34,
                  }}
                  style={{ willChange: "transform" }}
                >
                  <div
                    className="w-full h-full rounded-xl"
                    style={{
                      background: NEU.bg,
                      boxShadow: NEU.raisedSm,
                    }}
                  />
                </motion.div>
              )}

              {/* Content sits above the animated pill */}
              <span className="relative z-10 flex items-center gap-2">
                <TabIcon
                  size={14}
                  strokeWidth={isSelected ? 2.6 : 2.2}
                  className={isSelected && isArchived ? "text-amber-600" : undefined}
                />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                    isSelected
                      ? isArchived
                        ? "bg-amber-500/15 text-amber-700"
                        : "bg-brand-500/15 text-brand-700"
                      : "bg-neutral-200/70 text-neutral-500"
                  }`}
                >
                  {count}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
