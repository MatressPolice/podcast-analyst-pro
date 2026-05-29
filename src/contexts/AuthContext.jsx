import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { getAuthorization } from '../lib/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [role, setRole]             = useState(null)

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser && firebaseUser.email) {
        const authDoc = await getAuthorization(firebaseUser.email)
        if (authDoc) {
          setAuthorized(true)
          setRole(authDoc.role)
        } else {
          setAuthorized(false)
          setRole(null)
        }
      } else {
        setAuthorized(false)
        setRole(null)
      }

      authStateSettled.current = true
      evaluateLoading()
    })

    return unsubscribe
  }, [])

  const signIn = () => signInWithRedirect(auth, googleProvider)
  const logOut = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, authorized, role, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  )
}


export const useAuth = () => useContext(AuthContext)
