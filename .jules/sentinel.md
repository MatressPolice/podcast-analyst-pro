
Fixed XSS vulnerability by replacing dangerouslySetInnerHTML with safe React component rendering in ArchivePage.jsx.
## 2026-05-28 - XSS via AI-Generated Output
**Vulnerability:** XSS risk via `dangerouslySetInnerHTML` rendering AI-generated text in `src/pages/ArchivePage.jsx`.
**Learning:** Even though AI models generate the text, it is untrusted user input due to the risk of prompt injection or hallucinations.
**Prevention:** Treat AI output as untrusted input. Use safe parsing or rendering libraries (like React's built-in escaping) instead of `dangerouslySetInnerHTML`.

## 2026-05-30 - Error Exposure Vulnerability
**Vulnerability:** Raw error messages (e.g., `err.message`) were exposed to the frontend UI, window.alert popups, and database logs in useAnalysis.js, firestore.js, and SettingsPage.jsx.
**Learning:** Exposing raw error details risks leaking internal paths, API structures, or other sensitive execution details.
**Prevention:** Catch errors and log them locally to `console.error` for developers, but provide generic, safe messages to the end user and persist generic messages in external systems or logs.

## 2026-06-05 - Missing Authentication on Firebase Cloud Functions
**Vulnerability:** Firebase Cloud Functions defined with `onCall` do not enforce authentication by default, allowing unauthenticated public access to external APIs like Google AI Studio, Taddy, and AssemblyAI, which can lead to quota exhaustion and financial loss.
**Learning:** Even if a function is intended for authenticated users, the `invoker: 'public'` setting in Firebase Cloud Functions means anyone can call it unless explicit checks are implemented inside the function.
**Prevention:** Always add an explicit authentication check (e.g., `if (!request.auth) throw new HttpsError('unauthenticated');`) at the very beginning of all sensitive Firebase callable functions.
