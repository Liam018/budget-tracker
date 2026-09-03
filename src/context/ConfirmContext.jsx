import { createContext, useContext, useState, useRef, useCallback } from "react"
import ConfirmModal from "../components/ui/ConfirmModal"

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "danger",
  })

  const resolverRef = useRef(null)

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      setModalState({
        isOpen: true,
        title: options.title || "Are you sure?",
        description: options.description || "This action cannot be undone.",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "danger",
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }))
    if (resolverRef.current) {
      resolverRef.current(true)
      resolverRef.current = null
    }
  }, [])

  const handleCancel = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }))
    if (resolverRef.current) {
      resolverRef.current(false)
      resolverRef.current = null
    }
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        description={modalState.description}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        variant={modalState.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  )
}

/**
 * useConfirm — Promise-based hook for triggering confirmation dialogs anywhere.
 *
 * Example:
 * ```javascript
 * const confirm = useConfirm()
 * const ok = await confirm({
 *   title: "Delete Account?",
 *   description: "This will permanently remove your wallet.",
 *   confirmText: "Delete",
 *   variant: "danger"
 * })
 * if (ok) { ... }
 * ```
 */
export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider")
  }
  return context
}
