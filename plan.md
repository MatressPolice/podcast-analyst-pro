# Podcast Analyst Pro — Build Plan

## Phase 1: Foundation ✅
- Task 1.1: Vite + React scaffold with Tailwind
- Task 1.2: Firebase/Firestore wiring + Auth context
- Task 1.3: Modern Sage Editorial design system (tokens, fonts, components)
- Task 1.4: AppShell layout (Sidebar, Header, main content)

## Phase 2: Discovery Engine ✅
- Task 2.1: Taddy GraphQL client (`src/lib/taddy.js`)
- Task 2.2: `usePodcastSearch` debounced search hook
- Task 2.3: Discover UI — hero search bar, shimmer skeletons, result cards
- Task 2.4: Firestore subscription schema (`users/{uid}/subscriptions/{uuid}`)
  - `useSubscriptions` real-time hook
  - `addSubscription` / `removeSubscription` helpers
  - Library page with live Firestore data + local filter

## Phase 3: Analyst Workspace ✅
- Task 3.1: Analyst Workspace — Episode Browser
  - `getPodcastSeries` Taddy query (episodes with 25-item limit)
  - `usePodcastEpisodes` cancellation-safe hook
  - `EpisodePanel` slide-in component (backdrop, Escape close, shimmer rows)
  - Library cards wired as click targets → opens panel
- Task 3.2: Analyst Workspace — Analysis Interface
  - Two-view panel: Episode List ↔ Analysis View (keyed CSS transition)
  - `SageAudioPlayer` — custom play/pause/seek, Sage palette
  - Intelligence Brief + Transcript placeholder sections
  - "Begin Analysis" CTA (Phase 4 hook)
  - `selectedEpisode` lifted to LibraryPage for session persistence

## Phase 4: AI Analysis Engine 🔄
- Task 4.1: Transcription + Persistence (current)
  - AssemblyAI client (`src/lib/assemblyai.js`) — submit + poll
  - Firestore `users/{uid}/analyses/{episodeUuid}` — status lifecycle
  - `useAnalysis` hook — real-time listener + auto-resume polling
  - EpisodePanel wired: queued → processing → completed transcript
- Task 4.2: Intelligence Brief — Gemini summarisation
  - Read completed transcript from Firestore
  - Call Gemini API with editorial-analyst prompt
  - Persist `intelligenceBrief` field to the analysis document
  - Display rendered markdown in the Intelligence Brief section

## Phase 5: The Intelligence Control Center
- Task 5.1: The Intelligence Archive
  - Chronological history of all generated briefs (auto-logged).
  - Pull from `artifacts/${appId}/users/${user.uid}/analyses` ordered by date.
  - Card per analysis: podcast name/artwork, episode title, release date, analysis date, status badge.
  - Support background processing: users can start an analysis and leave the overlay safely.
- Task 5.2: The Prompt Laboratory (Settings)
  - Firebase collection: `prompts` mapped specifically to the user's private path.
  - List of up to 3 prompts with Name, Active Toggle, and Edit.
  - Active prompt remains the default for all future analyses until changed.
- Task 5.3: The Command Console (Usage & Logs)
  - A dashboard within Settings to monitor API usage and health.
  - Track "Total Minutes Transcribed" and "Total Analysis Requests".
  - Quick-link resources (Google AI Studio, AssemblyAI, Firebase, Taddy).
  - Tier Info reference tables.
  - Error Log section ("Black Box") with 7-day auto-deletion.
- Task 5.4: Security & Multi-User Implementation
  - VITE_AUTHORIZED_EMAILS environment variable manages active whitelist check.
  - Complete data isolation explicitly binding firestore paths to user.uid.
