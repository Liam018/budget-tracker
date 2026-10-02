import { MorphIcon } from "morphicons/react"
import { NEU } from "../../lib/neu"
import { PHILIPPINE_INSTITUTION_PRESETS } from "../../services/accountService"
import { getMorphAccountIcon } from "../../constants/accountConstants"

/**
 * AccountPresetGrid — Grid of Philippine financial institution presets (GCash, Maya, BDO, BPI, etc.)
 */
export default function AccountPresetGrid({
  institution,
  name,
  onSelectPreset,
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
          Select Institution Preset
        </label>
        <span className="text-[10px] font-semibold text-neutral-400">
          {PHILIPPINE_INSTITUTION_PRESETS.length} available
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PHILIPPINE_INSTITUTION_PRESETS.map((preset) => {
          const isSelected =
            institution === preset.name || name === preset.name
          const PresetIcon = getMorphAccountIcon(preset.icon)

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                isSelected
                  ? "text-neutral-900 font-extrabold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
              style={{
                background: NEU.bg,
                boxShadow: isSelected ? NEU.insetSm : NEU.raisedSm,
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs text-xs"
                style={{ background: preset.color }}
              >
                <MorphIcon icon={PresetIcon} size={14} strokeWidth={2.4} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">
                  {preset.name}
                </p>
                <span className="text-[9px] text-neutral-400 block truncate">
                  {preset.badge}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
