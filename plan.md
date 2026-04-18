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

## Phase 5: The Archive
- Task 5.1: Archive Page (repurposing the /archive route)
  - Chronological history of all analyzed episodes
  - Pull from `users/{uid}/analyses` collection, ordered by `createdAt` desc
  - Card per analysis: podcast name, episode title, date, status badge
  - Click card → reopens the Analyst Workspace for that episode
- Task 5.2: Prompt Manager UI
  - Create a Firestore collection for 'prompts'
  - Create a UI component to select which prompt to use for a given analysis
