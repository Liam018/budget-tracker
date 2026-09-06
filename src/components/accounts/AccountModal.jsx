import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useDragControls } from "motion/react"
import { MorphIcon } from "morphicons/react"
import {
  X,
  Plus,
  Check,
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
  Sparkles,
} from "lucide"
import { useScrollLock } from "../../hooks/useScrollLock"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"
import {
  PHILIPPINE_INSTITUTION_PRESETS,
  PRESET_COLORS,
  AVAILABLE_ICONS,
} from "../../services/accountService"

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

const ACCOUNT_TYPE_OPTIONS = [
  { id: "cash", label: "Cash" },
  { id: "bank", label: "Bank" },
  { id: "e_wallet", label: "E-Wallet" },
  { id: "credit_card", label: "Credit Card" },
  { id: "savings", label: "Savings / Jar" },
]

/**
 * AccountModal — Adaptive modal (Bottom Sheet on mobile, Dialog on desktop)
 * for creating and updating accounts with Philippine institution presets.
 */
export default function AccountModal({
  isOpen,
  onClose,
  onSave,
  accountToEdit = null,
  isSaving = false,
}) {
  const isEditing = Boolean(accountToEdit)

  // Form State
  const [name, setName] = useState("")
  const [type, setType] = useState("cash")
  const [balance, setBalance] = useState("")
  const [color, setColor] = useState("#10b981")
  const [icon, setIcon] = useState("Banknote")
  const [institution, setInstitution] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [activeTab, setActiveTab] = useState("presets") // "presets" | "custom"

  const dragControls = useDragControls()
  useScrollLock(isOpen)

  // Responsive state
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  )

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 640)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Sync state when opening or when accountToEdit changes
  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name || "")
      setType(accountToEdit.type || "cash")
      setBalance(accountToEdit.balance !== undefined ? String(accountToEdit.balance) : "")
      setColor(accountToEdit.color || "#10b981")
      setIcon(accountToEdit.icon || "Wallet")
      setInstitution(accountToEdit.institution || "")
      setAccountNumber(accountToEdit.account_number || "")
      setActiveTab("custom")
    } else {
      // Default to Cash preset
      setName("")
      setType("cash")
      setBalance("")
      setColor("#10b981")
      setIcon("Banknote")
      setInstitution("")
      setAccountNumber("")
      setActiveTab("presets")
    }
  }, [accountToEdit, isOpen])

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Handle Preset selection
  const handleSelectPreset = (preset) => {
    setName(preset.name)
    setType(preset.type)
    setColor(preset.color)
    setIcon(preset.icon)
    setInstitution(preset.name)
  }

  // Handle Submit
  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      type,
      balance: balance === "" ? 0 : parseFloat(balance),
      currency: "PHP",
      color,
      icon,
      institution: institution || null,
      account_number: accountNumber.trim() || null,
    })
  }

  function handleDragEnd(event, info) {
    if (info.offset.y > 60 || info.velocity.y > 200) {
      onClose()
    }
  }

  const motionProps = isMobile
    ? {
        drag: "y",
        dragControls: dragControls,
        dragListener: false,
        dragDirectionLock: true,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0.02, bottom: 0.65 },
        dragSnapToOrigin: true,
        onDragEnd: handleDragEnd,
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
        transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 },
      }
    : {
        drag: false,
        initial: { scale: 0.94, y: 12 },
        animate: { scale: 1, y: 0 },
        exit: { scale: 0.94, y: 8 },
        transition: { type: "spring", stiffness: 420, damping: 28 },
      }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex pointer-events-none ${
            isMobile ? "flex-col justify-end" : "items-center justify-center p-4"
          }`}
        >
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-md pointer-events-auto"
            aria-hidden="true"
          />

          {/* Adaptive Modal Card */}
          <motion.div
            {...motionProps}
            className={`relative pointer-events-auto z-10 flex flex-col overflow-hidden select-none ${
              isMobile
                ? "w-full max-w-lg mx-auto rounded-t-3xl max-h-[90dvh]"
                : "w-full max-w-lg rounded-3xl max-h-[85vh] p-1"
            }`}
            style={{
              background: "var(--neu-bg)",
              boxShadow: isMobile
                ? "0 -10px 25px -5px rgba(0, 0, 0, 0.12)"
                : "var(--neu-raised)",
            }}
          >
            {/* Mobile Pull Handle */}
            {isMobile && (
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="pt-3 pb-2 shrink-0 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
                aria-label="Drag down to close"
              >
                <div
                  className="w-12 h-1.5 rounded-full"
                  style={{
                    background: "var(--neu-bg)",
                    boxShadow: "var(--neu-inset-sm)",
                  }}
                />
              </div>
            )}

            {/* Header */}
            <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b border-neutral-200/50">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ background: color }}
                >
                  <MorphIcon
                    icon={ICON_MAP[icon] || Wallet}
                    size={17}
                    strokeWidth={2.4}
                  />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-800 tracking-tight leading-tight">
                    {isEditing ? "Edit Account" : "Add New Account"}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {isEditing
                      ? "Update balance or account details"
                      : "Choose a Philippine preset or customize"}
                  </p>
                </div>
              </div>

              {!isMobile && (
                <motion.button
                  whileHover={neuButtonHover}
                  whileTap={neuButtonTap}
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                  style={{
                    background: NEU.bg,
                    boxShadow: NEU.raisedSm,
                  }}
                  aria-label="Close"
                >
                  <MorphIcon icon={X} size={15} strokeWidth={2.4} />
                </motion.button>
              )}
            </div>

            {/* Scrollable Form Body */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-none"
            >
              {/* Presets vs Custom Segmented Switcher (Only when adding new) */}
              {!isEditing && (
                <div
                  className="p-1 rounded-2xl flex items-center gap-1 mb-2"
                  style={{
                    background: NEU.bg,
                    boxShadow: NEU.insetSm,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab("presets")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "presets"
                        ? "text-brand-600 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                    style={
                      activeTab === "presets"
                        ? { background: NEU.bg, boxShadow: NEU.raisedSm }
                        : {}
                    }
                  >
                    <MorphIcon icon={Sparkles} size={13} strokeWidth={2.4} />
                    <span>Philippine Presets</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("custom")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "custom"
                        ? "text-brand-600 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                    style={
                      activeTab === "custom"
                        ? { background: NEU.bg, boxShadow: NEU.raisedSm }
                        : {}
                    }
                  >
                    <MorphIcon icon={Plus} size={13} strokeWidth={2.4} />
                    <span>Custom Details</span>
                  </button>
                </div>
              )}

              {/* Philippine Presets Selection Grid */}
              {!isEditing && activeTab === "presets" && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Quick Pick (Popular in the Philippines)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                    {PHILIPPINE_INSTITUTION_PRESETS.map((preset) => {
                      const isSelected = name === preset.name
                      const PresetIcon = ICON_MAP[preset.icon] || Wallet
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? "text-neutral-800 font-extrabold"
                              : "text-neutral-600 hover:text-neutral-900"
                          }`}
                          style={{
                            background: NEU.bg,
                            boxShadow: isSelected ? NEU.insetSm : NEU.raisedSm,
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs text-xs"
                            style={{ background: preset.color }}
                          >
                            <MorphIcon icon={PresetIcon} size={14} strokeWidth={2.4} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate leading-tight">
                              {preset.name}
                            </p>
                            <span className="text-[9px] text-neutral-400 block truncate">
                              {preset.badge}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Name & Type */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Account Name *
                  </label>
                  <div
                    className="flex items-center px-3.5 h-12 rounded-xl"
                    style={{
                      background: "var(--neu-bg)",
                      boxShadow: "var(--neu-inset-sm)",
                    }}
                  >
                    <input
                      type="text"
                      required
                      placeholder="e.g. GCash, BDO Savings, Cash"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-neutral-800 outline-none"
                    />
                  </div>
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Account Type
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ACCOUNT_TYPE_OPTIONS.map((opt) => {
                      const isSelected = type === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setType(opt.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "text-brand-600"
                              : "text-neutral-500 hover:text-neutral-800"
                          }`}
                          style={{
                            background: NEU.bg,
                            boxShadow: isSelected ? NEU.insetSm : NEU.raisedSm,
                          }}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Current Balance */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    {isEditing ? "Current Balance" : "Starting Balance"} (₱ PHP)
                  </label>
                  <div
                    className="flex items-center px-3.5 h-12 rounded-xl gap-2"
                    style={{
                      background: "var(--neu-bg)",
                      boxShadow: "var(--neu-inset-sm)",
                    }}
                  >
                    <span className="text-sm font-extrabold text-neutral-400">₱</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      className="w-full bg-transparent text-sm font-extrabold text-neutral-800 outline-none"
                    />
                  </div>
                  {type === "credit_card" && (
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Tip: For credit cards, enter the amount you currently owe.
                    </p>
                  )}
                </div>

                {/* Account Number (Optional) */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Account / Card Number <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <div
                    className="flex items-center px-3.5 h-12 rounded-xl"
                    style={{
                      background: "var(--neu-bg)",
                      boxShadow: "var(--neu-inset-sm)",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="e.g. Last 4 digits or ref number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-neutral-800 outline-none"
                    />
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_COLORS.map((c) => {
                      const isSelected = color === c
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs"
                          style={{ background: c }}
                          aria-label={`Color ${c}`}
                        >
                          {isSelected && (
                            <MorphIcon
                              icon={Check}
                              size={14}
                              strokeWidth={3}
                              className="text-white"
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Icon Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Icon
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {AVAILABLE_ICONS.map((ic) => {
                      const isSelected = icon === ic
                      const IcComponent = ICON_MAP[ic] || Wallet
                      return (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => setIcon(ic)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? "text-brand-600"
                              : "text-neutral-400 hover:text-neutral-700"
                          }`}
                          style={{
                            background: NEU.bg,
                            boxShadow: isSelected ? NEU.insetSm : NEU.raisedSm,
                          }}
                          aria-label={ic}
                        >
                          <MorphIcon icon={IcComponent} size={16} strokeWidth={2.4} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-neutral-200/50 flex items-center justify-end gap-2.5 pb-2">
                <motion.button
                  type="button"
                  whileHover={neuButtonHover}
                  whileTap={neuButtonTap}
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                  style={{
                    background: NEU.bg,
                    boxShadow: NEU.raisedSm,
                  }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  whileHover={isSaving || !name.trim() ? {} : neuButtonHover}
                  whileTap={isSaving || !name.trim() ? {} : neuButtonTap}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
                    isSaving || !name.trim()
                      ? "opacity-50 cursor-not-allowed bg-brand-400"
                      : "bg-brand-600 hover:bg-brand-700 cursor-pointer"
                  }`}
                >
                  {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Account"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
