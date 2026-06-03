
Fixed XSS vulnerability by replacing dangerouslySetInnerHTML with safe React component rendering in ArchivePage.jsx.
## 2026-05-28 - XSS via AI-Generated Output
**Vulnerability:** XSS risk via `dangerouslySetInnerHTML` rendering AI-generated text in `src/pages/ArchivePage.jsx`.
**Learning:** Even though AI models generate the text, it is untrusted user input due to the risk of prompt injection or hallucinations.
**Prevention:** Treat AI output as untrusted input. Use safe parsing or rendering libraries (like React's built-in escaping) instead of `dangerouslySetInnerHTML`.

## 2026-05-30 - Error Exposure Vulnerability
**Vulnerability:** Raw error messages (e.g., `err.message`) were exposed to the frontend UI, window.alert popups, and database logs in useAnalysis.js, firestore.js, and SettingsPage.jsx.
**Learning:** Exposing raw error details risks leaking internal paths, API structures, or other sensitive execution details.
**Prevention:** Catch errors and log them locally to `console.error` for developers, but provide generic, safe messages to the end user and persist generic messages in external systems or logs.

## 2026-06-03 - Missing Authentication on Cloud Functions
**Vulnerability:** Firebase Cloud Functions (`onCall`) do not enforce authentication by default. Anyone with the URL could call our proxy functions (`analyzeTranscript`, `taddySearchPodcasts`, `taddyGetPodcastSeries`, `assemblySubmitTranscription`, `assemblyPollTranscription`) and incur heavy costs via our external API keys.
**Learning:** `invoker: 'public'` does not mean "authenticated users", it means anyone on the internet. Explicit `request.auth` checks must be implemented within the function body to prevent unauthorized access.
**Prevention:** Always check `!request.auth` and throw an `HttpsError('unauthenticated')` at the very beginning of sensitive Cloud Functions.
