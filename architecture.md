# Podcast Analyst Pro — System Architecture

This document provides a comprehensive overview of the technical architecture, data flows, and structural constraints for the Podcast Analyst Pro application.

---

## 1. The 3-Layer Architecture

The application strictly enforces a separation of concerns using a classic 3-layer frontend architecture. This ensures code remains highly maintainable, testable, and isolated.

### Layer 1: The Presentation Layer (`/src/pages` & `/src/components`)
**Responsibility:** Pure UI rendering and capturing user interactions.
*   **Pages:** Act as the main views for routing (e.g., `LibraryPage.jsx`, `DiscoverPage.jsx`). They compose components and consume hooks.
*   **Components:** Reusable UI elements (e.g., `EpisodePanel.jsx`, `AppShell.jsx`). They remain as "dumb" as possible, focusing purely on receiving props and emitting events.
*   **Constraint:** Files in this layer **must never** execute direct raw fetch requests to external APIs or manually initialize Firebase/SDKs.

### Layer 2: The Orchestration Layer (`/src/hooks` & `/src/contexts`)
**Responsibility:** State management, data caching, and real-time synchronization.
*   **Hooks:** Custom React Hooks (e.g., `useAnalysis.js`, `useSubscriptions.js`) act as the bridge between the UI and the data layer. They handle loading states, error handling, and component unmount cleanup.
*   **Contexts:** Application-wide state (e.g., `AuthContext.jsx`) is managed here to avoid prop-drilling.
*   **Constraint:** This layer consumes the Service Layer and exposes clean data to the Presentation Layer.

### Layer 3: The Service & Data Layer (`/src/lib`)
**Responsibility:** All direct interaction with external systems, databases, and APIs.
*   **Modules:** Pure JavaScript functions (`firestore.js`, `taddy.js`, `assemblyai.js`, `gemini.js`). 
*   **Constraint:** Files in this layer **must never** import React hooks or UI components. They are strictly UI-agnostic data fetchers and writers.

---

## 2. Codebase Structure

```text
podcast-analyst-pro/
â”œâ”€â”€ .github/                  # CI/CD pipelines (Firebase Hosting deployment)
â”œâ”€â”€ .archive/                 # Hidden folder for completed plans/tasks
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/           # Reusable UI elements (Buttons, Layouts, Panels)
â”‚   â”œâ”€â”€ contexts/             # Global state (AuthContext.jsx)
â”‚   â”œâ”€â”€ hooks/                # React Hooks tying UI to Data
â”‚   â”œâ”€â”€ lib/                  # Service Layer (API wrappers, Database interactions)
â”‚   â”œâ”€â”€ pages/                # Main application views
â”‚   â”œâ”€â”€ App.jsx               # Root React component / Router
â”‚   â””â”€â”€ main.jsx              # Application entry point
â”œâ”€â”€ firestore.rules           # Security rules for the database
â”œâ”€â”€ tailwind.config.js        # Design system & theme tokens
â””â”€â”€ architecture.md           # This document
```

---

## 3. Data Flow: UI to Backend

How data propagates through the system, using **Podcast Discovery** and **AI Analysis** as examples.

### Example A: Podcast Discovery Flow
1.  **User Input:** The user types "The Daily" in `DiscoverPage.jsx`.
2.  **Orchestration:** `DiscoverPage` passes the string to the `usePodcastSearch` hook. The hook handles debouncing (waiting 300ms before firing).
3.  **Service Request:** The hook calls `searchPodcasts()` from `src/lib/taddy.js`.
4.  **External API:** `taddy.js` attaches the environment API keys and executes the GraphQL POST request to Taddy.
5.  **Return:** The data flows back up the chain, the hook updates `loading` to `false`, and the UI renders the results.

### Example B: Asynchronous AI Analysis Flow
1.  **User Action:** User clicks "Begin Analysis" in `EpisodePanel.jsx`.
2.  **Orchestration Initiation:** The component calls `beginAnalysis()` from `useAnalysis.js`.
3.  **Service Chain:**
    *   `firestore.js` writes a `status: 'queued'` record to Firebase.
    *   `assemblyai.js` sends the audio URL to AssemblyAI for transcription.
    *   `firestore.js` updates status to `processing`.
    *   Upon transcription completion, `gemini.js` is called with the transcript to generate the Intelligence Brief.
    *   `firestore.js` updates status to `analyzed` and saves the final markdown.
4.  **Real-Time UI Update:** Throughout this process, `useAnalysis.js` maintains an active `onSnapshot` listener to Firebase. As the Firestore document updates in step 3, the UI in Step 1 re-renders automatically without manual polling.

---

## 4. Active Firebase Configuration

### Authentication & Authorization
*   **Provider:** Google OAuth (Popup).
*   **Dynamic Whitelist:** Authorization is decoupled from Authentication. A user can successfully log in with Google, but they are subsequently checked against the `authorized_users` collection in Firestore. If their email is not present, they are redirected to `UnauthorizedPage.jsx`.

### Firestore Data Model
Data is strictly siloed by the authenticated User ID (`uid`) to ensure complete multi-tenant privacy.
*   **Subscriptions:** `/users/{uid}/subscriptions/{podcastUuid}`
*   **Analyses:** `/users/{uid}/analyses/{episodeUuid}`
*   **Prompts:** `/users/{uid}/prompts/{promptId}`

### Security Rules (`firestore.rules`)
*   **Whitelist Read:** Users can read the `authorized_users` collection to verify their own access.
*   **Data Isolation:** All read/write access to `/users/{userId}/*` strictly requires `request.auth.uid == userId`. No user can read another user's intelligence briefs or subscriptions.

---

## 5. Environment & Infrastructure Requirements

To operate this architecture, the following environmental dependencies must be met via a `.env.local` file or CI/CD secrets:

*   **Firebase:** `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, etc.
*   **Taddy API (Podcasts):** `VITE_TADDY_USER_ID`, `VITE_TADDY_API_KEY`
*   **AssemblyAI (Transcription):** `VITE_ASSEMBLYAI_API_KEY`
*   **Google Gemini (Analysis):** `VITE_GEMINI_API_KEY`

### CI/CD Deployment
Deployment is entirely automated via GitHub Actions (`FirebaseExtended/action-hosting-deploy`). Any push to the `main` branch triggers a Vite production build and deploys the resulting static bundle to Firebase Hosting.
