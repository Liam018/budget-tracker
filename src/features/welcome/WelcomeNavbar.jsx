import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { LogIn, ArrowRight, Volume2, VolumeX } from "lucide-react"
import { triggerHaptic } from "../../lib/haptics"
import { NEU } from "../../lib/neu"
import kuriLogo from "../../assets/kuri-logo-2.png"

const NAV_ITEMS = [
  { href: "#hero", id: "hero", label: "Overview" },
  { href: "#philosophy", id: "philosophy", label: "Philosophy" },
  { href: "#ro-vault", id: "ro-vault", label: "Kuri" },
  { href: "#features", id: "features", label: "Features" },
  { href: "#comparison", id: "comparison", label: "Why Kuri" },
]

/**
 * WelcomeNavbar — Fluid Island Navigation Bar with Subtle Neumorphism
 *
 * Implements Kuri's core design style:
 * - Subtle Neumorphism: dual-source soft lighting (dark/light shadows), tactile pressed/raised feel
 * - Floating capsule island with soft neumorphic elevation and glassmorphic backdrop
 * - Inset sunken track for desktop nav pills with a tactile raised active indicator
 * - Tactile action buttons (sound toggle, sign in, morphing hamburger) with smooth hover/tap physics
 * - Fluid 3-bar to 'X' animated hamburger morph button
 * - Staggered entrance mobile navigation drawer with neumorphic card elevation
 * - Accessible focus rings, Escape key handling, and offset-aware smooth scrolling
 */
