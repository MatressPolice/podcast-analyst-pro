
Fixed XSS vulnerability by replacing dangerouslySetInnerHTML with safe React component rendering in ArchivePage.jsx.
## 2026-05-28 - XSS via AI-Generated Output
**Vulnerability:** XSS risk via `dangerouslySetInnerHTML` rendering AI-generated text in `src/pages/ArchivePage.jsx`.
**Learning:** Even though AI models generate the text, it is untrusted user input due to the risk of prompt injection or hallucinations.
**Prevention:** Treat AI output as untrusted input. Use safe parsing or rendering libraries (like React's built-in escaping) instead of `dangerouslySetInnerHTML`.

## 2026-05-30 - Error Exposure Vulnerability
**Vulnerability:** Raw error messages (e.g., `err.message`) were exposed to the frontend UI, window.alert popups, and database logs in useAnalysis.js, firestore.js, and SettingsPage.jsx.
**Learning:** Exposing raw error details risks leaking internal paths, API structures, or other sensitive execution details.
**Prevention:** Catch errors and log them locally to `console.error` for developers, but provide generic, safe messages to the end user and persist generic messages in external systems or logs.

## 2026-06-04 - Missing Authentication on Firebase Callable Functions
**Vulnerability:** Firebase Callable Functions (`onCall`) were deployed with `invoker: 'public'` but lacked explicit authentication checks inside the function body, allowing unauthenticated users to invoke them and consume expensive AI/transcription API quotas.
**Learning:** Firebase `onCall` functions do not enforce authentication automatically, even if they are part of an authenticated app. The `request.auth` object is populated if the user is authenticated, but it must be manually checked within the function.
**Prevention:** Always verify `request.auth` at the beginning of any `onCall` function that performs sensitive operations, accesses user data, or consumes paid resources. Throw a standard `HttpsError('unauthenticated', '...')` if it is missing.
