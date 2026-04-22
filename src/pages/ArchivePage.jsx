import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, Clock, Play, Brain, Loader2, FileText, Headphones } from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { listenToAllAnalyses } from '../lib/firestore'

export default function ArchivePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsubscribe = listenToAllAnalyses(user.uid, (data) => {
      setAnalyses(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  // A user clicks an archive card to view the brief in the EpisodePanel.
  // We navigate to Library with a simulated state.
  function handleResume(analysis) {
    navigate('/', {
      state: {
        resumeAnalysis: true,
        proxyPodcast: {
          uuid: analysis.podcastUuid,
          name: analysis.podcastName || 'Unknown Podcast',
          imageUrl: analysis.podcastImageUrl || '',
        },
        resumeEpisode: {
          uuid: analysis.episodeUuid,
          name: analysis.episodeName,
          audioUrl: analysis.audioUrl,
          datePublished: analysis.episodeReleaseDate,
          podcastUuid: analysis.podcastUuid,
        }
      }
    })
  }

  return (
    <AppShell>
      <Header
        title="Archive"
      />

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {analyses.map(analysis => (
              <ArchiveCard 
                key={analysis.episodeUuid} 
                analysis={analysis} 
                onClick={() => handleResume(analysis)} 
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

function ArchiveCard({ analysis, onClick }) {
  const { 
    podcastName, 
    podcastImageUrl, 
    episodeName, 
    status, 
    createdAt,
    episodeReleaseDate 
  } = analysis

  const isQueued = status === 'queued'
  const isProcessing = status === 'processing'
  const isCompleted = status === 'completed'
  const isAnalyzed = status === 'analyzed'
  const isError = status === 'error'

  return (
    <article
      className="card-tonal group flex flex-col hover:shadow-md transition-all duration-200 cursor-pointer p-5"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div className="flex items-start gap-4 mb-4">
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
        <div className="flex-1 min-w-0">
          <p className="eyebrow truncate" title={podcastName}>
            {podcastName || 'Unknown Podcast'}
          </p>
          <h3 
            className="font-editorial text-base font-medium text-ink leading-snug group-hover:text-sage-primary transition-colors line-clamp-2 mt-0.5"
            title={episodeName}
          >
            {episodeName || 'Untitled Episode'}
          </h3>
        </div>
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex items-center justify-between font-ui text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Analyzed {formatDate(createdAt)}
          </span>
          {episodeReleaseDate ? (
            <span>Released {formatPublishedDate(episodeReleaseDate)}</span>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-surface-border/50 pt-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
          </div>
          <span className="font-ui text-xs font-medium text-sage-primary opacity-0 group-hover:opacity-100 transition-opacity">
            {isAnalyzed ? 'View Brief →' : 'View Status →'}
          </span>
        </div>
      </div>
    </article>
  )
}

function StatusBadge({ status }) {
  switch(status) {
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
          Complete
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
        Analyses you run from your Library will appear here automatically.
      </p>
    </div>
  )
}

function formatDate(timestamp) {
  if (!timestamp) return 'recently'
  const ts = timestamp.seconds ? timestamp.seconds * 1000 : timestamp
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

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
