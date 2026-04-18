import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { db } from './lib/firebase.js'

// ── Connection test (F12 console) ─────────────────────────────────────────────
// Confirms the Firebase SDK initialised and the Firestore handle is live.
// You should see: Firebase Init Success: true
console.log('Firebase Init Success:', !!db)
console.log('Firestore project:', db.app.options.projectId)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
