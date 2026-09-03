import { Toaster as SonnerToaster } from "sonner"
import { Check, AlertCircle, Info, AlertTriangle, Loader2 } from "lucide-react"

/**
 * Neumorphic Toaster component powered by Sonner.
 *
 * - Styled to seamlessly emerge from the `#edf0f7` surface with dual drop-shadows.
 * - Status icons are nestled inside tactile inset Neumorphic cavities.
 * - Supports stacked cards, swipe-to-dismiss, and promise resolutions.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      expand={false}
      richColors={false}
      closeButton={false}
      gap={10}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "w-full sm:w-[350px] flex items-center gap-3.5 p-3.5 rounded-2xl select-none transition-all duration-200 pointer-events-auto",
          title: "text-xs font-bold text-neutral-800 leading-tight",
          description: "text-[11px] font-medium text-neutral-500 leading-tight mt-0.5",
          actionButton:
            "px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-sm hover:bg-brand-700 transition-colors",
          cancelButton:
            "px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-800 transition-colors",
        },
        style: {
          background: "var(--neu-bg)",
          boxShadow: "var(--neu-raised)",
        },
      }}
      icons={{
        success: (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-600 shrink-0"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-inset-sm)",
            }}
          >
            <Check size={16} strokeWidth={2.6} />
          </div>
        ),
        error: (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-600 shrink-0"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-inset-sm)",
            }}
          >
            <AlertCircle size={16} strokeWidth={2.4} />
          </div>
        ),
        warning: (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-amber-600 shrink-0"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-inset-sm)",
            }}
          >
            <AlertTriangle size={16} strokeWidth={2.4} />
          </div>
        ),
        info: (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-brand-600 shrink-0"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-inset-sm)",
            }}
          >
            <Info size={16} strokeWidth={2.4} />
          </div>
        ),
        loading: (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-brand-600 shrink-0"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-inset-sm)",
            }}
          >
            <Loader2 size={16} className="animate-spin" strokeWidth={2.6} />
          </div>
        ),
      }}
    />
  )
}

export { toast } from "sonner"
