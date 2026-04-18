import { useState } from 'react'
import { Search, Plus, Check, Loader2, WifiOff } from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import { SkeletonGrid } from '../components/SkeletonCard'
import { usePodcastSearch } from '../hooks/usePodcastSearch'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { addSubscription } from '../lib/firestore'
import { useAuth } from '../contexts/AuthContext'

export default function DiscoverPage() {
  const { user }  = useAuth()
  const [query, setQuery] = useState('')
  const { results, status, error } = usePodcastSearch(query)
  const { subscribedIds }          = useSubscriptions()

  return (
    <AppShell>
      <Header title="Discover" />

      <div className="flex-1 px-8 py-8 space-y-8">

        {/* ── Hero search bar ── */}
        <div className="space-y-2">
          <p className="eyebrow">Taddy Discovery Engine</p>
          <h2 className="font-editorial text-3xl italic text-ink">
            Find your next obsession
          </h2>
          <p className="font-ui text-sm text-ink-muted max-w-md">
            Search millions of podcasts. Add the ones that matter to your library.
          </p>
        </div>

        <div className="relative max-w-2xl">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-muted pointer-events-none"
            strokeWidth={1.5}
          />
          <input
            id="input-discover-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search podcasts, topics, or people…"
            autoComplete="off"
            spellCheck="false"
            className="
              w-full rounded-lg border border-surface-border bg-surface-container
              pl-12 pr-5 py-3.5
              font-ui text-base text-ink placeholder:text-ink-muted
              focus:outline-none focus:ring-2 focus:ring-sage-primary/30 focus:border-sage-primary/40
              transition-all duration-150
            "
          />
        </div>

        {/* ── Result area ── */}
        <ResultArea
          query={query}
          results={results}
          status={status}
          error={error}
          subscribedIds={subscribedIds}
          user={user}
        />

      </div>
    </AppShell>
  )
}

// ── Result area — handles all four states ────────────────────────────────────
function ResultArea({ query, results, status, error, subscribedIds, user }) {
  // Idle — no query entered yet
  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container mb-4">
          <Search className="h-7 w-7 text-ink-muted" strokeWidth={1} />
        </div>
        <p className="font-editorial text-xl italic text-ink-secondary">
          Start typing to search
        </p>
        <p className="mt-1 font-ui text-sm text-ink-muted">
          Results from the Taddy podcast database will appear here
        </p>
      </div>
    )
  }

  // Loading — shimmer skeletons
  if (status === 'loading') {
    return (
      <div role="status" aria-label="Searching…">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 rounded-full border-2 border-sage-primary border-t-transparent animate-spin" />
          <p className="label-ui">Searching Taddy…</p>
        </div>
        <SkeletonGrid count={6} />
      </div>
    )
  }

  // Error — localized, non-alarmist
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container mb-4">
          <WifiOff className="h-7 w-7 text-ink-muted" strokeWidth={1.5} />
        </div>
        <p className="font-editorial text-xl italic text-ink">
          Discovery is currently unavailable.
        </p>
        <p className="mt-1 font-ui text-sm text-ink-muted max-w-xs">
          Could not reach the Taddy API. Check your connection and try again.
        </p>
        {import.meta.env.DEV && (
          <p className="mt-3 font-mono text-xs text-ink-muted bg-surface-container rounded px-3 py-1.5">
            {error}
          </p>
        )}
      </div>
    )
  }

  // Success — empty set
  if (status === 'success' && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-editorial text-2xl italic text-ink-secondary">
          No podcasts found.
        </p>
        <p className="mt-1 font-ui text-sm text-ink-muted">
          Try a different search.
        </p>
      </div>
    )
  }

  // Success — results grid
  return (
    <section>
      <p className="eyebrow mb-4">
        {results.length} result{results.length !== 1 ? 's' : ''} for "{query.trim()}"
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((podcast) => (
          <PodcastResultCard
            key={podcast.uuid}
            podcast={podcast}
            alreadySaved={subscribedIds.has(podcast.uuid)}
            user={user}
          />
        ))}
      </div>
    </section>
  )
}

// ── Individual result card ────────────────────────────────────────────────────
// NOTE: `alreadySaved` is the single source of truth (from Firestore onSnapshot).
// Local `saving` tracks only the in-flight async state — never used to derive
// "in library" status, which eliminates the race condition where onSnapshot fires
// before setSaving(false), locking the button on the spinner indefinitely.
function PodcastResultCard({ podcast, alreadySaved, user }) {
  const { uuid, name, description, imageUrl } = podcast
  const [saving, setSaving] = useState(false)
  const [toast,  setToast]  = useState(null)  // 'added' | 'error' | null

  async function handleAdd() {
    if (alreadySaved || saving) return
    setSaving(true)
    try {
      await addSubscription(user.uid, podcast)
      // Don't set any local "saved" state here — onSnapshot will flip
      // alreadySaved to true, giving us the canonical "In Library" status.
      setToast('added')
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      console.error('[Discover] Add failed:', err)
      setToast('error')
      setTimeout(() => setToast(null), 4000)
    } finally {
      // Always clear spinner — independent of Firestore timing
      setSaving(false)
    }
  }

  return (
    <article
      id={`result-${uuid}`}
      className="card-tonal group flex gap-4 items-start hover:shadow-md transition-all duration-200"
    >
      {/* Artwork */}
      <div className="shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="h-20 w-20 object-cover"
            style={{
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(27,28,26,0.10)',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        {/* Fallback when image fails or is absent */}
        <div
          className="h-20 w-20 bg-surface-border items-center justify-center"
          style={{
            borderRadius: '4px',
            display: imageUrl ? 'none' : 'flex',
          }}
          aria-hidden="true"
        >
          <Search className="h-6 w-6 text-ink-muted" strokeWidth={1} />
        </div>
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Title — Newsreader, 2-line clamp */}
        <h3
          className="font-editorial text-base font-medium text-ink leading-snug group-hover:text-sage-primary transition-colors"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {name}
        </h3>

        {/* Description — Work Sans, single line truncated */}
        {description && (
          <p className="font-ui text-xs text-ink-muted leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        {/* Add to library CTA */}
        <div className="mt-2 flex flex-col gap-1">
          <button
            id={`btn-add-${uuid}`}
            onClick={handleAdd}
            disabled={alreadySaved || saving}
            className={`
              inline-flex items-center gap-1.5 font-ui text-xs font-medium
              transition-colors duration-150
              ${alreadySaved
                ? 'text-sage-primary cursor-default'
                : saving
                ? 'text-ink-muted cursor-wait'
                : 'text-sage-primary hover:text-sage-deep'}
            `}
            aria-label={alreadySaved ? `${name} is in your library` : `Add ${name} to library`}
          >
            {alreadySaved ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            ) : saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            {alreadySaved ? 'In Library' : saving ? 'Saving…' : 'Add to Library'}
          </button>

          {/* Inline toast — auto-dismisses */}
          {toast === 'added' && (
            <p className="font-ui text-[10px] text-sage-primary animate-pulse">
              ✓ Added to your library
            </p>
          )}
          {toast === 'error' && (
            <p className="font-ui text-[10px] text-red-400">
              Failed to save. Try again.
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
