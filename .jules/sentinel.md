## 2026-05-28 - XSS via AI-Generated Output
**Vulnerability:** XSS risk via `dangerouslySetInnerHTML` rendering AI-generated text in `src/pages/ArchivePage.jsx`.
**Learning:** Even though AI models generate the text, it is untrusted user input due to the risk of prompt injection or hallucinations.
**Prevention:** Treat AI output as untrusted input. Use safe parsing or rendering libraries (like React's built-in escaping) instead of `dangerouslySetInnerHTML`.
## 2026-05-29 - Exposed API Key in Frontend
**Vulnerability:** AssemblyAI API Key was exposed in the frontend bundle via `import.meta.env.VITE_ASSEMBLY_AI_API_KEY`.
**Learning:** Sensitive API keys must never be exposed to the client-side, as they can be easily extracted and abused.
**Prevention:** Always use a secure backend proxy (like Firebase Callable Functions) to handle requests to external APIs that require secret keys. The frontend should call the secure backend, which in turn calls the external API.
