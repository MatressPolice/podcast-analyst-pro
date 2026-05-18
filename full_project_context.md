File Path: src/App.jsx

```
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import LibraryPage from './pages/LibraryPage'
import DiscoverPage from './pages/DiscoverPage'
import ArchivePage from './pages/ArchivePage'
import SettingsPage from './pages/SettingsPage'
import { SavedPage } from './pages/StubPages'

// â”€â”€ Auth-aware route guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ App with router & auth provider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
``n
File Path: src/index.css

```
@tailwind base;
@tailwind components;
@tailwind utilities;

/* â”€â”€â”€ Base resets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
@layer base {
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-surface-cream text-ink font-ui;
  }

  h1, h2, h3, h4 {
    @apply font-editorial;
  }

  /* Subtle custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-surface-container;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-surface-border rounded-full;
  }
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-ink-muted;
  }
}

/* â”€â”€â”€ Component layer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
@layer components {
  /* UI label style: Work Sans, all-caps, tracked */
  .label-ui {
    @apply font-ui text-xs font-medium uppercase tracking-ui text-ink-muted;
  }

  /* Editorial eyebrow above headings */
  .eyebrow {
    @apply label-ui mb-1;
  }

  /* Tonal card â€” no border, subtle bg shift */
  .card-tonal {
    @apply bg-surface-container rounded-lg p-4 transition-shadow duration-200 hover:shadow-sm;
  }

  /* Primary action button */
  .btn-primary {
    @apply inline-flex items-center gap-2 rounded-lg bg-sage-primary px-4 py-2
           font-ui text-sm font-medium text-white tracking-ui
           transition-all duration-200 hover:bg-sage-deep active:scale-[0.98];
  }

  /* Ghost / outline button */
  .btn-ghost {
    @apply inline-flex items-center gap-2 rounded-lg px-4 py-2
           font-ui text-sm font-medium text-ink-secondary
           transition-all duration-200 hover:bg-surface-container active:scale-[0.98];
  }

  /* Sidebar nav item */
  .nav-item {
    @apply flex items-center gap-3 rounded-lg px-3 py-2.5
           font-ui text-sm font-medium text-ink-secondary
           transition-all duration-150 cursor-pointer
           hover:bg-surface-container hover:text-ink;
  }

  .nav-item.active {
    @apply bg-sage-primary/10 text-sage-primary;
  }

  /* Shimmer skeleton â€” used by SkeletonCard */
  .skeleton {
    @apply bg-surface-border;
    background-image: linear-gradient(
      90deg,
      theme('colors.surface.border') 0%,
      theme('colors.surface.container') 50%,
      theme('colors.surface.border') 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }
}

/* Keyframe lives outside @layer so it isn't purged */
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

.episode-panel {
  animation: slide-in-right 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

/* View transition inside the panel: subtle rightward fade on enter */
@keyframes panel-view-enter {
  from { opacity: 0; transform: translateX(10px); }
  to   { opacity: 1; transform: translateX(0);    }
}

.panel-view {
  animation: panel-view-enter 0.18s ease-out;
}
``n
File Path: src/main.jsx

```
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { db } from './lib/firebase.js'

// â”€â”€ Connection test (F12 console) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Confirms the Firebase SDK initialised and the Firestore handle is live.
// You should see: Firebase Init Success: true
console.log('Firebase Init Success:', !!db)
console.log('Firestore project:', db.app.options.projectId)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
``n
File Path: src/components/AppShell.jsx

```
import Sidebar from './Sidebar'

/**
 * AppShell â€” fixed scaffold layout.
 * Left: 256px fixed sidebar. Right: scrollable main content.
 * Matches the "Fixed Scaffold" spec in branding.md Â§3.
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
``n
File Path: src/components/EpisodePanel.jsx

```
import { useEffect, useRef, useState } from 'react'
import {
  X, WifiOff, Play, Pause, Headphones,
  ArrowLeft, Sparkles, FileText, Brain, Loader2, CheckCircle2,
} from 'lucide-react'
import { usePodcastEpisodes } from '../hooks/usePodcastEpisodes'
import { useAnalysis }        from '../hooks/useAnalysis'
import ReactMarkdown          from 'react-markdown'

// â”€â”€ Main panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

      {/* â”€â”€ Slide-in panel â€” 50 % desk space â”€â”€ */}
      <div
        className="episode-panel relative flex flex-col bg-surface-cream shadow-2xl overflow-hidden"
        style={{ width: '50%', minWidth: '400px', maxWidth: '800px' }}
      >

        {/* Close button â€” always visible */}
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

        {/* â”€â”€ View area: keyed so React remounts on switch, triggering CSS enter â”€â”€ */}
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

// â”€â”€ Episode list view â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Analysis view â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Derived UI state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const isQueued     = status === 'queued'
  const isProcessing = status === 'processing'
  const isCompleted  = status === 'completed'
  const isAnalyzed   = status === 'analyzed'
  const isError      = status === 'error'
  const inFlight     = isQueued || isProcessing || isCompleted
  const noAudio      = !audioUrl

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* â”€â”€ Analysis header â”€â”€ */}
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

        {/* Episode title â€” Newsreader */}
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

        {/* Date â€” Work Sans */}
        {datePublished && (
          <p className="font-ui text-xs text-ink-muted mt-1.5">
            {formatPublishedDate(datePublished)}
          </p>
        )}
      </div>

      {/* â”€â”€ Scrollable analysis body â”€â”€ */}
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
            {isQueued     && 'Analysis Queuedâ€¦'}
            {isProcessing && 'Transcribingâ€¦'}
            {isCompleted  && 'Analyzing Contextâ€¦'}
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
              Transcribing audio â€” this may take a few minutesâ€¦
            </p>
          )}
          {isCompleted && (
            <p className="font-ui text-[11px] text-sage-primary/80 mt-2 text-center animate-pulse">
              Generating critical intelligence briefâ€¦
            </p>
          )}
        </div>

        {/* Divider */}
        <hr className="border-surface-border" />

        {/* â”€â”€ Transcript section â”€â”€ */}
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
                {isError ? 'Transcription failed.' : 'Transcription pendingâ€¦'}
              </p>
            )}
          </div>
        </section>

        {/* â”€â”€ Intelligence Brief section â”€â”€ */}
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
                Generating editorial briefâ€¦
              </p>
            ) : (
              <p className="font-editorial italic text-center mt-6 select-none">
                AI Analysis pendingâ€¦
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

// â”€â”€ Sage audio player â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
              {duration ? formatTime(duration) : 'â€”:â€”â€”'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// â”€â”€ Episode list row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
              <span className="text-surface-border text-xs">Â·</span>
              <span className="font-ui text-[11px] text-sage-primary/70 flex items-center gap-1">
                <Play className="h-2.5 w-2.5" strokeWidth={2} />
                Audio available
              </span>
            </>
          )}
          {hasAnalysis && (
            <>
              <span className="text-surface-border text-xs">Â·</span>
              <span className="font-ui text-[11px] text-sage-primary flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                Brief ready
              </span>
            </>
          )}
        </div>
      </div>

      {/* Review Episode â€” opens Analysis View */}
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

