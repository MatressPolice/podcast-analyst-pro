import { Mic2, AlertTriangle, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function UnauthorizedPage() {
  const { user, logOut } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-cream px-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 mx-auto">
          <AlertTriangle className="h-7 w-7 text-red-400" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-editorial text-2xl text-ink">Access Restricted</h1>
          <p className="mt-2 font-ui text-sm text-ink-muted leading-relaxed">
            This workspace is private. The account{' '}
            <span className="text-ink font-medium">{user?.email}</span>{' '}
            is not authorized to view this application.
          </p>
        </div>
        <button onClick={logOut} className="btn-ghost gap-2 mx-auto">
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </div>
  )
}
