
Fixed XSS vulnerability by replacing dangerouslySetInnerHTML with safe React component rendering in ArchivePage.jsx.
## 2026-05-28 - XSS via AI-Generated Output
**Vulnerability:** XSS risk via `dangerouslySetInnerHTML` rendering AI-generated text in `src/pages/ArchivePage.jsx`.
**Learning:** Even though AI models generate the text, it is untrusted user input due to the risk of prompt injection or hallucinations.
**Prevention:** Treat AI output as untrusted input. Use safe parsing or rendering libraries (like React's built-in escaping) instead of `dangerouslySetInnerHTML`.

## 2026-05-30 - Error Exposure Vulnerability
**Vulnerability:** Raw error messages (e.g., `err.message`) were exposed to the frontend UI, window.alert popups, and database logs in useAnalysis.js, firestore.js, and SettingsPage.jsx.
**Learning:** Exposing raw error details risks leaking internal paths, API structures, or other sensitive execution details.
**Prevention:** Catch errors and log them locally to `console.error` for developers, but provide generic, safe messages to the end user and persist generic messages in external systems or logs.

## 2026-05-31 - Unauthenticated Cloud Functions Vulnerability
**Vulnerability:** Firebase Cloud Functions acting as proxies to third-party APIs (Google GenAI, Taddy, AssemblyAI) lacked authentication checks, allowing any user to call them.
**Learning:** Even if the frontend UI is protected by an auth guard, Cloud Functions can still be called directly via HTTP requests. Unauthenticated functions that wrap paid APIs can lead to abuse, data exposure, and severe cost overruns.
**Prevention:** Always ensure that Firebase Cloud Functions proxying sensitive or paid services require `request.auth` to be present. Use `HttpsError('unauthenticated')` to reject unauthorized requests.
