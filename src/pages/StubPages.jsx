// Stub pages — will be built out per task
import AppShell from '../components/AppShell'
import Header from '../components/Header'

function ComingSoonPage({ title, description }) {
  return (
    <AppShell>
      <Header title={title} />
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center">
        <p className="eyebrow mb-3">Coming Soon</p>
        <h2 className="font-editorial text-3xl italic text-ink">{title}</h2>
        <p className="mt-3 max-w-sm font-ui text-sm text-ink-muted leading-relaxed">
          {description}
        </p>
      </div>
    </AppShell>
  )
}

// Task 5.1 — chronological history of all analyzed episodes
export function ArchivePage() {
  return (
    <ComingSoonPage
      title="Archive"
      description="A chronological history of all analyzed episodes. Coming in Task 5.1."
    />
  )
}

export function SavedPage() {
  return (
    <ComingSoonPage
      title="Saved"
      description="Your bookmarked episodes and analyst notes."
    />
  )
}

export function SettingsPage() {
  return (
    <ComingSoonPage
      title="Settings"
      description="Manage your account, API integrations, and preferences."
    />
  )
}
