import { Link } from "react-router-dom"
import kuriLogo from "../../assets/kuri-logo-2.png"

export function WelcomeFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full bg-neutral-900 border-t border-white/8 pt-8 pb-28 sm:pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

        {/* Brand */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <img src={kuriLogo} alt="Kuri" className="w-6 h-6 object-contain opacity-90 shrink-0" />
            <span className="text-sm font-extrabold text-white">Kuri</span>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-900/50 border border-indigo-700/40 px-2 py-0.5 rounded-full">
              Smart, not kuripot
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-medium">
            Personal Expense Tracker & Ro-Vault Companion
          </p>
          <p className="text-[11px] text-neutral-600">© {year} Kuri. Free forever.</p>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap items-center gap-4 sm:gap-6" aria-label="Footer navigation">
          <Link
            to="/login"
            className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/register"
            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-colors"
            aria-label="Create a free Kuri account"
          >
            Create Free Account →
          </Link>
        </nav>
      </div>
    </footer>
  )
}
