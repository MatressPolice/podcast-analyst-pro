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

      {/* ── Delete confirmation modal ── */}
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

// ── Delete confirmation modal ─────────────────────────────────────────────────
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
        {/* Close × */}
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
            {deleting ? 'Deleting…' : 'Delete Brief'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Archive card with inline Intelligence Brief expansion ─────────────────────
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
      {/* ── Card header (always visible, click to expand) ── */}
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
          {/* Trash icon — separate from the expand toggle */}
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
