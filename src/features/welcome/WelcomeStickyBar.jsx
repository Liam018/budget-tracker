import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight } from "lucide-react"
import kuriLogo from "../../assets/kuri-logo-2.png"

export function WelcomeStickyBar({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 88, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 88, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-3 inset-x-3 z-50 sm:hidden"
          role="complementary"
          aria-label="Quick sign-up bar"
        >
          <div className="backdrop-blur-2xl bg-neutral-900/95 border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-3 rounded-2xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 pl-0.5">
              <img src={kuriLogo} alt="Kuri" className="w-7 h-7 object-contain shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="text-xs font-black text-white">Kuri</span>
                <span className="text-[10px] text-neutral-400 font-medium mt-0.5">Free & Offline</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                aria-label="Sign in to Kuri"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary !w-auto py-2 px-4 !rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/25"
                aria-label="Create a free Kuri account"
              >
                <span>Start Free</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
