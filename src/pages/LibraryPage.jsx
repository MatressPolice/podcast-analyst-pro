import { useState, useEffect } from 'react'
import { Search, Plus, BookOpen, Loader2, Trash2 } from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import EpisodePanel from '../components/EpisodePanel'
import { useAuth } from '../contexts/AuthContext'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { removeSubscription } from '../lib/firestore'
import { useNavigate, useLocation } from 'react-router-dom'

export default function LibraryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const { subscriptions, loading } = useSubscriptions()
  const [localSearch,      setLocalSearch]      = useState('')
  const [removing,         setRemoving]         = useState(null)   // uuid being removed
  const [selectedPodcast,  setSelectedPodcast]  = useState(null)   // opens EpisodePanel
  const [selectedEpisode,  setSelectedEpisode]  = useState(null)   // remembered analysis view

  // Handle Archive navigation to resume an episode panel
  useEffect(() => {
    if (location.state?.resumeAnalysis && location.state?.proxyPodcast) {
      setSelectedPodcast(location.state.proxyPodcast)
      setSelectedEpisode(location.state.resumeEpisode ?? null)
      
      // Clear state so a refresh doesn't keep popping it open
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, location.pathname])

  // Clear the selected episode whenever the user switches to a different podcast
  // We need to bypass this if we're resuming an episode from Archive
  useEffect(() => {
    // If selectedEpisode exists and matches the new podcast, let it be (resume case)
    // Actually simpler: if someone clicks a different podcast card, they trigger onOpen
    // which gives a new selectedPodcast. We just clear selectedEpisode then, unless
    // the selectedEpisode already belongs to this podcast (like when clicking back).
    // Let's just do:
    if (!selectedEpisode || selectedEpisode.podcastUuid !== selectedPodcast?.uuid) {
      setSelectedEpisode(null)
    }
  }, [selectedPodcast?.uuid])

  // Time-of-day greeting
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Filter by local search
  const visible = localSearch.trim()
    ? subscriptions.filter((p) =>
        p.name.toLowerCase().includes(localSearch.toLowerCase())
      )
    : subscriptions

  async function handleRemove(uuid, name) {
    if (!window.confirm(`Remove "${name}" from your library?`)) return
    setRemoving(uuid)
    try {
      await removeSubscription(user.uid, uuid)
    } catch (err) {
      console.error('[Library] Remove failed:', err)
    } finally {
      setRemoving(null)
    }
  }

  return (
    <>
    <AppShell>
      <Header
        title="Library"
        actions={
          <button
            id="btn-add-podcast"
            className="btn-primary"
            onClick={() => navigate('/discover')}
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Add Podcast
          </button>
        }
      />

      <div className="flex-1 px-8 py-8 space-y-8">
        {/* Greeting */}
        <div>
          <p className="eyebrow">{greeting}</p>
          <h2 className="font-editorial text-3xl italic text-ink mt-0.5">
            {user?.displayName?.split(' ')[0] ?? 'Analyst'}'s Podcasts
          </h2>
        </div>

        {/* Local search (only shown when there are subscriptions) */}
        {subscriptions.length > 0 && (
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted"
              strokeWidth={1.5}
            />
            <input
              id="input-library-search"
              type="search"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Filter your library…"
              className="
                w-full rounded-lg border border-surface-border bg-surface-container
                pl-10 pr-4 py-2.5 font-ui text-sm text-ink placeholder:text-ink-muted
                focus:outline-none focus:ring-2 focus:ring-sage-primary/30
                transition-shadow duration-150
              "
            />
          </div>
        )}

        {/* ── States ── */}
        {loading && <LoadingSkeleton />}

        {!loading && subscriptions.length === 0 && (
          <EmptyLibrary onDiscover={() => navigate('/discover')} />
        )}

        {!loading && subscriptions.length > 0 && (
          <section>
            <p className="eyebrow mb-4">
              Subscribed · {visible.length} show{visible.length !== 1 ? 's' : ''}
              {localSearch && subscriptions.length !== visible.length
                ? ` (filtered from ${subscriptions.length})`
                : ''}
            </p>

            {visible.length === 0 ? (
              <p className="font-editorial italic text-ink-muted text-lg py-8 text-center">
                No shows match that filter.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((podcast) => (
                  <PodcastCard
                    key={podcast.uuid}
                    podcast={podcast}
                    removing={removing === podcast.uuid}
                    onRemove={handleRemove}
                    onOpen={setSelectedPodcast}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>

    {/* ── Episode side panel (Task 3.1) ── */}
    {selectedPodcast && (
      <EpisodePanel
        podcast={selectedPodcast}
        user={user}
        selectedEpisode={selectedEpisode}
        onSelectEpisode={setSelectedEpisode}
        onClose={() => setSelectedPodcast(null)}
      />
    )}
  </>
  )
}

// ── Library card (real Taddy data) ───────────────────────────────────────────
function PodcastCard({ podcast, removing, onRemove, onOpen }) {
  const { uuid, name, description, imageUrl } = podcast

  return (
    <article
      id={`library-card-${uuid}`}
      className="card-tonal group flex gap-4 items-start hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onOpen(podcast)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(podcast)}
      aria-label={`Browse episodes for ${name}`}
    >
      {/* Artwork */}
      <div className="shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="h-16 w-16 object-cover"
            style={{ borderRadius: '4px', boxShadow: '0 2px 8px rgba(27,28,26,0.10)' }}
          />
        ) : (
          <div
            className="h-16 w-16 bg-surface-border flex items-center justify-center"
            style={{ borderRadius: '4px' }}
          >
            <BookOpen className="h-5 w-5 text-ink-muted" strokeWidth={1} />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
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
        {description && (
          <p className="font-ui text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Remove button */}
        <button
          id={`btn-remove-${uuid}`}
          onClick={(e) => { e.stopPropagation(); onRemove(uuid, name) }}
          disabled={removing}
          className="
            mt-2 inline-flex items-center gap-1 font-ui text-xs text-ink-muted
            hover:text-red-500 transition-colors duration-150 disabled:opacity-40
          "
          aria-label={`Remove ${name} from library`}
        >
          {removing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" strokeWidth={2} />
          )}
          {removing ? 'Removing…' : 'Remove'}
        </button>
      </div>
    </article>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyLibrary({ onDiscover }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container mb-5">
        <BookOpen className="h-7 w-7 text-ink-muted" strokeWidth={1} />
      </div>
      <p className="font-editorial text-2xl italic text-ink-secondary">
        Your library is empty.
      </p>
      <p className="mt-1 font-ui text-sm text-ink-muted max-w-xs">
        Use Discover to search for podcasts and add them here.
      </p>
      <button className="btn-primary mt-6" onClick={onDiscover}>
        <Search className="h-4 w-4" strokeWidth={2} />
        Go to Discover
      </button>
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="card-tonal flex gap-4 items-start">
          <div className="h-16 w-16 shrink-0 rounded-[4px] skeleton" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 w-3/4 rounded skeleton" />
            <div className="h-3 w-full  rounded skeleton" />
            <div className="h-3 w-5/6  rounded skeleton" />
          </div>
        </div>
      ))}
    </div>
  )
}
