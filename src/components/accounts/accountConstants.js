import {
  Wallet,
  Banknote,
  Building2,
  Smartphone,
  CreditCard,
  PiggyBank,
  ShoppingBag,
  TrendingUp,
  Coins,
  Briefcase,
  Landmark,
  Receipt,
} from "lucide-react"

/**
 * Mapping of icon key strings to Lucide React components
 */
export const ICON_MAP = {
  Wallet,
  Banknote,
  Building2,
  Smartphone,
  CreditCard,
  PiggyBank,
  ShoppingBag,
  TrendingUp,
  Coins,
  Briefcase,
  Landmark,
  Receipt,
}

/**
 * Get account icon component with fallback to Wallet
 */
export function getAccountIcon(iconName) {
  return ICON_MAP[iconName] || Wallet
}

/**
 * Human-readable display labels for account types
 */
export const TYPE_LABELS = {
  cash: "Cash Account",
  bank: "Bank Account",
  e_wallet: "E-Wallet",
  credit_card: "Credit Card",
  savings: "Savings Jar",
  investment: "Investment",
  other: "Digital Asset",
}
