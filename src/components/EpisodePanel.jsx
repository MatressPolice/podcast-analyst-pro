import { useEffect, useRef, useState } from 'react'
import {
  X, WifiOff, Play, Pause, Headphones,
  ArrowLeft, Sparkles, FileText, Brain, Loader2, CheckCircle2,
} from 'lucide-react'
import { usePodcastEpisodes } from '../hooks/usePodcastEpisodes'
import { useAnalysis }        from '../hooks/useAnalysis'
import ReactMarkdown          from 'react-markdown'

// ── Main panel ────────────────────────────────────────────────────────────────
// selectedEpisode is lifted to LibraryPage so it survives panel close/reopen.
export default function EpisodePanel({
  podcast,
  user,
  selectedEpisode,
  onSelectEpisode,
  onClose,
  analyzedUuids = new Set(),
}) {
  const { series, loading, error } = usePodcastEpisodes(podcast?.uuid ?? null)

  // Escape: back to list first, then close
  useEffect(() => {
    function handleKey(e) {
      if (e.key !== 'Escape') return
      if (selectedEpisode) onSelectEpisode(null)
      else onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onSelectEpisode, selectedEpisode])

  // Lock body scroll while panel is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!podcast) return null

  const episodes = series?.episodes ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={selectedEpisode ? selectedEpisode.name : `Episodes for ${podcast.name}`}
    >
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Slide-in panel — 50 % desk space ── */}
      <div
        className="episode-panel relative flex flex-col bg-surface-cream shadow-2xl overflow-hidden"
        style={{ width: '50%', minWidth: '400px', maxWidth: '800px' }}
      >

        {/* Close button — always visible */}
        <button
          id="btn-close-episode-panel"
          onClick={onClose}
          className="
            absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center
            rounded-full bg-surface-container text-ink-muted
            hover:bg-surface-border hover:text-ink transition-all duration-150
          "
          aria-label="Close panel"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        {/* ── View area: keyed so React remounts on switch, triggering CSS enter ── */}
        <div
          key={selectedEpisode?.uuid ?? 'episode-list'}
          className="panel-view flex flex-col flex-1 min-h-0"
        >
          {selectedEpisode ? (
            <AnalysisView
              episode={selectedEpisode}
              podcast={podcast}
              user={user}
              onBack={() => onSelectEpisode(null)}
            />
          ) : (
            <EpisodeListView
              podcast={podcast}
              episodes={episodes}
              loading={loading}
              error={error}
              onSelectEpisode={onSelectEpisode}
              analyzedUuids={analyzedUuids}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Episode list view ─────────────────────────────────────────────────────────
function EpisodeListView({ podcast, episodes, loading, error, onSelectEpisode, analyzedUuids = new Set() }) {
  return (
    <>
      {/* Panel header */}
      <div className="border-b border-surface-border px-6 py-5 shrink-0">
        <div className="flex items-start gap-4 pr-8">
          {podcast.imageUrl ? (
            <img
              src={podcast.imageUrl}
              alt={podcast.name}
              className="h-16 w-16 shrink-0 object-cover"
              style={{ borderRadius: '4px', boxShadow: '0 2px 12px rgba(27,28,26,0.12)' }}
            />
          ) : (
            <div
              className="h-16 w-16 shrink-0 flex items-center justify-center bg-surface-container"
              style={{ borderRadius: '4px' }}
            >
              <Headphones className="h-6 w-6 text-ink-muted" strokeWidth={1} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="eyebrow mb-0.5">Analyst Workspace</p>
            <h2
              className="font-editorial text-lg font-medium text-ink leading-snug"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {podcast.name}
            </h2>
            {podcast.description && (
              <p className="font-ui text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed">
                {podcast.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable episode list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && <EpisodeSkeletons />}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <WifiOff className="h-8 w-8 text-ink-muted mb-3" strokeWidth={1.5} />
            <p className="font-editorial text-lg italic text-ink-secondary">Episodes unavailable.</p>
            <p className="font-ui text-xs text-ink-muted mt-1">Could not reach the Taddy API.</p>
          </div>
        )}

        {!loading && !error && episodes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <Play className="h-8 w-8 text-ink-muted mb-3" strokeWidth={1} />
            <p className="font-editorial text-lg italic text-ink-secondary">No episodes found.</p>
          </div>
        )}

        {!loading && !error && episodes.length > 0 && (
          <div className="px-6">
            <p className="eyebrow py-3 border-b border-surface-border">
              {episodes.length} recent episode{episodes.length !== 1 ? 's' : ''}
            </p>
            <ul>
              {episodes.map((episode, idx) => (
                <EpisodeRow
                  key={episode.uuid ?? idx}
                  episode={episode}
                  hasAnalysis={analyzedUuids.has(episode.uuid)}
                  onReview={() => onSelectEpisode(episode)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  )
}

// ── Analysis view ─────────────────────────────────────────────────────────────
function AnalysisView({ episode, podcast, user, onBack }) {
  const { uuid, name, datePublished, audioUrl } = episode

  // Real-time Firestore analysis listener + AssemblyAI orchestration
  const { analysis, beginAnalysis } = useAnalysis(uuid, user?.uid ?? null)

  const status = analysis?.status ?? null

  async function handleBeginAnalysis() {
    await beginAnalysis(
      audioUrl,
      name,
      podcast.uuid,
      podcast.name,
      podcast.imageUrl,
      datePublished
    )
  }

  // ── Derived UI state ──────────────────────────────────────────────────────
  const isQueued     = status === 'queued'
  const isProcessing = status === 'processing'
  const isCompleted  = status === 'completed'
  const isAnalyzed   = status === 'analyzed'
  const isError      = status === 'error'
  const inFlight     = isQueued || isProcessing || isCompleted
  const noAudio      = !audioUrl

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Analysis header ── */}
      <div className="border-b border-surface-border px-6 py-4 shrink-0">
        {/* Back navigation */}
        <button
          id="btn-back-to-episodes"
          onClick={onBack}
          className="
            inline-flex items-center gap-1.5 font-ui text-xs text-ink-muted
            hover:text-sage-primary transition-colors duration-150 mb-3
          "
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to Episodes
        </button>

        {/* Podcast eyebrow */}
        <p className="eyebrow mb-1">{podcast.name}</p>

        {/* Episode title — Newsreader */}
        <h2
          className="font-editorial text-xl font-medium text-ink leading-snug"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {name ?? 'Untitled Episode'}
        </h2>

        {/* Date — Work Sans */}
        {datePublished && (
          <p className="font-ui text-xs text-ink-muted mt-1.5">
            {formatPublishedDate(datePublished)}
          </p>
        )}
      </div>

      {/* ── Scrollable analysis body ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-6">

        {/* Audio player */}
        {audioUrl ? (
          <SageAudioPlayer src={audioUrl} title={name} />
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-container border border-surface-border">
            <Headphones className="h-4 w-4 text-ink-muted shrink-0" strokeWidth={1.5} />
            <p className="font-ui text-xs text-ink-muted">No audio stream available for this episode.</p>
          </div>
        )}

        {/* Begin Analysis CTA */}
        <div className="flex flex-col items-center py-2">
          <button
            id={`btn-begin-analysis-${uuid}`}
            onClick={handleBeginAnalysis}
            disabled={inFlight || isAnalyzed || noAudio}
            className="
              w-full flex items-center justify-center gap-2.5
              rounded-xl py-4 px-6
              bg-sage-primary hover:bg-sage-deep
              text-surface-cream font-editorial text-lg italic
              transition-all duration-200
              shadow-md hover:shadow-lg active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
            "
            aria-label="Begin AI analysis for this episode"
          >
            {inFlight
              ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" strokeWidth={1.5} />
              : <Sparkles className="h-5 w-5 shrink-0" strokeWidth={1.5} />
            }
            {isQueued     && 'Analysis Queued…'}
            {isProcessing && 'Transcribing…'}
            {isCompleted  && 'Analyzing Context…'}
            {isAnalyzed   && 'Analysis Complete'}
            {isError      && 'Retry Analysis'}
            {!status      && 'Begin Analysis'}
          </button>

          {/* Sub-label */}
          {!inFlight && !isAnalyzed && (
            <p className="font-ui text-[11px] text-ink-muted mt-2 text-center">
              {isError
                ? (analysis?.error ?? 'Something went wrong. Try again.')
                : noAudio
                ? 'Audio stream required for transcription.'
                : 'AI-powered transcript + editorial intelligence brief'
              }
            </p>
          )}
          {isProcessing && (
            <p className="font-ui text-[11px] text-sage-primary/80 mt-2 text-center animate-pulse">
              Transcribing audio — this may take a few minutes…
            </p>
          )}
          {isCompleted && (
            <p className="font-ui text-[11px] text-sage-primary/80 mt-2 text-center animate-pulse">
              Generating critical intelligence brief…
            </p>
          )}
        </div>

        {/* Divider */}
        <hr className="border-surface-border" />

        {/* ── Transcript section ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />
            <h3 className="font-ui text-xs font-semibold text-ink-secondary uppercase tracking-wide">
              Transcript
            </h3>
            {(isAnalyzed || isCompleted) && (
              <span className="ml-auto font-ui text-[10px] text-sage-primary/80 bg-sage-primary/10 rounded-full px-2 py-0.5">
                Complete
              </span>
            )}
            {isProcessing && (
              <span className="ml-auto flex items-center gap-1 font-ui text-[10px] text-amber-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                Transcribing
              </span>
            )}
          </div>
          <div
            className="
              rounded-xl border border-surface-border bg-surface-container
              px-4 py-5 overflow-y-auto
              font-ui text-sm text-ink leading-relaxed
            "
            style={{ minHeight: '10rem', maxHeight: '24rem' }}
          >
            {(isAnalyzed || isCompleted) && analysis?.transcriptText ? (
              <p className="whitespace-pre-wrap">{analysis.transcriptText}</p>
            ) : isProcessing || isQueued ? (
              <div className="space-y-2 pt-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-3 rounded skeleton ${i === 4 ? 'w-2/3' : 'w-full'}`} />
                ))}
              </div>
            ) : (
              <p className="font-editorial italic text-center mt-6 select-none text-ink-muted">
                {isError ? 'Transcription failed.' : 'Transcription pending…'}
              </p>
            )}
          </div>
        </section>

        {/* ── Intelligence Brief section ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-sage-primary/70" strokeWidth={1.5} />
            <h3 className="font-ui text-xs font-semibold text-sage-primary/80 uppercase tracking-wide">
              Intelligence Brief
            </h3>
          </div>
          <div
            className="
              rounded-xl border border-sage-primary/20 bg-sage-primary/[0.04]
              px-4 py-5 min-h-[10rem]
              font-ui text-sm text-ink-muted leading-relaxed
            "
          >
            {isAnalyzed && analysis?.analysisResult ? (
              <div className="
                text-ink 
                [&>h1]:font-editorial [&>h1]:text-lg [&>h1]:font-semibold [&>h1]:mb-2
                [&>h2]:font-editorial [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mb-2 [&>h2]:mt-4
                [&>h3]:font-ui [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mb-2
                [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mb-3 [&>ul>li]:mb-1
                [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:mb-3 [&>ol>li]:mb-1
                [&>p]:mb-3
                [&>strong]:font-semibold
              ">
                <ReactMarkdown>{analysis.analysisResult}</ReactMarkdown>
              </div>
            ) : isCompleted ? (
              <p className="font-editorial italic text-center mt-6 select-none animate-pulse text-sage-primary/80">
                Generating editorial brief…
              </p>
            ) : (
              <p className="font-editorial italic text-center mt-6 select-none">
                AI Analysis pending…
              </p>
            )}
          </div>
        </section>

        {/* Bottom breathing room */}
        <div className="h-4" />
      </div>
    </div>
  )
}

// ── Sage audio player ─────────────────────────────────────────────────────────
function SageAudioPlayer({ src, title }) {
  const audioRef  = useRef(null)
  const [playing,     setPlaying]     = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration,    setDuration]    = useState(0)

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) audio.pause()
    else audio.play().catch(() => {})
    setPlaying(!playing)
  }

  function handleTimeUpdate() {
    setCurrentTime(audioRef.current?.currentTime ?? 0)
  }

  function handleLoadedMetadata() {
    setDuration(audioRef.current?.duration ?? 0)
  }

  function handleSeek(e) {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    if (audioRef.current) {
      audioRef.current.currentTime = pct * duration
      setCurrentTime(pct * duration)
    }
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="rounded-xl border border-surface-border bg-surface-container p-4">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
        preload="metadata"
      />

      <div className="flex items-center gap-4">
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-full bg-sage-primary text-surface-cream
            hover:bg-sage-deep active:scale-95
            transition-all duration-150 shadow-sm
          "
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing
            ? <Pause  className="h-4 w-4" strokeWidth={2} />
            : <Play   className="h-4 w-4 ml-0.5" strokeWidth={2} />
          }
        </button>

        <div className="flex-1 min-w-0">
          {/* Episode label */}
          <p
            className="font-ui text-[11px] text-ink-muted mb-2 truncate"
            title={title}
          >
            {title}
          </p>

          {/* Progress bar */}
          <div
            className="relative h-1.5 rounded-full bg-surface-border cursor-pointer group"
            onClick={handleSeek}
            role="slider"
            aria-label="Seek"
            aria-valuenow={Math.round(currentTime)}
            aria-valuemax={Math.round(duration)}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-sage-primary transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            {/* Scrubber thumb */}
            <div
              className="
                absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full
                bg-sage-primary border-2 border-surface-cream shadow
                opacity-0 group-hover:opacity-100 transition-opacity duration-150
              "
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>

          {/* Times */}
          <div className="flex justify-between mt-1.5">
            <span className="font-ui text-[10px] text-ink-muted tabular-nums">
              {formatTime(currentTime)}
            </span>
            <span className="font-ui text-[10px] text-ink-muted tabular-nums">
              {duration ? formatTime(duration) : '—:——'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Episode list row ──────────────────────────────────────────────────────────
function EpisodeRow({ episode, onReview, hasAnalysis = false }) {
  const { uuid, name, datePublished, audioUrl } = episode

  return (
    <li
      id={`episode-row-${uuid}`}
      className="flex items-start gap-4 py-4 border-b border-surface-border/50 last:border-b-0"
    >
      <div className="flex-1 min-w-0">
        <h3
          className="font-editorial text-sm font-medium text-ink leading-snug"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {name ?? 'Untitled Episode'}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          {datePublished && (
            <span className="font-ui text-[11px] text-ink-muted">
              {formatPublishedDate(datePublished)}
            </span>
          )}
          {audioUrl && (
            <>
              <span className="text-surface-border text-xs">·</span>
              <span className="font-ui text-[11px] text-sage-primary/70 flex items-center gap-1">
                <Play className="h-2.5 w-2.5" strokeWidth={2} />
                Audio available
              </span>
            </>
          )}
          {hasAnalysis && (
            <>
              <span className="text-surface-border text-xs">·</span>
              <span className="font-ui text-[11px] text-sage-primary flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                Brief ready
              </span>
            </>
          )}
        </div>
      </div>

      {/* Review Episode — opens Analysis View */}
      <button
        id={`btn-review-${uuid}`}
        onClick={onReview}
        className="
          shrink-0 inline-flex items-center gap-1.5 rounded-lg
          bg-surface-container px-3 py-1.5
          font-ui text-xs font-medium text-ink-secondary
          hover:bg-sage-primary/10 hover:text-sage-primary
          transition-all duration-150 border border-surface-border
        "
        aria-label={`Review episode: ${name}`}
      >
        <Headphones className="h-3 w-3" strokeWidth={2} />
        Review Episode
      </button>
    </li>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function EpisodeSkeletons() {
  return (
    <div className="px-6 py-4 space-y-4" role="status" aria-label="Loading episodes…">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex items-start gap-3 py-3 border-b border-surface-border/50">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-4/5 rounded skeleton" />
            <div className="h-3 w-1/3 rounded skeleton" />
          </div>
          <div className="h-7 w-28 rounded-lg skeleton shrink-0" />
        </div>
      ))}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPublishedDate(raw) {
  if (!raw) return ''
  const ts = typeof raw === 'number' ? raw * 1000 : Date.parse(raw)
  if (isNaN(ts)) return String(raw)
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  })
}

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
