import { useState, useEffect, useRef } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Plus } from "lucide-react"
import NavHubSheet from "./NavHubSheet"
import { LEFT_TABS, RIGHT_TABS } from "../../constants/navigation"



export default function BottomNav() {
  const [isHubOpen, setIsHubOpen] = useState(false)
  const [barWidth, setBarWidth] = useState(360)
  const barContainerRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Track the exact pixel width of the bar for responsive SVG notch rendering
  useEffect(() => {
    if (!barContainerRef.current) return
    const ro = new ResizeObserver(([entry]) => {
      if (entry?.contentRect?.width) {
        setBarWidth(Math.round(entry.contentRect.width))
      }
    })
    ro.observe(barContainerRef.current)
    return () => ro.disconnect()
  }, [])

  // Auto-close hub when navigating to any route
  useEffect(() => {
    setIsHubOpen(false)
  }, [location.pathname])

  function handleNavigate(to) {
    setIsHubOpen(false)
    navigate(to)
  }

  // Mathematical SVG path generator for the notched stadium capsule
  const w = barWidth || 360
  const h = 60
  const r = 30
  const cx = w / 2
  const notchR = 32
  const filletW = 14

  const notchPath = `
    M ${r} 0
    L ${cx - (notchR + filletW)} 0
    C ${cx - (notchR + filletW) + 7} 0, ${cx - notchR} 5, ${cx - notchR} 13
    A ${notchR} ${notchR} 0 0 0 ${cx + notchR} 13
    C ${cx + notchR} 5, ${cx + (notchR + filletW) - 7} 0, ${cx + (notchR + filletW)} 0
    L ${w - r} 0
    A ${r} ${r} 0 0 1 ${w - r} ${h}
    L ${r} ${h}
    A ${r} ${r} 0 0 1 ${r} 0
    Z
  `.trim()

  return (
    <>
      {/* Transparent Click-Away Listener with Animated Scrim  */}
      <AnimatePresence>
        {isHubOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setIsHubOpen(false)}
            className="fixed inset-0 z-25 lg:hidden bg-neutral-900/8 backdrop-blur-[1px]"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Floating Notched Bottom Navigation Bar    */}
      <div
        className="fixed bottom-0 inset-x-0 z-30 lg:hidden flex items-end justify-center pointer-events-none"
        style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
      >
        <motion.div
          ref={barContainerRef}
          animate={
            isHubOpen
              ? { y: 2, scale: 0.985 }
              : { y: 0, scale: 1 }
          }
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="relative mx-4 w-full flex items-end justify-center max-w-md pointer-events-auto"
          style={{ height: `${h}px` }}
        >

          {/*  Quick Action & Navigation Hub Card  */}
          <NavHubSheet
            isOpen={isHubOpen}
            onClose={() => setIsHubOpen(false)}
            onNavigate={handleNavigate}
          />

          {/* Background SVG Notched Capsule  */}
          <svg
            className="absolute inset-0 w-full h-15 pointer-events-none"
            style={{
              filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.06)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.04))",
            }}
          >
            <path d={notchPath} fill="var(--neu-bg)" />
          </svg>

          {/* Navigation Tabs Overlay (Softly dims when Hub card is active) */}
          <motion.div
            animate={{
              opacity: isHubOpen ? 0.45 : 1,
            }}
            transition={{ duration: 0.22 }}
            className="relative z-10 w-full h-full flex items-center justify-between"
          >

            {/* Left Tabs (Dashboard, Txns) */}
            <div
              className="flex items-center justify-around h-full pl-3"
              style={{ width: `calc(50% - ${notchR + 10}px)` }}
            >
              {LEFT_TABS.map(({ label, icon, activeIcon, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={(e) => {
                    if (location.pathname === to) {
                      e.preventDefault()
                    }
                  }}
                  className="relative flex flex-col items-center justify-center flex-1 h-full min-w-0 select-none"
                >
                  {({ isActive }) => (
                    <>
                      <motion.span
                        className="relative z-10"
                        animate={isActive ? { y: -2, scale: 1.12 } : { y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      >
                        <MorphIcon
                          icon={isActive ? activeIcon : icon}
                          size={20}
                          strokeWidth={isActive ? 2.2 : 1.7}
                          spring="snappy"
                          className={isActive ? "text-brand-600" : "text-neutral-400"}
                        />
                      </motion.span>

                      <motion.span
                        className="relative z-10 text-[9px] font-semibold tracking-wide leading-none mt-0.5"
                        animate={
                          isActive
                            ? { opacity: 1, y: 0,  color: "#4f46e5" }
                            : { opacity: 0.5, y: 2, color: "#9ca3af" }
                        }
                        transition={{ duration: 0.18 }}
                      >
                        {label}
                      </motion.span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Center Notch Gap (spacer) */}
            <div style={{ width: `${(notchR + 10) * 2}px` }} className="shrink-0 h-full" />

            {/* Right Tabs (Budget, Account) */}
            <div
              className="flex items-center justify-around h-full pr-3"
              style={{ width: `calc(50% - ${notchR + 10}px)` }}
            >
              {RIGHT_TABS.map(({ label, icon, activeIcon, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={(e) => {
                    if (location.pathname === to) {
                      e.preventDefault()
                    }
                  }}
                  className="relative flex flex-col items-center justify-center flex-1 h-full min-w-0 select-none"
                >
                  {({ isActive }) => (
                    <>
                      <motion.span
                        className="relative z-10"
                        animate={isActive ? { y: -2, scale: 1.12 } : { y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      >
                        <MorphIcon
                          icon={isActive ? activeIcon : icon}
                          size={20}
                          strokeWidth={isActive ? 2.2 : 1.7}
                          spring="snappy"
                          className={isActive ? "text-brand-600" : "text-neutral-400"}
                        />
                      </motion.span>

                      <motion.span
                        className="relative z-10 text-[9px] font-semibold tracking-wide leading-none mt-0.5"
                        animate={
                          isActive
                            ? { opacity: 1, y: 0,  color: "#4f46e5" }
                            : { opacity: 0.5, y: 2, color: "#9ca3af" }
                        }
                        transition={{ duration: 0.18 }}
                      >
                        {label}
                      </motion.span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

          </motion.div>

          {/* Centre Action & Navigation Hub FAB (Same 52px Circle Size in Both States) */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsHubOpen((prev) => !prev)}
            className="absolute left-1/2 -translate-x-1/2 z-40 flex items-center justify-center rounded-full cursor-pointer pointer-events-auto transition-colors duration-200"
            style={{
              top: "-14px",
              width: "52px",
              height: "52px",
              background: isHubOpen ? "var(--neu-bg)" : "linear-gradient(145deg, #6366f1, #4338ca)",
              boxShadow: isHubOpen
                ? "none"
                : "0 4px 10px rgba(0, 0, 0, 0.16), 0 1px 3px rgba(0, 0, 0, 0.08)",
            }}
            aria-label={isHubOpen ? "Close navigation hub" : "Open quick actions and navigation hub"}
            aria-expanded={isHubOpen}
          >
            <motion.div
              animate={{ rotate: isHubOpen ? 135 : 0 }}
              transition={{ type: "spring", stiffness: 480, damping: 24 }}
              className="flex items-center justify-center"
            >
              <Plus
                size={24}
                color={isHubOpen ? "#4f46e5" : "white"}
                strokeWidth={2.6}
              />
            </motion.div>
          </motion.button>

        </motion.div>
      </div>
    </>
  )
}
