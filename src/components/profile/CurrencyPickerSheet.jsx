import { useState, useEffect } from "react"
import { motion, AnimatePresence, useDragControls } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Search, Check, X } from "lucide"
import { SUPPORTED_CURRENCIES } from "../../services/currencyService"
import { CountryFlag } from "../ui"

/**
 * CurrencyPickerSheet — Adaptive Currency Picker.
 * - Mobile: Thumb-friendly bottom sheet with native swipe-down dismiss.
 * - Desktop: Centered Neumorphic dialog with scale spring physics & Escape listener.
 */
export default function CurrencyPickerSheet({
  isOpen,
  onClose,
  currentCurrencyCode,
  onSelectCurrency,
  isUpdating,
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const dragControls = useDragControls()

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
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function handleDragEnd(event, info) {
    if (info.offset.y > 75 || info.velocity.y > 250) {
      onClose()
    }
  }

  // Animation variants depending on mobile vs desktop
  const motionProps = isMobile
    ? {
        drag: "y",
        dragControls: dragControls,
        dragListener: false,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0, bottom: 0.6 },
        dragSnapToOrigin: true,
        onDragEnd: handleDragEnd,
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: { type: "spring", stiffness: 400, damping: 34 },
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
            }}
          >
            {/* Mobile Pull Handle Pill (Hidden on desktop) */}
            {isMobile && (
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="pt-3.5 pb-2 shrink-0 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
              >
                <div
                  className="w-12 h-1.5 rounded-full"
                  style={{
                    background: "var(--neu-bg)",
                    boxShadow: "var(--neu-inset-sm)",
                  }}
                />
              </div>
            )}

            {/* Header */}
            <div
              onPointerDown={(e) => {
                if (isMobile && e.target.tagName !== "INPUT") {
                  dragControls.start(e)
                }
              }}
              className="px-5 pt-3 pb-3 shrink-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-neutral-800 tracking-tight">
                    Choose Default Currency
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Select your primary currency for accounts and analytics
                  </p>
                </div>

                {/* Desktop Close Button */}
                {!isMobile && (
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92, boxShadow: "var(--neu-pressed)" }}
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer shrink-0"
                    style={{
                      background: "var(--neu-bg)",
                      boxShadow: "var(--neu-raised-sm)",
                    }}
                    aria-label="Close dialog"
                  >
                    <MorphIcon icon={X} size={15} strokeWidth={2.4} />
                  </motion.button>
                )}
              </div>

              {/* Search Bar with Inset Dish */}
              <div
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl mt-3.5"
                style={{
                  background: "var(--neu-bg)",
                  boxShadow: "var(--neu-inset-sm)",
                }}
              >
                <MorphIcon
                  icon={Search}
                  size={16}
                  className="text-neutral-400 shrink-0"
                  strokeWidth={2.2}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search currency name or code (e.g. USD, EUR, PHP)..."
                  className="w-full bg-transparent text-xs font-semibold text-neutral-800 outline-none placeholder:text-neutral-400"
                  autoFocus
                />
              </div>
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
              {filteredCurrencies.map((c) => {
                const isSelected = c.code === currentCurrencyCode
                return (
                  <motion.button
                    key={c.code}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{
                      scale: 0.98,
                      boxShadow: "var(--neu-pressed)",
                    }}
                    onClick={() => onSelectCurrency(c.code)}
                    disabled={isUpdating}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer text-left select-none ${
                      isSelected
                        ? "text-brand-600 font-bold"
                        : "text-neutral-700 hover:text-neutral-900"
                    }`}
                    style={{
                      background: "var(--neu-bg)",
                      boxShadow: isSelected
                        ? "var(--neu-inset-sm)"
                        : "var(--neu-raised-sm)",
                    }}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <CountryFlag code={c.code} size="lg" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold leading-tight truncate">
                          {c.code} — {c.name}
                        </p>
                        <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                          Symbol: {c.symbol}
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <MorphIcon
                          icon={Check}
                          size={14}
                          strokeWidth={2.8}
                          className="text-white"
                        />
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-neutral-400 pr-1 shrink-0">
                        {c.symbol}
                      </span>
                    )}
                  </motion.button>
                )
              })}

              {filteredCurrencies.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xs font-medium text-neutral-400">
                    No currencies found matching "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
