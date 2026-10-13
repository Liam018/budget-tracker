import { useState, useEffect, useRef, useCallback } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import {
  LogIn,
  UserPlus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { welcomeSlides } from "../constants/welcomeSlides"
import { getRandomTip } from "../constants/vaultyTips"
import { KuriCanvas } from "../components/mascot"
import { playTone } from "../components/mascot/vaultyEngine"
import { triggerHaptic } from "../lib/haptics"
import { toast } from "../components/ui"
import kuriLogo from "../assets/kuri-logo-2.png"

const SLIDE_DURATION = 4000 // 4 seconds per slide

export default function WelcomePage() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0) // 0 to 100%
  const [isPaused, setIsPaused] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem("kuri_sound") !== "false"
  })
  const [customSpeechState, setCustomSpeechState] = useState({ speech: null, slideIndex: 0 })
  const [pokePulse, setPokePulse] = useState(false)
  const activeCustomSpeech =
    customSpeechState.slideIndex === currentSlide ? customSpeechState.speech : null

  // Guard ref: prevents React Strict Mode's double-invocation of state updaters
  // from calling setCurrentSlide twice at the slide boundary (which skips a slide)
  const isAdvancingRef = useRef(false)
  const touchStartXRef = useRef(0)
  const touchStartYRef = useRef(0)
  const isSwipingRef = useRef(false)

  // Show session-expired toast if redirected from a protected route
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get("reason") === "session_expired") {
      toast.warning("Session expired", {
        description: "You were signed out automatically. Please log in again.",
        duration: 6000,
      })
      window.history.replaceState({}, "", "/welcome")
    }
  }, [location.search])

  const nextSlide = useCallback(() => {
    isAdvancingRef.current = false
    setCurrentSlide((prev) => (prev + 1) % welcomeSlides.length)
    setProgress(0)
  }, [])

  const prevSlide = useCallback(() => {
    isAdvancingRef.current = false
    setCurrentSlide((prev) => (prev - 1 + welcomeSlides.length) % welcomeSlides.length)
    setProgress(0)
  }, [])

  const goToSlide = useCallback((idx) => {
    isAdvancingRef.current = false
    setCurrentSlide(idx)
    setProgress(0)
  }, [])

  // Keyboard accessibility: Left/Right arrows to cycle, Space to pause/resume
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return
      if (e.key === "ArrowRight") {
        nextSlide()
        triggerHaptic("light")
      } else if (e.key === "ArrowLeft") {
        prevSlide()
        triggerHaptic("light")
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault()
        setIsPaused((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [nextSlide, prevSlide])

  // Smooth timer loop: increments progress smoothly and freezes on pause
  useEffect(() => {
    if (isPaused) return

    const stepMs = 30 // ~33fps smooth progress
    const increment = (stepMs / SLIDE_DURATION) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          if (!isAdvancingRef.current) {
            isAdvancingRef.current = true
            setCurrentSlide((curr) => (curr + 1) % welcomeSlides.length)
          }
          return 0
        }
        if (isAdvancingRef.current && next < 50) {
          isAdvancingRef.current = false
        }
        return next
      })
    }, stepMs)

    return () => clearInterval(timer)
  }, [isPaused])

  if (!loading && user) return <Navigate to="/" replace />

  function toggleSound() {
    setSoundEnabled((prev) => {
      const next = !prev
      localStorage.setItem("kuri_sound", String(next))
      if (next) playTone("coin", true)
      return next
    })
    triggerHaptic("light")
  }

  function handlePokeMascot() {
    playTone("coin", soundEnabled)
    triggerHaptic("medium")
    const tip = getRandomTip()
    setCustomSpeechState({ speech: tip.message, slideIndex: currentSlide })
    setPokePulse(true)
    setTimeout(() => setPokePulse(false), 600)
  }

  // Full-surface natural swipe handlers
  function handleTouchStart(e) {
    setIsPaused(true)
    if (e.touches && e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX
      touchStartYRef.current = e.touches[0].clientY
      isSwipingRef.current = true
    }
  }

  function handleTouchEnd(e) {
    setIsPaused(false)
    if (!isSwipingRef.current) return
    isSwipingRef.current = false
    if (e.changedTouches && e.changedTouches.length > 0) {
      const deltaX = touchStartXRef.current - e.changedTouches[0].clientX
      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY
      if (Math.abs(deltaX) > 36 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        if (deltaX > 0) {
          nextSlide()
          triggerHaptic("light")
        } else {
          prevSlide()
          triggerHaptic("light")
        }
      }
    }
  }

  const slide = welcomeSlides[currentSlide]

  return (
    <div
      className="min-h-dvh w-full flex flex-col justify-between p-3.5 sm:p-6 lg:p-10 max-w-7xl mx-auto bg-[#edf0f7] select-none relative overflow-x-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── TOP HEADER: Kuri Identity & Global Controls ── */}
      <header className="w-full flex items-center justify-between pt-1 pb-2 sm:pb-4 z-20">
        {/* Brand Logo & Kuri Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
            onClick={handlePokeMascot}
            title="Click Kuri for a financial tip!"
            aria-label="Click Kuri for a financial tip"
          >
            <img
              src={kuriLogo}
              alt="Kuri Logo"
              className="w-full h-full object-contain select-none pointer-events-none"
              draggable="false"
            />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-xl font-black tracking-tight text-neutral-900 leading-none">
                Kuri
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-indigo-700 bg-indigo-50/90 px-2 py-0.5 rounded-full border border-indigo-200/70 leading-none shadow-xs">
                Smart, not kuripot
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 font-medium hidden sm:block mt-0.5">
              Personal Financial Ro-Vault
            </span>
          </div>
        </div>

        {/* Top Controls & Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="btn-back h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-lg sm:rounded-xl flex items-center justify-center text-neutral-500 hover:text-neutral-700 cursor-pointer shrink-0"
            title={soundEnabled ? "Mute Kuri sounds" : "Unmute Kuri sounds"}
            aria-label={soundEnabled ? "Mute Kuri sounds" : "Unmute Kuri sounds"}
          >
            {soundEnabled ? <Volume2 size={15} className="text-indigo-600" /> : <VolumeX size={15} />}
          </button>

          {/* Desktop Top Links */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              to="/login"
              className="btn-back !w-auto h-9 px-4 !rounded-xl inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold shrink-0"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              className="btn-primary !w-auto h-9 px-4.5 !rounded-xl inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-bold shrink-0 shadow-sm shadow-brand-500/25"
            >
              <UserPlus size={14} />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN HERO BODY (Split 2-Column with Prominent Kuri Stage) ── */}
      <main
        className="flex-1 flex flex-col items-center justify-center my-auto w-full py-1 sm:py-4"
        aria-live="polite"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-8 lg:gap-12 items-center justify-center">
          {/* ── LEFT COLUMN: Hero Copy, Value Prop & Direct Action ── */}
          <div className="w-full lg:col-span-6 flex flex-col justify-center text-center lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="flex flex-col items-center lg:items-start"
              >
                {/* Category Pill */}
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50/90 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full mb-1 sm:mb-3 border border-indigo-200/80 shadow-xs">
                  {slide.badge}
                </span>

                {/* Hero Title */}
                <h1 className="text-xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 leading-[1.15] mb-1.5 sm:mb-4 text-balance">
                  {slide.title}
                </h1>

                {/* Value Description */}
                <p className="text-xs sm:text-base text-neutral-600 leading-relaxed mb-2 sm:mb-5 max-w-lg text-balance">
                  {slide.description}
                </p>

                {/* Bullet Points with Check Badges (Hidden on mobile to eliminate text clutter) */}
                <ul className="hidden sm:flex flex-col gap-2 sm:gap-2.5 mb-3.5 sm:mb-6 text-left w-full max-w-lg">
                  {slide.bulletPoints.map((bullet, bIdx) => (
                    <li
                      key={bIdx}
                      className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-700 font-medium"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                      </div>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            {/* ── Slide Switcher Segmented Tabs (Unified Tactile Track with Morphing Pill) ── */}
            <div className="pt-0.5 sm:pt-3 w-full flex justify-center lg:justify-start">
              <div
                className="inline-flex items-center p-1 sm:p-1.5 rounded-xl sm:rounded-2xl gap-0.5 sm:gap-1 overflow-x-auto max-w-full scrollbar-none"
                style={{
                  background: "var(--neu-bg)",
                  boxShadow: "var(--neu-inset-sm)",
                }}
              >
                {welcomeSlides.map((s, idx) => {
                  const isSelected = idx === currentSlide
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        goToSlide(idx)
                        triggerHaptic("light")
                      }}
                      className={`relative text-[11px] sm:text-xs font-bold py-1 px-2.5 sm:py-1.5 sm:px-4 rounded-lg sm:rounded-xl transition-colors flex items-center gap-1 cursor-pointer shrink-0 select-none border-0 focus:outline-none focus:ring-0 ${
                        isSelected
                          ? "text-indigo-700 font-extrabold"
                          : "text-neutral-500 hover:text-neutral-800 bg-transparent"
                      }`}
                    >
                      {/* Morphing Neumorphic Active Pill */}
                      {isSelected && (
                        <motion.div
                          layoutId="activeWelcomeTabPill"
                          className="absolute inset-0 rounded-lg sm:rounded-xl pointer-events-none transform-gpu"
                          transition={{
                            type: "spring",
                            stiffness: 460,
                            damping: 34,
                          }}
                          style={{ willChange: "transform" }}
                        >
                          <div
                            className="w-full h-full rounded-lg sm:rounded-xl"
                            style={{
                              background: "var(--neu-bg)",
                              boxShadow: "var(--neu-raised-sm)",
                            }}
                          />
                        </motion.div>
                      )}

                      {/* Tab label sitting above the morphing pill */}
                      <span className="relative z-10">{s.shortTitle}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Prominent Kuri Mascot Stage with Floating Micro-Cards ── */}
          <div className="w-full lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-135 flex flex-col items-center justify-center">
              {/* Previous Button (Desktop) */}
              <button
                type="button"
                onClick={() => {
                  prevSlide()
                  triggerHaptic("light")
                }}
                className="hidden lg:flex absolute -left-5 z-20 top-1/2 -translate-y-1/2 btn-back w-9 h-9 p-0 !rounded-full items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-95 transition"
                aria-label="Previous slide"
                title="Previous slide (Left Arrow)"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Raised Stage Card Container */}
              <div
                className="w-full rounded-2xl sm:rounded-3xl p-4 sm:p-7 flex flex-col items-center justify-between relative overflow-hidden transition-all duration-300 min-h-[310px] sm:min-h-[410px] lg:min-h-[450px]"
                style={{
                  background: "var(--neu-bg)",
                  boxShadow: "var(--neu-raised-sm)",
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {/* ── Interactive Comic Speech Bubble with Pointer Tail ── */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${slide.id}-${activeCustomSpeech ? "custom" : "slide"}`}
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 w-full max-w-sm bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-indigo-100 shadow-[0_8px_20px_rgba(79,70,229,0.08)] mb-1.5 sm:mb-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold tracking-wider uppercase text-indigo-700 flex items-center gap-1">
                        {activeCustomSpeech ? (
                          <>
                            <Sparkles size={11} className="text-amber-500 animate-spin" />
                            <span>Kuri's Smart Tip</span>
                          </>
                        ) : (
                          slide.mascotBadge
                        )}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        "Smart, not kuripot"
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-[13px] text-neutral-800 font-semibold leading-snug sm:leading-relaxed">
                      {activeCustomSpeech || slide.mascotSpeech}
                    </p>
                    {/* Speech bubble downward pointer tail seamlessly matching border and bg */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-indigo-100 rotate-45" />
                  </motion.div>
                </AnimatePresence>

                {/* ── Center Stage: Hero Kuri Mascot Flanked by Floating Micro-Cards ── */}
                <div className="relative w-full flex items-center justify-center my-auto py-2 sm:py-5">
                  {/* Floating Micro-Card A (Top Left) */}
                  <motion.div
                    key={`cardA-${slide.id}`}
                    initial={{ opacity: 0, x: -16, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
                    transition={{
                      y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                      opacity: { duration: 0.3 },
                    }}
                    className="hidden sm:flex absolute left-1 sm:left-3 top-2 sm:top-3 z-10 flex-col p-2.5 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[4px_4px_12px_rgba(163,177,198,0.25),-4px_-4px_12px_rgba(255,255,255,0.9)] max-w-[145px] pointer-events-none select-none"
                  >
                    <span className="text-[10px] font-bold text-neutral-400">{slide.cardA.tag}</span>
                    {slide.cardA.progress ? (
                      <div className="mt-1">
                        <div className="flex justify-between text-[11px] font-extrabold text-neutral-800 mb-0.5">
                          <span>{slide.cardA.spent}</span>
                          <span className="text-neutral-400 font-normal">/{slide.cardA.total}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${slide.cardA.progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span
                        className={`text-xs font-black mt-0.5 ${
                          slide.cardA.isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {slide.cardA.amount}
                      </span>
                    )}
                    <span className="text-[9px] text-neutral-500 mt-0.5 leading-tight">
                      {slide.cardA.note}
                    </span>
                  </motion.div>

                  {/* Hero Kuri Mascot Character (Prominent 136px Canvas) */}
                  <motion.button
                    type="button"
                    onClick={handlePokeMascot}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    animate={pokePulse ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    className="relative z-10 flex flex-col items-center cursor-pointer focus:outline-none group select-none"
                    title="Click Kuri for a financial tip & sound!"
                    aria-label="Click Kuri for a financial tip and sound"
                  >
                    <KuriCanvas
                      mood={slide.mascotMood || "wave"}
                      size={120}
                      animated={true}
                      showAura={false}
                    />
                    <span className="mt-1 bg-indigo-600 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full shadow-md group-hover:scale-105 transition-transform flex items-center gap-1">
                      <span>Tap Kuri</span>
                      <span className="text-amber-300">₱</span>
                    </span>
                  </motion.button>

                  {/* Floating Micro-Card B (Bottom Right) */}
                  <motion.div
                    key={`cardB-${slide.id}`}
                    initial={{ opacity: 0, x: 16, y: -10 }}
                    animate={{ opacity: 1, x: 0, y: [0, 6, 0] }}
                    transition={{
                      y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
                      opacity: { duration: 0.3 },
                    }}
                    className="hidden sm:flex absolute right-1 sm:right-3 bottom-6 sm:bottom-7 z-10 flex-col p-2.5 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[4px_4px_12px_rgba(163,177,198,0.25),-4px_-4px_12px_rgba(255,255,255,0.9)] max-w-[145px] pointer-events-none select-none"
                  >
                    <span className="text-[10px] font-bold text-neutral-400">{slide.cardB.tag}</span>
                    {slide.cardB.amount && (
                      <span
                        className={`text-xs font-black mt-0.5 ${
                          slide.cardB.isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {slide.cardB.amount}
                      </span>
                    )}
                    <span className="text-[9px] text-neutral-500 mt-0.5 leading-tight">
                      {slide.cardB.note}
                    </span>
                    {slide.cardB.highlight && (
                      <span className="text-[9px] font-bold text-indigo-600 mt-0.5">
                        {slide.cardB.highlight}
                      </span>
                    )}
                  </motion.div>
                </div>

                {/* Progress Indicators */}
                <div className="w-full max-w-56 sm:max-w-xs pt-2 sm:pt-4 flex items-center gap-1.5 z-10">
                  {welcomeSlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        goToSlide(idx)
                        triggerHaptic("light")
                      }}
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

              {/* Next Button (Desktop) */}
              <button
                type="button"
                onClick={() => {
                  nextSlide()
                  triggerHaptic("light")
                }}
                className="hidden lg:flex absolute -right-5 z-20 top-1/2 -translate-y-1/2 btn-back w-9 h-9 p-0 !rounded-full items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-95 transition"
                aria-label="Next slide"
                title="Next slide (Right Arrow)"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── MOBILE BOTTOM BAR: Single Clear Primary CTA + Clean Sign-In Link ── */}
      <footer className="md:hidden w-full flex flex-col items-center gap-2 pt-2 pb-2.5 z-20">
        <div className="w-full max-w-sm flex flex-col items-center gap-2">
          <Link
            to="/register"
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl shadow-md shadow-brand-500/25 active:scale-[0.98] transition-transform"
          >
            <span>Start Tracking Free</span>
            <ArrowRight size={15} />
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <span>Already have an account?</span>
            <Link
              to="/login"
              className="font-bold text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 underline-offset-2"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
