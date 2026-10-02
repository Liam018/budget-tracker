import { MorphIcon } from "morphicons/react"
import { Check, Sparkles } from "lucide"
import { NEU } from "../../lib/neu"
import { PRESET_COLORS, AVAILABLE_ICONS } from "../../services/accountService"
import { getMorphAccountIcon } from "../../constants/accountConstants"

/**
 * AccountAppearancePicker — Selects account card accent color and brand icon.
 */
export default function AccountAppearancePicker({
  color,
  icon,
  onChangeColor,
  onChangeIcon,
  isExpanded = true,
  onExpand,
}) {
  if (!isExpanded) {
    return (
      <div className="pt-1">
        <button
          type="button"
          onClick={onExpand}
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 py-1 transition-colors cursor-pointer"
        >
          <MorphIcon icon={Sparkles} size={13} strokeWidth={2.4} />
          <span>Customize Icon & Color</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-2 border-t border-neutral-200/50">
      {/* Color Picker */}
      <div>
        <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
          Accent Color
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => {
            const isSelected = color === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => onChangeColor(c)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs"
                style={{ background: c }}
                aria-label={`Color ${c}`}
              >
                {isSelected && (
                  <MorphIcon
                    icon={Check}
                    size={14}
                    strokeWidth={3}
                    className="text-white"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Icon Selector */}
      <div>
        <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
          Icon
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {AVAILABLE_ICONS.map((ic) => {
            const isSelected = icon === ic
            const IcComponent = getMorphAccountIcon(ic)

            return (
              <button
                key={ic}
                type="button"
                onClick={() => onChangeIcon(ic)}
                className={`h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? "text-brand-600"
                    : "text-neutral-400 hover:text-neutral-700"
                }`}
                style={{
                  background: NEU.bg,
                  boxShadow: isSelected ? NEU.insetSm : NEU.raisedSm,
                }}
                aria-label={ic}
              >
                <MorphIcon icon={IcComponent} size={16} strokeWidth={2.4} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
