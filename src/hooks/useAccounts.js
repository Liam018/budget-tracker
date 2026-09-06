import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "./useAuth"
import { supabase } from "../lib/supabase"
import {
  getAccounts,
  createAccount,
  updateAccount,
  toggleArchiveAccount,
  deleteAccount,
} from "../services/accountService"
import { toast } from "../components/ui"

/**
 * useAccounts — Complete account management hook.
 * Handles fetching, optimistic updates, net worth & liability calculations,
 * and Supabase realtime synchronization.
 */
export function useAccounts() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Fetch accounts from Supabase
  const loadAccounts = useCallback(async (showRefreshing = false) => {
    if (!user?.id) return
    if (showRefreshing) setIsRefreshing(true)
    else setIsLoading(true)
    setError(null)

    try {
      const data = await getAccounts(user.id)
      setAccounts(data)
    } catch (err) {
      console.error("Failed to load accounts:", err)
      setError(err.message || "Failed to load accounts")
      toast.error("Failed to load accounts")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [user?.id])

  // Initial load
  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  // Setup Supabase Realtime channel for live multi-device syncing
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`user-accounts-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "accounts",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setAccounts((prev) => {
              if (prev.some((a) => a.id === payload.new.id)) return prev
              return [...prev, payload.new]
            })
          } else if (payload.eventType === "UPDATE") {
            setAccounts((prev) =>
              prev.map((a) => (a.id === payload.new.id ? payload.new : a))
            )
          } else if (payload.eventType === "DELETE") {
            setAccounts((prev) => prev.filter((a) => a.id === payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  // Add Account
  const handleAddAccount = useCallback(
    async (accountData) => {
      if (!user?.id) return false
      try {
        const newAcc = await createAccount({ ...accountData, user_id: user.id })
        setAccounts((prev) => {
          if (prev.some((a) => a.id === newAcc.id)) return prev
          return [...prev, newAcc]
        })
        toast.success(`Added ${newAcc.name}`)
        return newAcc
      } catch (err) {
        console.error("Error creating account:", err)
        toast.error(err.message || "Failed to create account")
        throw err
      }
    },
    [user?.id]
  )

  // Update Account
  const handleUpdateAccount = useCallback(
    async (id, updates) => {
      try {
        const updated = await updateAccount(id, updates)
        setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)))
        toast.success("Account updated")
        return updated
      } catch (err) {
        console.error("Error updating account:", err)
        toast.error(err.message || "Failed to update account")
        throw err
      }
    },
    []
  )

  // Toggle Archive
  const handleArchiveAccount = useCallback(
    async (id, isArchived) => {
      try {
        await toggleArchiveAccount(id, isArchived)
        setAccounts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, is_archived: isArchived } : a))
        )
        toast.info(isArchived ? "Account archived" : "Account restored")
        return true
      } catch (err) {
        console.error("Error archiving account:", err)
        toast.error(err.message || "Failed to update account")
        throw err
      }
    },
    []
  )

  // Delete Account
  const handleDeleteAccount = useCallback(
    async (id) => {
      try {
        await deleteAccount(id)
        setAccounts((prev) => prev.filter((a) => a.id !== id))
        toast.success("Account deleted")
        return true
      } catch (err) {
        console.error("Error deleting account:", err)
        toast.error(err.message || "Failed to delete account")
        throw err
      }
    },
    []
  )

  // Financial Aggregations & Metrics
  const metrics = useMemo(() => {
    const active = accounts.filter((a) => !a.is_archived)

    let totalAssets = 0
    let totalLiabilities = 0

    active.forEach((acc) => {
      const bal = parseFloat(acc.balance) || 0
      if (acc.type === "credit_card") {
        // Credit card balance is typically owed/liability
        totalLiabilities += Math.abs(bal)
      } else {
        if (bal >= 0) {
          totalAssets += bal
        } else {
          totalLiabilities += Math.abs(bal)
        }
      }
    })

    const netWorth = totalAssets - totalLiabilities

    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      activeCount: active.length,
      archivedCount: accounts.length - active.length,
      totalCount: accounts.length,
    }
  }, [accounts])

  return {
    accounts,
    activeAccounts: useMemo(() => accounts.filter((a) => !a.is_archived), [accounts]),
    archivedAccounts: useMemo(() => accounts.filter((a) => a.is_archived), [accounts]),
    isLoading,
    isRefreshing,
    error,
    metrics,
    addAccount: handleAddAccount,
    updateAccount: handleUpdateAccount,
    archiveAccount: handleArchiveAccount,
    deleteAccount: handleDeleteAccount,
    refreshAccounts: () => loadAccounts(true),
  }
}
