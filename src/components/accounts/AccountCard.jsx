import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MorphIcon } from "morphicons/react"
import {
  Wallet,
  Banknote,
  Building2,
  Smartphone,
  CreditCard,
  PiggyBank,
  ShoppingBag,
  TrendingUp,
  Coins,
  Briefcase,
  Landmark,
  Receipt,
  MoreVertical,
  Edit3,
  Archive,
  RotateCcw,
  Trash2,
} from "lucide"
import { formatCurrency } from "../../services/accountService"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"

const ICON_MAP = {
  Wallet,
  Banknote,
  Building2,
  Smartphone,
  CreditCard,
  PiggyBank,
  ShoppingBag,
  TrendingUp,
  Coins,
  Briefcase,
  Landmark,
  Receipt,
}

const TYPE_LABELS = {
  cash: "Cash",
  bank: "Bank",
  e_wallet: "E-Wallet",
  credit_card: "Credit Card",
  savings: "Savings",
  investment: "Investment",
  other: "Other",
}

/**
 * AccountCard — Tactile Neumorphic account/wallet card.
 */
export default function AccountCard({
  account,
  onEdit,
  onArchive,
  onDelete,
  index = 0,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const {
    name,
    type,
    balance = 0,
    currency = "PHP",
    color = "#863bff",
    icon = "Wallet",
    institution,
    account_number,
    is_archived = false,
  } = account

  const IconComponent = ICON_MAP[icon] || Wallet
  const numBalance = parseFloat(balance) || 0
  const isCredit = type === "credit_card"

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("pointerdown", handleClickOutside)
    return () => document.removeEventListener("pointerdown", handleClickOutside)
  }, [menuOpen])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 18, boxShadow: NEU.raisedSm }}
      animate={{
        opacity: is_archived ? 0.6 : 1,
        scale: 1,
        y: 0,
        boxShadow: NEU.raisedSm,
      }}
      exit={{ opacity: 0, scale: 0.88, y: -12 }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 26,
        mass: 0.8,
        layout: { type: "spring", stiffness: 380, damping: 28 },
      }}
      whileHover={{ y: -3, boxShadow: NEU.raisedHover }}
      className="relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between select-none"
      style={{
        background: NEU.bg,
        boxShadow: NEU.raisedSm,
      }}
    >
      {/* Top Row: Icon + Type Badge + More Menu */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Account Icon Cavity */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0  transition-transform"
            style={{
              background: color || "#863bff",
              color: "#ffffff",
            }}
          >
            <MorphIcon icon={IconComponent} size={19} strokeWidth={2.4} />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-neutral-800 leading-tight truncate">
              {name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-neutral-200/80 text-neutral-600 uppercase tracking-wider">
                {institution || TYPE_LABELS[type] || "Account"}
              </span>
              {account_number && (
                <span className="text-[10px] text-neutral-400 font-mono">
                  •••• {account_number.slice(-4)}
                </span>
              )}
              {is_archived && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-neutral-200 text-neutral-400 uppercase tracking-wider">
                  Archived
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu Button */}
        <div className="relative shrink-0" ref={menuRef}>
          <motion.button
            whileHover={neuButtonHover}
            whileTap={neuButtonTap}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
            style={{
              background: NEU.bg,
              boxShadow: menuOpen ? NEU.insetSm : NEU.raisedSm,
            }}
            aria-label="Account options"
          >
            <MorphIcon icon={MoreVertical} size={14} strokeWidth={2.4} />
          </motion.button>

          {/* Floating Dropdown Popover */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-1.5 z-30 min-w-36 p-1.5 rounded-xl text-left"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.raised,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit?.(account)
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-brand-600 hover:bg-neutral-200/40 transition-colors cursor-pointer"
                >
                  <MorphIcon icon={Edit3} size={13} strokeWidth={2.4} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onArchive?.(account.id, !is_archived)
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-neutral-700 hover:text-amber-600 hover:bg-amber-50/50 transition-colors cursor-pointer"
                >
                  <MorphIcon
                    icon={is_archived ? RotateCcw : Archive}
                    size={13}
                    strokeWidth={2.4}
                  />
                  <span>{is_archived ? "Restore" : "Archive"}</span>
                </button>

                <div className="my-1 border-t border-neutral-200/60" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete?.(account)
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50/60 transition-colors cursor-pointer"
                >
                  <MorphIcon icon={Trash2} size={13} strokeWidth={2.4} />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Row: Balance Display */}
      <div className="pt-2 border-t border-neutral-200/50 flex items-baseline justify-between">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          Balance
        </span>
        <p
          className={`text-base sm:text-lg font-black tracking-tight ${
            isCredit
              ? "text-rose-600"
              : numBalance >= 0
              ? "text-neutral-800"
              : "text-rose-600"
          }`}
        >
          {formatCurrency(balance, currency)}
        </p>
      </div>
    </motion.div>
  )
}