// â”€â”€ Skeleton loader â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EpisodeSkeletons() {
  return (
    <div className="px-6 py-4 space-y-4" role="status" aria-label="Loading episodesâ€¦">
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

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
``n
File Path: src/components/Header.jsx

```
// Minimalist top header â€” branding label + page slot
export default function Header({ title, actions }) {
  return (
    <header
      className="
        sticky top-0 z-20 flex h-14 items-center justify-between
        border-b border-surface-border bg-surface-cream/80
        backdrop-blur-sm px-8
      "
    >
      <h1 className="font-editorial text-xl font-medium text-ink">
        {title}
      </h1>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  )
}
``n
File Path: src/components/Sidebar.jsx

```
import { NavLink } from 'react-router-dom'
import {
  Mic2, Library, Search, BookMarked, Settings, LogOut, Archive,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/',          icon: Library,    label: 'Library'  },
  { to: '/discover',  icon: Search,     label: 'Discover' },
  { to: '/archive',   icon: Archive,    label: 'Archive'  },
  { to: '/settings',  icon: Settings,   label: 'Settings' },
]

export default function Sidebar() {
  const { user, logOut } = useAuth()

  return (
    <aside
      className="
        fixed inset-y-0 left-0 z-30 flex w-64 flex-col
        bg-surface-container
      "
      aria-label="Primary navigation"
    >
      {/* â”€â”€ Branding â”€â”€ */}
      <div className="flex items-center gap-2.5 px-5 py-6 border-b border-surface-border">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-primary"
          aria-hidden="true"
        >
          <Mic2 className="h-5 w-5 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-editorial text-base font-semibold text-ink leading-tight">
            Podcast Analyst
          </p>
          <p className="label-ui" style={{ marginTop: '1px' }}>Pro</p>
        </div>
      </div>

      {/* â”€â”€ Navigation â”€â”€ */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
        <p className="eyebrow px-3 mb-3">Workspace</p>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* â”€â”€ User footer â”€â”€ */}
      {user && (
        <div className="border-t border-surface-border px-3 py-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName ?? 'User'}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sage-muted text-white text-xs font-medium">
                {(user.displayName ?? 'U')[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">
                {user.displayName ?? 'Analyst'}
              </p>
              <p className="label-ui truncate" style={{ marginTop: '1px' }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={logOut}
              className="text-ink-muted hover:text-ink transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
``n
File Path: src/components/SkeletonCard.jsx

```
// Shimmer skeleton â€” mirrors PodcastResultCard proportions exactly
// Uses a CSS keyframe animation defined in index.css

/**
 * Single shimmer placeholder card.
 * Render an array of these while status === 'loading'.
 */
export default function SkeletonCard() {
  return (
    <div
      className="card-tonal flex gap-4 items-start"
      aria-hidden="true"
    >
      {/* Artwork placeholder */}
      <div className="h-20 w-20 shrink-0 rounded-[4px] skeleton" />

      {/* Text lines */}
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 w-3/4 rounded skeleton" />
        <div className="h-3 w-1/2 rounded skeleton" />
        <div className="h-3 w-full rounded skeleton" />
        <div className="h-3 w-5/6 rounded skeleton" />
      </div>
    </div>
  )
}

/** Renders `count` skeleton cards */
export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
``n
File Path: src/contexts/AuthContext.jsx

```
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { isAuthorizedUser } from '../lib/authGuard'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [authorized, setAuthorized] = useState(false)

  // Track whether getRedirectResult has resolved yet.
  // onAuthStateChanged fires immediately with null before Firebase finishes
  // processing the redirect â€” this gate stops that null from clearing loading.
  const redirectSettled = useRef(false)
  const authStateSettled = useRef(false)

  const evaluateLoading = () => {
    if (redirectSettled.current && authStateSettled.current) {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 1. Resolve any pending redirect first
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('[Auth] Redirect resolved for:', result.user?.uid)
        }
      })
      .catch((err) => {
        console.error('[Auth] Redirect result error:', err)
      })
      .finally(() => {
        redirectSettled.current = true
        evaluateLoading()
      })

    // 2. Keep auth state in sync for the session lifetime
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setAuthorized(isAuthorizedUser(firebaseUser))

      authStateSettled.current = true
      evaluateLoading()
    })

    return unsubscribe
  }, [])

  const signIn = () => signInWithRedirect(auth, googleProvider)
  const logOut = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, authorized, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
``n
File Path: src/hooks/useAnalysis.js

```
import { useEffect, useRef, useState } from 'react'
import { createAnalysis, updateAnalysis, listenToAnalysis, getActivePrompt, writeLog } from '../lib/firestore'
import { submitTranscription, pollTranscription } from '../lib/assemblyai'
import { generateIntelligenceBrief } from '../lib/gemini'

/**
 * Task 4.1 â€” Analysis orchestration hook.
 *
 * Manages the full lifecycle of an episode analysis:
 *   queued â†’ processing â†’ completed | error
 *
 * Key design:
 * â€¢ A real-time Firestore listener drives all UI state â€” the hook never derives
 *   status from local variables, so closing/reopening the panel resumes correctly.
 * â€¢ Polling auto-resumes if the panel reopens while status is 'processing'.
 * â€¢ AbortController cancels the in-flight poll on unmount / episode change.
 *
 * @param {string|null} episodeUuid
 * @param {string|null} uid
 */
export function useAnalysis(episodeUuid, uid) {
  const [analysis, setAnalysis] = useState(null)
  const isPollingRef  = useRef(false)
  const abortCtrlRef  = useRef(null)
  const geminiRef     = useRef(false)

  // â”€â”€ Real-time Firestore listener â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!episodeUuid || !uid) {
      setAnalysis(null)
      return
    }
    const unsubscribe = listenToAnalysis(uid, episodeUuid, setAnalysis)
    return unsubscribe
  }, [episodeUuid, uid])

  // â”€â”€ Auto-resume polling when status is 'processing' â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Runs whenever assemblyJobId appears or changes. Guards against double-start.
  useEffect(() => {
    if (
      analysis?.status !== 'processing' ||
      !analysis?.assemblyJobId          ||
      isPollingRef.current
    ) return

    const controller = new AbortController()
    abortCtrlRef.current  = controller
    isPollingRef.current  = true

    pollTranscription(analysis.assemblyJobId, controller.signal)
      .then(async (text) => {
        if (!controller.signal.aborted) {
          await updateAnalysis(uid, episodeUuid, {
            status:         'completed',
            transcriptText: text,
          })
        }
      })
      .catch(async (err) => {
        if (!controller.signal.aborted) {
          console.error('[Analysis] Poll failed:', err)
          writeLog(uid, 'AssemblyAI', err.message)
          await updateAnalysis(uid, episodeUuid, {
            status: 'error',
            error:  err.message,
          })
        }
      })
      .finally(() => {
        isPollingRef.current = false
      })

    return () => {
      controller.abort()
      isPollingRef.current = false
    }
  }, [analysis?.assemblyJobId, analysis?.status, uid, episodeUuid])

  // â”€â”€ Auto-resume Gemini when transcript is completed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (
      analysis?.status !== 'completed' ||
      !analysis?.transcriptText ||
      geminiRef.current
    ) return

    geminiRef.current = true

    // Fetch the user's active prompt first, with graceful fallback to Editorial Sage
    getActivePrompt(uid)
      .then((systemPrompt) => generateIntelligenceBrief(analysis.transcriptText, systemPrompt))
      .then(async (brief) => {
        await updateAnalysis(uid, episodeUuid, {
          status: 'analyzed',
          analysisResult: brief,
        })
      })
      .catch(async (err) => {
        console.error('[Gemini] Analysis failed:', err)
        writeLog(uid, 'Gemini', err.message)
        // Keep state machine simple â€” go to error so user can retry.
        await updateAnalysis(uid, episodeUuid, {
          status: 'error',
          error:  `AI Analysis failed: ${err.message}`,
        })
      })
      .finally(() => {
        geminiRef.current = false
      })
  }, [analysis?.status, analysis?.transcriptText, uid, episodeUuid])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortCtrlRef.current?.abort()
    }
  }, [])

  // â”€â”€ Begin Analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /**
   * Called when the user clicks "Begin Analysis".
   * Idempotent: no-ops if already queued or processing.
   *
   * @param {string} audioUrl
   * @param {string} episodeName
   * @param {string} podcastUuid
   * @param {string} podcastName
   * @param {string} podcastImageUrl
   * @param {number} episodeReleaseDate
   */
  async function beginAnalysis(audioUrl, episodeName, podcastUuid, podcastName, podcastImageUrl, episodeReleaseDate) {
    // Guard: don't restart if already in-flight
    if (analysis?.status === 'queued' || analysis?.status === 'processing') return

    try {
      // 1. Create/reset the Firestore doc â†’ status: 'queued'
      await createAnalysis(uid, episodeUuid, {
        episodeName,
        podcastUuid,
        podcastName: podcastName ?? 'Unknown Podcast',
        podcastImageUrl: podcastImageUrl ?? '',
        episodeReleaseDate: episodeReleaseDate ?? 0,
        audioUrl,
        status: 'queued',
      })

      // 2. Submit to AssemblyAI
      const jobId = await submitTranscription(audioUrl)

      // 3. Update to 'processing' with the job ID so auto-resume can pick it up
      await updateAnalysis(uid, episodeUuid, {
        status:        'processing',
        assemblyJobId: jobId,
      })

      // Polling starts automatically via the useEffect above
    } catch (err) {
      console.error('[Analysis] Begin failed:', err)
      writeLog(uid, 'AssemblyAI', `Begin failed: ${err.message}`)
      await updateAnalysis(uid, episodeUuid, {
        status: 'error',
        error:  err.message,
      }).catch(() => {}) // best-effort â€” original error is more important
    }
  }

  return { analysis, beginAnalysis }
}
``n
File Path: src/hooks/usePodcastEpisodes.js

```
import { useState, useEffect } from 'react'
import { getPodcastSeries } from '../lib/taddy'

/**
 * Fetches a podcast series + its recent episodes from Taddy.
 * Cancels any in-flight request if the uuid changes.
 *
 * @param {string|null} podcastUuid
 * @returns {{ series, loading, error }}
 *   series: { uuid, name, description, imageUrl, episodes[] } | null
 */
export function usePodcastEpisodes(podcastUuid) {
  const [series,  setSeries]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!podcastUuid) {
      setSeries(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setSeries(null)

    async function fetchSeries() {
      try {
        const result = await getPodcastSeries(podcastUuid)
        if (!cancelled) setSeries(result)
      } catch (err) {
        if (!cancelled) {
          console.error('[Taddy] Episode fetch failed:', err)
          setError(err.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSeries()
    return () => { cancelled = true }
  }, [podcastUuid])

  return { series, loading, error }
}
``n
File Path: src/hooks/usePodcastSearch.js

```
import { useState, useEffect, useRef } from 'react'
import { searchPodcasts } from '../lib/taddy'

const DEBOUNCE_MS = 400  // wait for user to stop typing before firing

/**
 * Debounced podcast search hook.
 *
 * @param {string} query - Live search string from the input
 * @returns {{ results, status, error }}
 *   status: 'idle' | 'loading' | 'success' | 'error'
 */
export function usePodcastSearch(query) {
  const [results, setResults] = useState([])
  const [status,  setStatus]  = useState('idle')   // idle | loading | success | error
  const [error,   setError]   = useState(null)

  // AbortController ref â€” cancels in-flight requests when query changes
  const abortRef = useRef(null)

  useEffect(() => {
    const trimmed = query.trim()

    if (!trimmed) {
      setResults([])
      setStatus('idle')
      setError(null)
      return
    }

    // Debounce timer
    const timer = setTimeout(async () => {
      // Cancel any in-flight request
      abortRef.current?.abort()

      setStatus('loading')
      setError(null)

      try {
        const data = await searchPodcasts(trimmed)
        setResults(data)
        setStatus('success')
      } catch (err) {
        if (err.name === 'AbortError') return  // intentional cancel â€” ignore
        console.error('[Taddy] Search failed:', err)
        setError(err.message)
        setStatus('error')
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query])

  return { results, status, error }
}
``n
File Path: src/hooks/useSubscriptions.js

```
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { listenToSubscriptions } from '../lib/firestore'

/**
 * Real-time Firestore subscription hook.
 *
 * Returns:
 *  - subscriptions: Array of podcast objects (sorted newest-first)
 *  - subscribedIds: Set<string> of uuid values for O(1) membership checks
 *  - loading: true until the first snapshot arrives
 */
export function useSubscriptions() {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setSubscriptions([])
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribe = listenToSubscriptions(user.uid, (data) => {
      setSubscriptions(data)
      setLoading(false)
    })

    return unsubscribe   // clean up listener on unmount / uid change
  }, [user?.uid])

  // Memoised Set for O(1) "is this podcast already saved?" checks
  const subscribedIds = useMemo(
    () => new Set(subscriptions.map((p) => p.uuid)),
    [subscriptions]
  )

  return { subscriptions, subscribedIds, loading }
}
``n
File Path: src/lib/assemblyai.js

```
// AssemblyAI transcription client â€” Task 4.1
// Docs: https://www.assemblyai.com/docs/api-reference
const BASE_URL = 'https://api.assemblyai.com/v2'

function headers() {
  return {
    'Authorization': import.meta.env.VITE_ASSEMBLY_AI_API_KEY,
    'Content-Type':  'application/json',
  }
}

/**
 * Submit an audio URL to AssemblyAI for transcription.
 * @param {string} audioUrl - Public audio stream URL
 * @returns {Promise<string>} The AssemblyAI transcript ID
 */
export async function submitTranscription(audioUrl) {
  const res = await fetch(`${BASE_URL}/transcript`, {
    method:  'POST',
    headers: headers(),
    body:    JSON.stringify({
      audio_url:          audioUrl,
      language_detection: true,   // auto-detect podcast language
      speech_models:      ['universal-3-pro'],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`AssemblyAI submit failed (${res.status}): ${body}`)
  }

  const json = await res.json()
  if (!json.id) throw new Error('AssemblyAI did not return a transcript ID')
  return json.id
}

/**
 * Poll an AssemblyAI transcript until it is completed or errors out.
 * Uses recursive setTimeout so the caller can abort via AbortSignal.
 *
 * @param {string} jobId          - AssemblyAI transcript ID
 * @param {AbortSignal} [signal]  - Optional abort signal for cleanup
 * @returns {Promise<string>}     - The completed transcript text
 */
export async function pollTranscription(jobId, signal) {
  const POLL_INTERVAL_MS = 5_000  // 5 s between polls
  const MAX_POLLS        = 120    // max 10 min before timing out

  for (let i = 0; i < MAX_POLLS; i++) {
    // Honour cancellation before each sleep and after
    if (signal?.aborted) throw new DOMException('Polling aborted', 'AbortError')

    await sleep(POLL_INTERVAL_MS)

    if (signal?.aborted) throw new DOMException('Polling aborted', 'AbortError')

    const res = await fetch(`${BASE_URL}/transcript/${jobId}`, {
      headers: headers(),
    })

    if (!res.ok) {
      throw new Error(`AssemblyAI poll failed (${res.status})`)
    }

    const json = await res.json()

    if (json.status === 'completed') {
      return json.text ?? ''
    }

    if (json.status === 'error') {
      throw new Error(json.error ?? 'AssemblyAI transcription error')
    }

    // 'queued' or 'processing' â€” keep polling
  }

  throw new Error('Transcription timed out after 10 minutes')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
``n
File Path: src/lib/authGuard.js

```
// "Only-Me" gatekeeper â€” plan.md Â§2.2
// The authorized owner is identified by their Firebase UID.
// This UID corresponds to nssm\mikes when signed in via Google.
export const AUTHORIZED_EMAILS = import.meta.env.VITE_AUTHORIZED_EMAILS

/**
 * Returns true only if the given Firebase user is in the authorized email whitelist.
 * All protected routes must run this check before rendering.
 */
export function isAuthorizedUser(user) {
  if (!user || !user.email) return false

  const emailsRaw = import.meta.env.VITE_AUTHORIZED_EMAILS || ''
  const allowedEmails = emailsRaw.split(',').map(e => e.trim().toLowerCase())
  
  return allowedEmails.includes(user.email.toLowerCase())
}
``n
File Path: src/lib/firebase.js

```
// Firebase SDK configuration â€” values sourced from .env (never hard-coded)
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

// Explicitly target the (default) database.
// Omitting the second argument is equivalent, but being explicit avoids
// any confusion if a named database is added later.
export const auth           = getAuth(app)
export const db             = getFirestore(app, '(default)')
export const googleProvider = new GoogleAuthProvider()
``n
File Path: src/lib/firestore.js

```
// Firestore helpers â€” Task 2.4 (subscriptions) + Task 4.1 (analyses) + Task 5.2 (prompts) + Task 5.3 (logs)
// Subscription path: artifacts/{appId}/users/{uid}/subscriptions/{podcastUuid}
// Analysis path:     artifacts/{appId}/users/{uid}/analyses/{episodeUuid}
// Prompt path:       artifacts/{appId}/users/{uid}/prompts/{promptId}
// Log path:          artifacts/{appId}/users/{uid}/logs/{logId}
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  where,
  limit,
} from 'firebase/firestore'
import { db } from './firebase'

// We use the project ID to maintain clean URLs for the unified "artifacts" root
const APP_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'podcast-analyst-pro'

// â”€â”€ Editorial Sage â€” the built-in fallback prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const DEFAULT_PROMPT = {
  name: 'Editorial Sage',
  text: `You are Sage, a critical analyst. Evaluate this transcript for weak logic, lazy assumptions, or unearned conclusions. Provide two distinct sections: "Key Takeaways" and "Critical Gaps". Keep the tone sharp, professional, and intellectually rigorous.`,
  isActive: true,
}

/**
 * Returns a reference to the user's subscriptions sub-collection.
 * @param {string} uid - Firebase Auth UID
 */
function subscriptionsRef(uid) {
  return collection(db, 'artifacts', APP_ID, 'users', uid, 'subscriptions')
}

/**
 * Add a podcast to the user's Firestore subscription library.
 * Uses the podcast uuid as the document ID so re-adds are idempotent.
 *
 * @param {string} uid
 * @param {{ uuid, name, description, imageUrl, itunesId }} podcast
 */
export async function addSubscription(uid, podcast) {
  const ref = doc(subscriptionsRef(uid), podcast.uuid)
  await setDoc(ref, {
    uuid: podcast.uuid,
    name: podcast.name,
    description: podcast.description ?? '',
    imageUrl: podcast.imageUrl ?? '',
    itunesId: podcast.itunesId ?? null,
    addedAt: serverTimestamp(),
  })
}

/**
 * Remove a podcast from the user's subscription library.
 *
 * @param {string} uid
 * @param {string} podcastUuid
 */
export async function removeSubscription(uid, podcastUuid) {
  const ref = doc(subscriptionsRef(uid), podcastUuid)
  await deleteDoc(ref)
}

/**
 * Subscribe to real-time updates on the user's subscription list.
 * Returns an unsubscribe function â€” call it on component unmount.
 *
 * @param {string} uid
 * @param {(podcasts: Array) => void} callback
 * @returns {() => void} unsubscribe
 */
export function listenToSubscriptions(uid, callback) {
  const ref = subscriptionsRef(uid)
  return onSnapshot(
    ref,
    (snapshot) => {
      const podcasts = snapshot.docs.map((d) => d.data())
      // Sort newest-first by addedAt (Firestore Timestamp)
      podcasts.sort((a, b) => {
        const ta = a.addedAt?.seconds ?? 0
        const tb = b.addedAt?.seconds ?? 0
        return tb - ta
      })
      callback(podcasts)
    },
    (err) => {
      console.error('[Firestore] Subscription listener error:', err)
      callback([])
    }
  )
}

// â”€â”€ Analyses (Task 4.1) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Path: artifacts/{appId}/users/{uid}/analyses/{episodeUuid}
// Status lifecycle: queued â†’ processing â†’ completed | error

function analysisRef(uid, episodeUuid) {
  return doc(db, 'artifacts', APP_ID, 'users', uid, 'analyses', episodeUuid)
}

function analysesCollectionRef(uid) {
  return collection(db, 'artifacts', APP_ID, 'users', uid, 'analyses')
}

/**
 * Create or overwrite an analysis document for an episode.
 * Use setDoc so re-triggering analysis resets the document cleanly.
 */
export async function createAnalysis(uid, episodeUuid, fields) {
  await setDoc(analysisRef(uid, episodeUuid), {
    episodeUuid,
    ...fields,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Merge-update specific fields on an existing analysis document.
 */
export async function updateAnalysis(uid, episodeUuid, fields) {
  await updateDoc(analysisRef(uid, episodeUuid), {
    ...fields,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Permanently delete an analysis document.
 *
 * @param {string} uid
 * @param {string} episodeUuid
 */
export async function deleteAnalysis(uid, episodeUuid) {
  await deleteDoc(analysisRef(uid, episodeUuid))
}

/**
 * Real-time listener for a single analysis document.
 * Returns an unsubscribe function.
 *
 * @param {string}   uid
 * @param {string}   episodeUuid
 * @param {Function} callback â€” called with the doc data object, or null if missing
 * @returns {() => void} unsubscribe
 */
export function listenToAnalysis(uid, episodeUuid, callback) {
  return onSnapshot(
    analysisRef(uid, episodeUuid),
    (snap) => callback(snap.exists() ? snap.data() : null),
    (err) => {
      console.error('[Firestore] Analysis listener error:', err)
      callback(null)
    }
  )
}

/**
 * Real-time listener for ALL analysis documents for a specific user.
 * Ordered by creation date (newest first). Used mainly in the Archive page.
 * Returns an unsubscribe function.
 *
 * @param {string}   uid
 * @param {Function} callback â€” called with array of full analysis document objects
 * @returns {() => void} unsubscribe
 */
export function listenToAllAnalyses(uid, callback) {
  return onSnapshot(
    analysesCollectionRef(uid),
    (snapshot) => {
      const results = snapshot.docs.map((d) => d.data())
      results.sort((a, b) => {
        const ta = a.createdAt?.seconds ?? 0
        const tb = b.createdAt?.seconds ?? 0
        return tb - ta
      })
      callback(results)
    },
    (err) => {
      console.error('[Firestore] All Analyses listener error:', err)
      callback([])
    }
  )
}

// â”€â”€ Prompts (Task 5.2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Path: artifacts/{appId}/users/{uid}/prompts/{promptId}
// Hard limit of 3 prompts. Exactly one should have isActive === true.

function promptsRef(uid) {
  return collection(db, 'artifacts', APP_ID, 'users', uid, 'prompts')
}

/**
 * Real-time listener for the user's prompts collection.
 * Returns an unsubscribe function.
 *
 * @param {string}   uid
 * @param {Function} callback â€” called with array of prompt objects (each with .id)
 * @returns {() => void} unsubscribe
 */
export function listenToPrompts(uid, callback) {
  const ref = query(promptsRef(uid), orderBy('createdAt', 'asc'))
  return onSnapshot(
    ref,
    (snapshot) => {
      const prompts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(prompts)
    },
    (err) => {
      console.error('[Firestore] Prompts listener error:', err)
      callback([])
    }
  )
}

/**
 * Seed the prompts collection with the built-in Editorial Sage default.
 * Only called when the collection is empty.
 *
 * @param {string} uid
 */
export async function seedDefaultPrompt(uid) {
  await addDoc(promptsRef(uid), {
    ...DEFAULT_PROMPT,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Add a new prompt document (auto-generated ID).
 * Callers should enforce the 3-prompt limit before calling.
 *
 * @param {string} uid
 * @param {{ name: string, text: string, isActive: boolean }} prompt
 * @returns {string} new document ID
 */
export async function addPrompt(uid, prompt) {
  const ref = await addDoc(promptsRef(uid), {
    name: prompt.name,
    text: prompt.text,
    isActive: prompt.isActive ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/**
 * Update fields on an existing prompt document.
 *
 * @param {string} uid
 * @param {string} promptId
 * @param {object} fields
 */
export async function updatePrompt(uid, promptId, fields) {
  await updateDoc(doc(promptsRef(uid), promptId), {
    ...fields,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a prompt document.
 *
 * @param {string} uid
 * @param {string} promptId
 */
export async function deletePrompt(uid, promptId) {
  await deleteDoc(doc(promptsRef(uid), promptId))
}

/**
 * Set one prompt as active and deactivate all others.
 * Uses individual updateDoc calls (small collection, â‰¤3 docs).
 *
 * @param {string}   uid
 * @param {string}   activePromptId
 * @param {string[]} allPromptIds
 */
export async function setActivePrompt(uid, activePromptId, allPromptIds) {
  await Promise.all(
    allPromptIds.map((id) =>
      updateDoc(doc(promptsRef(uid), id), {
        isActive: id === activePromptId,
        updatedAt: serverTimestamp(),
      })
    )
  )
}

/**
 * Fetch the user's active prompt text for use in Gemini calls.
 *
 * Fallback chain:
 *   1. Prompt in the user's collection where isActive === true
 *   2. First prompt in the collection (if none are marked active)
 *   3. Built-in DEFAULT_PROMPT.text (if collection is empty or Firestore fails)
 *
 * @param {string} uid
 * @returns {Promise<string>} prompt text
 */
export async function getActivePrompt(uid) {
  try {
    // Try to find the explicitly active prompt first
    const activeQ = query(promptsRef(uid), where('isActive', '==', true), limit(1))
    const activeSnap = await getDocs(activeQ)

    if (!activeSnap.empty) {
      return activeSnap.docs[0].data().text
    }

    // No active prompt â€” try to return the first one in the collection
    const allQ = query(promptsRef(uid), orderBy('createdAt', 'asc'), limit(1))
    const allSnap = await getDocs(allQ)

    if (!allSnap.empty) {
      return allSnap.docs[0].data().text
    }

    // Empty collection â€” use the built-in default
    return DEFAULT_PROMPT.text
  } catch (err) {
    console.warn('[Firestore] getActivePrompt fallback to default:', err)
    return DEFAULT_PROMPT.text
  }
}

// â”€â”€ Error Logs (Task 5.3) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Path: artifacts/{appId}/users/{uid}/logs/{logId}
// module values: 'Taddy' | 'AssemblyAI' | 'Gemini'

function logsRef(uid) {
  return collection(db, 'artifacts', APP_ID, 'users', uid, 'logs')
}

/**
 * Write a single error log entry.
 *
 * @param {string} uid
 * @param {'Taddy'|'AssemblyAI'|'Gemini'} module
 * @param {string} message
 */
export async function writeLog(uid, module, message) {
  try {
    await addDoc(logsRef(uid), {
      module,
      message: String(message).slice(0, 2000), // cap length
      timestamp: serverTimestamp(),
    })
  } catch (err) {
    // Non-fatal â€” never let logging break the app
    console.warn('[Firestore] writeLog failed:', err)
  }
}

/**
 * Real-time listener for the user's error logs, newest-first.
 * Returns an unsubscribe function.
 *
 * @param {string}   uid
 * @param {Function} callback â€” called with array of log objects (each with .id)
 * @returns {() => void} unsubscribe
 */
export function listenToLogs(uid, callback) {
  const ref = query(logsRef(uid), orderBy('timestamp', 'desc'))
  return onSnapshot(
    ref,
    (snapshot) => {
      const logs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(logs)
    },
    (err) => {
      console.error('[Firestore] Logs listener error:', err)
      callback([])
    }
  )
}
``n
File Path: src/lib/gemini.js

```
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_AI_STUDIO_API_KEY,
  httpOptions: { apiVersion: 'v1beta' },
});

const FALLBACK_SYSTEM_PROMPT = `You are Sage, a critical analyst. Evaluate this transcript for weak logic, lazy assumptions, or unearned conclusions. Provide two distinct sections: "Key Takeaways" and "Critical Gaps". Keep the tone sharp, professional, and intellectually rigorous.`

/**
 * Generate an intelligence brief from a transcript.
 *
 * @param {string} transcriptText   - The full episode transcript.
 * @param {string} [systemPrompt]   - Optional system instructions from the user's
 *                                    active Prompt Laboratory selection. Falls back
 *                                    to the built-in Editorial Sage prompt.
 * @returns {Promise<string>} markdown-formatted brief
 */
export async function generateIntelligenceBrief(transcriptText, systemPrompt) {
  const instructions = systemPrompt?.trim() || FALLBACK_SYSTEM_PROMPT

  const prompt = `${instructions}

Transcript:
${transcriptText}
`;

  const modelId = 'gemini-3-flash-preview';
  console.log('Attempting Gemini call with:', modelId);

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
  });

  return response.text;
}
``n
File Path: src/lib/taddy.js

```
// Taddy GraphQL client â€” Task 2.3 / 3.1
// Docs: https://taddy.org/developers/podcast-api
const TADDY_ENDPOINT = 'https://api.taddy.org'

// â”€â”€ Shared fetch helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function taddyRequest(query, variables = {}) {
  const response = await fetch(TADDY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-USER-ID':    import.meta.env.VITE_TADDY_USER_ID,
      'X-API-KEY':    import.meta.env.VITE_TADDY_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Taddy responded with ${response.status}: ${response.statusText}`)
  }

  const json = await response.json()

  if (json.errors?.length) {
    throw new Error(json.errors[0].message ?? 'GraphQL error from Taddy')
  }

  return json.data
}

// â”€â”€ Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SEARCH_QUERY = `
  query SearchPodcasts($term: String!, $page: Int, $limitPerPage: Int) {
    searchForTerm(
      term: $term
      page: $page
      limitPerPage: $limitPerPage
      filterForTypes: PODCASTSERIES
    ) {
      searchId
      podcastSeries {
        uuid
        name
        description
        imageUrl
        itunesId
      }
    }
  }
`

/**
 * Search Taddy for podcast series matching the given term.
 * @param {string} term   - Search string
 * @param {number} limit  - Max results (default 20)
 * @returns {Promise<Array>} Array of podcast series objects
 */
export async function searchPodcasts(term, limit = 20) {
  const data = await taddyRequest(SEARCH_QUERY, { term, page: 1, limitPerPage: limit })
  return data?.searchForTerm?.podcastSeries ?? []
}

// â”€â”€ Episode Browser â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const GET_PODCAST_SERIES_QUERY = `
  query GetPodcastSeries($uuid: ID!, $limitPerPage: Int) {
    getPodcastSeries(uuid: $uuid) {
      uuid
      name
      description
      imageUrl
      episodes(page: 1, limitPerPage: $limitPerPage) {
        uuid
        name
        description
        datePublished
        audioUrl
      }
    }
  }
`

/**
 * Fetch a podcast series with its most recent episodes.
 * Episode `name` field maps to the episode title in the Taddy schema.
 *
 * @param {string} podcastUuid
 * @param {number} limit - Max episodes to return (default 25, Taddy hard cap)
 * @returns {Promise<object|null>} Series object with nested episodes array
 */
export async function getPodcastSeries(podcastUuid, limit = 25) {
  const data = await taddyRequest(GET_PODCAST_SERIES_QUERY, {
    uuid: podcastUuid,
    limitPerPage: limit,
  })
  return data?.getPodcastSeries ?? null
}
``n
File Path: src/pages/ArchivePage.jsx

```
import { useState, useEffect } from 'react'
import {
  Archive, Clock, Brain, Loader2, Headphones,
  ChevronDown, ChevronUp, FileText, Trash2, X, AlertTriangle,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { listenToAllAnalyses, deleteAnalysis } from '../lib/firestore'

export default function ArchivePage() {
  const { user } = useAuth()
  const [analyses, setAnalyses]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  // Deletion confirmation modal state
  const [confirmTarget, setConfirmTarget] = useState(null) // { episodeUuid, episodeName }
  const [deleting, setDeleting]           = useState(false)

  useEffect(() => {
    if (!user) return
    const unsubscribe = listenToAllAnalyses(user.uid, (data) => {
      setAnalyses(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  function handleToggle(episodeUuid) {
    setExpandedId((prev) => (prev === episodeUuid ? null : episodeUuid))
  }

  function requestDelete(analysis, e) {
    e.stopPropagation()
    setConfirmTarget({ episodeUuid: analysis.episodeUuid, episodeName: analysis.episodeName })
  }

  function cancelDelete() {
    if (deleting) return
    setConfirmTarget(null)
  }

  async function confirmDelete() {
    if (!confirmTarget || deleting) return
    setDeleting(true)
    try {
      await deleteAnalysis(user.uid, confirmTarget.episodeUuid)
      // Collapse if we just deleted the expanded card
      if (expandedId === confirmTarget.episodeUuid) setExpandedId(null)
    } catch (err) {
      console.error('[Archive] Delete failed:', err)
    } finally {
      setDeleting(false)
      setConfirmTarget(null)
    }
  }

  return (
    <AppShell>
      <Header title="Archive" />

      <div className="flex-1 px-8 py-8 space-y-8">
        <div>
          <p className="eyebrow">Intelligence History</p>
          <h2 className="font-editorial text-3xl text-ink mt-0.5">
            Your Generated Briefs
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-sage-primary" />
          </div>
        ) : analyses.length === 0 ? (
          <EmptyArchive />
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <ArchiveCard
                key={analysis.episodeUuid}
                analysis={analysis}
                isExpanded={expandedId === analysis.episodeUuid}
                onToggle={() => handleToggle(analysis.episodeUuid)}
                onDelete={(e) => requestDelete(analysis, e)}
              />
            ))}
          </div>
        )}
      </div>

      {/* â”€â”€ Delete confirmation modal â”€â”€ */}
      {confirmTarget && (
        <DeleteModal
          episodeName={confirmTarget.episodeName}
          deleting={deleting}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </AppShell>
  )
}

// â”€â”€ Delete confirmation modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DeleteModal({ episodeName, deleting, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm deletion"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[3px]"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-surface-cream border border-surface-border shadow-2xl p-6">
        {/* Close Ã— */}
        <button
          onClick={onCancel}
          disabled={deleting}
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-surface-container text-ink-muted hover:bg-surface-border hover:text-ink transition-all"
          aria-label="Cancel deletion"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>

        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" strokeWidth={1.5} />
        </div>

        {/* Copy */}
        <h3 className="font-editorial text-xl font-medium text-ink mb-1">
          Delete this Brief?
        </h3>
        <p className="font-ui text-sm text-ink-muted leading-relaxed mb-6">
          The Intelligence Brief for{' '}
          <span className="font-semibold text-ink">
            "{episodeName || 'this episode'}"
          </span>{' '}
          will be permanently removed. This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="
              flex-1 rounded-xl border border-surface-border bg-surface-container
              py-2.5 font-ui text-sm font-medium text-ink-secondary
              hover:bg-surface-border transition-colors duration-150
              disabled:opacity-50
            "
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="
              flex-1 rounded-xl bg-red-500 hover:bg-red-600
              py-2.5 font-ui text-sm font-medium text-white
              transition-colors duration-150 flex items-center justify-center gap-2
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            )}
            {deleting ? 'Deletingâ€¦' : 'Delete Brief'}
          </button>
        </div>
      </div>
    </div>
  )
}

// â”€â”€ Archive card with inline Intelligence Brief expansion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ArchiveCard({ analysis, isExpanded, onToggle, onDelete }) {
  const {
    podcastName,
    podcastImageUrl,
    episodeName,
    status,
    createdAt,
    episodeReleaseDate,
    analysisResult: briefText,  // the raw Intelligence Brief string written by Gemini
  } = analysis

  const isAnalyzed = status === 'analyzed'

  return (
    <article
      className={`
        rounded-2xl border bg-surface-container transition-all duration-200
        ${isExpanded
          ? 'border-sage-primary/40 shadow-md'
          : 'border-surface-border hover:border-sage-primary/20 hover:shadow-sm'
        }
      `}
    >
      {/* â”€â”€ Card header (always visible, click to expand) â”€â”€ */}
      <div className="flex items-start gap-4 p-5">
        {/* Expand toggle (left area + text) */}
        <button
          className="flex items-start gap-4 flex-1 text-left focus:outline-none min-w-0"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} brief for ${episodeName}`}
        >
          {/* Podcast thumbnail */}
          {podcastImageUrl ? (
            <img
              src={podcastImageUrl}
              alt={podcastName}
              loading="lazy"
              className="h-14 w-14 object-cover rounded shadow-sm shrink-0"
            />
          ) : (
            <div className="h-14 w-14 shrink-0 bg-surface-border rounded flex items-center justify-center">
              <Headphones className="h-5 w-5 text-ink-muted" strokeWidth={1} />
            </div>
          )}

          {/* Metadata */}
          <div className="flex-1 min-w-0">
            <p className="eyebrow truncate" title={podcastName}>
              {podcastName || 'Unknown Podcast'}
            </p>
            <h3
              className={`
                font-editorial text-base font-medium leading-snug mt-0.5 transition-colors
                ${isExpanded ? 'text-sage-primary' : 'text-ink'}
              `}
              title={episodeName}
            >
              {episodeName || 'Untitled Episode'}
            </h3>

            {/* Date row */}
            <div className="flex items-center gap-3 mt-2 font-ui text-xs text-ink-muted">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Analyzed {formatDate(createdAt)}
              </span>
              {episodeReleaseDate && (
                <span>Released {formatPublishedDate(episodeReleaseDate)}</span>
              )}
            </div>
          </div>
        </button>

        {/* Right: status badge + chevron + trash */}
        <div className="flex items-center gap-2 shrink-0 self-center">
          <StatusBadge status={status} />
          {isAnalyzed && (
            isExpanded
              ? <ChevronUp className="h-4 w-4 text-sage-primary" strokeWidth={2} />
              : <ChevronDown className="h-4 w-4 text-ink-muted" strokeWidth={2} />
          )}
          {/* Trash icon â€” separate from the expand toggle */}
          <button
            onClick={onDelete}
            className="
              ml-1 flex h-7 w-7 items-center justify-center rounded-full
              text-ink-muted hover:bg-red-50 hover:text-red-500
              transition-all duration-150
            "
            aria-label={`Delete Intelligence Brief for ${episodeName}`}
            title="Delete Brief"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* â”€â”€ Expanded: Intelligence Brief content â”€â”€ */}
      {isExpanded && isAnalyzed && (
        <div className="border-t border-surface-border/60 px-5 pb-6 pt-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-sage-primary" strokeWidth={1.5} />
            <p className="font-ui text-xs font-semibold text-ink-secondary uppercase tracking-wide">
              Intelligence Brief
            </p>
          </div>

          {briefText ? (
            <BriefContent text={briefText} />
          ) : (
            <p className="font-ui text-sm text-ink-muted italic">
              Brief content is unavailable for this entry.
            </p>
          )}
        </div>
      )}

      {/* Non-analyzed expansions (still processing / error) */}
      {isExpanded && !isAnalyzed && (
        <div className="border-t border-surface-border/60 px-5 pb-5 pt-4">
          <p className="font-ui text-sm text-ink-muted italic">
            {status === 'error'
              ? 'This analysis encountered an error. Brief unavailable.'
              : 'This episode is still being processed. Check back shortly.'}
          </p>
        </div>
      )}
    </article>
  )
}

// â”€â”€ Renders the raw brief text with basic markdown-ish formatting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function BriefContent({ text }) {
  // Split on double newlines for paragraphs; honour markdown headings & bullets
  const lines = text.split('\n')

  return (
    <div className="space-y-2 font-ui text-sm text-ink leading-relaxed max-w-3xl">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />

        // H1 / H2 headings
        if (line.startsWith('## ')) {
          return (
            <h4 key={i} className="font-editorial text-base font-semibold text-ink mt-4 mb-1">
              {line.replace(/^## /, '')}
            </h4>
          )
        }
        if (line.startsWith('# ')) {
          return (
            <h3 key={i} className="font-editorial text-lg font-semibold text-ink mt-5 mb-1">
              {line.replace(/^# /, '')}
            </h3>
          )
        }
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 ml-3">
              <span className="text-sage-primary mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-sage-primary" />
              <p>{line.replace(/^[-*] /, '')}</p>
            </div>
          )
        }
        // Bold inline (**text**)
        const boldified = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: boldified }} />
        )
      })}
    </div>
  )
}

// â”€â”€ Status badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatusBadge({ status }) {
  switch (status) {
    case 'queued':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-border px-2.5 py-1 font-ui text-[10px] font-medium text-ink-muted uppercase tracking-wide">
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
          Queued
        </span>
      )
    case 'processing':
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 font-ui text-[10px] font-medium text-amber-800 uppercase tracking-wide">
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
          {status === 'processing' ? 'Transcribing' : 'Generating Brief'}
        </span>
      )
    case 'analyzed':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-primary/10 px-2.5 py-1 font-ui text-[10px] font-medium text-sage-deep uppercase tracking-wide">
          <Brain className="h-2.5 w-2.5" />
          Intelligence Brief
        </span>
      )
    case 'error':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 font-ui text-[10px] font-medium text-red-800 uppercase tracking-wide">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Failed
        </span>
      )
    default:
      return null
  }
}

// â”€â”€ Empty state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EmptyArchive() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container mb-5">
        <Archive className="h-7 w-7 text-ink-muted" strokeWidth={1} />
      </div>
      <p className="font-editorial text-2xl italic text-ink-secondary">
        Your archive is empty.
      </p>
      <p className="mt-1 font-ui text-sm text-ink-muted max-w-xs">
        Intelligence Briefs you generate from your Library will appear here automatically.
      </p>
    </div>
  )
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function formatDate(timestamp) {
  if (!timestamp) return 'recently'
  const ts = timestamp.seconds ? timestamp.seconds * 1000 : timestamp
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatPublishedDate(raw) {
  if (!raw) return ''
  const ts = typeof raw === 'number' ? raw * 1000 : Date.parse(raw)
  if (isNaN(ts)) return String(raw)
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
``n
File Path: src/pages/DiscoverPage.jsx

```
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

        {/* â”€â”€ Hero search bar â”€â”€ */}
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
            placeholder="Search podcasts, topics, or peopleâ€¦"
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

        {/* â”€â”€ Result area â”€â”€ */}
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

// â”€â”€ Result area â€” handles all four states â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ResultArea({ query, results, status, error, subscribedIds, user }) {
  // Idle â€” no query entered yet
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

  // Loading â€” shimmer skeletons
  if (status === 'loading') {
    return (
      <div role="status" aria-label="Searchingâ€¦">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 rounded-full border-2 border-sage-primary border-t-transparent animate-spin" />
          <p className="label-ui">Searching Taddyâ€¦</p>
        </div>
        <SkeletonGrid count={6} />
      </div>
    )
  }

  // Error â€” localized, non-alarmist
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

  // Success â€” empty set
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

  // Success â€” results grid
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

// â”€â”€ Individual result card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// NOTE: `alreadySaved` is the single source of truth (from Firestore onSnapshot).
// Local `saving` tracks only the in-flight async state â€” never used to derive
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
      // Don't set any local "saved" state here â€” onSnapshot will flip
      // alreadySaved to true, giving us the canonical "In Library" status.
      setToast('added')
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      console.error('[Discover] Add failed:', err)
      setToast('error')
      setTimeout(() => setToast(null), 4000)
    } finally {
      // Always clear spinner â€” independent of Firestore timing
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
        {/* Title â€” Newsreader, 2-line clamp */}
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

        {/* Description â€” Work Sans, single line truncated */}
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
            {alreadySaved ? 'In Library' : saving ? 'Savingâ€¦' : 'Add to Library'}
          </button>

          {/* Inline toast â€” auto-dismisses */}
          {toast === 'added' && (
            <p className="font-ui text-[10px] text-sage-primary animate-pulse">
              âœ“ Added to your library
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
``n
File Path: src/pages/LibraryPage.jsx

```
import { useState, useEffect } from 'react'
import { Search, Plus, BookOpen, Loader2, Trash2 } from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import EpisodePanel from '../components/EpisodePanel'
import { useAuth } from '../contexts/AuthContext'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { removeSubscription, listenToAllAnalyses } from '../lib/firestore'
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
  const [analyzedUuids,    setAnalyzedUuids]    = useState(new Set()) // UUIDs with completed briefs

  // Handle Archive navigation to resume an episode panel
  useEffect(() => {
    if (location.state?.resumeAnalysis && location.state?.proxyPodcast) {
      setSelectedPodcast(location.state.proxyPodcast)
      setSelectedEpisode(location.state.resumeEpisode ?? null)
      
      // Clear state so a refresh doesn't keep popping it open
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, location.pathname])

  // Real-time listener: build a Set of analyzed episode UUIDs for green-check indicators
  useEffect(() => {
    if (!user) return
    const unsubscribe = listenToAllAnalyses(user.uid, (data) => {
      const uuids = new Set(
        data.filter((a) => a.status === 'analyzed').map((a) => a.episodeUuid)
      )
      setAnalyzedUuids(uuids)
    })
    return unsubscribe
  }, [user])

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
              placeholder="Filter your libraryâ€¦"
              className="
                w-full rounded-lg border border-surface-border bg-surface-container
                pl-10 pr-4 py-2.5 font-ui text-sm text-ink placeholder:text-ink-muted
                focus:outline-none focus:ring-2 focus:ring-sage-primary/30
                transition-shadow duration-150
              "
            />
          </div>
        )}

        {/* â”€â”€ States â”€â”€ */}
        {loading && <LoadingSkeleton />}

        {!loading && subscriptions.length === 0 && (
          <EmptyLibrary onDiscover={() => navigate('/discover')} />
        )}

        {!loading && subscriptions.length > 0 && (
          <section>
            <p className="eyebrow mb-4">
              Subscribed Â· {visible.length} show{visible.length !== 1 ? 's' : ''}
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

    {/* â”€â”€ Episode side panel (Task 3.1) â”€â”€ */}
    {selectedPodcast && (
      <EpisodePanel
        podcast={selectedPodcast}
        user={user}
        selectedEpisode={selectedEpisode}
        onSelectEpisode={setSelectedEpisode}
        onClose={() => setSelectedPodcast(null)}
        analyzedUuids={analyzedUuids}
      />
    )}
  </>
  )
}

// â”€â”€ Library card (real Taddy data) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
          {removing ? 'Removingâ€¦' : 'Remove'}
        </button>
      </div>
    </article>
  )
}

// â”€â”€ Empty state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Loading skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
``n
File Path: src/pages/LoginPage.jsx

```
import { Mic2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { signIn } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-cream px-6">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-10 gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sage-primary shadow-lg">
            <Mic2 className="h-7 w-7 text-white" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h1 className="font-editorial text-3xl text-ink">Podcast Analyst Pro</h1>
            <p className="mt-1 font-ui text-sm text-ink-muted">
              Your curated intelligence archive
            </p>
          </div>
        </div>

        {/* Sign-in card */}
        <div className="card-tonal p-8 space-y-6">
          <div>
            <p className="eyebrow text-center mb-2">Access</p>
            <h2 className="font-editorial text-lg text-ink text-center">
              Sign in to continue
            </h2>
            <p className="mt-2 font-ui text-xs text-ink-muted text-center leading-relaxed">
              This workspace is private and restricted to its authorized owner.
            </p>
          </div>

          <button
            id="btn-google-signin"
            onClick={signIn}
            className="btn-primary w-full justify-center py-3 text-base"
          >
            {/* Google G icon */}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" opacity=".9"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity=".9"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" opacity=".9"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity=".9"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-center font-ui text-xs text-ink-muted">
          Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  )
}
``n
File Path: src/pages/SettingsPage.jsx

```
import { useEffect, useState } from 'react'
import {
  FlaskConical, Plus, Trash2, Loader2, Check, Pencil, X,
  LayoutDashboard, AlertCircle, ExternalLink, Info,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import {
  listenToPrompts,
  seedDefaultPrompt,
  addPrompt,
  updatePrompt,
  deletePrompt,
  setActivePrompt,
  DEFAULT_PROMPT,
  listenToLogs,
} from '../lib/firestore'

const MAX_PROMPTS = 3
const TABS = ['Prompts', 'Resources', 'Logs']

// â”€â”€ Settings page (Task 5.3 â€” Command Console) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Prompts')

  return (
    <AppShell>
      <Header title="Settings" />

      <div className="flex-1 px-8 py-8 max-w-2xl">
        {/* â”€â”€ Tab Bar â”€â”€ */}
        <div className="flex items-center gap-1 mb-8 border-b border-surface-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              id={`tab-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 font-ui text-sm font-medium transition-all duration-150
                border-b-2 -mb-px
                ${activeTab === tab
                  ? 'border-sage-primary text-sage-primary'
                  : 'border-transparent text-ink-muted hover:text-ink'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* â”€â”€ Tab Panels â”€â”€ */}
        {activeTab === 'Prompts'   && <PromptsTab   uid={user?.uid} />}
        {activeTab === 'Resources' && <ResourcesTab />}
        {activeTab === 'Logs'      && <LogsTab      uid={user?.uid} />}
      </div>
    </AppShell>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PROMPTS TAB (existing Task 5.2 logic)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function PromptsTab({ uid }) {
  const [prompts,   setPrompts]   = useState([])
  const [seeded,    setSeeded]    = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [draftName, setDraftName] = useState('')
  const [draftText, setDraftText] = useState('')
  const [saving,    setSaving]    = useState(false)
  const [toggling,  setToggling]  = useState(null)
  const [deleting,  setDeleting]  = useState(null)

  useEffect(() => {
    if (!uid) return
    const unsub = listenToPrompts(uid, async (docs) => {
      setLoading(false)
      if (docs.length === 0 && !seeded) {
        setSeeded(true)
        await seedDefaultPrompt(uid)
      } else {
        setPrompts(docs)
      }
    })
    return unsub
  }, [uid]) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(prompt) { setEditingId(prompt.id); setDraftName(prompt.name); setDraftText(prompt.text) }
  function startNew()        { setEditingId('new');      setDraftName('');           setDraftText('') }
  function cancelEdit()      { setEditingId(null);       setDraftName('');           setDraftText('') }

  async function handleSave() {
    if (!draftName.trim() || !draftText.trim()) return
    setSaving(true)
    try {
      if (editingId === 'new') {
        await addPrompt(uid, { name: draftName.trim(), text: draftText.trim(), isActive: prompts.length === 0 })
      } else {
        await updatePrompt(uid, editingId, { name: draftName.trim(), text: draftText.trim() })
      }
      cancelEdit()
    } finally { setSaving(false) }
  }

  async function handleToggleActive(promptId) {
    setToggling(promptId)
    try   { await setActivePrompt(uid, promptId, prompts.map((p) => p.id)) }
    finally { setToggling(null) }
  }

  async function handleDelete(promptId, promptName) {
    if (!window.confirm(`Delete prompt "${promptName}"? This cannot be undone.`)) return
    setDeleting(promptId)
    try   { await deletePrompt(uid, promptId) }
    finally { setDeleting(null) }
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <FlaskConical className="h-4 w-4 text-sage-primary" strokeWidth={1.5} />
        <h2 className="font-ui text-xs font-semibold text-ink-secondary uppercase tracking-wide">
          Prompt Laboratory
        </h2>
      </div>
      <p className="font-ui text-sm text-ink-muted mb-2">
        Manage up to {MAX_PROMPTS} analysis prompts. The <strong className="font-medium text-ink">active</strong> prompt
        is sent to Gemini every time you run "Begin Analysis."
      </p>
      <p className="font-ui text-sm text-ink-muted mb-5">
        Select the green circle on the left of a prompt card to set it as Active.
      </p>

      {loading && (
        <div className="flex items-center gap-2 text-ink-muted py-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-ui text-sm">Loading promptsâ€¦</span>
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              isEditing={editingId === prompt.id}
              isToggling={toggling === prompt.id}
              isDeleting={deleting === prompt.id}
              isSaving={saving && editingId === prompt.id}
              draftName={draftName}
              draftText={draftText}
              onDraftName={setDraftName}
              onDraftText={setDraftText}
              onEdit={() => startEdit(prompt)}
              onCancelEdit={cancelEdit}
              onSave={handleSave}
              onToggleActive={() => handleToggleActive(prompt.id)}
              onDelete={() => handleDelete(prompt.id, prompt.name)}
            />
          ))}

          {editingId === 'new' && (
            <PromptEditor
              title="New Prompt"
              draftName={draftName}
              draftText={draftText}
              onDraftName={setDraftName}
              onDraftText={setDraftText}
              onSave={handleSave}
              onCancel={cancelEdit}
              saving={saving}
            />
          )}

          {prompts.length < MAX_PROMPTS && editingId !== 'new' && (
            <button
              id="btn-add-prompt"
              onClick={startNew}
              className="
                w-full flex items-center justify-center gap-2
                rounded-xl border border-dashed border-surface-border
                py-3 font-ui text-sm text-ink-muted
                hover:border-sage-primary/40 hover:text-sage-primary
                transition-colors duration-150
              "
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add Prompt ({prompts.length}/{MAX_PROMPTS})
            </button>
          )}

          {prompts.length >= MAX_PROMPTS && (
            <p className="font-ui text-xs text-ink-muted text-center py-1">
              Maximum of {MAX_PROMPTS} prompts reached. Delete one to add another.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// RESOURCES TAB (Task 5.3 â€” API Command Center)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const RESOURCE_GROUPS = [
  {
    label: 'Google AI Studio (Gemini)',
    links: [
      { name: 'Billing',  href: 'https://aistudio.google.com/app/billing' },
      { name: 'Usage',    href: 'https://aistudio.google.com/usage?project=gen-lang-client-0377055736&timeRange=last-28-days' },
    ],
  },
  {
    label: 'AssemblyAI (Transcription)',
    links: [
      { name: 'Cost',        href: 'https://www.assemblyai.com/dashboard/cost' },
      { name: 'Usage',       href: 'https://www.assemblyai.com/dashboard/usage' },
      { name: 'Rate Limits', href: 'https://www.assemblyai.com/dashboard/rate-limits' },
    ],
  },
  {
    label: 'Firebase',
    links: [
      { name: 'Overview', href: 'https://console.firebase.google.com/u/0/project/podcast-analyst-pro/overview' },
      { name: 'Billing',  href: 'https://console.firebase.google.com/u/0/project/podcast-analyst-pro/usage' },
    ],
  },
  {
    label: 'Taddy API (Podcast & Episode Details)',
    links: [
      { name: 'Dashboard', href: 'https://taddy.org/dashboard/my-apps' },
    ],
  },
]

const TIER_ROWS = [
  { service: 'Gemini 3 Flash',    limit: '15 Requests Per Minute' },
  { service: 'Taddy API',         limit: '500 Requests Per Month (Free Tier)' },
  { service: 'AssemblyAI',        limit: '$50 Initial Credit / Rate limited by tier' },
]

function ResourcesTab() {
  return (
    <section className="space-y-8">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <LayoutDashboard className="h-4 w-4 text-sage-primary" strokeWidth={1.5} />
        <h2 className="font-ui text-xs font-semibold text-ink-secondary uppercase tracking-wide">
          API Command Center
        </h2>
      </div>

      {/* Link groups */}
      <div className="space-y-5">
        {RESOURCE_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="font-ui text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">
              {group.label}
            </p>
            <div className="rounded-xl border border-surface-border bg-surface-container overflow-hidden divide-y divide-surface-border">
              {group.links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex items-center justify-between px-4 py-3
                    font-ui text-sm text-ink
                    hover:bg-sage-primary/[0.04] hover:text-sage-primary
                    transition-colors duration-150 group
                  "
                >
                  <span>{link.name}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-ink-muted group-hover:text-sage-primary transition-colors" strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tier reference table */}
      <div>
        <p className="font-ui text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">
          Tier Reference
        </p>
        <div className="rounded-xl border border-surface-border bg-surface-container overflow-hidden">
          <table className="w-full text-sm font-ui">
            <thead>
              <tr className="border-b border-surface-border bg-surface-cream">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Service</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide">Free-Tier Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {TIER_ROWS.map((row) => (
                <tr key={row.service}>
                  <td className="px-4 py-3 font-medium text-ink">{row.service}</td>
                  <td className="px-4 py-3 text-ink-muted">{row.limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// LOGS TAB (Task 5.3 â€” Error Log Viewer)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const MODULE_COLORS = {
  AssemblyAI: 'bg-blue-50 text-blue-700 border border-blue-200',
  Gemini:     'bg-purple-50 text-purple-700 border border-purple-200',
  Taddy:      'bg-amber-50 text-amber-700 border border-amber-200',
}

function LogsTab({ uid }) {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    const unsub = listenToLogs(uid, (docs) => {
      setLogs(docs)
      setLoading(false)
    })
    return unsub
  }, [uid])

  function formatTs(ts) {
    if (!ts?.seconds) return 'â€”'
    return new Date(ts.seconds * 1000).toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-sage-primary" strokeWidth={1.5} />
          <h2 className="font-ui text-xs font-semibold text-ink-secondary uppercase tracking-wide">
            Error Log
          </h2>
        </div>
        <span className="font-ui text-xs text-ink-muted">
          {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Retention notice */}
      <div className="flex items-start gap-2 rounded-lg border border-surface-border bg-surface-cream px-3 py-2.5">
        <Info className="h-3.5 w-3.5 text-ink-muted mt-0.5 shrink-0" strokeWidth={2} />
        <p className="font-ui text-xs text-ink-muted leading-relaxed">
          Entries older than <strong className="font-medium text-ink">7 days</strong> are subject to auto-deletion
          to keep Firestore lean.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-ink-muted py-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-ui text-sm">Loading logsâ€¦</span>
        </div>
      )}

      {!loading && logs.length === 0 && (
        <div className="rounded-xl border border-dashed border-surface-border py-10 text-center">
          <Check className="h-6 w-6 text-sage-primary mx-auto mb-2" strokeWidth={1.5} />
          <p className="font-ui text-sm text-ink-muted">No errors logged. All systems nominal.</p>
        </div>
      )}

      {!loading && logs.length > 0 && (
        <div className="rounded-xl border border-surface-border bg-surface-container overflow-hidden divide-y divide-surface-border">
          {logs.map((log) => (
            <div key={log.id} className="px-4 py-3 space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`
                    inline-block rounded-full px-2 py-0.5 font-ui text-[10px] font-semibold
                    ${MODULE_COLORS[log.module] ?? 'bg-surface-cream text-ink-muted border border-surface-border'}
                  `}
                >
                  {log.module ?? 'Unknown'}
                </span>
                <span className="font-ui text-xs text-ink-muted shrink-0">{formatTs(log.timestamp)}</span>
              </div>
              <p className="font-ui text-xs text-ink leading-relaxed break-words">{log.message}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SHARED SUB-COMPONENTS (Prompts tab)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function PromptCard({
  prompt,
  isEditing, isToggling, isDeleting, isSaving,
  draftName, draftText, onDraftName, onDraftText,
  onEdit, onCancelEdit, onSave, onToggleActive, onDelete,
}) {
  if (isEditing) {
    return (
      <PromptEditor
        title={`Edit: ${prompt.name}`}
        draftName={draftName}
        draftText={draftText}
        onDraftName={onDraftName}
        onDraftText={onDraftText}
        onSave={onSave}
        onCancel={onCancelEdit}
        saving={isSaving}
      />
    )
  }

  return (
    <div
      className={`
        rounded-xl border p-4 transition-all duration-200
        ${prompt.isActive
          ? 'border-sage-primary/40 bg-sage-primary/[0.04]'
          : 'border-surface-border bg-surface-container'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* â”€â”€ Left selector zone â€” clicking here activates the prompt â”€â”€ */}
        <button
          id={`btn-toggle-active-${prompt.id}`}
          onClick={onToggleActive}
          disabled={isToggling || prompt.isActive}
          title={prompt.isActive ? 'Currently active' : 'Set as active'}
          aria-label={prompt.isActive ? 'Active prompt' : `Set "${prompt.name}" as active`}
          className="
            group flex items-start gap-2.5 flex-1 min-w-0 text-left
            focus:outline-none disabled:cursor-default
          "
        >
          {/* Circle indicator */}
          <span
            className={`
              mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full
              border-2 transition-all duration-150
              ${prompt.isActive
                ? 'border-[#4a7c59] bg-[#4a7c59] text-white'
                : 'border-[#4a7c59] bg-surface-cream text-transparent group-hover:bg-[#4a7c59]/10'
              }
            `}
          >
            {isToggling
              ? <Loader2 className="h-3 w-3 animate-spin text-[#4a7c59]" />
              : <Check className="h-3 w-3" strokeWidth={3} />
            }
          </span>

          {/* Name + preview */}
          <span className="flex-1 min-w-0 block">
            <span className="flex items-center gap-2 flex-wrap">
              <span className="font-ui text-sm font-semibold text-ink">{prompt.name}</span>
              {prompt.isActive && (
                <span className="font-ui text-[10px] font-medium text-sage-primary bg-sage-primary/10 rounded-full px-2 py-0.5">
                  Active
                </span>
              )}
            </span>
            <span className="font-ui text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed block">
              {prompt.text}
            </span>
          </span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            id={`btn-edit-prompt-${prompt.id}`}
            onClick={onEdit}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-border transition-all duration-150"
            aria-label={`Edit prompt "${prompt.name}"`}
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button
            id={`btn-delete-prompt-${prompt.id}`}
            onClick={onDelete}
            disabled={isDeleting}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:text-red-500 hover:bg-red-50 transition-all duration-150 disabled:opacity-40"
            aria-label={`Delete prompt "${prompt.name}"`}
          >
            {isDeleting
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}

function PromptEditor({ title, draftName, draftText, onDraftName, onDraftText, onSave, onCancel, saving }) {
  const valid = draftName.trim().length > 0 && draftText.trim().length > 0

  return (
    <div className="rounded-xl border border-sage-primary/30 bg-sage-primary/[0.03] p-4 space-y-3">
      <p className="font-ui text-xs font-semibold text-sage-primary uppercase tracking-wide">{title}</p>

      <div className="space-y-2">
        <label className="block">
          <span className="font-ui text-xs text-ink-muted mb-1 block">Name</span>
          <input
            id="input-prompt-name"
            type="text"
            value={draftName}
            onChange={(e) => onDraftName(e.target.value)}
            placeholder="e.g. Editorial Sage"
            maxLength={60}
            className="
              w-full rounded-lg border border-surface-border bg-surface-cream
              px-3 py-2 font-ui text-sm text-ink placeholder:text-ink-muted
              focus:outline-none focus:ring-2 focus:ring-sage-primary/30
              transition-shadow duration-150
            "
          />
        </label>

        <label className="block">
          <span className="font-ui text-xs text-ink-muted mb-1 block">Instructions</span>
          <textarea
            id="input-prompt-text"
            value={draftText}
            onChange={(e) => onDraftText(e.target.value)}
            placeholder="Write your system instructions for Geminiâ€¦"
            rows={6}
            className="
              w-full rounded-lg border border-surface-border bg-surface-cream
              px-3 py-2.5 font-ui text-sm text-ink placeholder:text-ink-muted
              focus:outline-none focus:ring-2 focus:ring-sage-primary/30
              resize-y transition-shadow duration-150
            "
          />
        </label>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-ui text-xs text-ink-muted hover:text-ink transition-colors"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
          Cancel
        </button>
        <button
          id="btn-save-prompt"
          onClick={onSave}
          disabled={!valid || saving}
          className="
            inline-flex items-center gap-1.5 rounded-lg
            bg-sage-primary px-4 py-1.5
            font-ui text-xs font-medium text-white
            hover:bg-sage-deep transition-colors duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {saving
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          }
          {saving ? 'Savingâ€¦' : 'Save Prompt'}
        </button>
      </div>
    </div>
  )
}
``n
File Path: src/pages/StubPages.jsx

```
// Stub pages â€” will be built out per task
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
``n
File Path: src/pages/UnauthorizedPage.jsx

```
import { Mic2, AlertTriangle, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function UnauthorizedPage() {
  const { user, logOut } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-cream px-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 mx-auto">
          <AlertTriangle className="h-7 w-7 text-red-400" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-editorial text-2xl text-ink">Access Restricted</h1>
          <p className="mt-2 font-ui text-sm text-ink-muted leading-relaxed">
            Access Denied: <span className="text-ink font-medium">{user?.email}</span> is not authorized.
          </p>
        </div>
        <button onClick={logOut} className="btn-ghost gap-2 mx-auto">
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </div>
  )
}
``n
File Path: .env.local

```
# Vite reads variables prefixed with VITE_
# Values sourced from your .env file â€” never commit this file.

# Firebase
VITE_FIREBASE_API_KEY=[HIDDEN]
VITE_FIREBASE_AUTH_DOMAIN=[HIDDEN]
VITE_FIREBASE_PROJECT_ID=[HIDDEN]
VITE_FIREBASE_STORAGE_BUCKET=[HIDDEN]
VITE_FIREBASE_MESSAGING_SENDER_ID=[HIDDEN]
VITE_FIREBASE_APP_ID=[HIDDEN]

# Verified Identity Keys
# A comma-separated list of emails authorized for full app access.
VITE_AUTHORIZED_EMAILS=[HIDDEN]

# Local Discovery Keys (Bypassing Cloud Functions for MVP speed)
VITE_TADDY_USER_ID=[HIDDEN]
VITE_TADDY_API_KEY=[HIDDEN]
VITE_ASSEMBLY_AI_API_KEY=[HIDDEN]
VITE_GOOGLE_AI_STUDIO_API_KEY=[HIDDEN]
``n
