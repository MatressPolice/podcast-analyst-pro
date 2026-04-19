import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import LibraryPage from './pages/LibraryPage'
import DiscoverPage from './pages/DiscoverPage'
import { ArchivePage, SavedPage, SettingsPage } from './pages/StubPages'

// ── Auth-aware route guard ────────────────────────────
function ProtectedRoute({ children }) {
  const { user, authorized, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-cream">
        <div className="h-8 w-8 rounded-full border-2 border-sage-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!authorized) return <Navigate to="/unauthorized" replace />
  return children
}

// ── App with router & auth provider ──────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected area */}
          <Route path="/" element={
            <ProtectedRoute><LibraryPage /></ProtectedRoute>
          } />
          <Route path="/discover" element={
            <ProtectedRoute><DiscoverPage /></ProtectedRoute>
          } />
          <Route path="/archive" element={
            <ProtectedRoute><ArchivePage /></ProtectedRoute>
          } />
          <Route path="/saved" element={
            <ProtectedRoute><SavedPage /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><SettingsPage /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
