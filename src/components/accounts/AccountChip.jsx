import { NEU } from "../../lib/neu"

/**
 * AccountChip — Tactile EMV smart card chip and contactless NFC waves graphic.
 */
export default function AccountChip({ color = "#863bff" }) {
  return (
    <div className="flex items-center gap-2 pb-0.5 select-none" aria-hidden="true">
      {/* Neumorphic EMV Smart Chip */}
      <div
        className="relative w-9 h-6 rounded-md border border-neutral-300/40 p-0.5 flex items-center justify-center shrink-0 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(235, 238, 245, 0.95), rgba(215, 220, 230, 0.8))",
          boxShadow: NEU.insetSm,
        }}
      >
        {/* Micro circuit etchings */}
        <div className="w-full h-full rounded-[3px] border border-neutral-400/30 relative flex items-center justify-center">
          <div className="w-full h-px bg-neutral-400/30 absolute" />
          <div className="h-full w-px bg-neutral-400/30 absolute" />
          <div
            className="w-3 h-2 rounded-xs border border-neutral-400/30"
            style={{ background: `${color || "#863bff"}15` }}
          />
        </div>
      </div>

      {/* Tactile Contactless NFC Waves */}
      <div className="flex items-center text-neutral-400/70">
        <svg
          className="w-4 h-4 -rotate-45"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="M5 12.55a11 11 0 0 1 14.08 0" opacity="0.35" />
          <path d="M8.5 15.5a6 6 0 0 1 7 0" opacity="0.65" />
          <path d="M11.5 18a2 2 0 0 1 1 0" />
        </svg>
      </div>
    </div>
  )
}
