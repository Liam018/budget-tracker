import { ICON_MAP } from "../../constants/accountConstants"
import { Wallet } from "lucide-react"

/**
 * AccountBrandIcon — Renders the Lucide icon for an account, with Wallet fallback.
 */
export default function AccountBrandIcon({
  icon,
  size = 20,
  strokeWidth = 2.4,
  className = "",
}) {
  const IconComponent = ICON_MAP[icon] || Wallet
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  )
}
