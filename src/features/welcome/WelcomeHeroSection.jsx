import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, ArrowDown } from "lucide-react"
import { PeekingKuri } from "./PeekingKuri"

const ROTATING_WORDS = ["money", "cash flow", "spending", "savings", "habits", "future"]

function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, visible]
}

export function WelcomeHeroSection({
  pokePulse,
  onPokeMascot,
  onTouchStart,
  onTouchEnd,
}) {
  const [wordIndex, setWordIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [heroRef, heroVisible] = useScrollReveal(0.05)

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length)
    }, 2600)
    return () => clearInterval(timer)
  }, [isPaused])

  const currentWord = `${ROTATING_WORDS[wordIndex]}.`

  return (
    <section
      id="hero"
      ref={heroRef}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12 pb-0 lg:pb-12 min-h-[calc(100dvh-3.75rem)] flex flex-col justify-between scroll-mt-16 overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="w-full flex-1 flex flex-col justify-evenly lg:justify-between lg:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-10 items-center">
        {/* Left: Headline + Subtitle + CTAs */}
        <motion.div
          className="w-full lg:col-span-7 flex flex-col justify-center items-center lg:items-start text-center lg:text-left"
          initial={{ opacity: 0, y: 24 }}
          animate={heroVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Responsive 3-Line Parallel Headline */}
          <h1 className="w-full font-black text-neutral-950 tracking-[-0.035em] leading-[1.06] mb-3.5 sm:mb-5 lg:mb-6 text-[clamp(2.15rem,8vw,3.5rem)] lg:text-[clamp(2.85rem,4.2vw,4.35rem)]">
            {/* Line 1: Full-scale muted lead-in to pair with Line 3 */}
            <span className="block text-neutral-400 font-extrabold tracking-[-0.03em]">
              Know your
            </span>

            {/* Line 2: Rotating Word — Zero-Shift Grid + Staggered Character Wave */}
            <span
              className="inline-grid grid-cols-1 grid-rows-1 justify-items-center lg:justify-items-start align-baseline relative max-w-full py-0.5 -my-0.5 cursor-default select-none"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              aria-live="polite"
            >
              <AnimatePresence initial={false}>
                <motion.span
                  key={currentWord}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.022 } },
                    exit: { transition: { staggerChildren: 0.014, staggerDirection: 1 } },
                  }}
                  className="col-start-1 row-start-1 inline-flex items-center lg:items-start whitespace-nowrap font-black text-[#2D2E7E] overflow-hidden pb-1.5 -mb-1.5"
                >
                  {Array.from(currentWord).map((char, i) => (
                    <motion.span
                      key={`${char}-${i}`}
                      variants={{
                        hidden: { y: "105%", opacity: 0, filter: "blur(3px)" },
                        visible: {
                          y: "0%",
                          opacity: 1,
                          filter: "blur(0px)",
                          transition: {
                            duration: 0.45,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        },
                        exit: {
                          y: "-105%",
                          opacity: 0,
                          filter: "blur(3px)",
                          transition: {
                            duration: 0.28,
                            ease: [0.4, 0, 1, 1],
                          },
                        },
                      }}
                      className="inline-block whitespace-pre"
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.span>
              </AnimatePresence>
            </span>

            {/* Line 3: Grounding Statement */}
            <span className="block text-neutral-900">
              Own your choices.
            </span>
          </h1>

          {/* Responsive Subtitle — Orphan-Free Line Wrapping */}
          <div className="w-full max-w-[36ch] sm:max-w-lg lg:max-w-xl mb-5 sm:mb-7 lg:mb-8 px-1 sm:px-0 space-y-1.5 sm:space-y-2">
            <p className="text-[clamp(0.875rem,2.3vw,1.125rem)] text-neutral-800 font-semibold leading-snug tracking-tight">
              Meet <span className="text-[#2D2E7E] font-extrabold">Kuri the Ro-Vault</span> — your loyal{" "}
              <span className="whitespace-nowrap">pocket safe-keeper.</span>
            </p>
            <p className="text-[clamp(0.8rem,1.9vw,0.975rem)] text-neutral-500 leading-relaxed text-balance font-normal">
              Track every move across{" "}
              <strong className="text-neutral-700 font-semibold">
                cash, cards, and multi-currency wallets
              </strong>
              . Spot silent leaks early and build intentional habits without the guilt.
            </p>
          </div>

          {/* Responsive CTAs — Side-by-side on mobile & desktop */}
          <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 lg:gap-4">
            <Link
              to="/register"
              className="btn-primary !w-full sm:!w-auto min-h-[2.85rem] sm:min-h-[3.1rem] lg:min-h-[3.25rem] px-4 sm:px-7 lg:px-8 !rounded-xl inline-flex items-center justify-center gap-1.5 sm:gap-2 text-[clamp(0.75rem,1.8vw,0.9rem)] font-bold shadow-lg shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98] transition-transform whitespace-nowrap"
              aria-label="Create a free Kuri account"
            >
              <span>Start Tracking Free</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </Link>
            <a
              href="#features"
              className="btn-secondary !w-full sm:!w-auto min-h-[2.85rem] sm:min-h-[3.1rem] lg:min-h-[3.25rem] px-3.5 sm:px-6 lg:px-7 !rounded-xl inline-flex items-center justify-center gap-1.5 sm:gap-2 text-[clamp(0.75rem,1.8vw,0.9rem)] font-semibold text-neutral-600 hover:text-neutral-900 transition-colors whitespace-nowrap"
              aria-label="Explore Kuri features"
            >
              <span>Explore Features</span>
              <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
            </a>
          </div>
        </motion.div>

        {/* Mascot: Anchored to Bottom Edge on Mobile, Right Column on Desktop */}
        <motion.div
          className="w-full lg:col-span-5 flex flex-col items-center justify-end lg:justify-center -mb-[1px] lg:mb-0 mt-auto lg:mt-0 pt-2 lg:pt-0"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={heroVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <PeekingKuri onPoke={onPokeMascot} pokePulse={pokePulse} />
          {/* Subtle mobile section divider line */}
          <div className="w-full h-[1px] bg-slate-300/80 lg:hidden" />
        </motion.div>
      </div>
    </section>
  )
}