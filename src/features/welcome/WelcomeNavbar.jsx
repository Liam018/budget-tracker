import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { LogIn, UserPlus, Volume2, VolumeX, Menu, X } from "lucide-react"
import kuriLogo from "../../assets/kuri-logo-2.png"

const NAV_ITEMS = [
  { href: "#hero", id: "hero", label: "Overview" },
  { href: "#philosophy", id: "philosophy", label: "Philosophy" },
  { href: "#ro-vault", id: "ro-vault", label: "Kuri" },
  { href: "#features", id: "features", label: "Features" },
  { href: "#comparison", id: "comparison", label: "Why Kuri" },
]

export function WelcomeNavbar({ soundEnabled, onToggleSound, onPokeMascot }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navRef = useRef(null)
  const isClickingRef = useRef(false)
  const clickTimerRef = useRef(null)

  useEffect(() => {
    function updateIndicator() {
      if (!navRef.current) return
      const activeEl = navRef.current.querySelector(`[data-nav-id="${activeSection}"]`)
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1,
        })
      }
    }
    const timer = setTimeout(updateIndicator, 15)
    window.addEventListener("resize", updateIndicator)
    return () => { clearTimeout(timer); window.removeEventListener("resize", updateIndicator) }
  }, [activeSection, isScrolled])

  useEffect(() => {
    const sectionIds = ["hero", "philosophy", "ro-vault", "features", "comparison"]

    function handleScroll() {
      setIsScrolled(window.scrollY > 24)
      if (isClickingRef.current) return
      if (window.scrollY < 80) { setActiveSection("hero"); return }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        setActiveSection("comparison")
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickingRef.current) return
        entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id) })
      },
      { rootMargin: "-22% 0px -55% 0px", threshold: 0 }
    )

    sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el) })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      observer.disconnect()
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    }
  }, [])

  function handleNavClick(id) {
    setActiveSection(id)
    setMobileMenuOpen(false)
    isClickingRef.current = true
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    clickTimerRef.current = setTimeout(() => { isClickingRef.current = false }, 700)
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ease-out ${
          isScrolled ? "pt-2 sm:pt-3 px-3 sm:px-6 pointer-events-none" : "pt-0 px-0 pointer-events-auto"
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-300 ease-out pointer-events-auto ${
            isScrolled
              ? "max-w-5xl bg-white/92 backdrop-blur-2xl border border-white/80 rounded-full px-3.5 sm:px-5 py-2 shadow-[0_8px_32px_-4px_rgba(20,20,60,0.14),0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.03]"
              : "max-w-7xl bg-transparent px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-none shadow-none rounded-none"
          }`}
        >
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="relative w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 focus:outline-none shrink-0 group"
              onClick={onPokeMascot}
              title="Click Kuri for a financial tip!"
              aria-label="Click Kuri for a financial tip"
            >
              <img
                src={kuriLogo}
                alt="Kuri"
                className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
                draggable="false"
              />
            </button>

            <div className="flex flex-col leading-none">
              <div className="flex items-baseline gap-2">
                <span className="text-[17px] sm:text-lg font-black tracking-tight text-neutral-900">
                  Kuri
                </span>
                <span
                  className="hidden min-[400px]:inline-flex items-center text-[9.5px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full leading-none"
                  style={{ letterSpacing: "0.03em" }}
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

          {/* Desktop nav with morphing indicator */}
          <nav
            ref={navRef}
            className="relative hidden lg:flex items-center gap-0.5 text-xs font-semibold py-0.5"
            aria-label="Main navigation"
          >
            {/* Sliding pill indicator */}
            <div
              className={`absolute top-0.5 bottom-0.5 rounded-full pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isScrolled
                  ? "bg-neutral-100/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.07),inset_0_-1px_1px_rgba(255,255,255,0.8)]"
                  : "bg-[#dde3f2]/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.07),inset_0_-1px_1px_rgba(255,255,255,0.8)]"
              }`}
              style={{
                transform: `translateX(${indicatorStyle.left}px)`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
            />
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id
              return (
                <a
                  key={item.id}
                  data-nav-id={item.id}
                  href={item.href}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative z-10 px-3.5 py-1.5 rounded-full text-xs select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors duration-200 ${
                    isActive
                      ? "text-neutral-900 font-extrabold"
                      : "text-neutral-500 hover:text-neutral-800 font-medium"
                  }`}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onToggleSound}
              className={`btn-back h-8 w-8 sm:h-8 sm:w-8 p-0 flex items-center justify-center text-neutral-500 hover:text-neutral-700 cursor-pointer shrink-0 transition-all ${
                isScrolled ? "!rounded-full" : "!rounded-xl"
              }`}
              title={soundEnabled ? "Mute Kuri" : "Unmute Kuri"}
              aria-label={soundEnabled ? "Mute Kuri sounds" : "Unmute Kuri sounds"}
            >
              {soundEnabled ? <Volume2 size={14} className="text-indigo-600" /> : <VolumeX size={14} />}
            </button>

            <Link
              to="/login"
              className={`btn-back !w-auto h-8 sm:h-8 px-3 !hidden sm:!inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold shrink-0 transition-all ${
                isScrolled ? "!rounded-full" : "!rounded-xl"
              }`}
            >
              <LogIn size={12} />
              <span>Sign In</span>
            </Link>

            <Link
              to="/register"
              className={`btn-primary !w-auto h-8 sm:h-8 px-3.5 sm:px-4 !hidden sm:!inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-bold shrink-0 shadow-sm shadow-brand-500/20 transition-all ${
                isScrolled ? "!rounded-full" : "!rounded-xl"
              }`}
            >
              <UserPlus size={12} />
              <span>Get Started</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className={`btn-back lg:hidden h-8 w-8 p-0 flex items-center justify-center shrink-0 ${
                isScrolled ? "!rounded-full" : "!rounded-xl"
              }`}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-down nav menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-x-3 top-[4.5rem] z-40 lg:hidden rounded-2xl overflow-hidden border border-white/70 shadow-[0_20px_50px_-8px_rgba(20,20,60,0.18)] bg-white/95 backdrop-blur-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <nav className="p-3 flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeSection === item.id
                    ? "bg-indigo-50 text-indigo-700 font-extrabold"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 pt-2 border-t border-neutral-100 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-back !w-full flex-1 py-2.5 !rounded-xl text-sm font-semibold text-center justify-center"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary !w-full flex-1 py-2.5 !rounded-xl text-sm font-bold text-center justify-center"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
