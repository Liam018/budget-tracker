import { useState, useMemo, useEffect } from "react"
import { useAccounts } from "../hooks/useAccounts"
import {
  AccountNetWorthSummary,
  AccountFilterTabs,
  AccountToolbar,
  AccountGrid,
  AccountModal,
} from "../components/accounts"
import { ConfirmModal } from "../components/ui"

/**
 * AccountsPage — Comprehensive Accounts & Wallets Management System.
 * Supports Cash, Banks, GCash, Maya, ShopeePay, Credit Cards, and Savings.
 * Fully responsive Neumorphic multi-column layout across all screen sizes.
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

  // Auto-fallback to "all" if active tab is "archived" but there are no archived accounts left
  useEffect(() => {
    if (selectedType === "archived" && archivedAccounts.length === 0) {
      const timer = setTimeout(() => setSelectedType("all"), 0)
      return () => clearTimeout(timer)
    }
  }, [selectedType, archivedAccounts.length])

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Net Worth & Assets Overview Card ── */}
      <AccountNetWorthSummary
        metrics={metrics}
        onAddAccount={() => {
          setAccountToEdit(null)
          setIsModalOpen(true)
        }}
      />

      {/* ── Categories Navigation & Action Toolbar ── */}
      <div className="space-y-3.5">
        <AccountFilterTabs
          selectedType={selectedType}
          onSelectType={setSelectedType}
          getTabCount={getTabCount}
          archivedCount={archivedAccounts.length}
        />

        <AccountToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          count={filteredAccounts.length}
          isRefreshing={isRefreshing}
          onRefresh={refreshAccounts}
          onAddAccount={() => {
            setAccountToEdit(null)
            setIsModalOpen(true)
          }}
          selectedType={selectedType}
        />
      </div>

      {/* ── Accounts Cards Responsive Grid ── */}
      <AccountGrid
        isLoading={isLoading}
        totalAccountsCount={accounts.length}
        filteredAccounts={filteredAccounts}
        onEdit={handleOpenEdit}
        onArchive={archiveAccount}
        onDelete={setAccountToDelete}
        onAddAccount={() => {
          setAccountToEdit(null)
          setIsModalOpen(true)
        }}
        onSelectQuickPreset={handleSelectQuickPreset}
      />

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
