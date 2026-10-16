import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Sparkles, ShieldAlert } from "lucide-react"
import { triggerHaptic } from "../../lib/haptics"

function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, visible]
}

const KURI_WAY = [
  {
    num: "01",
    title: "Conscious Spending",
    body: "Spend generously on what enriches your life. Trim only the mindless leaks that don't serve you.",
  },
  {
    num: "02",
    title: "Healthy Boundaries",
    body: "Saying no to impulse peer pressure is a superpower, not an embarrassment.",
  },
  {
    num: "03",
    title: "Automated Peace",
    body: "Clear visual envelopes so you always know your safe-to-spend balance without anxiety.",
  },
]

const OLD_WAY = [
  {
    num: "01",
    title: "Penny-Pinching Stress",
    body: "Feeling anxious and guilty over every small coffee or social dinner with friends.",
  },
  {
    num: "02",
    title: "Binge-Spend Rebound",
    body: "Depriving yourself until willpower breaks, leading to massive regret purchases.",
  },
  {
    num: "03",
    title: "Spreadsheet Fatigue",
    body: "Spending your weekend fixing broken formulas instead of enjoying your money.",
  },
]

export function WelcomePhilosophySection() {
  const [activeMindset, setActiveMindset] = useState("kuri")
  const [sectionRef, visible] = useScrollReveal()

  const isKuri = activeMindset === "kuri"

  return (
    <section
      id="philosophy"
      ref={sectionRef}
      className="w-full border-t border-slate-200/80 scroll-mt-16"
    >
      {/* Dark editorial band — distinctive break from the neumorphic surface */}
      <div className="w-full bg-neutral-900 py-14 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle texture pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Accent glow */}
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 24 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.2em] text-indigo-400 mb-4">
              The Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-4">
              Smart Spending.{" "}
              <span className="text-indigo-400">Zero Guilt.</span>
            </h2>
            <p className="text-base sm:text-lg text-neutral-400 leading-relaxed font-normal max-w-xl">
              Personal finance shouldn't feel like a punishment. Kuri turns money management from a chore into quiet, confident clarity.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Interactive content below the dark band */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Toggle */}
        <motion.div
          className="flex justify-center mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div
            className="inline-flex items-center p-1.5 rounded-2xl gap-1"
            style={{ background: "var(--neu-bg)", boxShadow: "var(--neu-inset-sm)" }}
            role="tablist"
            aria-label="Mindset comparison"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isKuri}
              onClick={() => { setActiveMindset("kuri"); triggerHaptic("light") }}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                isKuri
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <Sparkles size={12} />
              <span className="hidden sm:inline">The Kuri Way — Intentional</span>
              <span className="sm:hidden">Kuri Method</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isKuri}
              onClick={() => { setActiveMindset("traditional"); triggerHaptic("light") }}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                !isKuri
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <ShieldAlert size={12} />
              <span className="hidden sm:inline">The Deprivation Trap</span>
              <span className="sm:hidden">Deprivation</span>
            </button>
          </div>
        </motion.div>

        {/* Comparison panel */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMindset}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className={`rounded-3xl overflow-hidden border ${
                isKuri ? "border-indigo-200/80" : "border-rose-200/80"
              }`}
              style={{
                background: isKuri
                  ? "linear-gradient(145deg, #ffffff, #edf2fc)"
                  : "linear-gradient(145deg, #ffffff, #fff1f2)",
                boxShadow: "var(--neu-raised)",
              }}
              role="tabpanel"
            >
              {/* Header row */}
              <div className={`px-6 sm:px-10 py-5 border-b ${isKuri ? "border-indigo-100" : "border-rose-100"} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-neutral-900 leading-none mb-1">
                    {isKuri ? "Mindful Allocation & Autonomy" : "The Deprivation & Guilt Loop"}
                  </h3>
                  <span className={`text-[12px] font-bold ${isKuri ? "text-indigo-600" : "text-rose-600"}`}>
                    {isKuri ? '"Smart, not stingy"' : "Why traditional money diets always fail"}
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg self-start sm:self-auto ${
                  isKuri ? "text-indigo-700 bg-indigo-50" : "text-rose-700 bg-rose-50"
                }`}>
                  {isKuri ? "Kuri Method" : "Old Mindset"}
                </span>
              </div>

              {/* Cards */}
              <div className="px-6 sm:px-10 py-7 sm:py-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(isKuri ? KURI_WAY : OLD_WAY).map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 sm:p-5 rounded-2xl border flex flex-col gap-1.5 ${
                      isKuri ? "bg-white/80 border-indigo-100/60" : "bg-white/80 border-rose-100/60"
                    }`}
                  >
                    <span className={`text-[11px] font-mono font-extrabold ${isKuri ? "text-indigo-500" : "text-rose-400"}`}>
                      {item.num}
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900">{item.title}</h4>
                    <p className="text-[12px] text-neutral-500 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
