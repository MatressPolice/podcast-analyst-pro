// Deprecated: Authorization is now handled dynamically using the Firestore
// whitelist collection ('authorized_users') and managed in AuthContext.jsx.
// This file is no longer used for access checks.
export const AUTHORIZED_EMAILS = '';
export function isAuthorizedUser() {
  return false;
}
