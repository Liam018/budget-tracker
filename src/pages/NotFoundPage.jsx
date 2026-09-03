import { Link } from "react-router-dom"
export default function NotFoundPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4" style={{ background: "var(--neu-bg)" }}>
      <p className="text-6xl">404</p>
      <p className="text-clay-600 font-semibold">Page not found</p>
      <Link to="/" className="text-clay-500 underline text-sm">Go home</Link>
    </div>
  )
}

