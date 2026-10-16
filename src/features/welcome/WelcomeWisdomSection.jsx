import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { RefreshCw, Quote } from "lucide-react"

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

const CATEGORY_COLORS = {
  budgeting: "text-indigo-700 bg-indigo-50 border-indigo-200/60",
  savings: "text-emerald-700 bg-emerald-50 border-emerald-200/60",
  safety: "text-sky-700 bg-sky-50 border-sky-200/60",
  frugal: "text-amber-700 bg-amber-50 border-amber-200/60",
  spending: "text-violet-700 bg-violet-50 border-violet-200/60",
  investing: "text-teal-700 bg-teal-50 border-teal-200/60",
  habits: "text-rose-700 bg-rose-50 border-rose-200/60",
  mindset: "text-orange-700 bg-orange-50 border-orange-200/60",
  general: "text-neutral-700 bg-neutral-100 border-neutral-200/60",
}

export function WelcomeWisdomSection({ interactiveTip, onRollWisdom }) {
  const [sectionRef, visible] = useScrollReveal()
  const categoryClass = CATEGORY_COLORS[interactiveTip.category] || CATEGORY_COLORS.general

  return (
    <section
      ref={sectionRef}
      className="w-full border-t border-slate-200/80"
      aria-label="Financial wisdom from Kuri"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="p-7 sm:p-10 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-6"
            style={{ background: "var(--neu-bg)", boxShadow: "var(--neu-raised)" }}
          >
            {/* Quote icon accent */}
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25">
              <Quote size={20} className="text-white" />
            </div>

            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                  Kuri's Financial Wisdom
                </span>
                <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${categoryClass}`}>
                  {interactiveTip.category}
                </span>
              </div>

              <p className="text-sm sm:text-[15px] font-semibold text-neutral-800 leading-relaxed">
                "{interactiveTip.message}"
              </p>

              <button
                type="button"
                onClick={onRollWisdom}
                className="self-start btn-secondary !w-auto h-9 px-4 !rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-transform mt-1"
                aria-label="Get another financial tip from Kuri"
              >
                <RefreshCw size={13} />
                <span>Roll Another Tip</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
