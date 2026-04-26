import { useState, useEffect } from 'react'
import {
  Archive, Clock, Brain, Loader2, Headphones,
  ChevronDown, ChevronUp, FileText, X,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { listenToAllAnalyses } from '../lib/firestore'

export default function ArchivePage() {
  const { user } = useAuth()
  const [analyses, setAnalyses]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [expandedId, setExpandedId] = useState(null)

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
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

// ── Archive card with inline Intelligence Brief expansion ─────────────────────
function ArchiveCard({ analysis, isExpanded, onToggle }) {
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
      {/* ── Card header (always visible, click to expand) ── */}
      <button
        className="w-full flex items-start gap-4 p-5 text-left focus:outline-none"
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

        {/* Right: status badge + chevron */}
        <div className="flex items-center gap-3 shrink-0 self-center">
          <StatusBadge status={status} />
          {isAnalyzed && (
            isExpanded
              ? <ChevronUp className="h-4 w-4 text-sage-primary" strokeWidth={2} />
              : <ChevronDown className="h-4 w-4 text-ink-muted" strokeWidth={2} />
          )}
        </div>
      </button>

      {/* ── Expanded: Intelligence Brief content ── */}
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

// ── Renders the raw brief text with basic markdown-ish formatting ─────────────
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

// ── Status badge ──────────────────────────────────────────────────────────────
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

// ── Empty state ───────────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
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
