import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { isAuthorizedUser } from '../lib/authGuard'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [authorized, setAuthorized] = useState(false)

  // Track whether getRedirectResult has resolved yet.
  // onAuthStateChanged fires immediately with null before Firebase finishes
  // processing the redirect — this gate stops that null from clearing loading.
  const redirectSettled = useRef(false)
  const authStateSettled = useRef(false)

  const evaluateLoading = () => {
    if (redirectSettled.current && authStateSettled.current) {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 1. Resolve any pending redirect first
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('[Auth] Redirect resolved for:', result.user?.uid)
        }
      })
      .catch((err) => {
        console.error('[Auth] Redirect result error:', err)
      })
      .finally(() => {
        redirectSettled.current = true
        evaluateLoading()
      })

    // 2. Keep auth state in sync for the session lifetime
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setAuthorized(isAuthorizedUser(firebaseUser))

      authStateSettled.current = true
      evaluateLoading()
    })

    return unsubscribe
  }, [])

  const signIn = () => signInWithRedirect(auth, googleProvider)
  const logOut = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, authorized, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
