import { MorphIcon } from "morphicons/react"
import { Sparkles, Plus } from "lucide"
import { NEU } from "../../lib/neu"

/**
 * AccountModalTabs — Segmented switch between Philippine Presets and Custom Details.
 */
export default function AccountModalTabs({ activeTab, onTabChange }) {
  return (
    <div
      className="p-1 rounded-2xl flex items-center gap-1"
      style={{
        background: NEU.bg,
        boxShadow: NEU.insetSm,
      }}
    >
      <button
        type="button"
        onClick={() => onTabChange("presets")}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeTab === "presets"
            ? "text-brand-600"
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
        onClick={() => onTabChange("custom")}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeTab === "custom"
            ? "text-brand-600"
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
  )
}
