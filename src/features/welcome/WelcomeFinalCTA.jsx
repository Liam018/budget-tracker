import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { ArrowRight, LogIn, Sparkles } from "lucide-react"
import kuriLogo from "../../assets/kuri-logo-2.png"

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

export function WelcomeFinalCTA() {
  const [sectionRef, visible] = useScrollReveal()

  return (
    <section
      ref={sectionRef}
      className="w-full border-t border-slate-200/80"
      aria-labelledby="final-cta-heading"
    >
      {/* Dark editorial final band */}
      <div className="w-full bg-neutral-900 relative overflow-hidden">
        {/* Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Glow accents */}
        <div className="absolute -top-40 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-20 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
          <motion.div
            className="max-w-4xl"
            initial={{ opacity: 0, y: 28 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Mascot + badge row */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                <img
                  src={kuriLogo}
                  alt="Kuri"
                  className="w-10 h-10 object-contain select-none"
                  draggable="false"
                />
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-400 uppercase tracking-[0.18em]">
                <Sparkles size={10} />
                Free forever — No credit card required
              </span>
            </div>

            {/* Headline */}
            <h2
              id="final-cta-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.06] mb-5"
            >
              Take Control of Your{" "}
              <span className="text-indigo-400">Finances Today.</span>
            </h2>

            {/* Body */}
            <p className="text-lg sm:text-xl text-neutral-400 leading-relaxed font-normal max-w-2xl mb-10">
              Join others tracking with clarity. No subscription walls, zero complexity — just a clear picture of your money.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <Link
                to="/register"
                className="btn-primary !w-full sm:!w-auto h-14 px-8 !rounded-2xl text-base font-bold flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                aria-label="Create a free Kuri account"
              >
                <span>Create Free Account</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="!w-full sm:!w-auto h-14 px-8 rounded-2xl text-base font-semibold inline-flex items-center justify-center gap-2.5 text-neutral-300 border border-white/15 hover:bg-white/8 hover:text-white transition-all"
                aria-label="Sign in to your existing Kuri account"
              >
                <LogIn size={17} />
                <span>Sign In to Vault</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
