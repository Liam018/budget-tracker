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
  Shield,
  Wallet,
  PieChart,
  TrendingUp,
  Smartphone,
  ArrowDown,
  Heart,
  RefreshCw,
  ShieldCheck,
  Coins,
  Award,
  Check,
  X,
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { welcomeSlides } from "../constants/welcomeSlides"
import { getRandomTip, KURI_TIPS } from "../constants/vaultyTips"
import { KuriCanvas } from "../components/mascot"
import { playTone } from "../components/mascot/vaultyEngine"
import { triggerHaptic } from "../lib/haptics"
import { toast } from "../components/ui"
import kuriLogo from "../assets/kuri-logo-2.png"

const SLIDE_DURATION = 4500 // 4.5 seconds per hero slide

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
  const [showStickyBottom, setShowStickyBottom] = useState(false)
  const [interactiveTip, setInteractiveTip] = useState(() => KURI_TIPS[0])

  // Guard ref for auto-advancing slides
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

  // Track scroll position to reveal sticky mobile bottom bar
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 480) {
        setShowStickyBottom(true)
      } else {
        setShowStickyBottom(false)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

  // Auto-advance hero slides with progressive interval
  useEffect(() => {
    if (isPaused) return

    const interval = 40 // update every 40ms
    const step = (interval / SLIDE_DURATION) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (!isAdvancingRef.current) {
            isAdvancingRef.current = true
            setCurrentSlide((curr) => (curr + 1) % welcomeSlides.length)
          }
          return 0
        }
        isAdvancingRef.current = false
        return prev + step
      })
    }, interval)

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

  function handleRollWisdom() {
    playTone("coin", soundEnabled)
    triggerHaptic("light")
    const tip = getRandomTip()
    setInteractiveTip(tip)
  }

  // Full-surface swipe handlers for hero mascot stage
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
  const activeCustomSpeech =
    customSpeechState.slideIndex === currentSlide ? customSpeechState.speech : null

  return (
    <div className="min-h-screen w-full bg-[#edf0f7] text-neutral-800 flex flex-col relative selection:bg-indigo-500 selection:text-white">
      {/* ── STICKY TOP NAVBAR ── */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#edf0f7]/90 border-b border-white/60 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none shrink-0"
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
                <span className="text-base sm:text-lg font-black tracking-tight text-neutral-900 leading-none">
                  Kuri
                </span>
                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50/90 px-2 py-0.5 rounded-full border border-indigo-200/70 leading-none shadow-xs">
                  Smart, not kuripot
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-medium hidden sm:block mt-0.5">
                Personal Financial Ro-Vault
              </span>
            </div>
          </div>

          {/* Quick Nav Anchors (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-neutral-600">
            <a href="#hero" className="hover:text-indigo-600 transition-colors">
              Overview
            </a>
            <a href="#philosophy" className="hover:text-indigo-600 transition-colors">
              The Philosophy
            </a>
            <a href="#ro-vault" className="hover:text-indigo-600 transition-colors">
              Meet Ro-Vault
            </a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#comparison" className="hover:text-indigo-600 transition-colors">
              Why Kuri
            </a>
          </nav>

          {/* Controls & Primary Nav Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className="btn-back h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-lg sm:rounded-xl flex items-center justify-center text-neutral-500 hover:text-neutral-700 cursor-pointer shrink-0"
              title={soundEnabled ? "Mute Kuri sounds" : "Unmute Kuri sounds"}
              aria-label={soundEnabled ? "Mute Kuri sounds" : "Unmute Kuri sounds"}
            >
              {soundEnabled ? (
                <Volume2 size={15} className="text-indigo-600" />
              ) : (
                <VolumeX size={15} />
              )}
            </button>

            <Link
              to="/login"
              className="btn-back !w-auto h-8 sm:h-9 px-3 sm:px-4 !rounded-xl inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold shrink-0"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </Link>

            <Link
              to="/register"
              className="btn-primary !w-auto h-8 sm:h-9 px-3.5 sm:px-4.5 !rounded-xl inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-bold shrink-0 shadow-sm shadow-brand-500/25"
            >
              <UserPlus size={13} />
              <span className="hidden xs:inline">Create Account</span>
              <span className="xs:hidden">Join</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── SECTION 1: HERO STAGE (Above the fold) ── */}
      <section
        id="hero"
        className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-5 sm:pt-10 pb-8 sm:pb-16 flex flex-col justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12 items-center justify-center">
          {/* Left Column: Hero Title, Tagline & Direct CTAs */}
          <div className="w-full lg:col-span-6 flex flex-col justify-center text-center lg:text-left">
            {/* Platform Tagline Badge */}
            <div className="inline-flex items-center gap-2 self-center lg:self-start bg-indigo-50 border border-indigo-200/80 rounded-full px-3 py-1 mb-3 sm:mb-4 shadow-xs">
              <Sparkles size={13} className="text-indigo-600" />
              <span className="text-[11px] sm:text-xs font-bold text-indigo-700 tracking-wide uppercase">
                The Pocket Vault-Keeper
              </span>
            </div>

            {/* Main Catchphrase */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 leading-[1.12] mb-3 sm:mb-5 text-balance">
              Know your money. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Own your choices.
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-xs sm:text-base text-neutral-600 leading-relaxed mb-4 sm:mb-6 max-w-xl mx-auto lg:mx-0 text-balance">
              Meet <strong>Kuri the Ro-Vault</strong> — your loyal expense tracker and companion.
              Effortlessly track daily cash flow across <strong>Cash, Maya, and GCash</strong>, plug
              silent money leaks, and stay <span className="text-indigo-700 font-bold">"smart, not kuripot."</span>
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 mb-5 sm:mb-7">
              <Link
                to="/register"
                className="btn-primary !w-full sm:!w-auto h-11 sm:h-12 px-6 sm:px-8 !rounded-xl sm:!rounded-2xl inline-flex items-center justify-center gap-2 text-sm font-bold shadow-md shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <span>Start Tracking Free</span>
                <ArrowRight size={16} />
              </Link>
              <a
                href="#philosophy"
                className="btn-secondary !w-full sm:!w-auto h-11 sm:h-12 px-5 sm:px-6 !rounded-xl sm:!rounded-2xl inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <span>Explore the Story</span>
                <ArrowDown size={14} className="text-indigo-600" />
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-[11px] sm:text-xs text-neutral-500 font-semibold border-t border-slate-200/80 pt-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone size={14} className="text-indigo-600 shrink-0" />
                <span>Offline-Ready PWA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-indigo-600 shrink-0" />
                <span>Bank-Grade Privacy</span>
              </div>
            </div>

            {/* ── Slide Switcher Segmented Tabs ── */}
            <div className="pt-4 sm:pt-6 w-full flex flex-col items-center lg:items-start gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Explore Core Capabilities:
              </span>
              <div
                className="inline-flex items-center p-1 rounded-xl sm:rounded-2xl gap-0.5 sm:gap-1 overflow-x-auto max-w-full scrollbar-none"
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
                      className={`relative text-[11px] sm:text-xs font-bold py-1 px-2.5 sm:py-1.5 sm:px-3.5 rounded-lg sm:rounded-xl transition-colors flex items-center gap-1 cursor-pointer shrink-0 select-none border-0 focus:outline-none focus:ring-0 ${
                        isSelected
                          ? "text-indigo-700 font-extrabold"
                          : "text-neutral-500 hover:text-neutral-800 bg-transparent"
                      }`}
                    >
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
                      <span className="relative z-10">{s.shortTitle}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Mascot Stage */}
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
                aria-label="Previous capability"
                title="Previous capability"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Raised Mascot Stage Card */}
              <div
                className="w-full rounded-2xl sm:rounded-3xl p-4 sm:p-7 flex flex-col items-center justify-between relative overflow-hidden transition-all duration-300 min-h-[320px] sm:min-h-[410px]"
                style={{
                  background: "var(--neu-bg)",
                  boxShadow: "var(--neu-raised-sm)",
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {/* Comic Speech Bubble with Pointer Tail */}
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
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-indigo-100 rotate-45" />
                  </motion.div>
                </AnimatePresence>

                {/* Center Mascot & Floating Micro-Cards */}
                <div className="relative w-full flex items-center justify-center my-auto py-2 sm:py-5">
                  {/* Floating Micro-Card A */}
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

                  {/* Interactive Mascot Character */}
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

                  {/* Floating Micro-Card B */}
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

                {/* Slide Progress Bars */}
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
                aria-label="Next capability"
                title="Next capability"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: THE KURI PHILOSOPHY ("Smart, Not Kuripot") ── */}
      <section
        id="philosophy"
        className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-10 sm:py-20 border-t border-slate-200/80"
      >
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Cultural Philosophy
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-4">
            Reclaiming <span className="text-indigo-600 italic">"Kuripot"</span> into Mindful Financial Freedom
          </h2>
          <p className="text-xs sm:text-base text-neutral-600 leading-relaxed">
            In Filipino culture, *"kuripot"* often meant penny-pinching out of fear or depriving oneself.
            <strong> Kuri reframes the concept:</strong> caring for your hard-earned money isn't cheap—it is
            wisdom, intentionality, and respect for your future self.
          </p>
        </div>

        {/* 3 Pillars of Kuri */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          <div
            className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col justify-between"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-raised-sm)",
            }}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 mb-5 shadow-xs">
                <Coins size={24} />
              </div>
              <h3 className="text-base sm:text-lg font-black text-neutral-900 mb-2">
                1. Masinop at Wais
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Every peso saved represents your invested hours and energy. Being mindful of cash flow
                is a mark of self-discipline, not stinginess.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-200/80 text-[11px] font-bold text-indigo-700">
              Motto: "Spend intentionally, save proudly."
            </div>
          </div>

          <div
            className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col justify-between"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-raised-sm)",
            }}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-5 shadow-xs">
                <Heart size={24} />
              </div>
              <h3 className="text-base sm:text-lg font-black text-neutral-900 mb-2">
                2. Freedom Over Deprivation
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                By plugging unconscious leaks and impulse buys, you unlock the freedom to spend
                comfortably and guilt-free on the milestones and memories that truly matter.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-200/80 text-[11px] font-bold text-emerald-700">
              Motto: "Guilt-free joy for what counts."
            </div>
          </div>

          <div
            className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col justify-between"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-raised-sm)",
            }}
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 mb-5 shadow-xs">
                <Shield size={24} />
              </div>
              <h3 className="text-base sm:text-lg font-black text-neutral-900 mb-2">
                3. Healthy Financial Boundaries
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Saying no to lifestyle creep, FOMO, and unneeded expenses isn't embarrassing.
                Kuri celebrates healthy boundaries as the ultimate self-respect.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-200/80 text-[11px] font-bold text-amber-700">
              Motto: "Protect your peace of mind."
            </div>
          </div>
        </div>

        {/* Central Quote Callout */}
        <div
          className="mt-8 sm:mt-12 p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-center max-w-2xl mx-auto border border-indigo-200/70"
          style={{
            background: "linear-gradient(145deg, #edf0f7, #e0e5f2)",
            boxShadow: "var(--neu-raised-sm)",
          }}
        >
          <p className="text-base sm:text-xl font-black text-neutral-900 leading-snug">
            “Your money shouldn't be confusing. Kuri helps make it clear.”
          </p>
          <span className="text-xs font-semibold text-indigo-700 mt-2 block">
            — The Kuri Promise
          </span>
        </div>
      </section>

      {/* ── SECTION 3: MEET KURI THE RO-VAULT (Character Anatomy & Lore) ── */}
      <section
        id="ro-vault"
        className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-10 sm:py-20 border-t border-slate-200/80"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          {/* Left Visual Character Spotlight */}
          <div className="w-full lg:col-span-5 flex flex-col items-center">
            <div
              className="w-full max-w-sm rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
              style={{
                background: "var(--neu-bg)",
                boxShadow: "var(--neu-raised)",
              }}
            >
              <div className="w-40 h-40 sm:w-48 sm:h-48 mb-4 relative flex items-center justify-center">
                <KuriCanvas mood="wave" size={160} animated={true} showAura={true} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900">
                Kuri the Ro-Vault
              </h3>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-0.5 rounded-full mt-1 mb-3">
                Robot + Vault = Your Pocket Vault-Keeper
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Crafted as a rounded indigo steel safe with glowing digital eyes and a golden belly
                combination dial. Your protective guardian against budget leaks.
              </p>
              <button
                type="button"
                onClick={handlePokeMascot}
                className="mt-4 btn-secondary !w-auto text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} className="text-amber-500" />
                <span>Tap for a Vault Sound</span>
              </button>
            </div>
          </div>

          {/* Right Anatomy Breakdown */}
          <div className="w-full lg:col-span-7 flex flex-col justify-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 self-start mb-3">
              Mascot Anatomy
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight mb-4">
              Designed with Purpose: The Ro-Vault Anatomy
            </h2>
            <p className="text-xs sm:text-base text-neutral-600 leading-relaxed mb-6">
              Unlike cold corporate banking bots, Kuri combines the mechanical discipline of a bank safe
              with the supportive warmth of a loyal friend.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "var(--neu-bg)",
                  boxShadow: "var(--neu-raised-sm)",
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                    👀
                  </div>
                  <h4 className="text-sm font-black text-neutral-900">Cyan Digital Eyes</h4>
                </div>
                <p className="text-xs text-neutral-600">
                  Expressive 20-frame procedural sprite eyes that celebrate your savings streaks and blink
                  with concern when limits are near.
                </p>
              </div>

              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "var(--neu-bg)",
                  boxShadow: "var(--neu-raised-sm)",
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    🔒
                  </div>
                  <h4 className="text-sm font-black text-neutral-900">Belly Combination Dial</h4>
                </div>
                <p className="text-xs text-neutral-600">
                  A tactile vault dial symbolizing bank-grade discipline. Safeguarding your accounts and
                  keeping confidential records private.
                </p>
              </div>

              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "var(--neu-bg)",
                  boxShadow: "var(--neu-raised-sm)",
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    📡
                  </div>
                  <h4 className="text-sm font-black text-neutral-900">Live Alert Antenna</h4>
                </div>
                <p className="text-xs text-neutral-600">
                  Sends gentle, encouraging nudges before you breach a category ceiling—eliminating the
                  anxiety of end-of-month financial shocks.
                </p>
              </div>

              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "var(--neu-bg)",
                  boxShadow: "var(--neu-raised-sm)",
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <h4 className="text-sm font-black text-neutral-900">Pocket PWA Companion</h4>
                </div>
                <p className="text-xs text-neutral-600">
                  Installs directly to your home screen with offline sync. Available at the checkout
                  counter, restaurant, or sari-sari store.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: CORE FEATURES BENTO GRID ── */}
      <section
        id="features"
        className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-10 sm:py-20 border-t border-slate-200/80"
      >
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            System Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-4">
            Everything You Need to Master Your Money
          </h2>
          <p className="text-xs sm:text-base text-neutral-600 leading-relaxed">
            Built from the ground up for how Filipinos actually spend, manage cash, and track e-wallets.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Card 1: Multi-Account Ledger (Large Span) */}
          <div
            className="lg:col-span-2 p-6 sm:p-8 rounded-3xl flex flex-col justify-between"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-raised-sm)",
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Wallet size={20} />
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                  Cash + E-Wallets + Banks
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-neutral-900 mb-2">
                Multi-Account Ledger with 3-Second Quick Add
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                Never lose track of which wallet paid for what. Keep separate balances for Physical Cash,
                GCash, Maya, and Bank cards with an ultra-fast bottom sheet entry on mobile.
              </p>
            </div>

            {/* Visual Account Mockup Pill Row */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs flex flex-col">
                <span className="text-[10px] font-bold text-neutral-400">GCash</span>
                <span className="text-xs sm:text-sm font-black text-neutral-800">₱4,250.00</span>
                <span className="text-[9px] text-emerald-600 font-semibold mt-0.5">Active</span>
              </div>
              <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs flex flex-col">
                <span className="text-[10px] font-bold text-neutral-400">Maya Savings</span>
                <span className="text-xs sm:text-sm font-black text-neutral-800">₱18,500.00</span>
                <span className="text-[9px] text-indigo-600 font-semibold mt-0.5">+4.5% p.a.</span>
              </div>
              <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs flex flex-col">
                <span className="text-[10px] font-bold text-neutral-400">Physical Cash</span>
                <span className="text-xs sm:text-sm font-black text-neutral-800">₱1,820.00</span>
                <span className="text-[9px] text-neutral-500 font-semibold mt-0.5">Pocket</span>
              </div>
            </div>
          </div>

          {/* Card 2: Visual Budget Envelopes */}
          <div
            className="p-6 sm:p-8 rounded-3xl flex flex-col justify-between"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-raised-sm)",
            }}
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <PieChart size={20} />
              </div>
              <h3 className="text-base sm:text-lg font-black text-neutral-900 mb-2">
                Smart Budget Envelopes
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
                Set category ceilings with dynamic visual progress bars. Automatic warnings at 80% and
                100% stop overspending before it happens.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs">
              <div className="flex justify-between text-xs font-bold text-neutral-800 mb-1">
                <span>Food & Dining</span>
                <span className="text-indigo-600">₱3,600 / ₱5,000</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[72%]" />
              </div>
              <span className="text-[10px] text-neutral-500 font-medium mt-1 block">
                72% spent • ₱1,400 remaining buffer
              </span>
            </div>
          </div>

          {/* Card 3: Live FX & Philippine Peso Native */}
          <div
            className="p-6 sm:p-8 rounded-3xl flex flex-col justify-between"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-raised-sm)",
            }}
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <RefreshCw size={20} />
              </div>
              <h3 className="text-base sm:text-lg font-black text-neutral-900 mb-2">
                Native ₱ PHP + Live FX
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
                Perfect for freelancers and OFW remittances. Real-time exchange rate conversions (USD,
                EUR, SGD, JPY) directly into Philippine Peso.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200/80 text-xs font-semibold text-neutral-700 flex items-center justify-between">
              <span>$100.00 USD</span>
              <span className="text-indigo-600 font-black">≈ ₱5,860.00 PHP</span>
            </div>
          </div>

          {/* Card 4: Reports & Analytics */}
          <div
            className="p-6 sm:p-8 rounded-3xl flex flex-col justify-between"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-raised-sm)",
            }}
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-4">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-base sm:text-lg font-black text-neutral-900 mb-2">
                Clarity Over Cash Flow
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
                Know your savings rate, top spending categories, and monthly net flow without
                complex formulas or intimidating charts.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <Award size={15} />
              <span>Savings Rate: +34.8% this month</span>
            </div>
          </div>

          {/* Card 5: Installable PWA */}
          <div
            className="p-6 sm:p-8 rounded-3xl flex flex-col justify-between"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-raised-sm)",
            }}
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Smartphone size={20} />
              </div>
              <h3 className="text-base sm:text-lg font-black text-neutral-900 mb-2">
                Installable Offline PWA
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
                Add Kuri directly to your Android or iOS home screen. No app store downloads, fast
                native standalone experience, and works offline.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-blue-800 bg-blue-50 p-2.5 rounded-xl border border-blue-200">
              ✓ Service Worker Caching & Web Push Ready
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: TRADITIONAL SPREADSHEETS vs. KURI ── */}
      <section
        id="comparison"
        className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-10 sm:py-20 border-t border-slate-200/80"
      >
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Why Kuri
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight mt-3 mb-4">
            Spreadsheets Give Up. Kuri Stays with You.
          </h2>
          <p className="text-xs sm:text-base text-neutral-600 leading-relaxed">
            Most budget routines fail because manual sheets are tedious, stressful, and impossible to
            maintain on a crowded phone screen.
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Traditional Way */}
          <div
            className="p-6 sm:p-8 rounded-3xl border border-rose-200/80 flex flex-col justify-between"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-raised-sm)",
            }}
          >
            <div>
              <div className="flex items-center gap-2 mb-4 text-rose-600 font-extrabold text-sm uppercase tracking-wider">
                <X size={18} className="text-rose-500" />
                <span>Spreadsheets & Generic Apps</span>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-neutral-600">
                <li className="flex items-start gap-2.5">
                  <X size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Messy pinch-to-zoom on mobile screens</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Broken Excel formulas and missing sync</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>Stressful, guilt-tripping red warning sheets</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>No offline support during spotty data signals</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-rose-100 text-xs text-rose-600 font-semibold">
              Outcome: Abandoned after 2 weeks.
            </div>
          </div>

          {/* The Kuri Way */}
          <div
            className="p-6 sm:p-8 rounded-3xl border border-indigo-200 flex flex-col justify-between relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #edf0f7, #e4e9f5)",
              boxShadow: "var(--neu-raised)",
            }}
          >
            <div>
              <div className="flex items-center gap-2 mb-4 text-indigo-700 font-extrabold text-sm uppercase tracking-wider">
                <Check size={18} className="text-indigo-600" />
                <span>Kuri the Ro-Vault</span>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-neutral-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Log an expense in 3 seconds via quick-entry FAB</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Visual category envelopes with real-time feedback</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Encouraging mascot companion celebrating wins</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Progressive Web App: works offline anywhere</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-indigo-100 text-xs text-indigo-700 font-bold">
              Outcome: Long-term mindful money habits.
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: INTERACTIVE KURI WISDOM GENERATOR ── */}
      <section className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-10 sm:py-16 border-t border-slate-200/80">
        <div
          className="p-6 sm:p-10 rounded-3xl flex flex-col items-center text-center relative"
          style={{
            background: "var(--neu-bg)",
            boxShadow: "var(--neu-raised)",
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
            <Sparkles size={24} />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 mb-1">
            Ro-Vault Wisdom Generator
          </span>
          <h3 className="text-lg sm:text-2xl font-black text-neutral-900 mb-4">
            Ask Kuri for Practical Financial Wisdom
          </h3>

          {/* Tip Card Display */}
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-indigo-100 shadow-sm mb-5 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {interactiveTip.category}
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">Smart Tip</span>
            </div>
            <p className="text-sm font-semibold text-neutral-800 leading-relaxed">
              "{interactiveTip.message}"
            </p>
          </div>

          <button
            type="button"
            onClick={handleRollWisdom}
            className="btn-primary !w-auto h-11 px-6 !rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-brand-500/25 hover:scale-105 active:scale-95 transition-transform"
          >
            <RefreshCw size={15} />
            <span>Generate Another Tip</span>
          </button>
        </div>
      </section>

      {/* ── SECTION 7: HIGH-IMPACT FINAL CTA ── */}
      <section className="w-full max-w-5xl mx-auto px-3.5 sm:px-6 py-12 sm:py-24 border-t border-slate-200/80">
        <div
          className="p-8 sm:p-14 rounded-3xl text-center relative overflow-hidden flex flex-col items-center"
          style={{
            background: "linear-gradient(145deg, #ffffff, #e6ebf5)",
            boxShadow: "var(--neu-raised)",
          }}
        >
          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />

          <img
            src={kuriLogo}
            alt="Kuri Ro-Vault"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-4 drop-shadow-md select-none"
          />

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight mb-3 text-balance">
            Take Control of Your Peso Today.
          </h2>

          <p className="text-xs sm:text-base text-neutral-600 max-w-xl mx-auto mb-8 text-balance">
            Join thousands tracking with clarity. No credit card required, zero subscription walls,
            and free forever.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full max-w-md">
            <Link
              to="/register"
              className="btn-primary w-full h-12 !rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <span>Create Free Account</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="btn-secondary w-full h-12 !rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-neutral-700"
            >
              <LogIn size={15} />
              <span>Sign In to Vault</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full border-t border-slate-200/80 py-8 px-4 sm:px-8 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={kuriLogo} alt="Kuri" className="w-5 h-5 object-contain" />
            <span className="font-extrabold text-neutral-700">Kuri</span>
            <span>— Personal Expense Tracker & Ro-Vault Companion</span>
          </div>

          <div className="flex items-center gap-6 text-neutral-500 font-semibold">
            <Link to="/login" className="hover:text-indigo-600 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-indigo-600 transition-colors">
              Get Started
            </Link>
            <span className="text-indigo-600 font-bold">"Smart, not kuripot"</span>
          </div>
        </div>
      </footer>

      {/* ── MOBILE STICKY FLOATING BOTTOM BAR ── */}
      <AnimatePresence>
        {showStickyBottom && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-3 inset-x-3 z-50 sm:hidden"
          >
            <div className="backdrop-blur-xl bg-white/95 border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-2.5 rounded-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 pl-1">
                <img src={kuriLogo} alt="Kuri" className="w-7 h-7 object-contain" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-neutral-900 leading-none">Kuri</span>
                  <span className="text-[10px] text-neutral-500 font-medium">Free & Offline</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary !w-auto py-2 px-4 !rounded-xl text-xs font-black flex items-center gap-1 shadow-md shadow-brand-500/25"
                >
                  <span>Start Free</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
