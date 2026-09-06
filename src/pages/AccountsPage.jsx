import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MorphIcon } from "morphicons/react"
import {
  Wallet,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Check,
  Building2,
  Smartphone,
  Banknote,
  CreditCard,
  PiggyBank,
  Archive,
} from "lucide"
import { useAccounts } from "../hooks/useAccounts"
import {
  AccountCard,
  AccountModal,
  AccountNetWorthSummary,
  AccountEmptyState,
} from "../components/accounts"
import { ConfirmModal } from "../components/ui"
import { NEU } from "../lib/neu"
import { neuButtonHover, neuButtonTap } from "../lib/animations"

const FILTER_TABS = [
  { id: "all", label: "All", icon: Wallet },
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "bank", label: "Banks", icon: Building2 },
  { id: "e_wallet", label: "E-Wallets", icon: Smartphone },
  { id: "credit_card", label: "Credit Cards", icon: CreditCard },
  { id: "savings", label: "Savings", icon: PiggyBank },
  { id: "archived", label: "Archived", icon: Archive },
]

/**
 * AccountsPage — Comprehensive Accounts & Wallets Management System.
 * Supports Cash, Banks, GCash, Maya, ShopeePay, Credit Cards, and Savings.
 */
export default function AccountsPage() {
  const {
    accounts,
    activeAccounts,
    archivedAccounts,
    isLoading,
    isRefreshing,
    metrics,
    addAccount,
    updateAccount,
    archiveAccount,
    deleteAccount,
    refreshAccounts,
  } = useAccounts()

  const [selectedType, setSelectedType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState(null)
  const [accountToDelete, setAccountToDelete] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Filter accounts based on active tab and search query
  const filteredAccounts = useMemo(() => {
    let list = selectedType === "archived" ? archivedAccounts : activeAccounts

    if (selectedType !== "all" && selectedType !== "archived") {
      list = list.filter((a) => a.type === selectedType)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.institution && a.institution.toLowerCase().includes(q)) ||
          (a.account_number && a.account_number.includes(q))
      )
    }

    return list
  }, [selectedType, activeAccounts, archivedAccounts, searchQuery])

  // Count items for each filter tab
  const getTabCount = (tabId) => {
    if (tabId === "all") return activeAccounts.length
    if (tabId === "archived") return archivedAccounts.length
    return activeAccounts.filter((a) => a.type === tabId).length
  }

  // Handle Create or Update
  const handleSaveAccount = async (formData) => {
    setIsSaving(true)
    try {
      if (accountToEdit) {
        await updateAccount(accountToEdit.id, formData)
      } else {
        await addAccount(formData)
      }
      setIsModalOpen(false)
      setAccountToEdit(null)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  // Open modal for edit
  const handleOpenEdit = (acc) => {
    setAccountToEdit(acc)
    setIsModalOpen(true)
  }

  // Open modal with quick pick preset from empty state
  const handleSelectQuickPreset = (preset) => {
    setAccountToEdit({
      name: preset.name,
      type: preset.type,
      color: preset.color,
      icon: preset.icon,
      institution: preset.name,
      balance: 0,
    })
    setIsModalOpen(true)
  }

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!accountToDelete) return
    try {
      await deleteAccount(accountToDelete.id)
      setAccountToDelete(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Net Worth & Assets Overview Card ── */}
      <AccountNetWorthSummary
        metrics={metrics}
        onAddAccount={() => {
          setAccountToEdit(null)
          setIsModalOpen(true)
        }}
      />

      {/* ── Filter Tabs & Action Toolbar ── */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Filter Tabs Horizontal Scroll inside Sunken Neumorphic Track */}
          <div
            className="flex items-center gap-1.5 p-1.5 rounded-2xl overflow-x-auto scrollbar-none min-w-0"
            style={{
              background: NEU.bg,
              boxShadow: NEU.insetSm,
            }}
          >
            {FILTER_TABS.map((tab) => {
              const isSelected = selectedType === tab.id
              const count = getTabCount(tab.id)
              const TabIcon = tab.icon

              // Hide archived tab if user has no archived accounts
              if (tab.id === "archived" && count === 0) return null

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedType(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 select-none ${
                    isSelected
                      ? "text-brand-600 font-extrabold"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {/* Morphing Active Pill Background */}
                  {isSelected && (
                    <motion.div
                      layoutId="activeAccountTabPill"
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 34,
                      }}
                    >
                      <div
                        className="w-full h-full rounded-xl"
                        style={{
                          background: NEU.bg,
                          boxShadow: NEU.raisedSm,
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Content sits above the animated pill */}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <MorphIcon
                      icon={TabIcon}
                      size={13}
                      strokeWidth={isSelected ? 2.6 : 2.2}
                      spring="snappy"
                    />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                        isSelected
                          ? "bg-brand-500/15 text-brand-700"
                          : "bg-neutral-200/70 text-neutral-500"
                      }`}
                    >
                      {count}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Bar & Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Input */}
            <div
              className="flex items-center gap-2 px-3 h-9 rounded-xl flex-1 sm:w-56"
              style={{
                background: "var(--neu-bg)",
                boxShadow: "var(--neu-inset-sm)",
              }}
            >
              <MorphIcon
                icon={Search}
                size={13}
                strokeWidth={2.4}
                className="text-neutral-400 shrink-0"
              />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-neutral-800 outline-none"
              />
            </div>

            {/* Refresh Button */}
            <motion.button
              whileHover={neuButtonHover}
              whileTap={neuButtonTap}
              onClick={refreshAccounts}
              disabled={isRefreshing}
              title="Refresh accounts"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:text-brand-600 transition-colors cursor-pointer shrink-0"
              style={{
                background: NEU.bg,
                boxShadow: isRefreshing ? NEU.insetSm : NEU.raisedSm,
              }}
            >
              <MorphIcon
                icon={RefreshCw}
                size={15}
                strokeWidth={2.4}
                className={isRefreshing ? "animate-spin text-brand-600" : "text-neutral-500"}
              />
            </motion.button>

            {/* Add Account Button */}
            <motion.button
              whileHover={neuButtonHover}
              whileTap={neuButtonTap}
              onClick={() => {
                setAccountToEdit(null)
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs cursor-pointer transition-all shrink-0"
            >
              <MorphIcon icon={Plus} size={15} strokeWidth={2.6} />
              <span>Add Account</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Accounts Cards Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-36 rounded-2xl animate-pulse"
              style={{
                background: NEU.bg,
                boxShadow: NEU.insetSm,
              }}
            />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <AccountEmptyState
          onAddAccount={() => {
            setAccountToEdit(null)
            setIsModalOpen(true)
          }}
          onSelectQuickPreset={handleSelectQuickPreset}
        />
      ) : (
        <AnimatePresence mode="popLayout">
          {filteredAccounts.length === 0 ? (
            <motion.div
              key="empty-filter"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15 }}
              className="p-10 rounded-2xl text-center select-none"
              style={{
                background: NEU.bg,
                boxShadow: NEU.insetSm,
              }}
            >
              <p className="text-xs font-bold text-neutral-500">
                No accounts found matching your filter or search.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="accounts-grid"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredAccounts.map((account, index) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onEdit={handleOpenEdit}
                    onArchive={archiveAccount}
                    onDelete={setAccountToDelete}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── Add / Edit Account Modal ── */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setAccountToEdit(null)
        }}
        onSave={handleSaveAccount}
        accountToEdit={accountToEdit}
        isSaving={isSaving}
      />

      {/* ── Delete Confirmation Dialog ── */}
      <ConfirmModal
        isOpen={Boolean(accountToDelete)}
        title="Delete Account?"
        description={`Are you sure you want to delete "${accountToDelete?.name}"? All associated account history may be lost.`}
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setAccountToDelete(null)}
      />
    </div>
  )
}
