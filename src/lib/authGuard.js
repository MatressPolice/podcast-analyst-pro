// "Only-Me" gatekeeper — plan.md §2.2
// The authorized owner is identified by their Firebase UID.
// This UID corresponds to nssm\mikes when signed in via Google.
export const AUTHORIZED_EMAILS = import.meta.env.VITE_AUTHORIZED_EMAILS

/**
 * Returns true only if the given Firebase user is in the authorized email whitelist.
 * All protected routes must run this check before rendering.
 */
export function isAuthorizedUser(user) {
  if (!user || !user.email) return false

  const emailsRaw = import.meta.env.VITE_AUTHORIZED_EMAILS || ''
  const allowedEmails = emailsRaw.split(',').map(e => e.trim().toLowerCase())
  
  return allowedEmails.includes(user.email.toLowerCase())
}
