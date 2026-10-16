import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Plus } from "lucide-react"
import { triggerHaptic } from "../../lib/haptics"
import { playTone } from "../../components/mascot/vaultyEngine"

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

const TABS = [
  { id: "quick-add", label: "3-Sec Quick Add", mobileLabel: "Quick Add" },
  { id: "multi-currency", label: "Multi-Currency & Accounts", mobileLabel: "Currencies" },
  { id: "envelopes", label: "Smart Envelopes", mobileLabel: "Envelopes" },
  { id: "insights", label: "Visual Cash Flow", mobileLabel: "Cash Flow" },
]

const CURRENCIES = [
  { code: "USD", symbol: "$", rate: 1.0, flag: "🇺🇸" },
  { code: "EUR", symbol: "€", rate: 0.92, flag: "🇪🇺" },
  { code: "GBP", symbol: "£", rate: 0.79, flag: "🇬🇧" },
  { code: "JPY", symbol: "¥", rate: 154.0, flag: "🇯🇵" },
  { code: "PHP", symbol: "₱", rate: 58.5, flag: "🇵🇭" },
]

export function WelcomeFeaturesSection() {
  const [activeTab, setActiveTab] = useState("quick-add")
  const [sectionRef, visible] = useScrollReveal()

  const [demoTransactions, setDemoTransactions] = useState([
    { id: 1, name: "Iced Cold Brew", category: "Coffee", amount: -4.5, time: "Just now" },
    { id: 2, name: "Client Design Retainer", category: "Income", amount: 450.0, time: "Today" },
  ])
  const [quickBalance, setQuickBalance] = useState(1280.5)
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0])
  const [spentDining, setSpentDining] = useState(380)
  const maxDining = 500

  function handleAddQuickExpense(name, category, amount) {
    playTone("coin", true)
    triggerHaptic("medium")
    const newTx = { id: Date.now(), name, category, amount, time: "Just now" }
    setDemoTransactions((prev) => [newTx, ...prev.slice(0, 3)])
    setQuickBalance((prev) => prev + amount)
  }

  function handleSelectCurrency(curr) {
    playTone("coin", true)
    triggerHaptic("light")
    setSelectedCurrency(curr)
  }

  const diningPercentage = Math.min(100, Math.round((spentDining / maxDining) * 100))
  const isWarning = diningPercentage >= 80

  return (
    <section
      id="features"
      ref={sectionRef}
      className="w-full border-t border-slate-200/80 scroll-mt-16"
    >
      {/* Dark editorial header band */}
      <div className="w-full bg-neutral-900 py-14 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-violet-600/12 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 22 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.2em] text-indigo-400 mb-4">
              Features — Try it now
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-4">
              Effortless Budgeting,{" "}
              <span className="text-indigo-400">No Sign-In Required.</span>
            </h2>
            <p className="text-base sm:text-lg text-neutral-400 leading-relaxed font-normal max-w-xl">
              Test drive Kuri's core mechanics right now. See exactly how it feels before you commit a single second to signing up.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Interactive sandbox area */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* Segmented tabs */}
        <motion.div
          className="w-full flex justify-start sm:justify-center mb-7 sm:mb-9 overflow-x-auto scrollbar-none py-1"
          initial={{ opacity: 0, y: 14 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div
            className="inline-flex items-center p-1.5 rounded-2xl gap-1 shrink-0"
            style={{ background: "var(--neu-bg)", boxShadow: "var(--neu-inset-sm)" }}
            role="tablist"
            aria-label="Feature demos"
          >
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => { setActiveTab(tab.id); triggerHaptic("light") }}
                  className={`relative px-3.5 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center cursor-pointer shrink-0 select-none border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isSelected ? "text-indigo-700 font-extrabold" : "text-neutral-500 hover:text-neutral-800 bg-transparent"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeFeaturePill"
                      className="absolute inset-0 rounded-xl pointer-events-none transform-gpu"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      style={{ background: "var(--neu-bg)", boxShadow: "var(--neu-raised-sm)" }}
                    />
                  )}
                  <span className="relative z-10 whitespace-nowrap hidden sm:inline">{tab.label}</span>
                  <span className="relative z-10 whitespace-nowrap sm:hidden">{tab.mobileLabel}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Demo panel */}
        <motion.div
          className="w-full max-w-4xl mx-auto p-5 sm:p-9 rounded-3xl relative overflow-hidden"
          style={{ background: "var(--neu-bg)", boxShadow: "var(--neu-raised)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <AnimatePresence mode="wait">

            {/* TAB 1: 3-SECOND QUICK ADD */}
            {activeTab === "quick-add" && (
              <motion.div
                key="quick-add"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start"
                role="tabpanel"
              >
                <div className="md:col-span-5 flex flex-col justify-center">
                  <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mb-2.5">Tap. Categorized. Done.</h3>
                  <p className="text-sm sm:text-[15px] text-neutral-500 leading-relaxed mb-5">
                    Log transactions the instant they occur with smart chips or custom amounts. Never postpone or forget a receipt.
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-widest">
                      Tap to simulate quick entry:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "-$4.75 Coffee", name: "Specialty Coffee", cat: "Dining", amt: -4.75, color: "rose" },
                        { label: "-$32.50 Grocery", name: "Grocery Run", cat: "Food", amt: -32.5, color: "rose" },
                        { label: "+$120 Payout", name: "Freelance Payout", cat: "Income", amt: 120.0, color: "emerald" },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleAddQuickExpense(item.name, item.cat, item.amt)}
                          className={`px-3.5 py-2 rounded-xl bg-white border shadow-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                            item.color === "emerald"
                              ? "border-emerald-200/80 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50/50"
                              : "border-slate-200/80 text-neutral-700 hover:border-indigo-300 hover:bg-indigo-50/30"
                          }`}
                        >
                          <Plus size={12} className={item.color === "emerald" ? "text-emerald-500" : "text-indigo-500"} />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-7 bg-white/95 rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                        Live Vault Balance
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-neutral-900 mt-0.5">
                        ${quickBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
                      Auto-Synced
                    </span>
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {demoTransactions.map((tx) => (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -16, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: "auto" }}
                          exit={{ opacity: 0, x: 16, height: 0 }}
                          transition={{ duration: 0.22 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100/80"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${tx.amount > 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-neutral-800">{tx.name}</span>
                              <span className="text-[10px] text-neutral-400">{tx.category}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`text-sm font-black ${tx.amount > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                            </span>
                            <span className="text-[9px] text-neutral-400">{tx.time}</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: MULTI-CURRENCY */}
            {activeTab === "multi-currency" && (
              <motion.div
                key="multi-currency"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start"
                role="tabpanel"
              >
                <div className="md:col-span-5 flex flex-col justify-center">
                  <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mb-2.5">Any Currency, Anywhere</h3>
                  <p className="text-sm sm:text-[15px] text-neutral-500 leading-relaxed mb-5">
                    Whether managing local cash, bank deposits, or international transfers, Kuri recalculates conversions in real-time.
                  </p>
                  <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-widest mb-2.5">
                    Switch active currency:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleSelectCurrency(c)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          selectedCurrency.code === c.code
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white border-slate-200/80 text-neutral-700 hover:border-indigo-300 hover:bg-indigo-50/30"
                        }`}
                        aria-pressed={selectedCurrency.code === c.code}
                      >
                        <span>{c.flag}</span>
                        <span>{c.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-7 grid grid-cols-2 gap-3">
                  {[
                    { label: "Checking Vault", badge: "Primary", badgeColor: "indigo", base: 3250.0 },
                    { label: "Digital Wallet", badge: "E-Wallet", badgeColor: "emerald", base: 540.0 },
                    { label: "Physical Cash Stash", badge: "Pocket", badgeColor: "neutral", base: 185.0 },
                  ].map((acct) => (
                    <div key={acct.label} className="p-4 rounded-2xl bg-white/95 border border-slate-200/80 shadow-sm flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-500">{acct.label}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          acct.badgeColor === "indigo" ? "text-indigo-700 bg-indigo-50" :
                          acct.badgeColor === "emerald" ? "text-emerald-700 bg-emerald-50" :
                          "text-neutral-500 bg-neutral-50"
                        }`}>{acct.badge}</span>
                      </div>
                      <span className="text-xl font-black text-neutral-900">
                        {selectedCurrency.symbol}{(acct.base * selectedCurrency.rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                  <div className="p-4 rounded-2xl bg-indigo-600 border border-indigo-500 flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-indigo-200">Total Net Portfolio</span>
                    <span className="text-xl font-black text-white">
                      {selectedCurrency.symbol}{(3975.0 * selectedCurrency.rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-indigo-300 font-semibold">Multi-wallet unified</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: SMART ENVELOPES */}
            {activeTab === "envelopes" && (
              <motion.div
                key="envelopes"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start"
                role="tabpanel"
              >
                <div className="md:col-span-5 flex flex-col justify-center">
                  <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mb-2.5">Guilt-Free Spending Buffers</h3>
                  <p className="text-sm sm:text-[15px] text-neutral-500 leading-relaxed mb-5">
                    Set dynamic ceilings per category. Get gentle visual warnings at 80% before overspending happens, eliminating end-of-month panic.
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-widest">
                      Drag to simulate spending:
                    </span>
                    <input
                      type="range" min="100" max="500" step="20" value={spentDining}
                      onChange={(e) => setSpentDining(Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      aria-label="Adjust dining spending amount"
                    />
                    <div className="flex justify-between text-[11px] font-bold text-neutral-400">
                      <span>$100 safe</span>
                      <span>$400 ⚠</span>
                      <span>$500 max</span>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-7 bg-white/95 rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-3.5">
                    <div>
                      <span className="text-sm font-black text-neutral-900 block">Dining & Hangouts</span>
                      <span className="text-xs text-neutral-400">Monthly Envelope</span>
                    </div>
                    <span className={`text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-2 ${
                      isWarning ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {isWarning && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse shrink-0" />}
                      {diningPercentage}% Spent
                    </span>
                  </div>
                  <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden mb-3.5">
                    <motion.div
                      className={`h-full rounded-full ${isWarning ? "bg-amber-500" : "bg-indigo-600"}`}
                      animate={{ width: `${diningPercentage}%` }}
                      transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-neutral-600 mb-4">
                    <span>Spent: ${spentDining}.00</span>
                    <span>Limit: ${maxDining}.00</span>
                  </div>
                  <div className={`p-3.5 rounded-2xl text-sm font-medium ${
                    isWarning ? "bg-amber-50 text-amber-900 border border-amber-200/70" : "bg-slate-50 text-neutral-600 border border-slate-100"
                  }`}>
                    {isWarning
                      ? "Kuri alert: Nearing category limit. Consider cooking at home!"
                      : `Buffer intact — $${maxDining - spentDining} remaining for this month.`}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: VISUAL CASH FLOW */}
            {activeTab === "insights" && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start"
                role="tabpanel"
              >
                <div className="md:col-span-5 flex flex-col justify-center">
                  <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mb-2.5">No Spreadsheets Required</h3>
                  <p className="text-sm sm:text-[15px] text-neutral-500 leading-relaxed mb-5">
                    Get high-level clarity on your savings rate, top categories, and monthly net flow without complex Excel formulas or cluttered dashboards.
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex flex-col">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-1">Savings Rate</span>
                      <span className="text-2xl font-black text-emerald-700">34.8%</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">+6.4% vs last month</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex flex-col">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide mb-1">Habit Streak</span>
                      <span className="text-2xl font-black text-indigo-700">7-Day</span>
                      <span className="text-[11px] text-indigo-600 font-semibold">Daily logging ✓</span>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-7 bg-white/95 rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Monthly Allocation</span>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                      +34.8% Savings
                    </span>
                  </div>
                  <div className="space-y-3.5">
                    {[
                      { label: "Essentials & Housing", pct: 45, color: "bg-indigo-600" },
                      { label: "Lifestyle & Fun", pct: 20, color: "bg-violet-500" },
                      { label: "Direct Wealth Building", pct: 35, color: "bg-emerald-500", highlight: true },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className={item.highlight ? "text-emerald-700" : "text-neutral-700"}>{item.label}</span>
                          <span className={item.highlight ? "text-emerald-600 font-extrabold" : "text-neutral-400"}>{item.pct}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