export function WelcomeNavbar({ soundEnabled, onToggleSound, onPokeMascot }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isClickingRef = useRef(false)
  const clickTimerRef = useRef(null)

  // Track active section and scroll state
  useEffect(() => {
    const sectionIds = ["hero", "philosophy", "ro-vault", "features", "comparison"]

    function handleScroll() {
      setIsScrolled(window.scrollY > 20)
      if (isClickingRef.current) return
      if (window.scrollY < 80) {
        setActiveSection("hero")
        return
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        setActiveSection("comparison")
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickingRef.current) return
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: "-20% 0px -50% 0px", threshold: 0 }
    )

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      observer.disconnect()
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    }
  }, [])

  // Close mobile drawer on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mobileMenuOpen])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  function handleNavClick(id) {
    setActiveSection(id)
    setMobileMenuOpen(false)
    triggerHaptic("light")
    isClickingRef.current = true
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    clickTimerRef.current = setTimeout(() => {
      isClickingRef.current = false
    }, 800)

    const element = document.getElementById(id)
    if (element) {
      const yOffset = -76 // Header offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none transition-all duration-300">
        <div
          className={`mx-auto flex items-center justify-between pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isScrolled
              ? "max-w-5xl rounded-full px-4 sm:px-5 py-2 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.12),0_4px_10px_-2px_rgba(0,0,0,0.06)]"
              : "max-w-7xl px-2 sm:px-4 py-1.5 shadow-none"
          }`}
          style={{
            background: isScrolled ? "var(--neu-bg)" : "transparent",
          }}
        >
          {/* Brand & Interactive Mascot */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="relative w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0 group"
              onClick={() => {
                triggerHaptic("medium")
                onPokeMascot?.()
              }}
              title="Click Kuri for a financial tip!"
              aria-label="Click Kuri for a financial tip"
            >
              <img
                src={kuriLogo}
                alt="Kuri Ro-Vault Mascot"
                className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm transition-transform duration-300 group-hover:rotate-6"
                draggable="false"
              />
            </button>

            <div className="flex flex-col leading-none">
              <div className="flex items-baseline gap-2">
                <span className="text-[17px] sm:text-lg font-black tracking-tight text-neutral-900">
                  Kuri
                </span>
                <span
                  className="hidden min-[420px]:inline-flex items-center text-[9.5px] font-extrabold text-indigo-700 px-2 py-0.5 rounded-full leading-none tracking-wide"
                  style={{
                    background: "rgba(238, 242, 255, 0.85)",
                    boxShadow: "inset 1px 1px 2px rgba(200, 204, 216, 0.5), inset -1px -1px 2px rgba(255, 255, 255, 0.9)",
                  }}
                >
                  Smart, not kuripot
                </span>
              </div>
              {!isScrolled && (
                <span className="text-[11px] text-neutral-400 font-medium hidden sm:block mt-0.5">
                  Personal Financial Ro-Vault
                </span>
              )}
            </div>
          </div>

          {/* Desktop Navigation with Segmented Tactile Inset Wells */}
          <nav
            className="hidden lg:flex items-center gap-1.5 p-1 rounded-full"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id
              return (
                <motion.a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick(item.id)
                  }}
                  whileHover={!isActive ? { scale: 1.04 } : {}}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-bold select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "text-brand-600"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                  style={{
                    background: isActive ? "rgba(226, 230, 240, 0.75)" : "transparent",
                    boxShadow: isActive ? NEU.insetSm : "none",
                  }}
                >
                  <span className="relative z-10">{item.label}</span>
                </motion.a>
              )
            })}
          </nav>

          {/* Actions & Controls with Tactile Neumorphic Physics */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Toggle Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92, boxShadow: NEU.pressed }}
              onClick={() => {
                triggerHaptic("light")
                onToggleSound?.()
              }}
              className="h-8.5 w-8.5 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0 transition-colors"
              style={{
                background: "var(--neu-bg)",
                boxShadow: "var(--neu-raised-sm)",
              }}
              title={soundEnabled ? "Mute Kuri sounds" : "Unmute Kuri sounds"}
              aria-label={soundEnabled ? "Mute Kuri sounds" : "Unmute Kuri sounds"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={soundEnabled ? "sound-on" : "sound-off"}
                  initial={{ scale: 0.7, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.7, opacity: 0, rotate: 20 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  {soundEnabled ? (
                    <Volume2 size={15} className="text-indigo-600" />
                  ) : (
                    <VolumeX size={15} className="text-neutral-400" />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Sign In CTA with Neu Inset Pressed State */}
            <motion.div
              whileTap={{ scale: 0.96, boxShadow: NEU.pressed }}
              className="hidden sm:inline-flex rounded-full"
              style={{
                background: "var(--neu-bg)",
                boxShadow: "var(--neu-raised-sm)",
              }}
            >
              <Link
                to="/login"
                className="h-8.5 px-3.5 inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold text-neutral-700 hover:text-neutral-900 rounded-full transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <LogIn size={13} className="text-neutral-500" />
                <span>Sign In</span>
              </Link>
            </motion.div>

            {/* Get Started Primary Button (Gradient Pill) */}
            <motion.div whileTap={{ scale: 0.96 }} className="hidden sm:inline-flex">
              <Link
                to="/register"
                className="btn-primary !w-auto h-8.5 px-4 !py-0 !rounded-full inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-bold text-white shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span>Get Started</span>
                <ArrowRight
                  size={13}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </motion.div>

            {/* Fluid Hamburger to 'X' Morph Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92, boxShadow: NEU.pressed }}
              onClick={() => {
                triggerHaptic("light")
                setMobileMenuOpen((v) => !v)
              }}
              className="lg:hidden h-8.5 w-8.5 rounded-full flex flex-col items-center justify-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0 transition-colors"
              style={{
                background: "var(--neu-bg)",
                boxShadow: "var(--neu-raised-sm)",
              }}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 4.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="w-4 h-[1.75px] bg-neutral-700 rounded-full origin-center"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="w-4 h-[1.75px] bg-neutral-700 rounded-full"
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -4.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="w-4 h-[1.75px] bg-neutral-700 rounded-full origin-center"
              />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Animated Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Scrim without blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-neutral-900/40 lg:hidden"
              aria-hidden="true"
            />

            {/* Floating Mobile Card */}
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-3.5 top-[4.75rem] z-50 lg:hidden rounded-3xl overflow-hidden shadow-[0_16px_36px_-6px_rgba(0,0,0,0.18)]"
              style={{
                background: "var(--neu-bg)",
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              <nav className="p-3.5 flex flex-col gap-1.5">
                {NAV_ITEMS.map((item, idx) => {
                  const isActive = activeSection === item.id
                  return (
                    <motion.a
                      key={item.id}
                      href={item.href}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.2 }}
                      onClick={(e) => {
                        e.preventDefault()
                        handleNavClick(item.id)
                      }}
                      className={`relative flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-colors duration-200 select-none ${
                        isActive
                          ? "text-brand-600 font-extrabold"
                          : "text-neutral-600 hover:text-neutral-900 font-semibold"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="welcomeMobileActivePill"
                          className="absolute inset-0 rounded-2xl pointer-events-none transform-gpu"
                          transition={{
                            type: "spring",
                            stiffness: 460,
                            damping: 34,
                          }}
                          style={{ willChange: "transform" }}
                        >
                          <div
                            className="w-full h-full rounded-2xl"
                            style={{
                              background: "rgba(238, 242, 255, 0.8)",
                              boxShadow: NEU.insetSm,
                            }}
                          />
                        </motion.div>
                      )}
                      <span className="relative z-10">{item.label}</span>
                      {isActive && (
                        <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-brand-600" />
                      )}
                    </motion.a>
                  )
                })}

                {/* Mobile Drawer Auth Actions */}
                <div className="mt-2 pt-3 flex gap-2.5">
                  <motion.div
                    whileTap={{ scale: 0.95, boxShadow: NEU.pressed }}
                    className="flex-1 rounded-xl"
                    style={{
                      background: "var(--neu-bg)",
                      boxShadow: "var(--neu-raised-sm)",
                    }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full h-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center flex items-center justify-center text-neutral-700 transition-colors"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary flex-1 !py-2.5 !px-4 !rounded-xl text-xs font-bold text-center justify-center text-white active:scale-95"
                  >
                    Get Started
                  </Link>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
export default WelcomeNavbar
