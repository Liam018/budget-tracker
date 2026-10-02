import { NEU } from "../../lib/neu"
import { ACCOUNT_TYPE_OPTIONS } from "../../constants/accountConstants"

/**
 * AccountTypeSelector — Selector buttons for Cash, Bank, E-Wallet, Credit Card, Savings Jar.
 */
export default function AccountTypeSelector({ type, onChangeType }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
        Account Type
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {ACCOUNT_TYPE_OPTIONS.map((opt) => {
          const isSelected = type === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChangeType(opt.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                isSelected
                  ? "text-brand-600"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
              style={{
                background: NEU.bg,
                boxShadow: isSelected ? NEU.insetSm : NEU.raisedSm,
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
