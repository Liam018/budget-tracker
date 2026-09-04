import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { TrendingUp, ArrowRight } from "lucide"
import { useAuth } from "../hooks/useAuth"
import { useConfirm } from "../hooks/useConfirm"
import { toast } from "../components/ui"
import { SUPPORTED_CURRENCIES } from "../services/currencyService"
import {
  ProfileCard,
  CurrencyPickerSheet,
  SessionCard,
} from "../components/profile"
import { NEU } from "../lib/neu"
import { neuButtonHover, neuButtonTap } from "../lib/animations"

/**
 * ProfilePage — User profile, account preferences,
 * default currency management, and session controls.
 */
export default function ProfilePage() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const confirm = useConfirm()
  const navigate = useNavigate()

  const currentCurrencyCode = profile?.currency || "PHP"
  const currentCurrencyObj =
    SUPPORTED_CURRENCIES.find((c) => c.code === currentCurrencyCode) ||
    SUPPORTED_CURRENCIES[0]

  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false)
  const [isUpdatingCurrency, setIsUpdatingCurrency] = useState(false)

  async function handleSelectCurrency(currencyCode) {
    if (currencyCode === currentCurrencyCode) {
      setIsCurrencyModalOpen(false)
      return
    }

    setIsUpdatingCurrency(true)
    try {
      await updateProfile({ currency: currencyCode })
      setIsCurrencyModalOpen(false)
      toast.success(`Default currency changed to ${currencyCode}`)
    } catch {
      toast.error("Failed to update currency preference")
    } finally {
      setIsUpdatingCurrency(false)
    }
  }

  async function handleSignOut() {
    const ok = await confirm({
      title: "Sign Out?",
      description: "Are you sure you want to sign out of your account?",
      confirmText: "Sign Out",
      cancelText: "Stay",
      variant: "warning",
    })

    if (!ok) return

    try {
      await signOut()
      toast.success("Signed out successfully")
      navigate("/welcome", { replace: true })
    } catch {
      // ignore
    }
  }

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-2 sm:pb-4">
      {/* ── User Profile & Current Currency Card ── */}
      <ProfileCard
        displayName={displayName}
        email={user?.email}
        initials={initials}
        currentCurrency={currentCurrencyObj}
        onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
      />

      {/* ── Financial Tools Card (Quick Access to Live Rates) ── */}
      <div
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          background: "var(--neu-bg)",
          boxShadow: "var(--neu-raised-sm)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-brand-600 shrink-0"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-inset-sm)",
            }}
          >
            <MorphIcon icon={TrendingUp} size={18} strokeWidth={2.4} className="text-brand-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-neutral-800 tracking-tight">
              Currency Converter & Live Rates
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5 truncate sm:whitespace-normal">
              Real-time cross-currency conversions and 160+ world market rates
            </p>
          </div>
        </div>

        <motion.button
          whileHover={neuButtonHover}
          whileTap={neuButtonTap}
          onClick={() => navigate("/converter")}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-brand-600 hover:text-brand-700 transition-all cursor-pointer shrink-0 select-none w-full sm:w-auto"
          style={{
            background: NEU.bg,
            boxShadow: NEU.raisedSm,
          }}
        >
          <span>Open Tool</span>
          <MorphIcon icon={ArrowRight} size={14} strokeWidth={2.4} />
        </motion.button>
      </div>

      {/* ── Session Management (Sign Out) Card ── */}
      <SessionCard onSignOut={handleSignOut} />

      {/* ── Bottom Sheet Currency Picker ── */}
      <CurrencyPickerSheet
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        currentCurrencyCode={currentCurrencyCode}
        onSelectCurrency={handleSelectCurrency}
        isUpdating={isUpdatingCurrency}
      />
    </div>
  )
}
