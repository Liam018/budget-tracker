import { supabase } from "../lib/supabase"

/**
 * Account Types supported by the Budget Tracker
 */
export const ACCOUNT_TYPES = [
  { id: "all", label: "All Accounts" },
  { id: "cash", label: "Cash", icon: "Banknote", defaultColor: "#10b981" },
  { id: "bank", label: "Banks", icon: "Building2", defaultColor: "#0033a0" },
  { id: "e_wallet", label: "E-Wallets", icon: "Smartphone", defaultColor: "#007dfe" },
  { id: "credit_card", label: "Credit Cards", icon: "CreditCard", defaultColor: "#8b5cf6" },
  { id: "savings", label: "Savings & Jars", icon: "PiggyBank", defaultColor: "#f59e0b" },
]

/**
 * Popular Philippine Financial Institution Presets
 */
export const PHILIPPINE_INSTITUTION_PRESETS = [
  // E-Wallets
  {
    id: "gcash",
    name: "GCash",
    type: "e_wallet",
    color: "#007dfe",
    icon: "Smartphone",
    badge: "E-Wallet",
    description: "Mobile Wallet & QR",
  },
  {
    id: "maya",
    name: "Maya",
    type: "e_wallet",
    color: "#16a34a",
    icon: "Smartphone",
    badge: "E-Wallet",
    description: "Digital Wallet & Savings",
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    type: "e_wallet",
    color: "#ee4d2d",
    icon: "ShoppingBag",
    badge: "E-Wallet",
    description: "Shopee Pay Wallet",
  },
  {
    id: "grabpay",
    name: "GrabPay",
    type: "e_wallet",
    color: "#00b14f",
    icon: "Smartphone",
    badge: "E-Wallet",
    description: "Grab Wallet",
  },

  // Major Philippine Banks
  {
    id: "bdo",
    name: "BDO",
    type: "bank",
    color: "#0033a0",
    icon: "Building2",
    badge: "Bank",
    description: "Banco de Oro",
  },
  {
    id: "bpi",
    name: "BPI",
    type: "bank",
    color: "#b11116",
    icon: "Building2",
    badge: "Bank",
    description: "Bank of the Philippine Islands",
  },
  {
    id: "unionbank",
    name: "UnionBank",
    type: "bank",
    color: "#ff6b00",
    icon: "Building2",
    badge: "Bank",
    description: "Union Bank of the Philippines",
  },
  {
    id: "metrobank",
    name: "Metrobank",
    type: "bank",
    color: "#002d72",
    icon: "Building2",
    badge: "Bank",
    description: "Metropolitan Bank & Trust Co.",
  },
  {
    id: "gotyme",
    name: "GoTyme",
    type: "bank",
    color: "#00d4c5",
    icon: "Smartphone",
    badge: "Digital Bank",
    description: "GoTyme Digital Banking",
  },
  {
    id: "seabank",
    name: "SeaBank",
    type: "bank",
    color: "#ff5722",
    icon: "Smartphone",
    badge: "Digital Bank",
    description: "High-yield Savings",
  },
  {
    id: "cimb",
    name: "CIMB Bank",
    type: "bank",
    color: "#ed1c24",
    icon: "Building2",
    badge: "Digital Bank",
    description: "GSave / UpSave",
  },
  {
    id: "securitybank",
    name: "Security Bank",
    type: "bank",
    color: "#007833",
    icon: "Building2",
    badge: "Bank",
    description: "Security Bank Corp",
  },
  {
    id: "landbank",
    name: "Landbank",
    type: "bank",
    color: "#005826",
    icon: "Building2",
    badge: "Bank",
    description: "Land Bank of the Philippines",
  },

  // Cash & Cards
  {
    id: "physical_cash",
    name: "Cash on Hand",
    type: "cash",
    color: "#10b981",
    icon: "Banknote",
    badge: "Cash",
    description: "Physical Wallet / Bills",
  },
  {
    id: "credit_card",
    name: "Credit Card",
    type: "credit_card",
    color: "#8b5cf6",
    icon: "CreditCard",
    badge: "Credit",
    description: "Credit Line / Revolving",
  },
  {
    id: "emergency_fund",
    name: "Emergency Fund",
    type: "savings",
    color: "#f59e0b",
    icon: "PiggyBank",
    badge: "Savings",
    description: "Stash / Rainy Day",
  },
]

export const PRESET_COLORS = [
  "#10b981", // Emerald Cash
  "#007dfe", // GCash Blue
  "#16a34a", // Maya Green
  "#0033a0", // BDO Blue
  "#b11116", // BPI Red
  "#ff6b00", // UnionBank Orange
  "#002d72", // Metrobank Deep Blue
  "#ee4d2d", // Shopee Orange
  "#8b5cf6", // Violet Credit
  "#f59e0b", // Amber Savings
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#64748b", // Slate
]

export const AVAILABLE_ICONS = [
  "Wallet",
  "Banknote",
  "Building2",
  "Smartphone",
  "CreditCard",
  "PiggyBank",
  "ShoppingBag",
  "TrendingUp",
  "Coins",
  "Briefcase",
  "Landmark",
  "Receipt",
]

/**
 * Format currency to Philippine Peso (₱ PHP)
 */
export function formatCurrency(amount, currency = "PHP", options = {}) {
  const num = typeof amount === "number" ? amount : parseFloat(amount) || 0
  const isNeg = num < 0
  const absVal = Math.abs(num)

  const formatted = absVal.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  })

  const symbol = currency === "PHP" ? "₱" : `${currency} `
  return isNeg ? `-${symbol}${formatted}` : `${symbol}${formatted}`
}

/**
 * Fetch all accounts for a specific user
 */
export async function getAccounts(userId) {
  if (!userId) throw new Error("User ID is required to fetch accounts")

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Create a new account
 */
export async function createAccount(accountData) {
  const {
    user_id,
    name,
    type,
    balance = 0,
    currency = "PHP",
    color = "#863bff",
    icon = "Wallet",
    institution = null,
    account_number = null,
  } = accountData

  if (!user_id) throw new Error("User ID is required")
  if (!name?.trim()) throw new Error("Account name is required")

  const { data, error } = await supabase
    .from("accounts")
    .insert([
      {
        user_id,
        name: name.trim(),
        type: type || "cash",
        balance: parseFloat(balance) || 0,
        currency,
        color,
        icon,
        institution,
        account_number: account_number ? account_number.trim() : null,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an existing account
 */
export async function updateAccount(id, updates) {
  if (!id) throw new Error("Account ID is required")

  const sanitized = { ...updates, updated_at: new Date().toISOString() }
  if (sanitized.balance !== undefined) {
    sanitized.balance = parseFloat(sanitized.balance) || 0
  }
  if (sanitized.name) {
    sanitized.name = sanitized.name.trim()
  }

  const { data, error } = await supabase
    .from("accounts")
    .update(sanitized)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Toggle archive state of an account
 */
export async function toggleArchiveAccount(id, is_archived) {
  return updateAccount(id, { is_archived })
}

/**
 * Delete an account
 */
export async function deleteAccount(id) {
  if (!id) throw new Error("Account ID is required")

  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id)

  if (error) throw error
  return true
}
