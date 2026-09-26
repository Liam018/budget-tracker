import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MorphIcon } from "morphicons/react"
import {
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide"
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
} from "lucide-react"
import { formatCurrency } from "../../services/accountService"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap, cardItemVariants } from "../../lib/animations"
import { toast } from "../ui"

/** Safe haptic vibration utility for mobile devices */
export function triggerHaptic(type = "light") {
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      if (type === "light") navigator.vibrate(12)
      else if (type === "medium") navigator.vibrate(22)
      else if (type === "success") navigator.vibrate([8, 25, 12])
    } catch {
      // Ignore vibration errors
    }
  }
}

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
  cash: "Cash Account",
  bank: "Bank Account",
  e_wallet: "E-Wallet",
  credit_card: "Credit Card",
  savings: "Savings Jar",
  investment: "Investment",
  other: "Digital Asset",
}

const TYPE_BADGES = {
  cash: "CASH",
  bank: "DEBIT",
  e_wallet: "E-WALLET",
  credit_card: "CREDIT",
  savings: "SAVINGS",
  investment: "INVEST",
  other: "ASSET",
}

/**
 * AccountCard — Tactile Neumorphic Account & Wallet Card.
 *
 * Designed with soft Neumorphic elevation, crisp color identity accents,
 * smooth privacy balance reveal, account number copy, and an elevated
 * non-clipping action menu.
 */
