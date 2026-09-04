import { useState, useEffect, useDeferredValue, useRef } from "react"
import { motion, AnimatePresence, useDragControls } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { X } from "lucide"
import { SUPPORTED_CURRENCIES } from "../../services/currencyService"
import { useScrollLock } from "../../hooks/useScrollLock"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"
import CurrencyListItem from "./CurrencyListItem"
import CurrencySearchBar from "./CurrencySearchBar"

/**
 * CurrencyPickerSheet — Adaptive Currency Picker.
 * - Mobile: Thumb-friendly bottom sheet with native swipe-down dismiss.
 * - Desktop: Centered Neumorphic dialog with scale spring physics & Escape listener.
 *
 * Props:
 *   title          — Sheet heading (default: "Choose Default Currency")
 *   subtitle       — Subheading below title
 *   closeOnSelect  — Auto-close after selection (default: false, caller handles)
 *
 * Search is debounced (300ms) so filtering only runs after the user pauses typing.
 * Results animate in/out with staggered spring physics via AnimatePresence + layout.
 */
export default function CurrencyPickerSheet({
  isOpen,
  onClose,
  currentCurrencyCode,
  onSelectCurrency,
  isUpdating,
  title = "Choose Default Currency",
  subtitle = "Select your primary currency for accounts and analytics",
  closeOnSelect = false,
}) {
  const [searchQuery, setSearchQuery] = useState("")
  // deferredQuery lags behind searchQuery by ~300ms — React processes
  // the urgent keystroke paint first, then re-renders the heavy list.
  const deferredQuery = useDeferredValue(searchQuery)
  const isStale = searchQuery !== deferredQuery

  const dragControls = useDragControls()
  const inputRef = useRef(null)

  // Prevent background scroll while picker is open
  useScrollLock(isOpen)

  // Track responsive viewport state
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  )

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 640)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Reset search when sheet opens/closes
  useEffect(() => {
    if (!isOpen) setSearchQuery("")
  }, [isOpen])

  // Filtered list only updates when deferredQuery changes (debounced)
  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(deferredQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(deferredQuery.toLowerCase())
  )

  function handleDragEnd(event, info) {
    if (info.offset.y > 50 || info.velocity.y > 180) {
      onClose()
    }
  }

  // Animation variants depending on mobile vs desktop
  const motionProps = isMobile
    ? {
        drag: "y",
        dragControls: dragControls,
        dragListener: false,
        dragDirectionLock: true,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0.02, bottom: 0.65 },
        dragSnapToOrigin: true,
        onDragEnd: handleDragEnd,
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: { type: "spring", stiffness: 420, damping: 32, mass: 0.8 },
      }
    : {
        drag: false,
        initial: { scale: 0.94, y: 10 },
        animate: { scale: 1, y: 0 },
        exit: { scale: 0.94, y: 8 },
        transition: { type: "spring", stiffness: 440, damping: 28 },
      }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex pointer-events-none ${
            isMobile
              ? "flex-col justify-end"
              : "items-center justify-center p-4"
          }`}
        >
          {/* ── Pure Frosted Blur Backdrop with synchronized fade-out on exit ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-md pointer-events-auto"
            aria-hidden="true"
          />

          {/* ── Adaptive Card (Bottom Sheet on Mobile, Centered Modal on Desktop) ── */}
          <motion.div
            {...motionProps}
            className={`relative pointer-events-auto z-10 flex flex-col overflow-hidden select-none ${
              isMobile
                ? "w-full max-w-lg mx-auto rounded-t-3xl h-[75dvh] max-h-[85dvh]"
                : "w-full max-w-md rounded-3xl h-145 p-2"
            }`}
            style={{
              background: "var(--neu-bg)",
              boxShadow: isMobile
                ? "0 -10px 25px -5px rgba(0, 0, 0, 0.12)"
                : "var(--neu-raised)",
              willChange: isMobile ? "transform" : "auto",
            }}
          >
            {/* Mobile Pull Handle Pill (Hidden on desktop) */}
            {isMobile && (
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="pt-3 pb-2.5 shrink-0 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
                aria-label="Drag down to close"
              >
                <div
                  className="w-14 h-1.5 rounded-full transition-transform duration-150 active:scale-95"
                  style={{
                    background: "var(--neu-bg)",
                    boxShadow: "var(--neu-inset-sm)",
                  }}
                />
              </div>
            )}

            {/* Header (also swipe-enabled if dragging on title/empty space) */}
            <div
              onPointerDown={(e) => {
                if (isMobile && e.target.tagName !== "INPUT" && !e.target.closest("button")) {
                  dragControls.start(e)
                }
              }}
              className={`px-5 pt-1 pb-3 shrink-0 ${isMobile ? "touch-none" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-neutral-800 tracking-tight">
                    {title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {subtitle}
                  </p>
                </div>

                {/* Desktop Close Button */}
                {!isMobile && (
                  <motion.button
                    whileHover={neuButtonHover}
                    whileTap={neuButtonTap}
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer shrink-0"
                    style={{
                      background: NEU.bg,
                      boxShadow: NEU.raisedSm,
                    }}
                    aria-label="Close dialog"
                  >
                    <MorphIcon icon={X} size={15} strokeWidth={2.4} />
                  </motion.button>
                )}
              </div>

              {/* Search Bar with Inset Dish + stale blur indicator */}
              <CurrencySearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClear={() => {
                  setSearchQuery("")
                  inputRef.current?.focus()
                }}
                isStale={isStale}
                inputRef={inputRef}
              />
            </div>

            {/* Scrollable Currency List */}
            <div
              className="flex-1 overflow-y-auto px-5 py-2 space-y-2 scrollbar-none overscroll-contain touch-pan-y"
              style={{
                paddingBottom: isMobile
                  ? "calc(2rem + env(safe-area-inset-bottom, 0px))"
                  : "1rem",
              }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredCurrencies.map((c, index) => {
                  const isSelected = c.code === currentCurrencyCode
                  return (
                    <CurrencyListItem
                      key={c.code}
                      currency={c}
                      isSelected={isSelected}
                      onSelect={() => {
                        onSelectCurrency(c.code)
                        if (closeOnSelect) onClose()
                      }}
                      disabled={isUpdating}
                      index={index}
                    />
                  )
                })}

                {/* Empty State */}
                {filteredCurrencies.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="text-center py-12"
                  >
                    <p className="text-xs font-medium text-neutral-400">
                      No currencies found matching &ldquo;{deferredQuery}&rdquo;
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
