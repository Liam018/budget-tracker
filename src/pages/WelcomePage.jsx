import { useState, useEffect, useRef } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import {
  Wallet,
  LogIn,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { welcomeSlides } from "../constants/welcomeSlides"
import { toast } from "../components/ui"

const SLIDE_DURATION = 4000 // 4 seconds per slide

export default function WelcomePage() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0) // 0 to 100%
  const [isPaused, setIsPaused] = useState(false)
  // Guard ref: prevents React Strict Mode's double-invocation of state updaters
  // from calling setCurrentSlide twice at the slide boundary (which skips a slide)
  const isAdvancingRef = useRef(false)

  // Show session-expired toast if redirected from a protected route
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get("reason") === "session_expired") {
      toast.warning("Session expired", {
        description: "You were signed out automatically. Please log in again.",
        duration: 6000,
      })
      // Clean the URL so the toast doesn't show again on manual refresh
      window.history.replaceState({}, "", "/welcome")
    }
  }, [])

  // Reset the guard whenever the slide actually changes
  useEffect(() => {
    isAdvancingRef.current = false
    setProgress(0)
  }, [currentSlide])

  // Smooth timer loop: increments progress smoothly and freezes on pause
  useEffect(() => {
    if (isPaused) return

    const stepMs = 30 // ~33fps smooth progress
    const increment = (stepMs / SLIDE_DURATION) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          // Guard ensures this only fires once even if React calls the updater twice
          if (!isAdvancingRef.current) {
            isAdvancingRef.current = true
            setCurrentSlide((curr) => (curr + 1) % welcomeSlides.length)
          }
          return 0
        }
        return next
      })
    }, stepMs)

    return () => clearInterval(timer)
  }, [isPaused])

  if (!loading && user) return <Navigate to="/" replace />

  function goToSlide(idx) {
    setCurrentSlide(idx)
    setProgress(0)
  }

  function nextSlide() {
    setCurrentSlide((prev) => (prev + 1) % welcomeSlides.length)
    setProgress(0)
  }

  function prevSlide() {
    setCurrentSlide((prev) => (prev - 1 + welcomeSlides.length) % welcomeSlides.length)
    setProgress(0)
  }

  const slide = welcomeSlides[currentSlide]

  return (
    <div
      className="min-h-dvh w-full flex flex-col justify-between p-4 sm:p-7 lg:p-12 max-w-6xl mx-auto bg-[#edf0f7] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* ── TOP HEADER: Centered Brand Logo & Title ── */}
      <header className="w-full flex items-center justify-center md:justify-between pt-1 pb-2 sm:pb-3">
        {/* Centered Brand Logo & App Name */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-xs">
            <Wallet className="text-white" size={18} strokeWidth={2.4} />
          </div>
          <span className="text-sm sm:text-base font-extrabold tracking-tight text-neutral-800 uppercase block leading-none">
            Budget Tracker
          </span>
        </div>

        {/* Desktop Top Action Links */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="btn-back"
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </Link>
          <Link
            to="/register"
            className="btn-primary py-2 px-4 text-xs font-semibold rounded-lg w-auto"
          >
            <UserPlus size={14} />
            <span>Create Account</span>
          </Link>
        </div>
      </header>

      {/* ── MAIN HERO BODY (Split 2-Column on md/lg, Centered on Mobile) ── */}
      <main className="flex-1 flex flex-col items-center justify-center my-auto w-full py-1 sm:py-2">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 md:gap-10 lg:gap-14 items-center justify-center">
          {/* LEFT COLUMN: Feature Information & Benefits */}
          <div className="w-full md:col-span-6 lg:col-span-6 flex flex-col justify-center text-center md:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col items-center md:items-start"
              >
                {/* Category Badge */}
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full mb-1.5 sm:mb-2 border border-brand-200/60 inline-flex items-center">
                  {slide.badge}
                </span>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-800 leading-tight mb-1 sm:mb-2 text-balance">
                  {slide.title}
                </h1>

                {/* Description */}
                <p className="text-xs sm:text-sm lg:text-base text-neutral-500 leading-relaxed mb-1 sm:mb-3 max-w-md text-balance">
                  {slide.description}
                </p>

                {/* Desktop Bullet Points */}
                <ul className="hidden md:flex flex-col gap-2 mb-6">
                  {slide.bulletPoints.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-center gap-2 text-xs lg:text-sm text-neutral-600">
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            {/* Desktop Interactive Slide Switcher Tabs */}
            <div className="hidden md:flex items-center gap-2 pt-2 border-t border-neutral-200/60">
              {welcomeSlides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  className={`text-xs font-semibold py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    idx === currentSlide
                      ? "text-brand-700 font-bold"
                      : "text-neutral-400 hover:text-neutral-600"
                  }`}
                  style={{
                    background: "var(--neu-bg)",
                    boxShadow: idx === currentSlide ? "var(--neu-inset-sm)" : "var(--neu-raised-sm)",
                  }}
                >
                  <span>{s.shortTitle}</span>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: SVG Illustration with Side Next/Prev Buttons */}
          <div className="w-full md:col-span-6 lg:col-span-6 flex flex-col items-center justify-center">
            {/* Stage Container with Side Next/Prev Buttons on Desktop */}
            <div className="relative w-full max-w-120 flex items-center justify-center">
              {/* Previous Button at Left Side of Illustration (Desktop) */}
              <button
                type="button"
                onClick={prevSlide}
                className="hidden md:flex absolute -left-4 lg:-left-6 z-10 btn-back p-2 rounded-full shadow-md cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Raised Stage Card */}
              <div className="w-full md:card-lg md:p-6 lg:p-7 flex flex-col items-center">
                {/* Interactive Hero Illustration Canvas with Swipe / Drag */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.25}
                    onDragStart={() => setIsPaused(true)}
                    onDragEnd={(_, info) => {
                      setIsPaused(false)
                      if (info.offset.x < -35) {
                        nextSlide()
                      } else if (info.offset.x > 35) {
                        prevSlide()
                      }
                    }}
                    initial={{ opacity: 0, scale: 0.92, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -8 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="w-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
                  >
                    {/* Large Hero SVG Illustration */}
                    <div
                      className="w-full flex justify-center items-center py-4 sm:py-6 px-4 rounded-3xl"
                      style={{
                        background: "var(--neu-bg)",
                        boxShadow: "var(--neu-inset-sm)",
                      }}
                    >
                      <motion.img
                        src={slide.illustration}
                        alt={slide.title}
                        className="h-44 sm:h-56 md:h-64 lg:h-72 w-auto max-w-[95%] object-contain select-none pointer-events-none drop-shadow-md"
                        initial={{ y: 6 }}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Mobile Progress Bar (Rendered below illustration only on mobile) */}
                <div className="md:hidden w-full max-w-70 sm:max-w-[320px] pt-3 sm:pt-4 flex items-center gap-1.5">
                  {welcomeSlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      className="h-1.5 flex-1 rounded-full overflow-hidden bg-neutral-300/80 transition-all cursor-pointer relative"
                      aria-label={`Go to slide ${idx + 1}`}
                    >
                      {idx < currentSlide ? (
                        <div className="h-full bg-brand-600 w-full rounded-full" />
                      ) : idx === currentSlide ? (
                        <div
                          className="h-full bg-brand-600 rounded-full"
                          style={{
                            width: `${progress}%`,
                            transition: isPaused ? "none" : "width 30ms linear",
                          }}
                        />
                      ) : (
                        <div className="h-full w-0 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Button at Right Side of Illustration (Desktop) */}
              <button
                type="button"
                onClick={nextSlide}
                className="hidden md:flex absolute -right-4 lg:-right-6 z-10 btn-back p-2 rounded-full shadow-md cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── DESKTOP CENTERED PROGRESS BAR (Directly below hero content with balanced spacing) ── */}
        <div className="hidden md:flex justify-center items-center w-full mt-6 lg:mt-8">
          <div className="w-full max-w-85 flex items-center gap-2">
            {welcomeSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                className="h-1.5 flex-1 rounded-full overflow-hidden bg-neutral-300/80 transition-all cursor-pointer relative"
                aria-label={`Go to slide ${idx + 1}`}
              >
                {idx < currentSlide ? (
                  <div className="h-full bg-brand-600 w-full rounded-full" />
                ) : idx === currentSlide ? (
                  <div
                    className="h-full bg-brand-600 rounded-full"
                    style={{
                      width: `${progress}%`,
                      transition: isPaused ? "none" : "width 30ms linear",
                    }}
                  />
                ) : (
                  <div className="h-full w-0 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* ── MOBILE BOTTOM SECTION: Login & Register Buttons (Hidden on desktop) ── */}
      <footer className="md:hidden w-full flex flex-col items-center gap-2.5 pt-2 pb-1">
        <div className="w-full max-w-sm flex flex-col gap-2.5">
          <Link
            to="/login"
            className="btn-primary flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl"
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </Link>

          <Link
            to="/register"
            className="btn-secondary flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl"
          >
            <UserPlus size={16} />
            <span>Create Account</span>
          </Link>
        </div>
      </footer>
    </div>
  )
}
