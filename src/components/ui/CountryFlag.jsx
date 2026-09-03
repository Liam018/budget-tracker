import { useState } from "react"

// Map of 3-letter currency codes to 2-letter ISO country codes
const CURRENCY_TO_ISO = {
  PHP: "ph",
  USD: "us",
  EUR: "eu",
  GBP: "gb",
  JPY: "jp",
  CAD: "ca",
  AUD: "au",
  CHF: "ch",
  SGD: "sg",
  HKD: "hk",
  NZD: "nz",
  CNY: "cn",
  INR: "in",
  KRW: "kr",
  THB: "th",
  MYR: "my",
  IDR: "id",
  VND: "vn",
  AED: "ae",
  SAR: "sa",
  TWD: "tw",
  SEK: "se",
  NOK: "no",
  DKK: "dk",
  PLN: "pl",
  TRY: "tr",
  BRL: "br",
  MXN: "mx",
  ZAR: "za",
  ILS: "il",
  QAR: "qa",
  KWD: "kw",
  BHD: "bh",
  OMR: "om",
  CLP: "cl",
  COP: "co",
  CZK: "cz",
  HUF: "hu",
  EGP: "eg",
  PKR: "pk",
  BDT: "bd",
  NGN: "ng",
  KES: "ke",
  ARS: "ar",
}

/**
 * CountryFlag — High-resolution cross-platform country flag.
 * Renders crisp, photorealistic flags on Windows, macOS, iOS, and Android.
 */
export function CountryFlag({
  code = "PHP",
  size = "md", // 'sm' | 'md' | 'lg'
  className = "",
}) {
  const [hasError, setHasError] = useState(false)
  const iso = (CURRENCY_TO_ISO[code?.toUpperCase()] || code?.slice(0, 2) || "ph").toLowerCase()

  const sizeClasses = {
    sm: "w-4.5 h-3",
    md: "w-6 h-4",
    lg: "w-7 h-5",
  }[size] || "w-6 h-4"

  if (hasError) {
    return (
      <span className="inline-flex items-center justify-center text-[10px] font-bold text-neutral-500 bg-neutral-200/80 px-1 py-0.5 rounded-xs">
        {iso.toUpperCase()}
      </span>
    )
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      srcSet={`https://flagcdn.com/w80/${iso}.png 2x`}
      width="24"
      height="16"
      alt={`${code} flag`}
      onError={() => setHasError(true)}
      loading="lazy"
      className={`inline-block object-cover rounded-xs ring-1 ring-black/10 shrink-0 shadow-2xs ${sizeClasses} ${className}`}
    />
  )
}
