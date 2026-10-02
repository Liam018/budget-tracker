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
  Archive,
  Sparkles,
  Plus,
} from "lucide-react"

import {
  Wallet as MorphWallet,
  Banknote as MorphBanknote,
  Building2 as MorphBuilding2,
  Smartphone as MorphSmartphone,
  CreditCard as MorphCreditCard,
  PiggyBank as MorphPiggyBank,
  ShoppingBag as MorphShoppingBag,
  TrendingUp as MorphTrendingUp,
  Coins as MorphCoins,
  Briefcase as MorphBriefcase,
  Landmark as MorphLandmark,
  Receipt as MorphReceipt,
} from "lucide"

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
 * Mapping of icon key strings to Lucide definition objects for MorphIcon
 */
export const MORPH_ICON_MAP = {
  Wallet: MorphWallet,
  Banknote: MorphBanknote,
  Building2: MorphBuilding2,
  Smartphone: MorphSmartphone,
  CreditCard: MorphCreditCard,
  PiggyBank: MorphPiggyBank,
  ShoppingBag: MorphShoppingBag,
  TrendingUp: MorphTrendingUp,
  Coins: MorphCoins,
  Briefcase: MorphBriefcase,
  Landmark: MorphLandmark,
  Receipt: MorphReceipt,
}

/**
 * Get Lucide definition object for MorphIcon with fallback to Wallet
 */
export function getMorphAccountIcon(iconName) {
  return MORPH_ICON_MAP[iconName] || MorphWallet
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

/**
 * Selectable account type options in the modal
 */
export const ACCOUNT_TYPE_OPTIONS = [
  { id: "cash", label: "Cash" },
  { id: "bank", label: "Bank" },
  { id: "e_wallet", label: "E-Wallet" },
  { id: "credit_card", label: "Credit Card" },
  { id: "savings", label: "Savings / Jar" },
]

/**
 * Filter tabs displayed on the Accounts page
 */
export const FILTER_TABS = [
  { id: "all", label: "All", icon: Wallet },
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "bank", label: "Banks", icon: Building2 },
  { id: "e_wallet", label: "E-Wallets", icon: Smartphone },
  { id: "credit_card", label: "Credit Cards", icon: CreditCard },
  { id: "savings", label: "Savings", icon: PiggyBank },
  { id: "archived", label: "Archived", icon: Archive },
]

/**
 * Modal segmented tabs for Philippine Presets vs Custom Details
 */
export const ACCOUNT_MODAL_TABS = [
  { id: "presets", label: "Philippine Presets", icon: Sparkles },
  { id: "custom", label: "Custom Details", icon: Plus },
]

