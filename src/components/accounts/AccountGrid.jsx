import { AnimatePresence } from "motion/react"
import { NEU } from "../../lib/neu"
import AccountCard from "./AccountCard"
import AccountEmptyState from "./AccountEmptyState"

/**
 * AccountGrid — Responsive grid displaying loading skeletons, empty state,
 * search empty state, or animated cards for the filtered accounts.
 */
export default function AccountGrid({
  isLoading,
  totalAccountsCount = 0,
  filteredAccounts = [],
  onEdit,
  onArchive,
  onDelete,
  onAddAccount,
  onSelectQuickPreset,
}) {
  if (isLoading) {
    return (
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
    )
  }

  if (totalAccountsCount === 0) {
    return (
      <AccountEmptyState
        onAddAccount={onAddAccount}
        onSelectQuickPreset={onSelectQuickPreset}
      />
    )
  }

  if (filteredAccounts.length === 0) {
    return (
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
    )
  }

  return (
    <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      <AnimatePresence mode="popLayout" initial={false}>
        {filteredAccounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={onEdit}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
