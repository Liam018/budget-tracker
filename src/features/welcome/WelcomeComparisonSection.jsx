import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

function useScrollReveal(threshold = 0.1) {
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

const LEGACY = [
  "Messy pinch-to-zoom and microscopic mobile cells",
  "Broken Excel/Sheets formulas and missing offline sync",
  "Stressful, guilt-tripping red warning sheets",
  "Hours of tedious weekend bookkeeping",
]

const KURI = [
  "Log an expense in 3 seconds via quick-entry",
  "Visual category envelopes with real-time feedback",
  "Encouraging mascot celebrating your milestones",
  "Installable offline PWA — ready anywhere instantly",
]

export function WelcomeComparisonSection() {
  const [sectionRef, visible] = useScrollReveal()

  return (
    <section
      id="comparison"
      ref={sectionRef}
      className="w-full border-t border-slate-200/80 scroll-mt-16"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">

        {/* Section header — left-aligned, editorial */}
        <motion.div
          className="mb-10 sm:mb-14 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-end"
          initial={{ opacity: 0, y: 22 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.2em] text-indigo-600 mb-3">
              Why Kuri
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-neutral-900 tracking-tight leading-[1.1]">
              Spreadsheets Give Up.{" "}
              <span className="text-indigo-600">Kuri Stays.</span>
            </h2>
          </div>
          <p className="text-base sm:text-[1.0625rem] text-neutral-500 leading-relaxed font-normal lg:pb-1">
            Most budget routines fail because manual sheets are tedious, stressful, and impossible to maintain on a crowded phone screen.
          </p>
        </motion.div>

        {/* Comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">

          {/* Legacy */}
          <motion.div
            className="rounded-3xl border border-rose-200/70 overflow-hidden flex flex-col"
            style={{ background: "var(--neu-bg)", boxShadow: "var(--neu-raised-sm)" }}
            initial={{ opacity: 0, x: -24 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {/* Card header band */}
            <div className="bg-rose-50 border-b border-rose-200/60 px-6 py-4 flex items-center justify-between">
              <span className="text-rose-700 font-extrabold text-xs uppercase tracking-widest">
                Spreadsheets & Generic Apps
              </span>
              <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-100 px-2.5 py-1 rounded-md">
                Legacy
              </span>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col">
              <ul className="space-y-3.5 text-sm text-neutral-600 flex-1">
                {LEGACY.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="font-mono font-bold text-rose-400 mt-0.5 shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-rose-100">
                <span className="text-sm font-bold text-rose-600">Outcome: Abandoned after 2 weeks.</span>
              </div>
            </div>
          </motion.div>

          {/* Kuri */}
          <motion.div
            className="rounded-3xl border border-indigo-200/70 overflow-hidden flex flex-col relative"
            style={{
              background: "linear-gradient(145deg, #edf0f7, #e3e9f6)",
              boxShadow: "var(--neu-raised)",
            }}
            initial={{ opacity: 0, x: 24 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {/* Glow accent */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Card header band */}
            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between relative z-10">
              <span className="text-white font-extrabold text-xs uppercase tracking-widest">
                Kuri the Ro-Vault
              </span>
              <span className="text-[10px] font-mono font-bold text-indigo-200 bg-indigo-500/60 px-2.5 py-1 rounded-md">
                Modern
              </span>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col relative z-10">
              <ul className="space-y-3.5 text-sm text-neutral-800 font-medium flex-1">
                {KURI.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="font-mono font-bold text-indigo-600 mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-indigo-200/60">
                <span className="text-sm font-bold text-indigo-700">Outcome: Long-term mindful money habits.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
