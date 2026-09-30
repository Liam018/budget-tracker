import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Wallet,
  Plus,
  RefreshCw,
  Search,
  Building2,
  Smartphone,
  Banknote,
  CreditCard,
  PiggyBank,
  Archive,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAccounts } from "../hooks/useAccounts"
import {
  AccountCard,
  AccountModal,
  AccountNetWorthSummary,
  AccountEmptyState,
  triggerHaptic,
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

  const activeTabRef = useRef(null)
  const tabsContainerRef = useRef(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Measure whether categories are scrollable left or right
  const checkScrollBounds = useCallback(() => {
    const el = tabsContainerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const maxScroll = scrollWidth - clientWidth
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(maxScroll > 4 && scrollLeft < maxScroll - 4)
  }, [])

  // Monitor scroll events and container resize for responsive scroll indication
  useEffect(() => {
    const el = tabsContainerRef.current
    if (!el) return

    const rafId = requestAnimationFrame(checkScrollBounds)
    el.addEventListener("scroll", checkScrollBounds, { passive: true })

    const resizeObserver = new ResizeObserver(() => {
      checkScrollBounds()
    })
    resizeObserver.observe(el)

    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener("scroll", checkScrollBounds)
      resizeObserver.disconnect()
    }
  }, [checkScrollBounds, archivedAccounts.length])

  // Re-check scroll bounds after tab change or programmatic scroll
  useEffect(() => {
    const timer = setTimeout(checkScrollBounds, 350)
    return () => clearTimeout(timer)
  }, [selectedType, checkScrollBounds])

  const handleScrollCategories = (direction) => {
    if (!tabsContainerRef.current) return
    const scrollAmount = direction === "left" ? -180 : 180
    tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    triggerHaptic("light")
  }

  // Auto-fallback to "all" if active tab is "archived" but there are no archived accounts left
  useEffect(() => {
    if (selectedType === "archived" && archivedAccounts.length === 0) {
      const timer = setTimeout(() => setSelectedType("all"), 0)
      return () => clearTimeout(timer)
    }
  }, [selectedType, archivedAccounts.length])

  // Smoothly center active filter tab into view only when the container is overflowing and the tab is out of view
  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      const container = tabsContainerRef.current
      const tab = activeTabRef.current
      if (container.scrollWidth > container.clientWidth) {
        const containerLeft = container.scrollLeft
        const containerRight = containerLeft + container.clientWidth
        const tabLeft = tab.offsetLeft
        const tabRight = tabLeft + tab.offsetWidth

        if (tabLeft < containerLeft || tabRight > containerRight) {
          tab.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          })
        }
      }
    }
  }, [selectedType])

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
        {/* Tier 1: Full-Width Categories Track */}
        <div className="relative w-full">
          {/* Left Scroll Indicator & Gradient Fade */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 inset-y-0 z-20 flex items-center pl-1 sm:pl-1.5 pointer-events-none"
              >
                {/* Gradient mask */}
                <div
                  className="absolute inset-y-0.5 left-0 w-12 sm:w-16 rounded-l-2xl pointer-events-none"
                  style={{
                    background: `linear-gradient(to right, ${NEU.bg} 40%, rgba(237, 240, 247, 0) 100%)`,
                  }}
                />
                {/* Scroll button */}
                <motion.button
                  type="button"
                  onClick={() => handleScrollCategories("left")}
                  className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-neutral-600 hover:text-neutral-900 active:text-brand-600 transition-colors pointer-events-auto cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
                  style={{
                    background: NEU.bg,
                    boxShadow: NEU.raisedSm,
                  }}
                  whileHover={neuButtonHover}
                  whileTap={neuButtonTap}
                  aria-label="Scroll categories left"
                >
                  <ChevronLeft size={14} strokeWidth={2.6} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Scroll Indicator & Gradient Fade */}
          <AnimatePresence>
            {canScrollRight && (
              <motion.div
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 inset-y-0 z-20 flex items-center justify-end pr-1 sm:pr-1.5 pointer-events-none"
              >
                {/* Gradient mask */}
                <div
                  className="absolute inset-y-0.5 right-0 w-12 sm:w-16 rounded-r-2xl pointer-events-none"
                  style={{
                    background: `linear-gradient(to left, ${NEU.bg} 40%, rgba(237, 240, 247, 0) 100%)`,
                  }}
                />
                {/* Scroll button */}
                <motion.button
                  type="button"
                  onClick={() => handleScrollCategories("right")}
                  className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-neutral-600 hover:text-neutral-900 active:text-brand-600 transition-colors pointer-events-auto cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
                  style={{
                    background: NEU.bg,
                    boxShadow: NEU.raisedSm,
                  }}
                  whileHover={neuButtonHover}
                  whileTap={neuButtonTap}
                  aria-label="Scroll categories right"
                >
                  <motion.span
                    animate={{ x: [0, 2, 0] }}
                    transition={{
                      repeat: Infinity,
                      repeatDelay: 2.5,
                      duration: 1.2,
                      ease: "easeInOut",
                    }}
                    className="flex items-center justify-center"
                  >
                    <ChevronRight size={14} strokeWidth={2.6} />
                  </motion.span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            ref={tabsContainerRef}
            className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl overflow-x-auto scrollbar-none scroll-smooth touch-pan-x"
            style={{
              background: NEU.bg,
              boxShadow: NEU.insetSm,
              WebkitOverflowScrolling: "touch",
            }}
          >
            {FILTER_TABS.map((tab) => {
              const isSelected = selectedType === tab.id
              const count = getTabCount(tab.id)
              const TabIcon = tab.icon
              const isArchived = tab.id === "archived"

              // Hide archived tab if user has no archived accounts
              if (isArchived && count === 0) return null

              return (
                <button
                  key={tab.id}
                  ref={isSelected ? activeTabRef : null}
                  type="button"
                  onClick={() => {
                    setSelectedType(tab.id)
                    triggerHaptic("light")
                  }}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 select-none ${
                    isSelected
                      ? isArchived
                        ? "text-amber-700 font-extrabold"
                        : "text-brand-600 font-extrabold"
                      : "text-neutral-500 hover:text-neutral-800 active:text-neutral-900"
                  }`}
                >
                  {/* Morphing Active Pill Background */}
                  {isSelected && (
                    <motion.div
                      layoutId="activeAccountTabPill"
                      className="absolute inset-0 rounded-xl pointer-events-none transform-gpu"
                      transition={{
                        type: "spring",
                        stiffness: 460,
                        damping: 34,
                      }}
                      style={{ willChange: "transform" }}
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
                  <span className="relative z-10 flex items-center gap-2">
                    <TabIcon
                      size={14}
                      strokeWidth={isSelected ? 2.6 : 2.2}
                      className={isSelected && isArchived ? "text-amber-600" : undefined}
                    />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                        isSelected
                          ? isArchived
                            ? "bg-amber-500/15 text-amber-700"
                            : "bg-brand-500/15 text-brand-700"
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
        </div>

        {/* Tier 2: Search Input & Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div
              className="flex items-center gap-2.5 px-3.5 h-10 rounded-xl w-full transition-shadow focus-within:ring-2 focus-within:ring-brand-500/20"
              style={{
                background: NEU.bg,
                boxShadow: NEU.insetSm,
              }}
            >
              <Search
                size={14}
                strokeWidth={2.4}
                className="text-neutral-400 shrink-0"
              />
              <input
                type="text"
                placeholder={
                  selectedType === "archived"
                    ? "Search archived accounts..."
                    : "Search accounts by name or institution..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-neutral-800 outline-none placeholder:text-neutral-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer rounded-md transition-colors"
                  title="Clear search"
                >
                  <X size={14} strokeWidth={2.4} />
                </button>
              )}
            </div>
          </div>

          {/* Action Controls & Match Counter */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
            <span className="text-xs font-bold text-neutral-500 hidden sm:inline-block">
              {filteredAccounts.length}{" "}
              {filteredAccounts.length === 1 ? "account" : "accounts"}
            </span>

            {/* Refresh Button */}
            <motion.button
              whileHover={neuButtonHover}
              whileTap={neuButtonTap}
              onClick={refreshAccounts}
              disabled={isRefreshing}
              title="Refresh accounts"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-500 hover:text-brand-600 transition-colors cursor-pointer shrink-0"
              style={{
                background: NEU.bg,
                boxShadow: isRefreshing ? NEU.insetSm : NEU.raisedSm,
              }}
            >
              <RefreshCw
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
              className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm cursor-pointer transition-all shrink-0"
            >
              <Plus size={16} strokeWidth={2.6} />
              <span>Add Account</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Accounts Cards Responsive Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-48 rounded-2xl animate-pulse"
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
        <div>
          {filteredAccounts.length === 0 ? (
            <div
              className="p-10 rounded-2xl text-center select-none"
              style={{
                background: NEU.bg,
                boxShadow: NEU.insetSm,
              }}
            >
              <p className="text-xs font-bold text-neutral-500">
                No accounts found matching your filter or search.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
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
            </div>
          )}
        </div>
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
