import { useState } from "react"
import { motion } from "motion/react"
import { Archive, RotateCcw } from "lucide-react"
import { NEU } from "../../lib/neu"
import { cardItemVariants } from "../../lib/animations"
import { useCanHover } from "../../hooks/useCanHover"
import { TYPE_LABELS } from "../../constants/accountConstants"
import AccountBrandIcon from "./AccountBrandIcon"
import AccountCardMenu from "./AccountCardMenu"
import AccountNumberPill from "./AccountNumberPill"
import AccountChip from "./AccountChip"
import AccountBalance from "./AccountBalance"

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
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const canHover = useCanHover()

  const {
    name,
    type = "bank",
    balance = 0,
    currency = "PHP",
    color = "#863bff",
    icon = "Wallet",
    institution,
    account_number,
    is_archived = false,
  } = account || {}

  const isCredit = type === "credit_card"


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
              <AccountBrandIcon icon={icon} size={20} strokeWidth={2.4} />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-neutral-800 leading-tight truncate tracking-tight">
                {name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {/* Sunken Neumorphic Institution Badge (only when distinct from account name) */}
                {institution && institution.toLowerCase() !== name?.toLowerCase() && (
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

          {/* Action Menu Button & Popover */}
          <AccountCardMenu
            isOpen={menuOpen}
            onOpenChange={setMenuOpen}
            account={account}
            onEdit={onEdit}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        </div>

        {/* ── MIDFIELD: Account Number Pill or Not Set ── */}
        <AccountNumberPill
          accountNumber={account_number}
          accountType={type}
        />

        {/* ── FOOTER: Tactile Neumorphic Motif & Balance ── */}
        <div className="relative z-10 pt-3 border-t border-neutral-300/40 flex items-end justify-between gap-3">
          <AccountChip color={color} />
          <AccountBalance
            balance={balance}
            currency={currency}
            isCredit={isCredit}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
