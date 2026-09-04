import { useRef, useState, useEffect, useCallback } from "react"

/**
 * useCarouselScroll — Custom hook managing smooth continuous gliding,
 * mouse drag-to-scroll, and dynamic boundary detection for scrollable carousels.
 *
 * @param {Array} dependencies - Array of reactive values (e.g. layout toggle, selected tab, item count)
 *                                that trigger a scroll reset and boundary recalculation when changed.
 */
export default function useCarouselScroll(dependencies = []) {
  const sliderRef = useRef(null)
  const contentRef = useRef(null)

  // Mouse drag-to-scroll state
  const isMouseDown = useRef(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)
  const [isDraggingMouse, setIsDraggingMouse] = useState(false)

  // Boundary & hold-to-scroll states
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollIntervalRef = useRef(null)
  const scrollTimeoutRef = useRef(null)

  const stopContinuousScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = null
    }
    if (scrollIntervalRef.current) {
      cancelAnimationFrame(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }, [])

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

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0 || !sliderRef.current) return
    stopContinuousScroll()
    isMouseDown.current = true
    startX.current = e.pageX - sliderRef.current.offsetLeft
    scrollLeftStart.current = sliderRef.current.scrollLeft
  }, [stopContinuousScroll])

  const handleMouseLeave = useCallback(() => {
    isMouseDown.current = false
    setIsDraggingMouse(false)
  }, [])

  const handleMouseUp = useCallback(() => {
    isMouseDown.current = false
    setIsDraggingMouse(false)
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isMouseDown.current || !sliderRef.current) return
    e.preventDefault()
    setIsDraggingMouse(true)
    const x = e.pageX - sliderRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    sliderRef.current.scrollLeft = scrollLeftStart.current - walk
  }, [])

  const startContinuousScroll = useCallback((direction) => {
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
  }, [canScrollLeft, canScrollRight, stopContinuousScroll, updateScrollBounds])

  // Attach scroll, resize, and ResizeObserver
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
  }, [updateScrollBounds, stopContinuousScroll, ...dependencies]) // eslint-disable-line react-hooks/exhaustive-deps

  // Recalculate bounds and reset scroll when dependencies change
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
  }, [updateScrollBounds, ...dependencies]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    sliderRef,
    contentRef,
    canScrollLeft,
    canScrollRight,
    isDraggingMouse,
    startContinuousScroll,
    stopContinuousScroll,
    updateScrollBounds,
    sliderProps: {
      ref: sliderRef,
      onMouseDown: handleMouseDown,
      onMouseLeave: handleMouseLeave,
      onMouseUp: handleMouseUp,
      onMouseMove: handleMouseMove,
      onTouchStart: stopContinuousScroll,
    },
  }
}