export default function AccountCard({
  account,
  onEdit,
  onArchive,
  onDelete,
  index = 0,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  const menuRef = useRef(null)

  // Track hover capability to avoid sticky hover states on touch screens
  const [canHover, setCanHover] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const hoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)")
    setCanHover(hoverMedia.matches)
    const handleHoverChange = (e) => setCanHover(e.matches)
    hoverMedia.addEventListener("change", handleHoverChange)
    return () => hoverMedia.removeEventListener("change", handleHoverChange)
  }, [])

  // Close menu on outside pointerdown
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

  const {
    id,
    name,
    type = "bank",
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

  // Formatted account number
  const formattedNumber = account_number
    ? account_number.length > 4
      ? `•••• •••• •••• ${account_number.slice(-4)}`
      : `•••• ${account_number}`
    : null

  // Copy to clipboard handler
  const handleCopy = async (e) => {
    e.stopPropagation()
    if (copied || !account_number) return

    triggerHaptic("success")

    let success = false
    if (navigator?.clipboard?.writeText && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(account_number)
        success = true
      } catch {
        // fallback below
      }
    }

    if (!success) {
      try {
        const textarea = document.createElement("textarea")
        textarea.value = account_number
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
        success = true
      } catch {
        toast?.error?.("Unable to copy")
        return
      }
    }

    setCopied(true)
    toast?.success?.("Account number copied!")
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <motion.div
      layout="position"
      variants={cardItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        zIndex: menuOpen ? 40 : 1,
        willChange: "transform",
      }}
      className="relative select-none transform-gpu"
    >
      {/* ── Neumorphic Card Shell ── */}
      <motion.div
        whileHover={
          canHover
            ? {
                y: -3,
                transition: { duration: 0.18, ease: "easeOut" },
              }
            : undefined
        }
        whileTap={{
          scale: 0.988,
          transition: { duration: 0.08, ease: "easeIn" },
        }}
        style={{
          background: NEU.bg,
          boxShadow: NEU.raised,
        }}
        className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 min-h-50 sm:min-h-52.5 flex flex-col justify-between transition-[transform,box-shadow] duration-200 hover:shadow-(--neu-raised-hover)"
      >
        {/* ── Internal Background Clip Layer (Watermarks & Color Wash) ── */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none z-0">
          {/* Subtle Ambient Color Wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 12% 16%, ${color || "#863bff"}18 0%, transparent 60%)`,
            }}
          />

          {/* Tactile Concentric Arc Watermark */}
          <div className="absolute -right-12 -bottom-14 w-48 h-48 rounded-full border border-neutral-300/25 pointer-events-none" />
          <div className="absolute -right-6 -bottom-8 w-36 h-36 rounded-full border border-white/50 pointer-events-none" />
        </div>

        {/* ── Archived Notice Banner ── */}
        {is_archived && (
          <div className="relative z-20 mb-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 text-[11px] font-bold">
            <div className="flex items-center gap-1.5">
              <Archive size={13} className="text-amber-600 shrink-0" />
              <span>Archived Account</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onArchive?.(account.id, false)
              }}
              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700 hover:text-amber-900 bg-amber-500/15 hover:bg-amber-500/25 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw size={10} strokeWidth={2.5} />
              <span>Restore</span>
            </button>
          </div>
        )}

        {/* ── TOP ROW: Brand Icon + Details + Options Menu ── */}
        <div className="relative z-20 flex items-start justify-between gap-3">
          {/* Brand Icon Cavity & Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm border border-white/40 transition-transform duration-200"
              style={{
                background: color || "#863bff",
                boxShadow: `0 4px 12px -2px ${color || "#863bff"}55`,
              }}
            >
              <IconComponent
                size={20}
                strokeWidth={2.4}
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-neutral-800 leading-tight truncate tracking-tight">
                {name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {/* Sunken Neumorphic Institution Badge (only when distinct from account name) */}
                {institution && institution.toLowerCase() !== name.toLowerCase() && (
                  <span
                    className="px-2 py-0.5 rounded-md text-[9px] font-extrabold text-neutral-600 uppercase tracking-wider"
                    style={{
                      background: NEU.bg,
                      boxShadow: NEU.insetSm,
                    }}
                  >
                    {institution}
                  </span>
                )}
                <span className="text-[10px] text-neutral-400 font-semibold tracking-wide">
                  {TYPE_LABELS[type] || "Account"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Menu Button */}
          <div className="relative shrink-0" ref={menuRef}>
            <motion.button
              whileHover={neuButtonHover}
              whileTap={neuButtonTap}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((prev) => !prev)
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
              style={{
                background: NEU.bg,
                boxShadow: menuOpen ? NEU.insetSm : NEU.raisedSm,
              }}
              aria-label="Account options"
            >
              <MoreVertical
                size={15}
                strokeWidth={2.4}
              />
            </motion.button>

            {/* Floating Popover Menu (Solid opaque background, deep shadow) */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 4 }}
                  transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full mt-2 z-50 min-w-44 p-1.5 rounded-2xl border border-neutral-200/80 text-left"
                  style={{
                    background: "#edf0f7",
                    boxShadow:
                      "0 14px 32px -4px rgba(0, 0, 0, 0.2), 0 4px 12px -2px rgba(0, 0, 0, 0.1), -3px -3px 8px rgba(255, 255, 255, 0.85)",
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpen(false)
                      onEdit?.(account)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-neutral-700 hover:text-brand-600 hover:bg-neutral-200/50 transition-colors cursor-pointer"
                  >
                    <Edit3
                      size={13}
                      strokeWidth={2.4}
                    />
                    <span>Edit Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpen(false)
                      onArchive?.(account.id, !is_archived)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-neutral-700 hover:text-amber-600 hover:bg-amber-50/60 transition-colors cursor-pointer"
                  >
                    {is_archived ? (
                      <RotateCcw size={13} strokeWidth={2.4} />
                    ) : (
                      <Archive size={13} strokeWidth={2.4} />
                    )}
                    <span>{is_archived ? "Restore Card" : "Archive Card"}</span>
                  </button>

                  <div className="my-1 border-t border-neutral-300/40" />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpen(false)
                      onDelete?.(account)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50/60 transition-colors cursor-pointer"
                  >
                    <Trash2
                      size={13}
                      strokeWidth={2.4}
                    />
                    <span>Delete Card</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── MIDFIELD: Account Number Pill (if available) or Identifier ── */}
        <div className="relative z-10 my-3">
          {formattedNumber ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-400">
                Account Number
              </span>
              <motion.button
                type="button"
                whileHover={neuButtonHover}
                whileTap={neuButtonTap}
                onClick={handleCopy}
                title="Click to copy account number"
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.insetSm,
                }}
              >
                <span className="font-mono text-xs tracking-wider font-bold text-neutral-700 group-hover:text-brand-600">
                  {formattedNumber}
                </span>
                <span className="text-neutral-400 group-hover:text-brand-600 transition-colors">
                  <MorphIcon
                    icon={copied ? Check : Copy}
                    size={12}
                    strokeWidth={2.4}
                    spring="snappy"
                    className={copied ? "text-emerald-600" : ""}
                  />
                </span>
                {copied && (
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider animate-pulse">
                    Copied
                  </span>
                )}
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 py-0.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-neutral-400">
                Asset Identifier
              </span>
              <span
                className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-neutral-500 border border-neutral-300/30"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.insetSm,
                }}
              >
                #{id ? id.slice(-6).toUpperCase() : "WALLET"}
              </span>
            </div>
          )}
        </div>

        {/* ── FOOTER: Tactile Neumorphic Motif & Balance ── */}
        <div className="relative z-10 pt-3 border-t border-neutral-300/40 flex items-end justify-between gap-3">
          {/* Neumorphic EMV Smart Chip & Contactless Waves */}
          <div className="flex items-center gap-2 pb-0.5 select-none" aria-hidden="true">
            <div
              className="relative w-9 h-6 rounded-md border border-neutral-300/40 p-0.5 flex items-center justify-center shrink-0 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(235, 238, 245, 0.95), rgba(215, 220, 230, 0.8))",
                boxShadow: NEU.insetSm,
              }}
            >
              {/* Micro circuit etchings */}
              <div className="w-full h-full rounded-[3px] border border-neutral-400/30 relative flex items-center justify-center">
                <div className="w-full h-px bg-neutral-400/30 absolute" />
                <div className="h-full w-px bg-neutral-400/30 absolute" />
                <div
                  className="w-3 h-2 rounded-xs border border-neutral-400/30"
                  style={{ background: `${color || "#863bff"}15` }}
                />
              </div>
            </div>

            {/* Tactile Contactless NFC Waves */}
            <div className="flex items-center text-neutral-400/70">
              <svg
                className="w-4 h-4 -rotate-45"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M5 12.55a11 11 0 0 1 14.08 0" opacity="0.35" />
                <path d="M8.5 15.5a6 6 0 0 1 7 0" opacity="0.65" />
                <path d="M11.5 18a2 2 0 0 1 1 0" />
              </svg>
            </div>
          </div>

          {/* Balance Display with Privacy Peek */}
          <div className="text-right shrink-0">
            <div className="flex items-center justify-end gap-1 mb-0.5">
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                {isCredit ? "Outstanding" : "Balance"}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowBalance((prev) => !prev)
                  triggerHaptic("light")
                }}
                className="p-0.5 rounded text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                title={showBalance ? "Hide balance" : "Show balance"}
              >
                <MorphIcon
                  icon={showBalance ? Eye : EyeOff}
                  size={11}
                  strokeWidth={2.4}
                  spring="snappy"
                />
              </button>
            </div>

            <p
              className={`text-base sm:text-lg font-black tracking-tight font-mono tabular-nums ${
                isCredit
                  ? "text-rose-600"
                  : numBalance >= 0
                  ? "text-neutral-800"
                  : "text-rose-600"
              }`}
            >
              {showBalance ? formatCurrency(numBalance, currency) : "••••••••"}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
