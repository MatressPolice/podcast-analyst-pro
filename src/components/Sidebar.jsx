import { NavLink } from 'react-router-dom'
import {
  Mic2, Library, Search, BookMarked, Settings, LogOut, Archive,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/',          icon: Library,    label: 'Library'  },
  { to: '/discover',  icon: Search,     label: 'Discover' },
  { to: '/archive',   icon: Archive,    label: 'Archive'  },
  { to: '/saved',     icon: BookMarked, label: 'Saved'    },
  { to: '/settings',  icon: Settings,   label: 'Settings' },
]

export default function Sidebar() {
  const { user, logOut } = useAuth()

  return (
    <aside
      className="
        fixed inset-y-0 left-0 z-30 flex w-64 flex-col
        bg-surface-container
      "
      aria-label="Primary navigation"
    >
      {/* ── Branding ── */}
      <div className="flex items-center gap-2.5 px-5 py-6 border-b border-surface-border">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-primary"
          aria-hidden="true"
        >
          <Mic2 className="h-5 w-5 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-editorial text-base font-semibold text-ink leading-tight">
            Podcast Analyst
          </p>
          <p className="label-ui" style={{ marginTop: '1px' }}>Pro</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
        <p className="eyebrow px-3 mb-3">Workspace</p>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── User footer ── */}
      {user && (
        <div className="border-t border-surface-border px-3 py-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName ?? 'User'}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sage-muted text-white text-xs font-medium">
                {(user.displayName ?? 'U')[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">
                {user.displayName ?? 'Analyst'}
              </p>
              <p className="label-ui truncate" style={{ marginTop: '1px' }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={logOut}
              className="text-ink-muted hover:text-ink transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
