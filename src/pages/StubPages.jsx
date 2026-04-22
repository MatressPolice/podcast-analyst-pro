// Stub pages — will be built out per task
import AppShell from '../components/AppShell'
import Header from '../components/Header'

export function SavedPage() {
  return (
    <AppShell>
      <Header title="Saved Briefs" />
      <div className="flex-1 px-8 py-8 flex flex-col items-center justify-center text-center">
        <h2 className="font-editorial text-2xl italic text-ink-secondary mb-2">Coming Soon</h2>
        <p className="font-ui text-sm text-ink-muted max-w-sm flex-wrap">
          A place to bookmark individual pieces of intelligence or save entire briefs offline.
        </p>
      </div>
    </AppShell>
  )
}

export function SettingsPage() {
  return (
    <AppShell>
      <Header title="Settings" />
      <div className="flex-1 px-8 py-8 flex flex-col items-center justify-center text-center">
        <h2 className="font-editorial text-2xl italic text-ink-secondary mb-2">Preferences</h2>
        <p className="font-ui text-sm text-ink-muted max-w-sm flex-wrap">
          Settings integration to allow users to link their own RSS feeds or manage auth.
        </p>
      </div>
    </AppShell>
  )
}
