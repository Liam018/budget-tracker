import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/layout/ProtectedRoute"
import AppLayout from "./components/layout/AppLayout"

// Auth & Onboarding pages
import WelcomePage from "./pages/WelcomePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"

// App pages (placeholders — filled in later steps)
import DashboardPage from "./pages/DashboardPage"
import TransactionsPage from "./pages/TransactionsPage"
import BudgetsPage from "./pages/BudgetsPage"
import CategoriesPage from "./pages/CategoriesPage"
import AccountsPage from "./pages/AccountsPage"
import ReportsPage from "./pages/ReportsPage"
import RecurringPage from "./pages/RecurringPage"
import NotificationsPage from "./pages/NotificationsPage"
import ProfilePage from "./pages/ProfilePage"
import NotFoundPage from "./pages/NotFoundPage"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public & Onboarding routes */}
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes — wrapped inside AppLayout (sidebar + header + bottom nav) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/"              element={<DashboardPage />} />
              <Route path="/transactions"  element={<TransactionsPage />} />
              <Route path="/budgets"       element={<BudgetsPage />} />
              <Route path="/categories"    element={<CategoriesPage />} />
              <Route path="/accounts"      element={<AccountsPage />} />
              <Route path="/reports"       element={<ReportsPage />} />
              <Route path="/recurring"     element={<RecurringPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile"       element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
