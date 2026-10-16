import { useState, useEffect, useRef, useCallback } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { welcomeSlides } from "../constants/welcomeSlides"
import { getRandomTip, KURI_TIPS } from "../constants/vaultyTips"
import { playTone } from "../components/mascot/vaultyEngine"
import { triggerHaptic } from "../lib/haptics"
import { toast } from "../components/ui"
import {
  WelcomeNavbar,
  WelcomeHeroSection,
  WelcomePhilosophySection,
  WelcomeRoVaultSection,
  WelcomeFeaturesSection,
  WelcomeComparisonSection,
  WelcomeWisdomSection,
  WelcomeFinalCTA,
  WelcomeFooter,
  WelcomeStickyBar,
} from "../features/welcome"

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
      setShowStickyBottom(window.scrollY > 480)
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
    setInteractiveTip(getRandomTip())
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

  const activeCustomSpeech =
    customSpeechState.slideIndex === currentSlide ? customSpeechState.speech : null

  return (
    <div className="min-h-screen w-full bg-[#edf0f7] text-neutral-800 flex flex-col relative selection:bg-indigo-500 selection:text-white overflow-x-clip scroll-smooth">
      <WelcomeNavbar
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onPokeMascot={handlePokeMascot}
      />

      <WelcomeHeroSection
        currentSlide={currentSlide}
        progress={progress}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        pokePulse={pokePulse}
        activeCustomSpeech={activeCustomSpeech}
        onNextSlide={nextSlide}
        onPrevSlide={prevSlide}
        onGoToSlide={goToSlide}
        onPokeMascot={handlePokeMascot}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />

      <WelcomePhilosophySection />

      <WelcomeRoVaultSection onPokeMascot={handlePokeMascot} />

      <WelcomeFeaturesSection />

      <WelcomeComparisonSection />

      <WelcomeWisdomSection
        interactiveTip={interactiveTip}
        onRollWisdom={handleRollWisdom}
      />

      <WelcomeFinalCTA />

      <WelcomeFooter />

      <WelcomeStickyBar show={showStickyBottom} />
    </div>
  )
}
