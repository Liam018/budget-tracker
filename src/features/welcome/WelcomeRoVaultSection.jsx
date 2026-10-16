import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Sparkles, Smile, Award, HelpCircle, Lock } from "lucide-react"
import { KuriCanvas } from "../../components/mascot"
import { playTone } from "../../components/mascot/vaultyEngine"
import { triggerHaptic } from "../../lib/haptics"

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

const MOOD_ACTIONS = [
  {
    id: "wave",
    mood: "wave",
    label: "Wave Salute",
    icon: Smile,
    sound: "coin",
    speech: "Hey! Ready to make your money work harder for you today?",
  },
  {
    id: "celebrate",
    mood: "celebrate",
    label: "Celebrate Streak",
    icon: Award,
    sound: "coin",
    speech: "Woohoo! Savings milestone reached! Compound interest in motion!",
  },
  {
    id: "thinking",
    mood: "thinking",
    label: "Crunch Numbers",
    icon: HelpCircle,
    sound: "coin",
    speech: "Analyzing cash flow... All buffers are safely within limits!",
  },
  {
    id: "dial_buff",
    mood: "dial_buff",
    label: "Seal the Safe",
    icon: Lock,
    sound: "coin",
    speech: "Vault locked and secured! Confidential, encrypted, and private.",
  },
]

export function WelcomeRoVaultSection({ onPokeMascot }) {
  const [selectedAction, setSelectedAction] = useState(MOOD_ACTIONS[0])
  const [sectionRef, visible] = useScrollReveal()

  function handleTriggerAction(action) {
    playTone(action.sound, true)
    triggerHaptic("medium")
    setSelectedAction(action)
  }

  return (
    <section
      id="ro-vault"
      ref={sectionRef}
      className="w-full border-t border-slate-200/80 scroll-mt-16"
    >
      {/* Asymmetric layout: full-bleed with offset mascot and text in left rail */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">

        {/* Section intro */}
        <motion.div
          className="mb-10 sm:mb-14 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-end"
          initial={{ opacity: 0, y: 22 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.2em] text-indigo-600 mb-3">
              Meet Kuri
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-neutral-900 tracking-tight leading-[1.1] mb-0">
              Your Pocket{" "}
              <span className="text-indigo-600">Safe-Keeper</span>
            </h2>
          </div>
          <p className="text-base sm:text-[1.0625rem] text-neutral-500 leading-relaxed font-normal lg:pb-1">
            Unlike cold corporate banking apps, Kuri combines the mechanical discipline of a vault with the warmth of an encouraging friend who celebrates every win.
          </p>
        </motion.div>

        {/* Main interactive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">

          {/* Mascot Stage — elevated, distinctive treatment */}
          <motion.div
            className="w-full lg:col-span-5 flex flex-col items-center"
            initial={{ opacity: 0, x: -24 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <div
              className="w-full max-w-sm rounded-3xl p-7 sm:p-9 flex flex-col items-center text-center relative overflow-hidden"
              style={{ background: "var(--neu-bg)", boxShadow: "var(--neu-raised)" }}
            >
              {/* Subtle accent circle */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-100/50 pointer-events-none" />

              <div className="w-44 h-44 sm:w-48 sm:h-48 relative flex items-center justify-center mb-3">
                <KuriCanvas mood={selectedAction.mood} size={176} animated={true} />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedAction.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="w-full bg-white/95 rounded-2xl p-4 border border-indigo-100/80 shadow-sm mb-4 text-left"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                      Ro-Vault Reaction
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">Interactive</span>
                  </div>
                  <p className="text-[13px] font-semibold text-neutral-800 leading-snug">
                    "{selectedAction.speech}"
                  </p>
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                onClick={onPokeMascot}
                className="btn-secondary !w-auto text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                aria-label="Get a random financial tip from Kuri"
              >
                <Sparkles size={13} className="text-amber-500" />
                <span>Poke for a Random Tip</span>
              </button>
            </div>
          </motion.div>

          {/* Mood controller + trust signals */}
          <motion.div
            className="w-full lg:col-span-7 flex flex-col justify-center"
            initial={{ opacity: 0, x: 24 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <div className="mb-6">
              <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-3">
                Trigger Ro-Vault animations
              </span>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {MOOD_ACTIONS.map((action) => {
                  const Icon = action.icon
                  const isActive = selectedAction.id === action.id
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleTriggerAction(action)}
                      className={`p-3 sm:p-4 rounded-2xl flex items-center gap-3 text-sm font-bold transition-all cursor-pointer text-left border ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20 scale-[1.02]"
                          : "bg-white border-slate-200/80 text-neutral-700 hover:border-indigo-300 hover:bg-indigo-50/40"
                      }`}
                      aria-pressed={isActive}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? "bg-white/15" : "bg-indigo-50"
                      }`}>
                        <Icon size={16} className={isActive ? "text-amber-300" : "text-indigo-600"} />
                      </div>
                      <span>{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Trust signal pills */}
            <div className="pt-5 border-t border-slate-200/80 flex flex-wrap gap-2">
              {[
                "Zero ads",
                "Zero data selling",
                "100% offline-ready PWA",
                "No subscription walls",
              ].map((item) => (
                <span
                  key={item}
                  className="text-[11px] font-semibold text-neutral-500 bg-white border border-slate-200/80 px-3 py-1.5 rounded-full shadow-[1px_1px_3px_rgba(163,177,198,0.15),-1px_-1px_3px_rgba(255,255,255,0.8)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
