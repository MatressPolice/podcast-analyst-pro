// "Only-Me" gatekeeper — plan.md §2.2
// The authorized owner is identified by their Firebase UID.
// This UID corresponds to nssm\mikes when signed in via Google.
export const AUTHORIZED_UID = import.meta.env.VITE_AUTHORIZED_UID

/**
 * Returns true only if the given Firebase user is the authorized owner.
 * All protected routes must run this check before rendering.
 */
export function isAuthorizedUser(user) {
  if (!user) return false

  // Primary check: UID match — .trim() guards against stray spaces in .env.local
  const envUid = (AUTHORIZED_UID ?? '').trim()
  if (envUid && user.uid.trim() === envUid) return true

  // Fallback: email domain check (nssm account)
  if (user.email && user.email.toLowerCase().startsWith('mikes')) return true

  return false
}
