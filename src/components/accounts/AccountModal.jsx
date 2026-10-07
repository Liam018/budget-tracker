import { useState, useEffect, startTransition } from "react"
import { motion, AnimatePresence, useDragControls } from "motion/react"
import { useScrollLock } from "../../hooks/useScrollLock"
import { useIsMobile } from "../../hooks/useIsMobile"
import { NEU } from "../../lib/neu"
import {
  neuButtonHover,
  neuButtonTap,
  modalVariants,
  mobileSheetVariants,
  backdropVariants,
} from "../../lib/animations"
import AccountModalHeader from "./AccountModalHeader"
import AccountModalTabs from "./AccountModalTabs"
import AccountPresetGrid from "./AccountPresetGrid"
import AccountTypeSelector from "./AccountTypeSelector"
import AccountAppearancePicker from "./AccountAppearancePicker"

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
  const isMobile = useIsMobile(640)
  const dragControls = useDragControls()
  useScrollLock(isOpen)

  // Form State
  const [name, setName] = useState("")
  const [type, setType] = useState("bank")
  const [balance, setBalance] = useState("")
  const [color, setColor] = useState("#007dfe")
  const [icon, setIcon] = useState("Building2")
  const [institution, setInstitution] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [activeTab, setActiveTab] = useState("presets") // "presets" | "custom"
  const [showAppearanceOptions, setShowAppearanceOptions] = useState(false)

  // Accounts without account/card numbers (Cash, Piggy Bank, Savings Jars)
  const supportsAccountNumber = type !== "cash" && type !== "savings"

  // Sync state when opening or when accountToEdit changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (accountToEdit) {
        setName(accountToEdit.name || "")
        setType(accountToEdit.type || "bank")
        setBalance(
          accountToEdit.balance !== undefined ? String(accountToEdit.balance) : ""
        )
        setColor(accountToEdit.color || "#007dfe")
        setIcon(accountToEdit.icon || "Building2")
        setInstitution(accountToEdit.institution || "")
        setAccountNumber(accountToEdit.account_number || "")
        setActiveTab("custom")
        setShowAppearanceOptions(true)
      } else {
        setName("")
        setType("bank")
        setBalance("")
        setColor("#007dfe")
        setIcon("Building2")
        setInstitution("")
        setAccountNumber("")
        setActiveTab("presets")
        setShowAppearanceOptions(false)
      }
    }, 0)
    return () => clearTimeout(timer)
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
    // Clear account number if selected preset doesn't use one (e.g. Cash on Hand, Piggy Bank)
    if (preset.type === "cash" || preset.type === "savings") {
      setAccountNumber("")
    }
  }

  // Handle manual Type change in Custom mode
  const handleTypeChange = (newType) => {
    setType(newType)
    if (newType === "cash" || newType === "savings") {
      setAccountNumber("")
    }
  }

  // Handle Submit
  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!name.trim()) return

    const parsedBalance = balance === "" ? 0 : parseFloat(balance)
    const finalBalance = isNaN(parsedBalance) || parsedBalance < 0 ? 0 : parsedBalance

    onSave({
      name: name.trim(),
      type,
      balance: finalBalance,
      currency: "PHP",
      color,
      icon,
      institution: institution || null,
      account_number:
        supportsAccountNumber && accountNumber.trim() ? accountNumber.trim() : null,
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
        variants: mobileSheetVariants,
        initial: "hidden",
        animate: "visible",
        exit: "exit",
      }
    : {
        drag: false,
        variants: modalVariants,
        initial: "hidden",
        animate: "visible",
        exit: "exit",
      }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex pointer-events-none overflow-hidden ${
            isMobile ? "flex-col justify-end" : "items-center justify-center p-4"
          }`}
        >
          {/* Frosted Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-md pointer-events-auto"
            aria-hidden="true"
          />

          {/* Adaptive Modal Card */}
          <motion.div
            {...motionProps}
            className={`relative pointer-events-auto z-10 flex flex-col overflow-hidden select-none ${
              isMobile
                ? "w-full max-w-lg mx-auto rounded-t-3xl max-h-[92dvh] h-auto"
                : "w-full max-w-lg rounded-3xl max-h-[88vh] h-auto"
            }`}
            style={{
              background: NEU.bg,
              boxShadow: isMobile
                ? "0 -10px 25px -5px rgba(0, 0, 0, 0.12)"
                : NEU.raised,
            }}
          >
            {/* Mobile Pull Handle */}
            {isMobile && (
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="pt-3 pb-1.5 shrink-0 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
                aria-label="Drag down to close"
              >
                <div
                  className="w-12 h-1.5 rounded-full"
                  style={{
                    background: NEU.bg,
                    boxShadow: NEU.insetSm,
                  }}
                />
              </div>
            )}

            {/* Pinned Header */}
            <AccountModalHeader
              color={color}
              icon={icon}
              isEditing={isEditing}
              activeTab={activeTab}
              onClose={onClose}
            />

            {/* Form Container with Flex Column so Body scrolls and Footer stays Pinned */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-none">
                {/* Presets vs Custom Segmented Switcher (Only when adding new) */}
                {!isEditing && (
                  <AccountModalTabs
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                      startTransition(() => {
                        setActiveTab(tab)
                        if (tab === "custom") {
                          setShowAppearanceOptions(true)
                        }
                      })
                    }}
                  />
                )}

                {/* Philippine Presets Selection Grid */}
                {!isEditing && activeTab === "presets" && (
                  <AccountPresetGrid
                    institution={institution}
                    name={name}
                    onSelectPreset={handleSelectPreset}
                  />
                )}

                {/* Account Name */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Account Name *
                  </label>
                  <div
                    className="flex items-center px-3.5 h-11 rounded-xl"
                    style={{
                      background: NEU.bg,
                      boxShadow: NEU.insetSm,
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

                {/* Account Type (Always in Custom/Edit mode) */}
                {(isEditing || activeTab === "custom") && (
                  <AccountTypeSelector
                    type={type}
                    onChangeType={handleTypeChange}
                  />
                )}

                {/* Current Balance */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                    {isEditing ? "Current Balance" : "Starting Balance"} (₱ PHP)
                  </label>
                  <div
                    className="flex items-center px-3.5 h-11 rounded-xl gap-2"
                    style={{
                      background: NEU.bg,
                      boxShadow: NEU.insetSm,
                    }}
                  >
                    <span className="text-sm font-extrabold text-neutral-400">₱</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.00"
                      value={balance}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === "") {
                          setBalance("")
                          return
                        }
                        if (val.includes("-") || parseFloat(val) < 0) return
                        setBalance(val)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e" || e.key === "E") {
                          e.preventDefault()
                        }
                      }}
                      className="w-full bg-transparent text-sm font-extrabold text-neutral-800 outline-none"
                    />
                  </div>
                  {type === "credit_card" && (
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Tip: For credit cards, enter the amount you currently owe.
                    </p>
                  )}
                </div>

                {/* Account Number (Optional) — Hidden for Cash & Savings accounts */}
                <AnimatePresence initial={false}>
                  {supportsAccountNumber && (
                    <motion.div
                      key="account-number-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-0.5 pb-0.5">
                        <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                          {type === "credit_card"
                            ? "Card Number"
                            : type === "e_wallet"
                            ? "Mobile / Account Number"
                            : "Account / Card Number"}{" "}
                          <span className="text-neutral-400 font-normal">(Optional)</span>
                        </label>
                        <div
                          className="flex items-center px-3.5 h-11 rounded-xl"
                          style={{
                            background: NEU.bg,
                            boxShadow: NEU.insetSm,
                          }}
                        >
                          <input
                            type="text"
                            placeholder={
                              type === "credit_card"
                                ? "e.g. Last 4 digits or card ref"
                                : type === "e_wallet"
                                ? "e.g. 0917 ••• ••••"
                                : "e.g. Last 4 digits or ref number"
                            }
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full bg-transparent text-sm font-medium text-neutral-800 outline-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Appearance: Color & Icon (Always in Custom/Edit, expandable in Presets) */}
                <AccountAppearancePicker
                  color={color}
                  icon={icon}
                  onChangeColor={setColor}
                  onChangeIcon={setIcon}
                  isExpanded={
                    isEditing || activeTab === "custom" || showAppearanceOptions
                  }
                  onExpand={() => setShowAppearanceOptions(true)}
                />
              </div>

              {/* Pinned Action Footer */}
              <div
                className="shrink-0 px-5 py-3.5 border-t border-neutral-200/60 flex items-center justify-end gap-3"
                style={{ background: NEU.bg }}
              >
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
