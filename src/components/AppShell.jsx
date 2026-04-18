import Sidebar from './Sidebar'

/**
 * AppShell — fixed scaffold layout.
 * Left: 256px fixed sidebar. Right: scrollable main content.
 * Matches the "Fixed Scaffold" spec in branding.md §3.
 */
export default function AppShell({ children }) {
  return (
    <div className="flex h-full min-h-screen bg-surface-cream">
      <Sidebar />
      {/* Main content area offset by sidebar width */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  )
}
