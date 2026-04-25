import { useEffect, useState } from 'react'
import {
  FlaskConical, Plus, Trash2, Loader2, Check, Pencil, X,
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
} from '../lib/firestore'

const MAX_PROMPTS = 3

// ── Settings page (Task 5.2 — Prompt Laboratory) ─────────────────────────────
export default function SettingsPage() {
  const { user } = useAuth()
  const [prompts,   setPrompts]   = useState([])
  const [seeded,    setSeeded]    = useState(false)
  const [loading,   setLoading]   = useState(true)

  // Editing state
  const [editingId, setEditingId] = useState(null)  // prompt.id being edited, or 'new'
  const [draftName, setDraftName] = useState('')
  const [draftText, setDraftText] = useState('')

  // Saving / toggling spinners
  const [saving,    setSaving]    = useState(false)
  const [toggling,  setToggling]  = useState(null)  // id currently being toggled
  const [deleting,  setDeleting]  = useState(null)  // id currently being deleted

  // ── Real-time listener + auto-seed ──────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return

    const unsub = listenToPrompts(user.uid, async (docs) => {
      setLoading(false)

      if (docs.length === 0 && !seeded) {
        // First visit — seed the Editorial Sage default
        setSeeded(true)
        await seedDefaultPrompt(user.uid)
        // The listener will fire again after the seed write
      } else {
        setPrompts(docs)
      }
    })

    return unsub
  }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ────────────────────────────────────────────────────────────────
  function startEdit(prompt) {
    setEditingId(prompt.id)
    setDraftName(prompt.name)
    setDraftText(prompt.text)
  }

  function startNew() {
    setEditingId('new')
    setDraftName('')
    setDraftText('')
  }

  function cancelEdit() {
    setEditingId(null)
    setDraftName('')
    setDraftText('')
  }

  async function handleSave() {
    if (!draftName.trim() || !draftText.trim()) return
    setSaving(true)
    try {
      if (editingId === 'new') {
        await addPrompt(user.uid, {
          name:     draftName.trim(),
          text:     draftText.trim(),
          isActive: prompts.length === 0, // first prompt is active by default
        })
      } else {
        await updatePrompt(user.uid, editingId, {
          name: draftName.trim(),
          text: draftText.trim(),
        })
      }
      cancelEdit()
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(promptId) {
    setToggling(promptId)
    try {
      await setActivePrompt(user.uid, promptId, prompts.map((p) => p.id))
    } finally {
      setToggling(null)
    }
  }

  async function handleDelete(promptId, promptName) {
    if (!window.confirm(`Delete prompt "${promptName}"? This cannot be undone.`)) return
    setDeleting(promptId)
    try {
      await deletePrompt(user.uid, promptId)
    } finally {
      setDeleting(null)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <Header title="Settings" />

      <div className="flex-1 px-8 py-8 max-w-2xl space-y-10">

        {/* ── Section: Prompt Laboratory ── */}
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

          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-2 text-ink-muted py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-ui text-sm">Loading prompts…</span>
            </div>
          )}

          {/* Prompt list */}
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

              {/* New prompt editor */}
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

              {/* Add button (only when < MAX and not already adding) */}
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
      </div>
    </AppShell>
  )
}

// ── Prompt card ──────────────────────────────────────────────────────────────
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
        {/* ── Left selector zone — clicking here activates the prompt ── */}
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

// ── Prompt editor (shared by add + edit) ─────────────────────────────────────
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
            placeholder="Write your system instructions for Gemini…"
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
          {saving ? 'Saving…' : 'Save Prompt'}
        </button>
      </div>
    </div>
  )
}
