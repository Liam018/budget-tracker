import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { X } from "lucide"
import { CountryFlag, toast } from "../ui"
import { NEU } from "../../lib/neu"

/**
 * WatchlistItemCard — Individual Pinned Currency Card in the Watchlist Grid
 */
export default function WatchlistItemCard({
  code,
  currObj,
  val,
  rate1,
  fromCurrency,
  toCurrency,
  isSelected,
  onSelectCurrency,
  onTogglePin,
}) {
  const formattedVal = val.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: val < 1 ? 4 : 2,
  })
  const isLongVal = formattedVal.length > 12

  function handleSelect() {
    if (!onSelectCurrency) return

    // Guard: Prevent re-applying if already selected as target currency
    if (toCurrency && code === toCurrency) {
      toast.info(`${code} is already the target currency`, {
        description: `Currently converting ${fromCurrency} → ${code} (${currObj.name})`,
        id: "apply-currency-convert",
      })
      return
    }

    // Guard: Prevent setting target currency to the same as source currency
    if (fromCurrency && code === fromCurrency) {
      toast.error(`Cannot convert ${code} to itself`, {
        description: `${code} is currently the source currency. Please select a different currency.`,
        id: "apply-currency-convert",
      })
      return
    }

    onSelectCurrency(code)
    toast.success(`Applied ${code} to converter`, {
      description: `Converting ${fromCurrency} → ${code} (${currObj.name})`,
      id: "apply-currency-convert",
    })
  }

  return (
    <motion.div
      layout
      key={code}
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{
        opacity: 0,
        scale: 0.8,
        y: -8,
        transition: { duration: 0.18 },
      }}
      transition={{
        layout: { type: "spring", stiffness: 420, damping: 32 },
        opacity: { duration: 0.2 },
        scale: { type: "spring", stiffness: 420, damping: 32 },
        y: { type: "spring", stiffness: 420, damping: 32 },
      }}
      whileHover={{ y: -2 }}
      onClick={handleSelect}
      title={
        isSelected
          ? `${code} is currently active in the converter`
          : onSelectCurrency
          ? `Click to convert ${fromCurrency} with ${code}`
          : undefined
      }
      className={`p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between group relative select-none transition-all ${
        isSelected ? "ring-2 ring-brand-500/30" : ""
      } ${onSelectCurrency ? "cursor-pointer hover:shadow-md" : ""}`}
      style={{
        background: NEU.bg,
        boxShadow: NEU.insetSm,
      }}
    >
      {/* Unpin button — accessible on touch devices with opacity-70, hoverable on desktop */}
      <motion.button
        type="button"
        whileHover={{
          scale: 1.15,
          rotate: 90,
          transition: { duration: 0.15, ease: "easeOut" },
        }}
        whileTap={{
          scale: 0.9,
          transition: { duration: 0.08, ease: "easeIn" },
        }}
        onClick={(e) => {
          e.stopPropagation()
          onTogglePin(code)
        }}
        title={`Remove ${code} from watchlist`}
        aria-label={`Remove ${code} from watchlist`}
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-rose-500 hover:bg-rose-50/50 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-[opacity,color,background-color] duration-150 ease-out cursor-pointer z-10"
      >
        <MorphIcon icon={X} size={12} strokeWidth={2.4} />
      </motion.button>

      {/* Top: Flag, Code, and Currency Name */}
      <div className="flex items-center gap-2.5 mb-2.5 min-w-0 pr-7">
        <CountryFlag code={code} size="md" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs sm:text-sm font-extrabold text-neutral-800 truncate leading-tight">
              {code}
            </p>
            {isSelected && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-brand-500/15 text-brand-600 leading-none shrink-0">
                Active
              </span>
            )}
          </div>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate leading-tight mt-0.5">
            {currObj.name}
          </p>
        </div>
      </div>

      {/* Bottom: Converted Value & Exchange Rate */}
      <div className="min-w-0 mt-1">
        <p
          title={`${currObj.symbol || ""} ${formattedVal}`}
          className={`font-black text-brand-600 tracking-tight leading-tight truncate ${
            isLongVal ? "text-base" : "text-base sm:text-lg"
          }`}
        >
          {currObj.symbol || ""}{" "}
          {formattedVal}
        </p>
        <p className="text-[10px] font-semibold text-neutral-400 mt-1 truncate">
          1 {fromCurrency} = {rate1.toFixed(3)} {code}
        </p>
      </div>
    </motion.div>
  )
}
