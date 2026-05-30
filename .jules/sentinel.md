## 2026-05-28 - XSS via AI-Generated Output
**Vulnerability:** XSS risk via `dangerouslySetInnerHTML` rendering AI-generated text in `src/pages/ArchivePage.jsx`.
**Learning:** Even though AI models generate the text, it is untrusted user input due to the risk of prompt injection or hallucinations.
**Prevention:** Treat AI output as untrusted input. Use safe parsing or rendering libraries (like React's built-in escaping) instead of `dangerouslySetInnerHTML`.
## 2026-05-30 - Missing Security Headers in Firebase Hosting
**Vulnerability:** The application was missing basic security headers (CSP, HSTS, X-Frame-Options, etc.), leaving it exposed to clickjacking, MIME-sniffing, and potential XSS execution.
**Learning:** Default Firebase Hosting configurations do not include security headers automatically. They must be explicitly defined in `firebase.json`.
**Prevention:** Always add a robust `headers` block to `firebase.json` covering standard web security headers, with a tailored Content-Security-Policy that whitelists required external APIs.
